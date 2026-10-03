#!/usr/bin/env node
// Push Worker runtime secrets from the prod env file.
//
//   pnpm secrets:push --dry-run   → list which names WOULD be pushed
//   pnpm secrets:push             → push them (one bulk call = one Worker version)
//
// Only NAMES are ever printed; values travel to wrangler over stdin.
//
// WHY an explicit allowlist instead of "everything in the prod env file": that
// file is the deploy credential file. It holds CLOUDFLARE_API_TOKEN, which must
// NEVER become a Worker secret (that would hand the Worker the keys to its own
// account). So runtime secrets are enumerated here by hand and reviewed on change.
//
// Runtime secrets are read in code with readRuntimeEnv() (src/lib/runtime-env.ts).
import { spawnSync } from "node:child_process";
import { partitionSecrets, PROD_ENV_FILE } from "./lib/deploy-guards.mjs";
import { loadProdEnvOrExit, WORKER_NAME } from "./lib/prod-env.mjs";

// Add a name here when a feature needs a runtime secret. Empty today: the site
// has no auth, email, or third-party APIs.
const RUNTIME_SECRETS = [];

const NEVER_PUSH = ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"];
const forbidden = RUNTIME_SECRETS.filter((name) => NEVER_PUSH.includes(name) || name.startsWith("NEXT_PUBLIC_"));
if (forbidden.length > 0) {
  console.error(`Refusing: these must never be Worker secrets: ${forbidden.join(", ")}`);
  process.exit(1);
}

if (RUNTIME_SECRETS.length === 0) {
  console.log("RUNTIME_SECRETS allowlist is empty — nothing to push. Dry run — no secrets pushed.");
  process.exit(0);
}

loadProdEnvOrExit();

const { present, absent } = partitionSecrets(process.env, RUNTIME_SECRETS);
console.log(`Will push (${present.length}):`);
for (const name of present) console.log(`  ${name}`);
console.log(`Skipped — absent from ${PROD_ENV_FILE} (${absent.length}):`);
for (const name of absent) console.log(`  ${name}`);

// Nothing to push also means dry run, so an empty allowlist is never a
// no-op wrangler call.
if (process.argv.includes("--dry-run") || present.length === 0) {
  console.log("Dry run — no secrets pushed.");
  process.exit(0);
}

const payload = Object.fromEntries(present.map((name) => [name, process.env[name]]));
const step = spawnSync("npx", ["wrangler", "secret", "bulk", "--name", WORKER_NAME], {
  env: process.env,
  input: JSON.stringify(payload),
  stdio: ["pipe", "inherit", "inherit"],
});
process.exit(step.status ?? 1);
