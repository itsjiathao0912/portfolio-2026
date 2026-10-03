// Project <-> database row mapping. Pure, dependency-free apart from the content
// schema, so it is shared by the app, the bun tests, AND plain-Node
// `scripts/seed.mjs`. Keep imports RELATIVE with explicit `.ts` extensions and
// erasable-only TypeScript (see content/schema.ts).

import { projectInputSchema, type Project } from "../../content/schema.ts";

type SqlParam = string | number | null;
export interface Statement {
  sql: string;
  params: SqlParam[];
}

/** Columns of the "Project" table, in INSERT order. */
export const PROJECT_COLUMNS = [
  "id",
  "slug",
  "title",
  "summary",
  "role",
  "period",
  "year",
  "category",
  "tags",
  "cover",
  "blocks",
  "links",
  "sortOrder",
  "published",
  "updatedAt",
] as const;

/** Raw row shape as stored in SQLite/D1 (JSON columns are strings). */
export interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
  role: string;
  period: string;
  year: number | null;
  category: string;
  tags: string;
  cover: string | null;
  blocks: string;
  links: string;
  sortOrder: number;
  published: number;
  updatedAt: string;
  /** ProjectMeta.data, joined in by the read queries (null when no meta row). */
  meta?: string | null;
}

export function projectToRow(project: Project) {
  const row = {
    id: project.id,
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    role: project.role,
    period: project.period,
    year: project.year,
    category: project.category,
    tags: JSON.stringify(project.tags),
    cover: project.cover,
    blocks: JSON.stringify(project.blocks),
    links: JSON.stringify(project.links),
    sortOrder: project.sortOrder,
    published: project.published ? 1 : 0,
    updatedAt: project.updatedAt,
  } satisfies ProjectRow;
  return { ...row, meta: JSON.stringify(project.meta) };
}

function parseJson(value: string) {
  try {
    return { ok: true, value: JSON.parse(value) as unknown } as const;
  } catch {
    return { ok: false } as const;
  }
}

/**
 * Parse a database row back into a validated Project. Returns an error object
 * (never throws) so a single corrupt row cannot take down a whole page.
 */
export function rowToProject(row: ProjectRow) {
  const tags = parseJson(row.tags);
  const blocks = parseJson(row.blocks);
  const links = parseJson(row.links);
  const meta = row.meta == null ? ({ ok: true, value: {} } as const) : parseJson(row.meta);
  if (!tags.ok || !blocks.ok || !links.ok || !meta.ok) {
    return { ok: false, error: `Project ${row.id}: a JSON column is not valid JSON` } as const;
  }

  const parsed = projectInputSchema.safeParse({
    ...row,
    tags: tags.value,
    blocks: blocks.value,
    links: links.value,
    meta: meta.value,
    published: row.published === 1,
  });
  if (!parsed.success) {
    return { ok: false, error: `Project ${row.id}: ${parsed.error.issues[0]?.message ?? "invalid"}` } as const;
  }
  return { ok: true, project: parsed.data } as const;
}

/** Idempotent upsert: re-running the seed updates rows in place by id. */
export function buildProjectUpsert(project: Project) {
  const row = projectToRow(project);
  const columns = PROJECT_COLUMNS.map((c) => `"${c}"`).join(", ");
  const placeholders = PROJECT_COLUMNS.map(() => "?").join(", ");
  const updates = PROJECT_COLUMNS.filter((c) => c !== "id")
    .map((c) => `"${c}" = excluded."${c}"`)
    .join(", ");
  return {
    sql: `INSERT INTO "Project" (${columns}) VALUES (${placeholders}) ON CONFLICT("id") DO UPDATE SET ${updates}`,
    params: PROJECT_COLUMNS.map((c) => row[c]),
  } satisfies Statement;
}

function buildMetaUpsert(project: Project) {
  return {
    sql: `INSERT INTO "ProjectMeta" ("projectId", "data", "updatedAt") VALUES (?, ?, ?) ON CONFLICT("projectId") DO UPDATE SET "data" = excluded."data", "updatedAt" = excluded."updatedAt"`,
    params: [project.id, JSON.stringify(project.meta), project.updatedAt],
  } satisfies Statement;
}

function pruneStatement(table: string, column: string, ids: readonly string[]) {
  return ids.length === 0
    ? ({ sql: `DELETE FROM "${table}"`, params: [] } satisfies Statement)
    : ({
        sql: `DELETE FROM "${table}" WHERE "${column}" NOT IN (${ids.map(() => "?").join(", ")})`,
        params: [...ids],
      } satisfies Statement);
}

/**
 * The full seed as an ordered statement list. content/ is the source of truth,
 * so the seed SYNCS: every entry is upserted, and any row whose id is no longer
 * in content/ is deleted. Running it twice is a no-op.
 */
export function buildSeedStatements(projects: readonly Project[]) {
  const ids = projects.map((p) => p.id);
  return [
    ...projects.map(buildProjectUpsert),
    ...projects.map(buildMetaUpsert),
    pruneStatement("Project", "id", ids),
    pruneStatement("ProjectMeta", "projectId", ids),
  ];
}

/** SELECT list used by every project read: the row plus its joined meta. */
export const PROJECT_SELECT = `SELECT p.*, m."data" AS "meta" FROM "Project" p LEFT JOIN "ProjectMeta" m ON m."projectId" = p."id"`;

function sqlLiteral(value: SqlParam) {
  if (value === null) return "NULL";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`Non-finite number cannot be written as SQL: ${value}`);
    return String(value);
  }
  return `'${value.replace(/'/g, "''")}'`;
}

/**
 * Render statements as literal SQL text for `wrangler d1 execute --file`, which
 * cannot take bound parameters. Strings are escaped by doubling single quotes
 * (the standard SQLite string-literal escape). Placeholders are substituted in
 * one pass over the TEMPLATE, so a `?` inside a value is never re-substituted.
 */
export function renderStatementsAsSql(statements: readonly { sql: string; params: readonly SqlParam[] }[]) {
  return statements
    .map(({ sql, params }) => {
      let i = 0;
      const text = sql.replace(/\?/g, () => {
        if (i >= params.length) throw new Error(`Too few params for: ${sql}`);
        return sqlLiteral(params[i++]);
      });
      if (i !== params.length) throw new Error(`Too many params for: ${sql}`);
      return `${text};`;
    })
    .join("\n");
}
