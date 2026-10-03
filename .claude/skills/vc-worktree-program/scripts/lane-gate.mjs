#!/usr/bin/env node
// Lane gates for a multi-worktree program — the two checks that were missing and cost a whole
// run, ported from flowser-turborepo and made config-driven.
//
// WHY THIS EXISTS (both failures are observed, not hypothetical, in the source repo):
//
//   1. PROVISION. A fresh `git worktree` does NOT inherit gitignored files: env files,
//      node_modules, or any other generated/installed artifact. In one real run a lane
//      silently lacked a required env file (it had only the `.example`), so it could not
//      load a whole test lane at all. Nothing warned; that lane just quietly wrote a weaker
//      test, and the untested behavior reached the merge. A documented copy step is not proof
//      the copy happened — assert it.
//
//   2. SKILLS. Headless (`claude -p`) lanes DO have the Skill tool, but under ordinary
//      phrasing they invoke it ZERO times — measured across every lane of a real program,
//      0 skill calls across ~2,000 turns. Only a MANDATORY-FIRST-ACTION framing produced a
//      real call. A lane's own claim that it "used the skills" is not evidence — read its
//      transcript.
//
// CONFIG-DRIVEN (this is the difference from the source version): required env files, required
// paths, and the dependency-resolution probe package all come from `worktree.config.json` at the
// repo root — see `loadConfig()`/`depsResolve()` in the sibling `vc-worktree-session` skill,
// reused here rather than reimplemented. Nothing repo-specific is hardcoded in this file.
//
// Values are NEVER read or printed. Env checks are name-presence only.
//
// Usage:
//   lane-gate.mjs provision --worktree <path> [--require f1,f2,...] [--json]
//   lane-gate.mjs skills    --worktree <path> [--min 1] [--expect vc-test-coverage-plan,...] [--json]
//   lane-gate.mjs all       --worktree <path> [--require ...] [--expect ...] [--json]
//   lane-gate.mjs --self-test
//
// Exit 0 = gate passed. Exit 1 = gate FAILED (do not let the lane proceed / do not trust its report).

import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  lstatSync,
  realpathSync,
  mkdtempSync,
  mkdirSync,
  symlinkSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { join, basename, resolve } from "node:path";
import { homedir, tmpdir } from "node:os";
import { currentCheckoutPath,
  loadConfig, depsResolve, mainCheckoutPath } from "../../vc-worktree-session/scripts/worktree-lib.mjs";

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) out[key] = true;
      else { out[key] = next; i++; }
    } else out._.push(a);
  }
  return out;
}

const list = (v, fallback = []) =>
  typeof v === "string" && v.length ? v.split(",").map((s) => s.trim()).filter(Boolean) : fallback;

/**
 * Is `p` (relative to `worktree`) present as a REAL, resolvable artifact?
 *
 * Two strategies, picked by `config.depsStrategy` (default "install", matching this repo's
 * per-worktree `pnpm install`):
 *   - "install": the path must be a REAL directory/file, not a symlink. A symlinked
 *     node_modules resolves back to the main checkout's install and would silently pass an
 *     `existsSync` check even though THIS worktree never ran its own install — a real prior
 *     incident where a deploy was attempted against a worktree that had never installed
 *     anything. `lstatSync` (which does NOT follow the link) is what catches this; `existsSync`
 *     alone does not.
 *   - "symlink": the opposite is expected — the path itself may be a symlink, but its target
 *     must actually resolve to something real.
 *
 * For a path literally named `node_modules` (or ending in it) with strategy "install", this
 * delegates to `depsResolve()` from the shared worktree lib rather than re-deriving the same
 * symlink check a second time.
 */
function checkArtifactPath(worktree, relPath, { depsStrategy = "install", depsProbePackage = "next" } = {}) {
  const p = join(worktree, relPath);
  const isNodeModules = relPath === "node_modules" || relPath.endsWith("/node_modules");

  if (isNodeModules) {
    const res = depsResolve(worktree, depsProbePackage);
    if (!res.ok) return { ok: false, reason: res.error };
    if (depsStrategy === "install" && res.linked) {
      return { ok: false, reason: `${relPath} is a symlink (target ${res.target}) but depsStrategy is "install" — this worktree never ran its own install` };
    }
    if (depsStrategy === "symlink" && !res.linked) {
      return { ok: false, reason: `${relPath} is a real directory but depsStrategy is "symlink" — expected a link to a shared install` };
    }
    return { ok: true };
  }

  if (!existsSync(p)) return { ok: false, reason: `missing: ${relPath}` };
  let st;
  try { st = lstatSync(p); } catch { return { ok: false, reason: `cannot stat: ${relPath}` }; }
  if (st.isSymbolicLink()) {
    try {
      const target = realpathSync(p);
      if (!existsSync(target)) return { ok: false, reason: `${relPath} is a dangling symlink` };
    } catch {
      return { ok: false, reason: `${relPath} is a dangling symlink` };
    }
  }
  return { ok: true };
}

