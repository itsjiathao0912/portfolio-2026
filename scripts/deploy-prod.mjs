#!/usr/bin/env node
// Production deploy. Always run as `pnpm run deploy:prod` — bare `pnpm deploy`
// is a pnpm built-in and never reaches this script.
//
// What it guarantees:
//   1. It deploys EXACTLY origin/main — refuses a dirty tree or a HEAD that is
//      not origin/main.
//   2. It builds in a CLEAN git worktree (../portfolio-2026-deploy) at that sha,
//      so no uncommitted file, local DB, or local dotenv override can leak into
//      the bundle.
//   3. LOCAL_DB_PATH can never reach production: checked before the build
//      (env + dotenv files) and after it (the env snapshot OpenNext baked).
//   4. It is only "done" when the LIVE site answers: the home page AND a
//      D1-backed route (/api/health) must return real data. A page shell can
//      200 while every DB call fails, so status codes alone prove nothing.
//   5. On a failed smoke it prints the exact rollback command.
//
// Env (from the prod env file): CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, SITE_URL.
// Escape hatch: KEEP_DEPLOY_WORKTREE=1 keeps the worktree for debugging.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import {
  BAKED_ENV_MODULE,
  BUILD_ENV_FILES,
  checkDeployableGitState,
  checkHealthResponse,
  findBakedLocalDbPath,
  findLocalDbPathSources,
  PROD_ENV_FILE,
} from "./lib/deploy-guards.mjs";
import { capture, loadProdEnvOrExit, runOrExit } from "./lib/prod-env.mjs";

const root = process.cwd();
const worktree = path.resolve(root, "..", "portfolio-2026-deploy");

loadProdEnvOrExit({ required: ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "SITE_URL"] });
const siteUrl = process.env.SITE_URL.replace(/\/+$/, "");
// A deploy build must use the default `.next` dir — OpenNext reads it.
delete process.env.NEXT_DIST_DIR;

if (/"database_id"\s*:\s*"TBD/.test(readFileSync("wrangler.jsonc", "utf8"))) {
  console.error("BLOCKED: wrangler.jsonc still has a placeholder D1 database_id. Run `pnpm cf:setup` and commit the change.");
  process.exit(1);
}

// ── Git preflight: deploy origin/main, nothing else ────────────────────────
runOrExit("git fetch origin main", "git", ["fetch", "origin", "main"]);
const git = (args) => {
  const r = capture("git", args);
  return r.status === 0 ? r.stdout.trim() : null;
};
const state = checkDeployableGitState({
  headSha: git(["rev-parse", "HEAD"]),
  originSha: git(["rev-parse", "origin/main"]),
  porcelain: git(["status", "--porcelain"]),
});
if (!state.ok) {
  console.error(`BLOCKED: ${state.error}`);
  process.exit(1);
}
const sha = state.sha;

// ── Clean worktree at the pinned sha ───────────────────────────────────────
function removeWorktree() {
  if (process.env.KEEP_DEPLOY_WORKTREE === "1") {
    console.log(`Keeping worktree for debugging: ${worktree}`);
    return;
  }
  if (existsSync(worktree)) {
    spawnSync("git", ["worktree", "remove", "--force", worktree], { stdio: "ignore" });
  }
  spawnSync("git", ["worktree", "prune"], { stdio: "ignore" });
}

if (existsSync(worktree)) {
  const registered = (git(["worktree", "list", "--porcelain"]) ?? "")
    .split("\n")
    .some((line) => line === `worktree ${worktree}`);
  if (!registered) {
    console.error(`BLOCKED: ${worktree} exists and is not a git worktree of this repo. Move it away first.`);
    process.exit(1);
  }
  console.log(`Removing stale deploy worktree ${worktree}`);
  removeWorktree();
}

process.on("exit", removeWorktree);
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(signal, () => process.exit(130));

runOrExit(`git worktree add ${path.basename(worktree)} @ ${sha.slice(0, 8)}`, "git", [
  "worktree", "add", "--detach", worktree, sha,
]);
copyFileSync(path.join(root, PROD_ENV_FILE), path.join(worktree, PROD_ENV_FILE));

