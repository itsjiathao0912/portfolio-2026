import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "bun:test";
import { projectEntries, siteEntry } from "../../content/index.ts";
import { parseProjects, parseSite, tocEntries, type ContentBlock, type Project } from "../../content/schema.ts";

// Integrity of the COMMITTED content: what the live site will actually show.

const projects = (() => {
  const result = parseProjects(projectEntries);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.projects;
})();

const site = (() => {
  const result = parseSite(siteEntry);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.site;
})();

function assetPaths(project: Project) {
  const paths: string[] = [];
  if (project.cover) paths.push(project.cover);
  if (project.meta.logo) paths.push(project.meta.logo);
  for (const block of project.blocks as ContentBlock[]) {
    if (block.type === "image" && block.src) paths.push(block.src);
    if (block.type === "gallery") paths.push(...block.images.map((i) => i.src));
  }
  return paths.filter((p) => p.startsWith("/"));
}

describe("committed projects", () => {
  test("every project is published with a slug, title, summary and a body", () => {
    expect(projects.length).toBeGreaterThanOrEqual(7);
    for (const project of projects) {
      expect(project.published).toBe(true);
      expect(project.slug.length).toBeGreaterThan(0);
      expect(project.title.length).toBeGreaterThan(0);
      expect(project.summary.length).toBeGreaterThan(20);
      expect(project.category.length).toBeGreaterThan(0);
      expect(project.blocks.length).toBeGreaterThan(2);
    }
  });

  test("slugs and ids are unique", () => {
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
    expect(new Set(projects.map((p) => p.id)).size).toBe(projects.length);
  });

  test("every case study has at least two table-of-contents sections", () => {
    for (const project of projects) expect(tocEntries(project.blocks).length).toBeGreaterThanOrEqual(2);
  });

  test("every referenced local asset exists in public/", () => {
    for (const project of projects) {
      for (const asset of assetPaths(project)) {
        expect(existsSync(path.join(process.cwd(), "public", asset)), `${project.slug}: ${asset}`).toBe(true);
      }
    }
  });

  test("at least one project is featured on the home page", () => {
    expect(projects.some((p) => p.meta.featured)).toBe(true);
  });

  test("images without a screenshot carry alt text (placeholder frames are labelled)", () => {
    for (const project of projects) {
      for (const block of project.blocks) {
        if (block.type === "image") expect(block.alt.length).toBeGreaterThan(3);
      }
    }
  });
});

describe("committed site content", () => {
  test("profile has contact details but no phone number", () => {
    expect(site.profile.email).toContain("@");
    expect(site.profile.socials.length).toBeGreaterThan(0);
    expect(JSON.stringify(site.profile)).not.toMatch(/\+84|\(\+84\)|\d{3}\s?\d{3}\s?\d{3}/);
  });

  test("Vietnamese local name is present", () => {
    expect(site.profile.nameLocal).toBe("Gia Thảo");
  });

  test("experience includes every role", () => {
    const companies = site.experience.map((e) => e.company);
    for (const name of ["SkyLab Group", "ReOrc AI", "Zalo", "Chợ Tốt", "MoMo", "Creatio Marketing Club"]) {
      expect(companies).toContain(name);
    }
  });

  test("main roles are complete (role, period, summary, bullets)", () => {
    for (const job of site.experience.filter((e) => !e.earlier)) {
      expect(job.role.length, job.id).toBeGreaterThan(0);
      expect(job.period.length, job.id).toBeGreaterThan(0);
      expect(job.summary.length, job.id).toBeGreaterThan(0);
      expect(job.bullets.length, job.id).toBeGreaterThan(0);
    }
  });

  test("earlier roles each name a role and period", () => {
    for (const job of site.experience.filter((e) => e.earlier)) {
      expect(job.role.length, job.id).toBeGreaterThan(0);
      expect(job.period.length, job.id).toBeGreaterThan(0);
    }
  });

  test("recognition and skills are populated", () => {
    expect(site.education.length).toBeGreaterThan(0);
    expect(site.certifications.length).toBeGreaterThan(0);
    expect(site.awards.length).toBeGreaterThan(0);
    expect(site.skills.length).toBeGreaterThan(0);
  });
});

describe("parseSite", () => {
  test("rejects duplicate experience ids", () => {
    const input = structuredClone(siteEntry) as { experience: { id: string }[] };
    input.experience.push({ ...input.experience[0] });
    const result = parseSite(input);
    expect(result.ok).toBe(false);
  });

  test("rejects a missing profile", () => {
    const input = { ...(siteEntry as object), profile: undefined };
    expect(parseSite(input).ok).toBe(false);
  });
});
