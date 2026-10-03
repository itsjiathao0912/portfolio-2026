#!/usr/bin/env node
// One-time (and safely re-runnable) Cloudflare provisioning.
//
//   pnpm cf:setup             → create what is missing, write the D1 id into wrangler.jsonc
//   pnpm cf:setup --dry-run   → report what WOULD happen; change nothing
//
// Idempotent: an existing D1 database / R2 bucket is detected and reused, never
// recreated. Credentials come from the prod env file (CLOUDFLARE_API_TOKEN +
// CLOUDFLARE_ACCOUNT_ID). Nothing secret is printed.
import { readFileSync, writeFileSync } from "node:fs";
import { setD1DatabaseId } from "./lib/deploy-guards.mjs";
import { capture, D1_DATABASE_NAME, loadProdEnvOrExit, R2_BUCKET_NAME, runOrExit } from "./lib/prod-env.mjs";

const dryRun = process.argv.includes("--dry-run");
const WRANGLER_CONFIG = "wrangler.jsonc";

loadProdEnvOrExit();

function findD1Id() {
  const listed = capture("npx", ["wrangler", "d1", "list", "--json"]);
  if (listed.status !== 0) {
    console.error("`wrangler d1 list` failed. Check CLOUDFLARE_API_TOKEN permissions (D1 edit) and CLOUDFLARE_ACCOUNT_ID.");
    console.error(listed.stderr.trim().split("\n").slice(-5).join("\n"));
    process.exit(1);
  }
  let databases;
  try {
    databases = JSON.parse(listed.stdout);
  } catch {
    console.error("Could not parse `wrangler d1 list --json` output.");
    process.exit(1);
  }
  const match = Array.isArray(databases) ? databases.find((d) => d?.name === D1_DATABASE_NAME) : null;
  return match ? (match.uuid ?? match.id ?? match.database_id ?? null) : null;
}

// ── D1 ──────────────────────────────────────────────────────────────────────
let databaseId = findD1Id();
if (databaseId) {
  console.log(`D1 "${D1_DATABASE_NAME}": exists (${databaseId})`);
} else if (dryRun) {
  console.log(`D1 "${D1_DATABASE_NAME}": MISSING — would create`);
} else {
  runOrExit(`wrangler d1 create ${D1_DATABASE_NAME}`, "npx", ["wrangler", "d1", "create", D1_DATABASE_NAME]);
  databaseId = findD1Id();
  if (!databaseId) {
    console.error(`Created "${D1_DATABASE_NAME}" but could not find its id afterwards. Re-run \`pnpm cf:setup\`.`);
    process.exit(1);
  }
  console.log(`D1 "${D1_DATABASE_NAME}": created (${databaseId})`);
}

if (databaseId) {
  const text = readFileSync(WRANGLER_CONFIG, "utf8");
  const updated = setD1DatabaseId(text, D1_DATABASE_NAME, databaseId);
  if (updated === null) {
    console.error(`Could not find exactly one d1_databases entry named "${D1_DATABASE_NAME}" in ${WRANGLER_CONFIG}. Edit it by hand.`);
    process.exit(1);
  }
  if (updated === text) {
    console.log(`${WRANGLER_CONFIG}: database_id already correct`);
  } else if (dryRun) {
    console.log(`${WRANGLER_CONFIG}: would set database_id to ${databaseId}`);
  } else {
    writeFileSync(WRANGLER_CONFIG, updated);
    console.log(`${WRANGLER_CONFIG}: database_id set to ${databaseId} — commit this change`);
  }
}

// ── R2 ──────────────────────────────────────────────────────────────────────
const bucket = capture("npx", ["wrangler", "r2", "bucket", "info", R2_BUCKET_NAME]);
if (bucket.status === 0) {
  console.log(`R2 "${R2_BUCKET_NAME}": exists`);
} else if (dryRun) {
  console.log(`R2 "${R2_BUCKET_NAME}": MISSING (or unreadable) — would create`);
} else {
  runOrExit(`wrangler r2 bucket create ${R2_BUCKET_NAME}`, "npx", ["wrangler", "r2", "bucket", "create", R2_BUCKET_NAME]);
}

console.log(
  dryRun
    ? "\nDry run — nothing was changed."
    : "\nDone. Next: pnpm db:migrate:remote → pnpm db:seed:remote → commit wrangler.jsonc → push → pnpm run deploy:prod"
);
