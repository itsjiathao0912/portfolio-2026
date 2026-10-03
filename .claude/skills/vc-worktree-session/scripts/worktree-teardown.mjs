#!/usr/bin/env node
// Remove a worktree safely.
//
//   node worktree-teardown.mjs <name> [--land] [--force] [--dry-run] [--keep-branch]
//
// --land is the normal END of a worktree session: rebase onto the remote default
// branch, push the work there, tear down the repo's public URL if it opened one,
// then remove the worktree, its branch and its database. Without --land it only
// removes things, which is right when the work is being abandoned.
//
// Fail-closed by default: refuses when the worktree still holds work
// (uncommitted changes, untracked files, or commits not on the remote).
// Destroying an agent's only copy of its work has happened in this repo before.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  currentCheckoutPath,
  loadConfig,
  mainCheckoutPath,
  pidsHoldingDir,
  shQuiet,
} from "./worktree-lib.mjs";

const argv = process.argv.slice(2);
const name = argv.find((a) => !a.startsWith("--"));
const flag = (f) => argv.includes(f);
const DRY = flag("--dry-run");

function die(msg) { console.error(`\n  x ${msg}\n`); process.exit(1); }
function step(msg) { console.log(`  . ${msg}`); }

if (!name) die("usage: worktree-teardown.mjs <name> [--force] [--dry-run] [--keep-branch]");

const repoRoot = mainCheckoutPath();
const loaded = loadConfig(currentCheckoutPath(), repoRoot);
if (!loaded.ok) die(loaded.error);
const cfg = loaded.config;

const worktreesDir = resolve(repoRoot, cfg.worktreesDir ?? "../worktrees");
const worktreePath = join(worktreesDir, name);
if (!existsSync(worktreePath)) die(`no such worktree: ${worktreePath}`);
if (resolve(worktreePath) === resolve(repoRoot)) die("refusing: that is the main checkout");

console.log(`\n  teardown "${name}"  ${worktreePath}${DRY ? "  (dry run)" : ""}`);

// --- 0. land the work first (opt-in via --land) ------------------------------
// Ordering is the point: rebase and push BEFORE anything is destroyed. Tearing
// down first and pushing after leaves a window where a failed push has already
// deleted the only copy of the work.
if (flag("--land")) {
  const remote = cfg.remote ?? "origin";
  const base = cfg.defaultBranch ?? "main";

  const dirtyNow = shQuiet("git", ["-C", worktreePath, "status", "--porcelain"]);
  if (dirtyNow.ok && dirtyNow.out) {
    die(
      `refusing to land: uncommitted changes in the worktree.\n` +
        `    Commit them first - landing is not a commit step, and a rebase\n` +
        `    would fail or silently strand them.\n\n` +
        dirtyNow.out.split("\n").slice(0, 10).map((l) => `      ${l}`).join("\n"),
    );
  }

  step(`fetching ${remote}/${base}`);
  if (!DRY) {
    const fetched = shQuiet("git", ["-C", worktreePath, "fetch", remote, base, "--quiet"]);
    if (!fetched.ok) die(`fetch failed, nothing was changed: ${fetched.error}`);
    const rebased = shQuiet("git", ["-C", worktreePath, "rebase", `${remote}/${base}`]);
    if (!rebased.ok) {
      die(
        `rebase onto ${remote}/${base} failed - resolve it in the worktree, then re-run.\n` +
          `    Nothing has been deleted.\n\n${rebased.error}`,
      );
    }
    step(`rebased onto ${remote}/${base}`);
    const ahead = shQuiet("git", ["-C", worktreePath, "rev-list", "--count", `${remote}/${base}..HEAD`]);
    const count = ahead.ok ? Number(ahead.out) : 0;
    if (count === 0) {
      step("nothing to push (no commits ahead)");
    } else {
      const pushed = shQuiet("git", ["-C", worktreePath, "push", remote, `HEAD:${base}`]);
      if (!pushed.ok) die(`push failed, nothing was deleted:\n${pushed.error}`);
      step(`pushed ${count} commit(s) to ${remote}/${base}`);
    }
  } else {
    step(`would rebase onto ${remote}/${base} and push`);
  }
}

// --- 0b. repo-specific: close the public URL, if this repo opens one ---------
// Config-driven so this file stays repo-agnostic. A tunnel touches account-wide
// DNS and Worker routes; leaving orphans behind is how an account accumulates
// cruft nobody can later identify.
const tunnelTeardown = cfg.repoNotes?.publicUrl?.teardown;
if (tunnelTeardown) {
  const cmd = tunnelTeardown.replaceAll("<name>", name).replaceAll("{name}", name);
  if (DRY) {
    step(`would run public-URL teardown: ${cmd}`);
  } else {
    const res = shQuiet("sh", ["-c", `cd ${JSON.stringify(worktreePath)} && ${cmd}`]);
    // Never fatal: a tunnel that was never opened is the common case.
    step(res.ok ? "public URL torn down" : "no public URL to tear down (or already gone)");
  }
}

