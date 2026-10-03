import { Database } from "bun:sqlite";
import { createLocalD1, type SqliteDriver } from "../../src/lib/local-db";

/**
 * Fresh in-memory D1 for a test, built with the SAME wrapper the app uses
 * locally (src/lib/local-db.ts) — only the driver differs, because Bun cannot
 * load better-sqlite3. The idempotent schema is applied by createLocalD1, and a
 * broken migration throws here instead of yielding a silently wrong DB.
 */
export function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  const db = createLocalD1(sqlite as unknown as SqliteDriver);
  return { db, sqlite };
}
