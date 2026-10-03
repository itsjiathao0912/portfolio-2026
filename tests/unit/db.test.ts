import { afterEach, describe, expect, test } from "bun:test";
import { parseProjects, type Project } from "../../content/schema.ts";
import { assertCloudflareBindingsAllowed } from "../../src/lib/cf-guard";
import { execute, queryFirst, resolveDbSource } from "../../src/lib/db";
import {
  buildSeedStatements,
  projectToRow,
  renderStatementsAsSql,
  rowToProject,
  type ProjectRow,
} from "../../src/lib/project-rows";
import { countPublishedProjects, getPublishedProjectBySlug, listPublishedProjects } from "../../src/lib/projects";
import { createTestDb } from "../helpers/test-db";

function makeProjects(inputs: unknown[]) {
  const result = parseProjects(inputs);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.projects;
}

const base = { updatedAt: "2026-10-03T00:00:00.000Z", published: true };
const projects = makeProjects([
  { ...base, id: "p2", slug: "second", title: "Second", sortOrder: 2 },
  { ...base, id: "p1", slug: "first", title: "First", sortOrder: 1, tags: ["a", "b"] },
  { ...base, id: "p3", slug: "draft", title: "Draft", published: false },
]);

async function seed(db: D1Database, list: readonly Project[]) {
  for (const { sql, params } of buildSeedStatements(list)) await execute(db, sql, ...params);
}

describe("getDb source selection", () => {
  test("dev or LOCAL_DB_PATH → local, otherwise cloudflare", () => {
    expect(resolveDbSource({ NODE_ENV: "development" })).toBe("local");
    expect(resolveDbSource({ NODE_ENV: "production", LOCAL_DB_PATH: "/tmp/x.db" })).toBe("local");
    expect(resolveDbSource({ NODE_ENV: "production" })).toBe("cloudflare");
    expect(resolveDbSource({ NODE_ENV: "production", LOCAL_DB_PATH: "" })).toBe("cloudflare");
  });
});

describe("cf-guard", () => {
  const saved = { e2e: process.env.PORTFOLIO_E2E, path: process.env.LOCAL_DB_PATH };
  afterEach(() => {
    if (saved.e2e === undefined) delete process.env.PORTFOLIO_E2E;
    else process.env.PORTFOLIO_E2E = saved.e2e;
    if (saved.path === undefined) delete process.env.LOCAL_DB_PATH;
    else process.env.LOCAL_DB_PATH = saved.path;
  });

  test("refuses real bindings under a test marker", () => {
    delete process.env.LOCAL_DB_PATH;
    process.env.PORTFOLIO_E2E = "1";
    expect(() => assertCloudflareBindingsAllowed()).toThrow(/Refusing real Cloudflare binding/);
  });

  test("allows them when no marker is set", () => {
    delete process.env.LOCAL_DB_PATH;
    delete process.env.PORTFOLIO_E2E;
    expect(() => assertCloudflareBindingsAllowed()).not.toThrow();
  });
});

describe("seed + read path (in-memory SQLite via the real local-D1 wrapper)", () => {
  test("lists published projects in sortOrder, hiding drafts", async () => {
    const { db } = createTestDb();
    await seed(db, projects);
    const { projects: listed, errors } = await listPublishedProjects(db);
    expect(errors).toEqual([]);
    expect(listed.map((p) => p.slug)).toEqual(["first", "second"]);
    expect(listed[0].tags).toEqual(["a", "b"]);
    expect(await countPublishedProjects(db)).toBe(2);
  });

  test("looks up by slug and never returns a draft", async () => {
    const { db } = createTestDb();
    await seed(db, projects);
    const found = await getPublishedProjectBySlug(db, "first");
    expect(found.ok && found.project.title).toBe("First");
    expect((await getPublishedProjectBySlug(db, "draft")).ok).toBe(false);
  });

  test("seed is idempotent and prunes rows removed from content", async () => {
    const { db } = createTestDb();
    await seed(db, projects);
    await seed(db, projects);
    expect((await queryFirst<{ n: number }>(db, `SELECT COUNT(*) AS n FROM "Project"`))?.n).toBe(3);

    await seed(db, projects.filter((p) => p.id !== "p2"));
    expect((await queryFirst<{ n: number }>(db, `SELECT COUNT(*) AS n FROM "Project"`))?.n).toBe(2);

    await seed(db, []);
    expect((await queryFirst<{ n: number }>(db, `SELECT COUNT(*) AS n FROM "Project"`))?.n).toBe(0);
  });

  test("a corrupt row is reported, not thrown", async () => {
    const { db } = createTestDb();
    await seed(db, projects);
    await execute(db, `UPDATE "Project" SET "blocks" = 'not json' WHERE "id" = 'p1'`);
    const { projects: listed, errors } = await listPublishedProjects(db);
    expect(listed.map((p) => p.id)).toEqual(["p2"]);
    expect(errors[0]).toContain("p1");
  });
});

describe("row mapping", () => {
  test("project → row → project round-trips", () => {
    for (const project of projects) {
      const back = rowToProject(projectToRow(project) as ProjectRow);
      expect(back.ok && back.project).toEqual(project);
    }
  });

  test("literal SQL rendering (remote seed) matches bound-param results", () => {
    const tricky = makeProjects([
      { ...base, id: "q", slug: "quotes", title: "It's a \"test\"? yes; really", summary: "a ' b ? c" },
    ]);
    const { sqlite } = createTestDb();
    sqlite.exec(renderStatementsAsSql(buildSeedStatements(tricky)));
    const row = sqlite.prepare(`SELECT * FROM "Project" WHERE "id" = 'q'`).get() as ProjectRow;
    const back = rowToProject(row);
    expect(back.ok && back.project).toEqual(tricky[0]);
  });

  test("renderer rejects a placeholder/param count mismatch", () => {
    expect(() => renderStatementsAsSql([{ sql: "SELECT ?, ?", params: [1] }])).toThrow(/Too few/);
    expect(() => renderStatementsAsSql([{ sql: "SELECT ?", params: [1, 2] }])).toThrow(/Too many/);
  });
});