// --- 1. unsaved work check ----------------------------------------------------
const dirty = shQuiet("git", ["-C", worktreePath, "status", "--porcelain"]);
const dirtyFiles = dirty.ok ? dirty.out.split("\n").filter(Boolean) : [];
const branchRes = shQuiet("git", ["-C", worktreePath, "rev-parse", "--abbrev-ref", "HEAD"]);
const branch = branchRes.ok ? branchRes.out : "(unknown)";
const remote = cfg.remote ?? "origin";
const unpushed = shQuiet("git", ["-C", worktreePath, "log", "--oneline", `${remote}/${cfg.defaultBranch ?? "main"}..HEAD`]);
const unpushedCommits = unpushed.ok ? unpushed.out.split("\n").filter(Boolean) : [];

if (dirtyFiles.length) step(`uncommitted/untracked files: ${dirtyFiles.length}`);
if (unpushedCommits.length) step(`commits not on ${remote}/${cfg.defaultBranch ?? "main"}: ${unpushedCommits.length}`);

if ((dirtyFiles.length || unpushedCommits.length) && !flag("--force")) {
  console.error(`\n  x refusing to remove - this worktree still holds work.\n`);
  if (dirtyFiles.length) console.error(dirtyFiles.slice(0, 15).map((l) => `      ${l}`).join("\n"));
  if (unpushedCommits.length) console.error(unpushedCommits.slice(0, 10).map((l) => `      ${l}`).join("\n"));
  console.error(`\n    Push the branch, or re-run with --force to discard.\n`);
  process.exit(1);
}

// --- 2. kill holders BY OPEN FILE HANDLE, not by port or process name ---------
// Killing by listening port misses the PostCSS/worker child (it holds no socket).
// `pkill -f <path>` misses a process whose path is only its cwd, not in its argv.
// Either mistake leaves an orphan that rewrites the build dir of the NEXT run,
// and makes `rm -rf` fail with "Directory not empty".
//
// SELF-PRESERVATION: this process, and every process that spawned it, are
// legitimately "holding" the worktree whenever teardown is invoked from a cwd
// inside it -- shell -> node -> agent. Killing them ends teardown mid-run,
// which is strictly worse than the orphan it exists to remove. This guard is
// newly REACHABLE (not newly needed): pidsHoldingDir used to return [] always,
// because lsof exits 1 on a partial stat and its stdout was discarded.
//
// Depth: the FULL parent chain to pid 1, capped at 20 hops. The chain is not a
// fixed length (sh -> npm -> node -> agent is already 4) so a fixed depth of 2
// would still kill a grandparent. One `ps` per hop is a handful of cheap
// POSIX calls, and 20 is only a cycle guard.
const SELF_CHAIN_MAX_DEPTH = 20;
function selfChain() {
  const chain = [process.pid];
  let cur = process.ppid;
  let truncated = false;
  for (let i = 0; i < SELF_CHAIN_MAX_DEPTH && Number.isInteger(cur) && cur > 1; i++) {
    chain.push(cur);
    const res = shQuiet("ps", ["-o", "ppid=", "-p", String(cur)]);
    if (!res.ok) { truncated = true; break; }
    const next = Number(res.out.trim());
    if (!Number.isInteger(next) || next <= 1 || chain.includes(next)) break;
    cur = next;
  }
  return { chain, truncated };
}

const { chain: selfPids, truncated: chainTruncated } = selfChain();
if (chainTruncated) {
  // Loud, never silent: a shortened chain means the filter is NARROWER than
  // intended, and a silently narrowed self-filter is how the original bug hid.
  step(`warning: could not walk the full parent chain (stopped at ${selfPids.length} pid(s)) - an ancestor above that may not be protected`);
}

const allHolders = pidsHoldingDir(worktreePath);
const excluded = allHolders.filter((pid) => selfPids.includes(pid));
const holders = allHolders.filter((pid) => !selfPids.includes(pid));

for (const pid of excluded) {
  const why = pid === process.pid ? "this process" : pid === process.ppid ? "its parent" : "an ancestor of this process";
  step(`not killing pid ${pid} (${why})`);
}

if (holders.length) {
  step(`processes holding files here: ${holders.join(", ")}`);
  for (const pid of holders) {
    if (DRY) continue;
    shQuiet("kill", ["-TERM", String(pid)]);
  }
  if (!DRY) {
    const stubborn = pidsHoldingDir(worktreePath).filter((pid) => !selfPids.includes(pid));
    for (const pid of stubborn) shQuiet("kill", ["-9", String(pid)]);
    step(`released (${holders.length} pid(s), by open file handle)`);
  }
} else {
  step("no processes holding files here");
}

// --- 3. remove ----------------------------------------------------------------
if (!DRY) {
  const args = ["-C", repoRoot, "worktree", "remove", worktreePath];
  if (flag("--force")) args.push("--force");
  const removed = shQuiet("git", args);
  if (!removed.ok) die(`git worktree remove failed:\n${removed.error}`);
  shQuiet("git", ["-C", repoRoot, "worktree", "prune"]);
  step("worktree removed");

  if (!flag("--keep-branch") && branch !== "(unknown)" && branch !== "HEAD") {
    const del = shQuiet("git", ["-C", repoRoot, "branch", "-D", branch]);
    step(del.ok ? `branch ${branch} deleted` : `branch ${branch} kept (${del.error.trim().split("\n")[0]})`);
  }

  const registry = join(worktreesDir, "registry.json");
  if (existsSync(registry)) {
    const all = JSON.parse(readFileSync(registry, "utf8"));
    delete all[name];
    writeFileSync(registry, JSON.stringify(all, null, 2) + "\n");
  }
}

console.log(`\n  done.\n`);
