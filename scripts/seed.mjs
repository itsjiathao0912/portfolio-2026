#!/usr/bin/env node
// Seed the database from content/ (the source of truth for all site content).
//
//   pnpm db:seed:local    → LOCAL_DB_PATH, or ./local.db
//   pnpm db:seed:remote   → the production D1 database (needs the prod env file)
//
// The seed SYNCS: every entry in content/ is upserted, and rows whose id is no
// longer in content/ are deleted. Safe to run repeatedly.
//
// content/*.ts and src/lib/project-rows.ts are imported directly — Node 22
// strips TypeScript types natively, so there is no build step.
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { projectEntries } from "../content/index.ts";
import { parseProjects } from "../content/schema.ts";
import { buildSeedStatements, renderStatementsAsSql } from "../src/lib/project-rows.ts";
import { capture, D1_DATABASE_NAME, loadProdEnvOrExit } from "./lib/prod-env.mjs";

const target = process.argv.includes("--remote") ? "remote" : process.argv.includes("--local") ? "local" : null;
if (!target) {
  console.error("Usage: node scripts/seed.mjs --local | --remote");
  process.exit(1);
}

const parsed = parseProjects(projectEntries);
if (!parsed.ok) {
  console.error("Content is invalid — nothing was written:");
  for (const error of parsed.errors) console.error(`  - ${error}`);
  process.exit(1);
}

const statements = buildSeedStatements(parsed.projects);
const migration = readFileSync(path.join(process.cwd(), "schema", "migration.sql"), "utf8");

if (target === "local") {
  const { default: Database } = await import("better-sqlite3");
  const dbPath = process.env.LOCAL_DB_PATH || path.join(process.cwd(), "local.db");
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(migration);
  const apply = db.transaction(() => {
    for (const { sql, params } of statements) db.prepare(sql).run(...params);
  });
  apply();
  const count = db.prepare(`SELECT COUNT(*) AS n FROM "Project"`).get().n;
  db.close();
  console.log(`Seeded ${parsed.projects.length} project(s) into ${path.relative(process.cwd(), dbPath) || dbPath} (table now has ${count}).`);
} else {
  loadProdEnvOrExit();
  const probe = capture("npx", ["wrangler", "d1", "list", "--json"]);
  if (probe.status !== 0 || !probe.stdout.includes(`"${D1_DATABASE_NAME}"`)) {
    console.error(`D1 database "${D1_DATABASE_NAME}" not found on this account. Run \`pnpm cf:setup\` first.`);
    process.exit(1);
  }
  // Remote D1 takes literal SQL text, not bound params. The file lives under
  // .wrangler/ (gitignored) and is removed afterwards.
  const dir = path.join(process.cwd(), ".wrangler", "tmp");
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `seed-${process.pid}.sql`);
  writeFileSync(file, `${migration}\n${renderStatementsAsSql(statements)}\n`);
  // Not runOrExit: process.exit() would skip cleanup of the temp file.
  console.log("\n=== wrangler d1 execute (remote seed) ===");
  const step = spawnSync(
    "npx",
    ["wrangler", "d1", "execute", D1_DATABASE_NAME, "--remote", "--yes", "--file", file],
    { env: process.env, stdio: "inherit" }
  );
  rmSync(file, { force: true });
  if (step.status !== 0) {
    console.error(`Remote seed failed (exit ${step.status ?? "signal"}).`);
    process.exit(step.status ?? 1);
  }
  console.log(`Seeded ${parsed.projects.length} project(s) into remote D1 "${D1_DATABASE_NAME}".`);
}
