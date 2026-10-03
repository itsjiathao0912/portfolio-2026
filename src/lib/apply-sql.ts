import fs from "node:fs";

interface SqlExecutor {
  exec(sql: string): unknown;
}

/**
 * Apply a SQL file as one multi-statement batch.
 *
 * Errors are NOT swallowed: a broken migration throws loudly, so a dev/test
 * database can never be silently built against the wrong schema.
 * `schema/migration.sql` is idempotent (CREATE ... IF NOT EXISTS), so this is
 * safe on both a fresh and an existing database.
 */
export function applySqlFile(db: SqlExecutor, filePath: string) {
  applySql(db, fs.readFileSync(filePath, "utf-8"));
}

export function applySql(db: SqlExecutor, sql: string) {
  db.exec(sql);
}
