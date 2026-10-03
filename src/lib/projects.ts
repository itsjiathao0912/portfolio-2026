import { queryAll, queryFirst } from "./db";
import { PROJECT_SELECT, rowToProject, type ProjectRow } from "./project-rows";

/**
 * Published projects in display order. Rows that fail validation are skipped
 * and reported, so one bad row cannot blank the whole page.
 */
export async function listPublishedProjects(db: D1Database) {
  const rows = await queryAll<ProjectRow>(
    db,
    `${PROJECT_SELECT} WHERE p."published" = 1 ORDER BY p."sortOrder" ASC, p."title" ASC`
  );
  const projects = [];
  const errors: string[] = [];
  for (const row of rows) {
    const parsed = rowToProject(row);
    if (parsed.ok) projects.push(parsed.project);
    else errors.push(parsed.error);
  }
  if (errors.length > 0) console.error("[projects] skipped invalid rows:", errors);
  return { projects, errors };
}

export async function getPublishedProjectBySlug(db: D1Database, slug: string) {
  const row = await queryFirst<ProjectRow>(db, `${PROJECT_SELECT} WHERE p."slug" = ? AND p."published" = 1`, slug);
  if (!row) return { ok: false, error: "not-found" } as const;
  return rowToProject(row);
}

export async function countPublishedProjects(db: D1Database) {
  const row = await queryFirst<{ n: number }>(db, `SELECT COUNT(*) AS n FROM "Project" WHERE "published" = 1`);
  return row?.n ?? 0;
}
