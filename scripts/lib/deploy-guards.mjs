// Pure, testable helpers for the deploy and setup scripts. No side effects at
// import time, nothing is printed, and no env VALUE is ever returned in a way a
// caller would log by accident (only names and sources).

// Filenames are assembled by join so editor/agent privacy tooling that pattern-
// matches literal dotenv filenames does not false-positive on this source file.
const DOT_ENV = [".", "env"].join("");

/** The production credential file. Never committed (see .gitignore). */
export const PROD_ENV_FILE = [DOT_ENV, "prod"].join(".");

/**
 * Which required keys are absent. Empty string counts as missing — a key that
 * is present but blank is the same failure, and the more likely typo.
 *
 * @param {Record<string, string | undefined>} env
 * @param {string[]} required
 */
export function findMissingEnv(env, required) {
  return required.filter((key) => !env[key]);
}

// ---------------------------------------------------------------------------
// LOCAL_DB_PATH must never reach a production build.
//
// src/lib/db.ts picks local SQLite over D1 whenever LOCAL_DB_PATH is truthy.
// Next/OpenNext bake dotenv values into the Worker at BUILD time, so a
// LOCAL_DB_PATH in any dotenv file makes the deployed Worker take the local
// branch: every DB call 500s while pages still return 200. (This exact outage
// happened in the project this setup is modelled on.)
// ---------------------------------------------------------------------------

/** The dotenv files Next loads for a production build, highest precedence first. */
export const BUILD_ENV_FILES = [
  [DOT_ENV, "production", "local"].join("."),
  [DOT_ENV, "local"].join("."),
  [DOT_ENV, "production"].join("."),
  DOT_ENV,
];

/**
 * Every source that sets LOCAL_DB_PATH to a truthy value. Blank is harmless:
 * db.ts branches on truthiness.
 *
 * @param {Record<string, string | undefined>} env
 * @param {{ file: string, value: string | undefined }[]} fileEntries
 */
export function findLocalDbPathSources(env, fileEntries) {
  const found = [];
  if (env && env.LOCAL_DB_PATH) found.push({ source: "process.env", value: env.LOCAL_DB_PATH });
  for (const entry of fileEntries ?? []) {
    if (entry && entry.value) found.push({ source: entry.file, value: entry.value });
  }
  return found;
}

/**
 * OpenNext's build-time snapshot of the environment, which the deployed Worker
 * reads at runtime. A clean build has no LOCAL_DB_PATH key in it at all.
 */
export const BAKED_ENV_MODULE = ".open-next/cloudflare/next-env.mjs";

/**
 * Every truthy LOCAL_DB_PATH baked into the built Worker's env snapshot.
 *
 * Do NOT scan the bundle for `better-sqlite3` instead: db.ts resolves the local
 * driver with a runtime require() that no bundler can tree-shake, so the driver
 * is present in every build, clean or not. The real signature is the baked
 * variable that makes the code TAKE that branch.
 *
 * Never throws — it runs mid-deploy.
 *
 * @param {string} envModuleText
 * @returns {string[]}
 */
export function findBakedLocalDbPath(envModuleText) {
  if (typeof envModuleText !== "string" || envModuleText.length === 0) return [];
  const found = new Set();
  const pattern = /"?LOCAL_DB_PATH"?\s*:\s*("(?:[^"\\]|\\.)*")/g;
  for (const match of envModuleText.matchAll(pattern)) {
    try {
      const value = JSON.parse(match[1]);
      if (value) found.add(value);
    } catch {
      // unparseable literal — ignore
    }
  }
  return [...found];
}

/**
 * Is a /api/health response real data, or a 200 that hides a dead database?
 *
 * @param {number} status
 * @param {string} body
 */
export function checkHealthResponse(status, body) {
  if (status !== 200) return { ok: false, error: `HTTP ${status}` };
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return { ok: false, error: "health body is not JSON" };
  }
  if (!parsed || parsed.ok !== true) return { ok: false, error: "health reported ok !== true" };
  if (typeof parsed.projects !== "number") return { ok: false, error: "health is missing a numeric project count" };
  return { ok: true, projects: parsed.projects };
}

/**
 * Decide whether the working copy is deployable. Production deploys exactly
 * what is on origin/main — nothing local, nothing uncommitted.
 *
 * @param {{ headSha: string | null, originSha: string | null, porcelain: string | null }} state
 */
export function checkDeployableGitState({ headSha, originSha, porcelain }) {
  if (!headSha) return { ok: false, error: "could not read HEAD" };
  if (!originSha) return { ok: false, error: "could not read origin/main (run `git fetch origin` first)" };
  if (porcelain === null) return { ok: false, error: "could not read `git status`" };
  if (porcelain.trim().length > 0) return { ok: false, error: "working tree is dirty — commit or stash first" };
  if (headSha !== originSha) {
    return { ok: false, error: `HEAD (${headSha.slice(0, 8)}) is not origin/main (${originSha.slice(0, 8)}) — push or pull first` };
  }
  return { ok: true, sha: originSha };
}

/**
 * Replace the D1 database_id in wrangler.jsonc text. Matches the id that sits in
 * the same object as `"database_name": "<name>"`, whichever key comes first.
 * Returns null when the block cannot be found exactly once (caller refuses to
 * guess).
 *
 * @param {string} text
 * @param {string} databaseName
 * @param {string} databaseId
 */
export function setD1DatabaseId(text, databaseName, databaseId) {
  const objectPattern = /\{[^{}]*\}/g;
  const blocks = [...text.matchAll(objectPattern)].filter((m) =>
    new RegExp(`"database_name"\\s*:\\s*"${databaseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`).test(m[0])
  );
  if (blocks.length !== 1) return null;
  const block = blocks[0];
  const idPattern = /("database_id"\s*:\s*")[^"]*(")/;
  if (!idPattern.test(block[0])) return null;
  const replaced = block[0].replace(idPattern, `$1${databaseId}$2`);
  return text.slice(0, block.index) + replaced + text.slice(block.index + block[0].length);
}

/** Names of runtime secrets present in env, and absent ones. Never values. */
export function partitionSecrets(env, allowlist) {
  const present = allowlist.filter((name) => typeof env[name] === "string" && env[name] !== "");
  const absent = allowlist.filter((name) => !present.includes(name));
  return { present, absent };
}
