#!/usr/bin/env node
// Create a fully isolated worktree: own branch off origin/<default>, own port(s),
// own database, own build dir, env files carried over. Repo-agnostic.
//
//   node worktree-setup.mjs <name> [--from <ref>] [--no-install] [--dry-run]
//
// Design rules, each traceable to a real incident (see references/):
//  * branch from origin/<default>, never local main  -> stale-HEAD contamination
//  * worktree lives OUTSIDE the repo                  -> nested checkout gets scanned
//  * build dir + db MUST be gitignored, verified      -> Tailwind eats binaries, 500s
//  * deps must RESOLVE, not merely exist              -> symlink false-pass

import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
  appendFileSync,
} from "node:fs";
import { join, resolve, dirname } from "node:path";
import {
  currentCheckoutPath,
  findFreePort,
  isIgnored,
  loadConfig,
  mainCheckoutPath,
  sh,
  shQuiet,
  depsResolve,
  devServerPreflight,
} from "./worktree-lib.mjs";

const argv = process.argv.slice(2);
// The value of --from is a positional-looking token but is NOT the name, so it
// must be excluded or `--from <ref> <name>` would silently name the worktree
// after the ref.
// NOTE the -1 sentinel: indexOf returns -1 when --from is absent, and a naive
// `+ 1` then yields 0 -- which excludes argv[0], i.e. the NAME itself. That
// bug broke every invocation that did not pass --from.
const fromFlagIdx = argv.indexOf("--from");
const fromValueIdx = fromFlagIdx === -1 ? -1 : fromFlagIdx + 1;
const name = argv.filter((a, i) => !a.startsWith("--") && i !== fromValueIdx)[0];
const flag = (f) => argv.includes(f);
const DRY = flag("--dry-run");
// --from <ref>: branch from a specific REMOTE ref instead of the default branch.
// Still remote-only -- the point of the rule is "never branch from local state",
// not "only ever branch from main". Useful when the base you need is on a branch
// that has not merged yet.
const fromIdx = argv.indexOf("--from");
const fromRef = fromIdx !== -1 ? argv[fromIdx + 1] : null;

function die(msg) {
  console.error(`\n  x ${msg}\n`);
  process.exit(1);
}
function step(msg) {
  console.log(`  . ${msg}`);
}

if (!name) die("usage: worktree-setup.mjs <name> [--from <remote-ref>] [--no-install] [--dry-run]");
if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(name)) {
  die(`invalid name "${name}" - use lowercase letters, digits and dashes (2-41 chars)`);
}

const repoRoot = mainCheckoutPath();
const loaded = loadConfig(currentCheckoutPath(), repoRoot);
if (!loaded.ok) die(loaded.error);
const cfg = loaded.config;
// The .worktreeinclude LIST comes from wherever the config came from (so a
// branch that adds one can test it), but the FILES themselves are always read
// from the main checkout -- that is the only place real credentials live.
const configDir = dirname(loaded.path);

const worktreesDir = resolve(repoRoot, cfg.worktreesDir ?? "../worktrees");
const worktreePath = join(worktreesDir, name);
const branch = (cfg.branchPrefix ?? "wt/") + name;
const defaultBranch = fromRef ?? cfg.defaultBranch ?? "main";
const remote = cfg.remote ?? "origin";

console.log(`\n  worktree "${name}"`);
console.log(`  repo      ${repoRoot}`);
console.log(`  path      ${worktreePath}`);
console.log(`  branch    ${branch}  (from ${remote}/${defaultBranch})`);
if (DRY) console.log("  MODE      dry run - nothing will be created");

// --- guard: never operate on the main checkout -------------------------------
if (resolve(worktreePath) === resolve(repoRoot)) {
  die("refusing: target resolves to the main checkout");
}
if (resolve(worktreePath).startsWith(resolve(repoRoot) + "/")) {
  die(
    `refusing: ${worktreePath} is INSIDE the repo.\n` +
      `    A checkout nested in the repo gets scanned by the CSS toolchain and by\n` +
      `    every glob in the build. Put worktrees in a sibling directory instead.`,
  );
}
if (existsSync(worktreePath)) die(`already exists: ${worktreePath}`);

