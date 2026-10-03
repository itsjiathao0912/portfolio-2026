import { describe, expect, test } from "bun:test";
import { projectEntries } from "../../content/index.ts";
import { parseProjects } from "../../content/schema.ts";

const valid = {
  id: "a",
  slug: "a-project",
  title: "A",
  updatedAt: "2026-10-03T00:00:00.000Z",
};

describe("content/", () => {
  test("every committed entry is valid", () => {
    const result = parseProjects(projectEntries);
    if (!result.ok) throw new Error(result.errors.join("\n"));
    expect(result.projects.length).toBeGreaterThan(0);
  });

  test("defaults are applied to optional fields", () => {
    const result = parseProjects([valid]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.projects[0]).toMatchObject({
      summary: "",
      tags: [],
      blocks: [],
      links: [],
      cover: null,
      year: null,
      published: false,
      sortOrder: 0,
    });
  });

  test("rejects a non-kebab-case slug", () => {
    const result = parseProjects([{ ...valid, slug: "Not A Slug" }]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]).toContain("slug");
  });

  test("rejects an unknown block type", () => {
    const result = parseProjects([{ ...valid, blocks: [{ type: "video", src: "x" }] }]);
    expect(result.ok).toBe(false);
  });

  test("rejects duplicate ids and slugs across entries", () => {
    const result = parseProjects([valid, { ...valid }]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toEqual(["duplicate id: a", "duplicate slug: a-project"]);
  });
});
