// Local D1 emulation: a D1-shaped wrapper around a synchronous SQLite driver.
//
// The wrapper is DRIVER-AGNOSTIC on purpose. `next dev` / `next start` (Node)
// use better-sqlite3, but Bun cannot load that native module, so the unit tests
// hand the same wrapper a `bun:sqlite` Database instead. Both drivers expose the
// same `prepare(sql).all/get/run(...params)` + `exec(sql)` shape, so the tests
// exercise this exact code rather than a parallel copy of it.

import path from "node:path";
import { applySqlFile } from "./apply-sql";

/** The subset of better-sqlite3 / bun:sqlite this wrapper relies on. */
export interface SqliteDriver {
  exec(sql: string): unknown;
  prepare(sql: string): {
    all(...params: unknown[]): unknown[];
    get(...params: unknown[]): unknown;
    run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  };
}

export const MIGRATION_PATH = path.join(process.cwd(), "schema", "migration.sql");

function withSql(error: unknown, sql: string) {
  const base = error instanceof Error ? error : new Error(String(error));
  const rich = new Error(`${base.message}\n  SQL: ${sql}`);
  rich.stack = base.stack;
  return rich;
}

class LocalD1PreparedStatement {
  private params: unknown[] = [];

  constructor(
    private readonly driver: SqliteDriver,
    private readonly sql: string
  ) {}

  bind(...params: unknown[]) {
    this.params = params;
    return this;
  }

  async all<T>() {
    try {
      return { results: this.driver.prepare(this.sql).all(...this.params) as T[] };
    } catch (error) {
      throw withSql(error, this.sql);
    }
  }

  async first<T>() {
    try {
      return (this.driver.prepare(this.sql).get(...this.params) as T) ?? null;
    } catch (error) {
      throw withSql(error, this.sql);
    }
  }

  async run() {
    try {
      const info = this.driver.prepare(this.sql).run(...this.params);
      return { success: true, meta: { changes: Number(info.changes), last_row_id: Number(info.lastInsertRowid) } };
    } catch (error) {
      throw withSql(error, this.sql);
    }
  }
}

class LocalD1Database {
  constructor(private readonly driver: SqliteDriver) {}

  prepare(sql: string) {
    return new LocalD1PreparedStatement(this.driver, sql);
  }
}

/** Wrap a SQLite driver as a D1Database, applying the idempotent schema first. */
export function createLocalD1(driver: SqliteDriver, migrationPath = MIGRATION_PATH) {
  applySqlFile(driver, migrationPath);
  return new LocalD1Database(driver) as unknown as D1Database;
}

/** Default local database file when LOCAL_DB_PATH is not set. */
export function resolveLocalDbPath() {
  return process.env.LOCAL_DB_PATH || path.join(process.cwd(), "local.db");
}

const cache = new Map<string, D1Database>();

/** Node-only: open (once per path) the better-sqlite3 file database. */
export function getLocalD1() {
  const dbPath = resolveLocalDbPath();
  const cached = cache.get(dbPath);
  if (cached) return cached;

  // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy: keeps the native driver out of any path that never runs locally
  const Database = require("better-sqlite3");
  const driver = new Database(dbPath);
  driver.pragma("journal_mode = WAL");
  driver.pragma("foreign_keys = ON");
  const db = createLocalD1(driver);
  cache.set(dbPath, db);
  return db;
}