// --- 1. branch from the REMOTE default, not local ----------------------------
step(`fetching ${remote}/${defaultBranch}`);
if (!DRY) {
  const fetched = shQuiet("git", ["-C", repoRoot, "fetch", remote, defaultBranch, "--quiet"]);
  if (!fetched.ok) die(`git fetch failed: ${fetched.error}`);
}
const baseSha = DRY
  ? "(dry)"
  : sh("git", ["-C", repoRoot, "rev-parse", "--short", `${remote}/${defaultBranch}`]);
step(`base commit ${baseSha}`);

if (!DRY) {
  mkdirSync(worktreesDir, { recursive: true });
  const added = shQuiet("git", [
    "-C", repoRoot, "worktree", "add", "-b", branch, worktreePath, `${remote}/${defaultBranch}`,
  ]);
  if (!added.ok) die(`git worktree add failed: ${added.error}`);
}
step("worktree created");

// --- 2. carry gitignored env files across ------------------------------------
const includeFile = join(configDir, ".worktreeinclude");
const envPatterns = existsSync(includeFile)
  ? readFileSync(includeFile, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"))
  : (cfg.envFiles ?? []);
let copied = 0;
for (const rel of envPatterns) {
  const src = join(repoRoot, rel);
  if (!existsSync(src)) continue;
  if (!DRY) {
    mkdirSync(dirname(join(worktreePath, rel)), { recursive: true });
    writeFileSync(join(worktreePath, rel), readFileSync(src));
  }
  copied += 1;
}
step(
  `env files carried over: ${copied}` +
    (envPatterns.length ? "" : " (none configured - add a .worktreeinclude)"),
);

// --- 3. allocate ports --------------------------------------------------------
const portNames = Object.keys(cfg.ports ?? {});
const ports = {};
// Seed from the registry, not just from live listeners. A lane whose dev server
// happens to be stopped right now still OWNS its port -- without this, two idle
// lanes are both handed the base port and collide the moment both start.
const taken = new Set();
{
  const reg = join(worktreesDir, "registry.json");
  if (existsSync(reg)) {
    try {
      for (const [lane, entry] of Object.entries(
        JSON.parse(readFileSync(reg, "utf8")),
      )) {
        if (lane === name) continue; // re-creating this lane may reuse its own port
        for (const p of Object.values(entry?.ports ?? {})) taken.add(p);
      }
    } catch {
      // A corrupt registry must not block setup; live-port probing still applies.
    }
  }
}
for (const key of portNames) {
  const start = cfg.ports[key];
  const port = DRY ? start : await findFreePort(start, taken);
  taken.add(port);
  ports[key] = port;
}
step(
  `ports: ${portNames.length ? portNames.map((k) => `${k}=${ports[k]}`).join(" ") : "(none configured)"}`,
);

// --- 4. per-worktree build dir + database ------------------------------------
const distDir = (cfg.distDirPrefix ?? ".next-") + name;

// `dbPathTemplate: null` means this repo has NO per-worktree database FILE.
// That is a real configuration, not a missing one: a repo whose isolation is a
// dynamically created server-side database (a per-run Postgres, say) has nothing
// for this script to create. Without this branch the script would invent a stray
// file, gitignore-check it, and report "database isolated" -- a claim that is
// simply false there. Isolation this script did not perform must not be reported
// as isolation.
const dbPath =
  cfg.dbPathTemplate === null || cfg.dbPathTemplate === false
    ? null
    : (cfg.dbPathTemplate ?? "{name}.wt.db").replaceAll("{name}", name);

step(`build dir: ${distDir}`);
step(
  dbPath
    ? `database:  ${dbPath}`
    : "database:  (none per-worktree — this repo isolates its database elsewhere)",
);

// --- 5. THE CHECK THAT MATTERS: both must be gitignored ----------------------
// A trailing-slash pattern only matches an EXISTING DIRECTORY, so the paths have
// to exist before `git check-ignore` can answer. Asking about a path that is not
// there yet returns a false "not ignored" and would fail every run.
//
// A dry run does this too, against the checkout you are standing in. It shares
// the same .gitignore the new worktree would inherit, so the answer is real --
// and a dry run that printed "verified" without checking anything would be
// exactly the kind of false reassurance this script exists to prevent.
const probeRoot = DRY ? (currentCheckoutPath() ?? repoRoot) : worktreePath;
mkdirSync(join(probeRoot, distDir), { recursive: true });
if (dbPath && !existsSync(join(probeRoot, dbPath))) writeFileSync(join(probeRoot, dbPath), "");

const unignored = [];
if (!isIgnored(probeRoot, distDir)) unignored.push(distDir);
if (dbPath && !isIgnored(probeRoot, dbPath)) unignored.push(dbPath);

if (DRY) {
  // Leave the checkout exactly as we found it.
  rmSync(join(probeRoot, distDir), { recursive: true, force: true });
  if (dbPath) rmSync(join(probeRoot, dbPath), { force: true });
}
if (unignored.length) {
  die(
    `these are NOT gitignored: ${unignored.join(", ")}\n\n` +
      `    This is fatal, not cosmetic. Tailwind v4 finds source files by scanning\n` +
      `    everything git does not ignore. It will read these binaries as source,\n` +
      `    extract raw bytes as class candidates, and emit invalid UTF-8 into the\n` +
      `    generated CSS - 500ing the dev server on every edit.\n` +
      `    Measured: 5/5 edits broken un-ignored vs 0/5 ignored.\n\n` +
      `    Fix with a GENERIC pattern in the repo's tracked .gitignore so every\n` +
      `    future worktree is covered, e.g.  ${cfg.distDirPrefix ?? ".next-"}*/  and  *.wt.db`,
  );
}
step(
  `gitignore verified: ${dbPath ? "build dir and database are both" : "build dir is"} ignored` +
    (DRY ? " (checked against this checkout)" : ""),
);

// --- 6. write the worktree's env overrides -----------------------------------
const envTargetName = cfg.envTargetFile ?? ".env" + ".local";
const envTarget = join(worktreePath, envTargetName);
// One list, two consumers. The .env FILE is what the app reads at runtime; the
// same pairs are also printed inline on the dev command below, because a bundler
// reads its port and build dir from the PROCESS environment at startup, long
// before any .env file is loaded for application code. Deriving both from this
// single array is what keeps them from drifting apart.
const envPairs = [
  ...(cfg.distDirEnv ? [[cfg.distDirEnv, distDir]] : []),
  ...(cfg.dbPathEnv && dbPath ? [[cfg.dbPathEnv, join(worktreePath, dbPath)]] : []),
  ...portNames.map((k) => [cfg.portEnv?.[k] ?? k.toUpperCase() + "_PORT", String(ports[k])]),
];
const lines = [
  "",
  `# --- worktree "${name}" - written by vc-worktree-session, safe to regenerate ---`,
  ...envPairs.map(([k, v]) => `${k}=${v}`),
];
if (!DRY) appendFileSync(envTarget, lines.join("\n") + "\n");
step(`env overrides appended to ${envTargetName}`);

// --- 7. dependencies ----------------------------------------------------------
if (!flag("--no-install") && !DRY) {
  step("installing dependencies (this is the slow part)...");
  const installed = shQuiet("sh", [
    "-c",
    `cd ${JSON.stringify(worktreePath)} && ${cfg.installCommand ?? "pnpm install --frozen-lockfile"}`,
  ]);
  if (!installed.ok) die(`install failed:\n${installed.error}`);
  const probe = depsResolve(worktreePath, cfg.depsProbePackage ?? "next");
  if (!probe.ok) die(`dependencies did not resolve after install: ${probe.error}`);
  step(probe.linked ? `deps resolve (symlinked -> ${probe.target})` : "deps resolve (real local install)");
}

// --- 8. seed the worktree's own database ------------------------------------
// "Its own database" means its own DATA, not just its own empty file. A fresh
// worktree whose db has schema but no rows opens on an empty app with nothing
// to click, which is indistinguishable from something being broken -- and the
// agent then debugs the wrong thing. The command comes from config, so this
// stays repo-agnostic; a repo with nothing to seed sets it to null.
// Seeding needs the dependencies it was installed with, so --no-install makes
// it structurally impossible. Skipping with a reason beats letting it fail and
// print a module-not-found stack trace that looks like a real defect.
if (cfg.seedCommand && !DRY && flag("--no-install")) {
  step("database not seeded (--no-install: the seed needs dependencies)");
} else if (cfg.seedCommand && !DRY) {
  step("seeding the database ...");
  const env = cfg.dbPathEnv && dbPath ? `${cfg.dbPathEnv}=${JSON.stringify(join(worktreePath, dbPath))} ` : "";
  const seeded = shQuiet("sh", [
    "-c",
    `cd ${JSON.stringify(worktreePath)} && ${env}${cfg.seedCommand} 2>&1`,
  ]);
  // Not fatal: an unseeded worktree is still a working worktree, and failing
  // here would throw away an install that just took minutes.
  step(
    seeded.ok
      ? "database seeded"
      : `seed FAILED (worktree still usable): ${seeded.error.trim().split("\n").slice(-1)[0]}`,
  );
} else if (!cfg.seedCommand) {
  step("database not seeded (no seedCommand configured for this repo)");
}

// --- 8. registry --------------------------------------------------------------
if (!DRY) {
  const registry = join(worktreesDir, "registry.json");
  const all = existsSync(registry) ? JSON.parse(readFileSync(registry, "utf8")) : {};
  all[name] = {
    path: worktreePath,
    branch,
    base: `${remote}/${defaultBranch}@${baseSha}`,
    ports,
    distDir,
    dbPath,
    createdAt: new Date().toISOString(),
  };
  writeFileSync(registry, JSON.stringify(all, null, 2) + "\n");
}

// --- 9. refuse to advise a dev server when one is already running -----------
// The "never run two dev servers against one worktree" rule already existed in
// prose and was still broken repeatedly, at a cost of hours. So setup checks it
// instead of restating it. Read-only and non-fatal to the worktree that was
// just built: everything above is already on disk and correct.
const devPort = ports.dev ?? ports[portNames[0]];
const preflight = devServerPreflight({ distDir: join(worktreePath, distDir), port: devPort });
if (preflight.warning) step(`WARNING: ${preflight.warning}`);
if (!preflight.ok) die(preflight.message);
if (preflight.ok && !preflight.warning) step("dev-server preflight: nothing holding this lane's build dir or port");

console.log(`\n  ready.\n`);
console.log(`    cd ${worktreePath}`);
// The env is printed INLINE, not left to the .env file written above. A dev
// server reads its port and build dir from the process environment at startup;
// an .env file is loaded later, for application code. Printing the bare command
// therefore advised a lane onto the DEFAULT port and the DEFAULT build dir --
// defeating the isolation this whole script exists to provide, and putting two
// lanes on one build dir, which is the silent-corruption incident the
// dev-server preflight above already refuses. Key names AND values both come
// from the same config keys used for the .env file, so a repo that configures
// none of them still prints a correct bare command.
const shq = (v) => (/^[A-Za-z0-9_.\/:@=-]+$/.test(v) ? v : `'${String(v).replace(/'/g, `'\\''`)}'`);
const devEnv = envPairs.map(([k, v]) => `${k}=${shq(v)}`).join(" ");
console.log(`    ${devEnv ? devEnv + " " : ""}${cfg.devCommand ?? "pnpm dev"}`);
console.log(`\n  All git work happens here - rebase, commit and push from this directory:`);
console.log(`    git fetch ${remote} && git rebase ${remote}/${defaultBranch}`);
console.log(`    git push -u ${remote} ${branch}\n`);