/**
 * Provisioning gate: can this worktree actually run anything?
 * An `.example` file does NOT satisfy a requirement — that exact miss is what broke a lane.
 *
 * `requiredEnvFiles` and `requiredPaths` both come from `worktree.config.json` (via `cfg`),
 * with sane repo-agnostic fallbacks when a repo's config hasn't declared them yet:
 *   - env files default to `cfg.envFiles`
 *   - paths default to `["node_modules"]` (the one dependency dir every JS/TS repo has)
 * A repo that needs more (a generated ORM client, a second workspace package's own
 * node_modules, ...) declares them under `gates.requiredPaths` in its own config — this script
 * never hardcodes another repo's specific paths.
 */
export function checkProvision(worktree, { cfg = null, requiredEnvFiles = null, requiredPaths = null } = {}) {
  const failures = [];
  const present = [];

  if (!existsSync(worktree)) {
    return { ok: false, failures: [`worktree not found: ${worktree}`], present, checks: {} };
  }

  const envFiles = requiredEnvFiles ?? cfg?.envFiles ?? [];
  const paths = requiredPaths ?? cfg?.gates?.requiredPaths ?? ["node_modules"];
  const depsStrategy = cfg?.depsStrategy ?? "install";
  const depsProbePackage = cfg?.depsProbePackage ?? "next";

  for (const name of envFiles) {
    const p = join(worktree, name);
    const ok = existsSync(p) && statSync(p).isFile();
    if (ok) present.push(name);
    else {
      const hasExample = existsSync(`${p}.example`);
      failures.push(
        `missing ${name}${hasExample ? " (only the .example is present — an .example is NOT usable)" : ""}`,
      );
    }
  }

  const checks = {};
  for (const relPath of paths) {
    const res = checkArtifactPath(worktree, relPath, { depsStrategy, depsProbePackage });
    checks[relPath] = res.ok;
    if (!res.ok) failures.push(res.reason);
  }

  return { ok: failures.length === 0, failures, present, checks };
}

/** Map a worktree path to its transcript directory the way the harness encodes it. */
export function transcriptDir(worktree) {
  // Both `/` AND `.` become `-`. Verified against real dirs in ~/.claude/projects/. Uppercase,
  // digits and existing hyphens are preserved, so do NOT widen this to a blanket
  // [^a-zA-Z0-9] sweep — that would also eat characters this encoding leaves alone.
  const encoded = resolve(worktree).replace(/[/.]/g, "-");
  return join(homedir(), ".claude", "projects", encoded);
}

/**
 * Skill gate: did the lane ACTUALLY invoke skills? Read the transcript, never the lane's claim.
 * Counts real `"name":"Skill"` tool_use entries and which skills were invoked.
 */
export function checkSkills(worktree, { min = 1, expect = [] } = {}) {
  const dir = transcriptDir(worktree);
  const failures = [];
  if (!existsSync(dir)) {
    return { ok: false, skillCalls: 0, invoked: [], transcript: null, failures: [`no transcript dir for ${worktree} (has the lane started?)`] };
  }
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".jsonl"))
    .map((f) => ({ f, m: statSync(join(dir, f)).mtimeMs, s: statSync(join(dir, f)).size }))
    .sort((a, b) => b.s - a.s);
  if (!files.length) {
    return { ok: false, skillCalls: 0, invoked: [], transcript: null, failures: [`no transcript files in ${dir}`] };
  }

  // Scan every transcript in the lane dir — a lane that was resumed writes more than one.
  let skillCalls = 0;
  const invoked = new Set();
  for (const { f } of files) {
    let raw = "";
    try { raw = readFileSync(join(dir, f), "utf8"); } catch { continue; }
    skillCalls += (raw.match(/"name":"Skill"/g) || []).length;
    for (const m of raw.matchAll(/"skill":"([a-z0-9:_-]+)"/gi)) invoked.add(m[1]);
  }

  if (skillCalls < min) {
    failures.push(
      `only ${skillCalls} Skill tool call(s), need >= ${min} — soft phrasing yields 0; the lane prompt must make skill invocation a MANDATORY FIRST ACTION and require proof back`,
    );
  }
  for (const want of expect) {
    if (!invoked.has(want)) failures.push(`required skill never invoked: ${want}`);
  }

  return {
    ok: failures.length === 0,
    skillCalls,
    invoked: [...invoked].sort(),
    transcript: basename(files[0].f),
    failures,
  };
}

function report(name, res, asJson) {
  if (asJson) { console.log(JSON.stringify({ gate: name, ...res }, null, 2)); return res.ok; }
  if (res.ok) console.log(`GATE PASS (${name})`);
  else console.error(`GATE FAIL (${name}):\n  ` + res.failures.join("\n  "));
  return res.ok;
}

