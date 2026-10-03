// Shared helpers for the worktree skills. Repo-agnostic: every repo-specific
// value comes from worktree.config.json at the repo root.
//
// Used by BOTH vc-worktree-session (one lane) and vc-worktree-program (many lanes),
// and copied verbatim into other repos. Keep it free of repo assumptions.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";

export function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf8", ...opts }).trim();
}

export function shQuiet(cmd, args, opts = {}) {
  try {
    return { ok: true, out: sh(cmd, args, opts) };
  } catch (error) {
    return { ok: false, error: error?.stderr?.toString?.() || String(error) };
  }
}

/** Absolute path of the MAIN checkout, even when called from inside a worktree. */
export function mainCheckoutPath(cwd = process.cwd()) {
  const common = sh("git", ["-C", cwd, "rev-parse", "--path-format=absolute", "--git-common-dir"]);
  return join(common, "..");
}

/** Root of the checkout you are STANDING IN -- the worktree, not the main tree. */
export function currentCheckoutPath(cwd = process.cwd()) {
  const res = shQuiet("git", ["-C", cwd, "rev-parse", "--show-toplevel"]);
  return res.ok ? res.out : null;
}

/**
 * Load worktree.config.json, preferring the checkout you are standing in.
 *
 * Order matters. An agent working in a worktree may be the one CHANGING the
 * config -- adding a port, a new gate -- and reading only the main checkout's
 * copy would make that change untestable until after it merged. So: current
 * checkout first, main checkout as fallback (which is what you get when you
 * invoke from the main tree anyway).
 *
 * `roots` are tried in order; the first that has the file wins.
 */
export function loadConfig(...roots) {
  const candidates = roots.filter(Boolean).map((r) => join(r, "worktree.config.json"));
  const path = candidates.find((p) => existsSync(p));
  if (!path) {
    return {
      ok: false,
      error:
        `worktree.config.json not found. Looked in:\n` +
        candidates.map((p) => `      ${p}`).join("\n") +
        `\n\n    Create one at the repo root. It is the ONLY per-repo file the` +
        `\n    shared scripts need -- see the skill's SKILL.md for the keys.`,
    };
  }
  try {
    return { ok: true, config: JSON.parse(readFileSync(path, "utf8")), path };
  } catch (error) {
    return { ok: false, error: `${path} is not valid JSON: ${error.message}` };
  }
}

/**
 * Is `candidate` ignored by git, from the perspective of `cwd`?
 *
 * Load-bearing, not hygiene. Tailwind v4 discovers source files by scanning
 * everything git does NOT ignore. An un-ignored build dir or sqlite file gets
 * read as source, its raw bytes are extracted as "class candidates", invalid
 * UTF-8 becomes U+FFFD, and that lands in the generated CSS as a selector
 * PostCSS cannot parse -- which 500s the whole dev server on every edit.
 * Measured: 5/5 edits broken un-ignored, 0/5 ignored, same worktree, same bundler.
 *
 * NOTE: a `foo/` pattern (trailing slash) only matches when the path exists AND
 * is a directory, so `git check-ignore` on a not-yet-created dir reports a false
 * negative. Callers must create the directory before asking.
 */
export function isIgnored(cwd, candidate) {
  const res = shQuiet("git", ["-C", cwd, "check-ignore", "-q", candidate]);
  return res.ok;
}

/**
 * First free TCP port at or after `start`, skipping anything in `taken`.
 *
 * Binds the WILDCARD address, not 127.0.0.1. A dev server listens on the
 * wildcard (`*:PORT`, IPv6), and on macOS a 127.0.0.1 bind SUCCEEDS against
 * that -- so the probe reported "free" for a port that was plainly in use and
 * every lane was handed the same base port. Measured directly: 127.0.0.1:2000
 * bound fine while wildcard:2000 returned EADDRINUSE, with a live next-server
 * holding `*:2000`.
 */
export async function findFreePort(start, taken = new Set()) {
  for (let port = start; port < start + 500; port += 1) {
    if (taken.has(port)) continue;
    const free = await new Promise((resolve) => {
      const server = createServer();
      server.once("error", () => resolve(false));
      server.once("listening", () => server.close(() => resolve(true)));
      server.listen(port);
    });
    if (free) return port;
  }
  throw new Error(`no free port in [${start}, ${start + 500})`);
}

/**
 * PIDs holding a file handle anywhere under `dir`.
 *
 * Teardown MUST use this rather than matching on port or process name. Killing
 * by listening port misses the PostCSS/worker child (it holds no socket), and
 * `pkill -f <path>` misses a process whose path appears only as its cwd and not
 * in its argv. Both mistakes leave an orphan that silently rewrites the build
 * dir of the next run -- and a `rm -rf` that then fails with "Directory not empty".
 */
export function pidsHoldingDir(dir) {
  // `-Fpn` (pid + name records) rather than `-t` (bare pids), because the pids
  // alone cannot be filtered and `+D` over-matches badly here.
  //
  // Why the filter exists: deps are installed with
  // `--config.package-import-method=hardlink`, so a file under this worktree's
  // node_modules is the SAME INODE as the identical file in every other
  // worktree. `lsof +D` matches on device+inode, so ANOTHER lane's dev server
  // -- holding an ordinary shared dependency open -- is reported as "holding
  // files here". Measured: tearing down one lane reported 8 holders and killed
  // a different lane's live dev server on its own port. Only a handle on a path
  // outside node_modules proves the process is really this lane's.
  const out = lsofOut(["-nP", "-Fpn", "+D", dir]);
  const prefix = dir.endsWith("/") ? dir : dir + "/";
  const held = new Set();
  let pid = null;
  for (const line of String(out || "").split("\n")) {
    if (line.startsWith("p")) {
      const n = Number(line.slice(1).trim());
      pid = Number.isInteger(n) && n > 0 ? n : null;
    } else if (line.startsWith("n") && pid !== null) {
      const path = line.slice(1);
      if (!path.startsWith(prefix)) continue;
      if (path.slice(prefix.length).split("/").includes("node_modules")) continue;
      held.add(pid);
    }
  }
  return [...held];
}

