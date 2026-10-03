import type { Project } from "../../content/schema.ts";
import { queryAll, queryFirst } from "./db";
import { PROJECT_SELECT, rowToProject, type ProjectRow } from "./project-rows";

/**
 * What to do with a database row that fails validation (e.g. a row seeded
 * before a schema field became required).
 *
 * - "throw": dev/test. Fail loudly with every slug + reason, so a stale DB is
 *   noticed immediately instead of silently hiding projects.
 * - "fallback": production. Log loudly, then serve the bundled content/ copy of
 *   that project, so a stale row can never make a project disappear.
 *
 * A row is NEVER silently dropped.
 */
export type InvalidRowPolicy =
  | { mode: "throw" }
  | { mode: "fallback"; bundled: readonly Project[] };

export class InvalidProjectRowsError extends Error {
  constructor(readonly errors: readonly string[]) {
    super(
      `[projects] ${errors.length} database row(s) failed validation — re-seed with \`pnpm db:seed:local\`:\n  - ${errors.join("\n  - ")}`
    );
    this.name = "InvalidProjectRowsError";
  }
}

function resolveInvalidRows(rows: readonly ProjectRow[], policy: InvalidRowPolicy) {
  const projects: Project[] = [];
  const errors: string[] = [];
  const fallbacks: string[] = [];
  const unrecoverable: string[] = [];

  for (const row of rows) {
    const parsed = rowToProject(row);
    if (parsed.ok) {
      projects.push(parsed.project);
      continue;
    }
    errors.push(parsed.error);
    if (policy.mode === "fallback") {
      const bundled = policy.bundled.find((p) => p.slug === row.slug && p.published);
      if (bundled) {
        projects.push(bundled);
        fallbacks.push(row.slug);
      } else {
        unrecoverable.push(row.slug);
      }
    }
  }

  if (errors.length > 0) {
    if (policy.mode === "throw") throw new InvalidProjectRowsError(errors);
    console.error(new InvalidProjectRowsError(errors).message);
    if (fallbacks.length > 0) console.error(`[projects] served bundled content/ for: ${fallbacks.join(", ")}`);
    if (unrecoverable.length > 0) console.error(`[projects] NO bundled copy for: ${unrecoverable.join(", ")}`);
  }
  return { projects, errors, fallbacks };
}

/** Published projects in display order. See InvalidRowPolicy for bad rows. */
export async function listPublishedProjects(db: D1Database, policy: InvalidRowPolicy = { mode: "throw" }) {
  const rows = await queryAll<ProjectRow>(
    db,
    `${PROJECT_SELECT} WHERE p."published" = 1 ORDER BY p."sortOrder" ASC, p."title" ASC`
  );
  const result = resolveInvalidRows(rows, policy);
  // Fallback copies keep their own sortOrder; restore display order.
  result.projects.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
  return result;
}

export async function getPublishedProjectBySlug(
  db: D1Database,
  slug: string,
  policy: InvalidRowPolicy = { mode: "throw" }
) {
  const row = await queryFirst<ProjectRow>(db, `${PROJECT_SELECT} WHERE p."slug" = ? AND p."published" = 1`, slug);
  if (!row) return { ok: false, error: "not-found" } as const;
  const { projects, errors } = resolveInvalidRows([row], policy);
  const project = projects[0];
  if (!project) return { ok: false, error: errors[0] ?? "invalid" } as const;
  return { ok: true, project } as const;
}

export async function countPublishedProjects(db: D1Database) {
  const row = await queryFirst<{ n: number }>(db, `SELECT COUNT(*) AS n FROM "Project" WHERE "published" = 1`);
  return row?.n ?? 0;
}
