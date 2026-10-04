#!/usr/bin/env node
// Isolated E2E lane: a production `next build` + `next start` that shares
// NOTHING mutable with a running dev server or another run.
//
//   pnpm test:e2e:isolated                    → all specs
//   pnpm test:e2e:isolated -- --grep "home"   → args go to `playwright test`
//
// Per run, everything is private:
//   build dir  .next-e2e-<id>          (NEXT_DIST_DIR — read by next.config.ts)
//   database   playwright/.tmp/e2e-<id>.db   (LOCAL_DB_PATH, seeded from content/)
//   port       an OS-assigned free port
//
// Why a private build dir: two Next processes writing one dist dir corrupt each
// other silently — the symptom is a stale or blank page, not an error.
//
// Cleanup runs on success, failure, AND Ctrl-C/SIGTERM (async spawns keep the
// event loop free so the signal handlers actually run).
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { restoredTsconfigText } from "./tsconfig-restore.mjs";

const root = process.cwd();
const runId = `${Date.now()}-${process.pid}`;
const distDir = `.next-e2e-${runId}`;
const tmpDir = path.join(root, "playwright", ".tmp");
const dbPath = path.join(tmpDir, `e2e-${runId}.db`);
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const playwrightCli = path.join(root, "node_modules", "@playwright", "test", "cli.js");

if (path.resolve(root, distDir) === path.resolve(root, ".next")) {
  throw new Error("refusing to run: computed build dir is the shared .next");
}

// `next build` rewrites tsconfig.json (reformats it and adds `<distDir>/types/**`
// includes). With a per-run dir those entries go stale the moment we delete it.
// Restore by content snapshot: drop every `.next-e2e-*` include whose dir no
// longer exists from BOTH the before and after versions; if what is left is the
// same, write the clean before-text back. Idempotent: a file that was already
// dirty with stale entries from older runs comes back clean, never dirtier.
// Any other difference (someone edited the file mid-run) is left alone.
const tsconfigPath = path.join(root, "tsconfig.json");
const tsconfigBefore = readFileSync(tsconfigPath, "utf8");

function restoreTsconfig() {
  const after = readFileSync(tsconfigPath, "utf8");
  const text = restoredTsconfigText(tsconfigBefore, after, (dir) => existsSync(path.join(root, dir)));
  if (text === null) {
    console.warn("[e2e] tsconfig.json changed during the run beyond Next's own edits — left as is.");
    return;
  }
  if (text !== after) writeFileSync(tsconfigPath, text);
}

let server = null;
let cleanedUp = false;

function stopServer() {
  if (!server?.pid) return;
  try {
    process.kill(-server.pid, "SIGTERM"); // whole process group (next start + workers)
  } catch {
    try {
      server.kill("SIGTERM");
    } catch {
      /* already gone */
    }
  }
}

function cleanup() {
  if (cleanedUp) return;
  cleanedUp = true;
  stopServer();
  rmSync(path.join(root, distDir), { recursive: true, force: true });
  for (const suffix of ["", "-wal", "-shm"]) rmSync(`${dbPath}${suffix}`, { force: true });
  restoreTsconfig();
}

process.on("exit", cleanup);
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => {
    console.error(`[e2e] received ${signal} — cleaning up`);
    cleanup();
    process.exit(1);
  });
}

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

function run(label, command, args, env) {
  return new Promise((resolve) => {
    console.log(`\n=== [e2e] ${label} ===`);
    const child = spawn(command, args, { cwd: root, env, stdio: "inherit" });
    child.on("exit", (code, signal) => resolve(signal ? 1 : (code ?? 1)));
    child.on("error", (error) => {
      console.error(`[e2e] ${label} failed to start: ${error.message}`);
      resolve(1);
    });
  });
}

async function waitForHealthy(baseUrl, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (server?.exitCode !== null && server?.exitCode !== undefined) return false;
    try {
      const res = await fetch(`${baseUrl}/api/health`);
      if (res.ok) return true;
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

// Base env for every step: test markers on, no inherited per-run overrides.
// The output dir is per run so concurrent runs never delete each other's
// screenshots, traces and logs (see playwright.config.ts).
const baseEnv = {
  ...process.env,
  PORTFOLIO_E2E: "1",
  NEXT_TELEMETRY_DISABLED: "1",
  E2E_OUTPUT_DIR: `test-results/run-${runId}`,
};
delete baseEnv.LOCAL_DB_PATH;
delete baseEnv.NEXT_DIST_DIR;

async function main() {
  mkdirSync(tmpDir, { recursive: true });
  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[e2e] build dir ${distDir} · db ${path.relative(root, dbPath)} · ${baseUrl}`);

  const dbEnv = { ...baseEnv, LOCAL_DB_PATH: dbPath };
  if ((await run("seed", process.execPath, ["scripts/seed.mjs", "--local"], dbEnv)) !== 0) return 1;

  // No LOCAL_DB_PATH at build time: pages are dynamic and must not touch a DB
  // during the build (and the deploy guard treats a baked LOCAL_DB_PATH as fatal).
  const buildEnv = { ...baseEnv, NEXT_DIST_DIR: distDir };
  if ((await run("next build", process.execPath, [nextBin, "build"], buildEnv)) !== 0) return 1;

  console.log("\n=== [e2e] next start ===");
  server = spawn(process.execPath, [nextBin, "start", "-p", String(port), "-H", "127.0.0.1"], {
    cwd: root,
    env: { ...dbEnv, NEXT_DIST_DIR: distDir },
    stdio: "inherit",
    detached: true, // own process group so stopServer() reaches every child
  });
  if (!(await waitForHealthy(baseUrl, 60_000))) {
    console.error("[e2e] server did not become healthy within 60s");
    return 1;
  }

  const forwarded = process.argv.slice(2).filter((arg, i) => !(i === 0 && arg === "--"));
  return run("playwright test", process.execPath, [playwrightCli, "test", ...forwarded], {
    ...baseEnv,
    E2E_BASE_URL: baseUrl,
  });
}

let status = 1;
try {
  status = await main();
} finally {
  cleanup();
}
process.exit(status);
