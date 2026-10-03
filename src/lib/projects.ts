import { queryAll, queryFirst } from "./db";
import { rowToProject, type ProjectRow } from "./project-rows";

/**
 * Published projects in display order. Rows that fail validation are skipped
 * and reported, so one bad row cannot blank the whole page.
 */
export async function listPublishedProjects(db: D1Database) {
  const rows = await queryAll<ProjectRow>(
    db,
    `SELECT * FROM "Project" WHERE "published" = 1 ORDER BY "sortOrder" ASC, "title" ASC`
  );
  const projects = [];
  const errors: string[] = [];
  for (const row of rows) {
    const parsed = rowToProject(row);
    if (parsed.ok) projects.push(parsed.project);
    else errors.push(parsed.error);
  }
  return { projects, errors };
}

export async function getPublishedProjectBySlug(db: D1Database, slug: string) {
  const row = await queryFirst<ProjectRow>(
    db,
    `SELECT * FROM "Project" WHERE "slug" = ? AND "published" = 1`,
    slug
  );
  if (!row) return { ok: false, error: "not-found" } as const;
  return rowToProject(row);
}

export async function countPublishedProjects(db: D1Database) {
  const row = await queryFirst<{ n: number }>(db, `SELECT COUNT(*) AS n FROM "Project" WHERE "published" = 1`);
  return row?.n ?? 0;
}