/**
 * Run lsof and keep its STDOUT even when it exits non-zero.
 *
 * lsof exits 1 both for "found nothing" AND for "found something, but could
 * not stat every path I was asked about" -- and the second case is the normal
 * one, because a scan of a build dir always meets a file that vanished
 * mid-scan. Routing it through shQuiet (which discards stdout on a non-zero
 * exit) therefore threw away REAL hits: measured here, lsof printed pid 78761
 * and exited 1, and the helper reported [].
 *
 * That made the open-file-handle check silently blind -- the exact blind spot
 * it exists to close, in the exact helper teardown relies on to avoid leaving
 * an orphan behind.
 */
function lsofOut(args) {
  try {
    return execFileSync("lsof", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch (error) {
    return error?.stdout?.toString?.() ?? "";
  }
}

function parsePids(out) {
  return String(out || "")
    .split("\n")
    .map((l) => Number(l.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
}

/**
 * True when node_modules resolves to a REAL local install.
 *
 * An existence check alone is not enough: some repos symlink node_modules into
 * the worktree, so `existsSync` follows the link back to the main checkout and
 * reports a false pass -- a real prior incident here, where a deploy was
 * attempted against a worktree that had never actually installed anything.
 */
export function depsResolve(worktreePath, probePackage = "next") {
  const probe = join(worktreePath, "node_modules", probePackage, "package.json");
  if (!existsSync(probe)) return { ok: false, error: `node_modules/${probePackage} missing` };
  const real = shQuiet("readlink", ["-f", join(worktreePath, "node_modules")]);
  const insideWorktree = real.ok && real.out.startsWith(worktreePath);
  return insideWorktree
    ? { ok: true, linked: false }
    : { ok: true, linked: true, target: real.out };
}

/** Is `lsof` on PATH? The preflight degrades to a warning without it. */
export function hasLsof() {
  return shQuiet("sh", ["-c", "command -v lsof"]).ok;
}

/** PIDs LISTENING on `port` (not merely connected to it). */
export function pidsListeningOnPort(port) {
  return parsePids(lsofOut(["-t", "-nP", `-iTCP:${port}`, "-sTCP:LISTEN"]));
}

/**
 * Refuse to start a SECOND dev server for a lane.
 *
 * The rule "never run two dev servers against the same worktree -- they share
 * one build dir and silently corrupt it" was already written down, in prose,
 * and was still broken repeatedly in one session at a cost of hours. Prose does
 * not hold. This is the same rule, as something that refuses.
 *
 * Checks TWO things, because either alone has a measured blind spot:
 *  * open file handles on the build dir (reuses pidsHoldingDir) -- catches the
 *    PostCSS/worker child, which holds no socket and so is invisible to a port
 *    check. Proof: `rm -rf <dist-dir>` failed with "Directory not empty" while
 *    such an orphan was still writing.
 *  * a listener on the lane's dev port -- catches a server whose worktree path
 *    appears only as its cwd and not in its argv, which a `pgrep -f <path>`
 *    sweep misses entirely. Proof: PID 94810 survived exactly that kill and
 *    kept serving an already-deleted build dir, corrupting the next server's.
 *
 * Deliberately does NOT kill anything. A silent kill could destroy a
 * colleague's live session -- this repo has a real prior incident of one lane
 * destroying another's uncommitted work. Naming the PIDs and stopping is the
 * correct action; the human decides.
 *
 * Without lsof this returns a WARNING, never a failure: a preflight that
 * crashes is worse than the bug it guards against.
 */
export function devServerPreflight({ distDir, port } = {}) {
  if (!hasLsof()) {
    return {
      ok: true,
      warning:
        "lsof not found - could not check for an already-running dev server.\n" +
        "    Verify by hand that no other server is using this lane's build dir or port;\n" +
        "    two servers sharing one build dir corrupt it silently.",
    };
  }

  const byHandle = distDir && existsSync(distDir) ? pidsHoldingDir(distDir) : [];
  const byPort = port ? pidsListeningOnPort(port) : [];
  const pids = [...new Set([...byHandle, ...byPort])];
  if (!pids.length) return { ok: true, byHandle, byPort };

  const found = [];
  if (byHandle.length) found.push(`      pid ${byHandle.join(", ")}  holding an open file handle on ${distDir}`);
  if (byPort.length) found.push(`      pid ${byPort.join(", ")}  listening on port ${port}`);

  return {
    ok: false,
    byHandle,
    byPort,
    message:
      `a dev server is already running for this lane - refusing to start a second one.\n\n` +
      found.join("\n") +
      `\n\n    Two servers sharing one build dir corrupt it silently: the loser keeps\n` +
      `    writing into a directory the winner has replaced, and the next build\n` +
      `    reads the mixture. Nothing errors; the output is just wrong.\n\n` +
      `    Inspect before you decide:\n` +
      (distDir ? `      lsof -nP +D ${distDir}\n` : "") +
      (port ? `      lsof -nP -iTCP:${port} -sTCP:LISTEN\n` : "") +
      `\n    Nothing was killed. That other server may be someone's live session -\n` +
      `    stop it deliberately, or use a different lane.`,
  };
}