function selfTest() {
  const problems = [];

  // A path that cannot exist must fail, not throw.
  const missing = checkProvision("/nonexistent-worktree-xyz");
  if (missing.ok) problems.push("nonexistent worktree reported ok");

  // The real repo root, driven by ITS OWN worktree.config.json, must pass provisioning —
  // this repo genuinely has its env file and a real (non-symlinked) node_modules. Unlike the
  // source version of this gate, this does NOT hardcode which repo or which paths — it loads
  // whatever config this checkout declares, and skips the assertion (does not fail self-test)
  // if no config is found, since this script may be copied into a repo before that repo has
  // written its own worktree.config.json yet.
  let repoRoot = null;
  try { repoRoot = mainCheckoutPath(); } catch { /* not inside a git repo */ }
  if (repoRoot) {
    const loaded = loadConfig(currentCheckoutPath(), repoRoot);
    if (loaded.ok) {
      const real = checkProvision(repoRoot, { cfg: loaded.config });
      if (!real.ok) problems.push(`repo root failed provisioning gate: ${real.failures.join("; ")}`);
    } else {
      console.log(`self-test note: no worktree.config.json found (${loaded.error}) — skipping the real-repo provisioning assertion`);
    }
  } else {
    console.log("self-test note: not inside a git repo — skipping the real-repo provisioning assertion");
  }

  // A symlinked node_modules must FAIL under the default "install" strategy, even though a
  // naive existsSync-only check would follow the link and pass. This is the bug this port
  // fixes relative to the source version.
  problems.push(...selfTestSymlinkCase());

  // An unstarted lane must fail the skill gate rather than silently pass.
  const noSkills = checkSkills("/nonexistent-worktree-xyz");
  if (noSkills.ok) problems.push("nonexistent worktree passed the skill gate");

  if (problems.length) { console.error("SELF-TEST FAILED:\n  " + problems.join("\n  ")); process.exit(1); }
  console.log("self-test ok: missing worktree rejected, real tree accepted (or skipped, no config), symlinked node_modules rejected under install strategy, unstarted lane rejected");
  process.exit(0);
}

// Builds a throwaway dir with a SYMLINKED node_modules and confirms checkProvision rejects it
// under the default "install" depsStrategy (and accepts it under "symlink"). Cleans up after
// itself. This is the case the source version of this gate got wrong: an existsSync-only check
// follows the symlink back to a real install elsewhere and reports a false pass.
function selfTestSymlinkCase() {
  const problems = [];
  let dir = null;
  try {
    dir = mkdtempSync(join(tmpdir(), "lane-gate-selftest-"));
    const realTarget = join(dir, "real-node_modules");
    mkdirSync(join(realTarget, "next"), { recursive: true });
    writeFileSync(join(realTarget, "next", "package.json"), "{}\n");
    symlinkSync(realTarget, join(dir, "node_modules"), "dir");

    const installStrategy = checkProvision(dir, { requiredEnvFiles: [], requiredPaths: ["node_modules"] });
    if (installStrategy.ok) {
      problems.push("symlinked node_modules was accepted under the default install strategy (should be rejected)");
    }

    const symlinkStrategy = checkProvision(dir, {
      requiredEnvFiles: [],
      requiredPaths: ["node_modules"],
      cfg: { depsStrategy: "symlink" },
    });
    if (!symlinkStrategy.ok) {
      problems.push(`symlinked node_modules was rejected under the "symlink" strategy (should be accepted): ${symlinkStrategy.failures.join("; ")}`);
    }
  } catch (error) {
    problems.push(`symlink self-test case could not run: ${error.message}`);
  } finally {
    if (dir) { try { rmSync(dir, { recursive: true, force: true }); } catch { /* best-effort cleanup */ } }
  }
  return problems;
}

const args = parseArgs(process.argv.slice(2));
const cmd = args._[0];
if (args["self-test"]) selfTest();
if (!cmd || !args.worktree) {
  console.error("usage: lane-gate.mjs <provision|skills|all> --worktree <path> [--require a,b] [--expect skill,...] [--min N] [--json]");
  process.exit(1);
}

let cfg = null;
{
  let repoRoot = null;
  try { repoRoot = mainCheckoutPath(); } catch { /* not inside a git repo */ }
  if (repoRoot) {
    const loaded = loadConfig(currentCheckoutPath(), repoRoot);
    if (loaded.ok) cfg = loaded.config;
  }
}

const requiredEnvFiles = args.require !== undefined ? list(args.require) : null;
const expect = list(args.expect, []);
const min = args.min ? Number(args.min) : 1;
const asJson = Boolean(args.json);

let ok = true;
if (cmd === "provision" || cmd === "all") {
  ok = report("provision", checkProvision(args.worktree, { cfg, requiredEnvFiles }), asJson) && ok;
}
if (cmd === "skills" || cmd === "all") {
  ok = report("skills", checkSkills(args.worktree, { min, expect }), asJson) && ok;
}
if (!["provision", "skills", "all"].includes(cmd)) { console.error(`unknown command: ${cmd}`); process.exit(1); }
process.exit(ok ? 0 : 1);
