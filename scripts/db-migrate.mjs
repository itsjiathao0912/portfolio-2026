#!/usr/bin/env node
// Apply schema/migration.sql (idempotent: CREATE ... IF NOT EXISTS only).
//
//   pnpm db:migrate:local    → LOCAL_DB_PATH, or ./local.db
//   pnpm db:migrate:remote   → the production D1 database (needs the prod env file)
import { readFileSync } from "node:fs";
import path from "node:path";
import { capture, D1_DATABASE_NAME, loadProdEnvOrExit, runOrExit } from "./lib/prod-env.mjs";

const MIGRATION = path.join(process.cwd(), "schema", "migration.sql");
const target = process.argv.includes("--remote") ? "remote" : process.argv.includes("--local") ? "local" : null;

if (!target) {
  console.error("Usage: node scripts/db-migrate.mjs --local | --remote");
  process.exit(1);
}

if (target === "local") {
  const { default: Database } = await import("better-sqlite3");
  const dbPath = process.env.LOCAL_DB_PATH || path.join(process.cwd(), "local.db");
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(readFileSync(MIGRATION, "utf8"));
  db.close();
  console.log(`Applied schema/migration.sql to ${path.relative(process.cwd(), dbPath) || dbPath}`);
} else {
  loadProdEnvOrExit();
  const probe = capture("npx", ["wrangler", "d1", "list", "--json"]);
  if (probe.status !== 0 || !probe.stdout.includes(`"${D1_DATABASE_NAME}"`)) {
    console.error(`D1 database "${D1_DATABASE_NAME}" not found on this account. Run \`pnpm cf:setup\` first.`);
    process.exit(1);
  }
  runOrExit("wrangler d1 execute (remote migration)", "npx", [
    "wrangler", "d1", "execute", D1_DATABASE_NAME, "--remote", "--yes", "--file", MIGRATION,
  ]);
}