const inWorktree = { cwd: worktree, env: { ...process.env, CI: "true" } };
runOrExit("pnpm install --frozen-lockfile", "pnpm", ["install", "--frozen-lockfile"], inWorktree);

// ── Guard 1 (pre-build): LOCAL_DB_PATH must not reach the build ────────────
const fileEntries = BUILD_ENV_FILES.map((file) => path.join(worktree, file))
  .filter((file) => existsSync(file))
  .map((file) => ({ file: path.relative(root, file), value: dotenv.parse(readFileSync(file)).LOCAL_DB_PATH }));
const localDbSources = findLocalDbPathSources(process.env, fileEntries);
if (localDbSources.length > 0) {
  console.error("BLOCKED: LOCAL_DB_PATH is set for a production build. The Worker would use local SQLite and 500 every DB call.");
  for (const { source } of localDbSources) console.error(`  set in: ${source}`);
  process.exit(1);
}

runOrExit("pnpm build:cf", "pnpm", ["build:cf"], inWorktree);

// ── Guard 2 (post-build): nothing baked LOCAL_DB_PATH into the Worker ──────
const bakedEnvPath = path.join(worktree, BAKED_ENV_MODULE);
if (!existsSync(bakedEnvPath)) {
  console.error(`BLOCKED: ${BAKED_ENV_MODULE} was not produced — cannot prove the build is clean.`);
  process.exit(1);
}
if (findBakedLocalDbPath(readFileSync(bakedEnvPath, "utf8")).length > 0) {
  console.error(`BLOCKED: LOCAL_DB_PATH is baked into ${BAKED_ENV_MODULE}. Find its source; do not deploy this build.`);
  process.exit(1);
}

// ── Remember the live version so a failed smoke can print a real rollback ──
let priorVersionId = null;
const listed = capture("npx", ["wrangler", "deployments", "list", "--json"], inWorktree);
if (listed.status === 0) {
  try {
    const deployments = JSON.parse(listed.stdout);
    const latest = Array.isArray(deployments) ? deployments[deployments.length - 1] : null;
    priorVersionId = latest?.versions?.[0]?.version_id ?? latest?.version_id ?? null;
  } catch {
    // first deploy, or unexpected shape — fall back to the placeholder hint
  }
}
const rollbackHint = priorVersionId
  ? `npx wrangler rollback ${priorVersionId}`
  : "npx wrangler rollback <version-id>   # find it with: npx wrangler deployments list";

runOrExit("wrangler deploy", "npx", ["wrangler", "deploy"], inWorktree);

// ── Smoke the LIVE site (retries cover edge propagation) ───────────────────
async function smoke() {
  const home = await fetch(`${siteUrl}/`, { headers: { "cache-control": "no-cache" } });
  const html = await home.text();
  if (home.status !== 200 || !html.includes('data-testid="home"')) {
    return { ok: false, error: `home page: HTTP ${home.status}${home.status === 200 ? " but the page marker is missing" : ""}` };
  }
  const health = await fetch(`${siteUrl}/api/health`, { headers: { "cache-control": "no-cache" } });
  const verdict = checkHealthResponse(health.status, await health.text());
  return verdict.ok ? verdict : { ok: false, error: `/api/health: ${verdict.error}` };
}

console.log(`\n=== smoke ${siteUrl} ===`);
let verdict = { ok: false, error: "not run" };
for (let attempt = 1; attempt <= 5; attempt++) {
  try {
    verdict = await smoke();
  } catch (error) {
    verdict = { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
  if (verdict.ok) break;
  console.log(`  attempt ${attempt}/5 failed: ${verdict.error}`);
  await new Promise((resolve) => setTimeout(resolve, 3000));
}

if (!verdict.ok) {
  console.error(`\nDEPLOYED BUT UNHEALTHY: ${verdict.error}`);
  console.error(`If the database has not been migrated/seeded yet: pnpm db:migrate:remote && pnpm db:seed:remote`);
  console.error(`Otherwise roll back now:\n  ${rollbackHint}`);
  process.exit(1);
}

console.log(`Smoke OK — live site serves the home page and D1 returned ${verdict.projects} published project(s).`);
console.log(`Deployed ${sha.slice(0, 8)} to ${siteUrl}`);
