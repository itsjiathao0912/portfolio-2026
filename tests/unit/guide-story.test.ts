import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { GUIDE_SECTION_IDS, ROLE_IDS } from "../../src/components/site/visitor/role-ids";
import { ROLES } from "../../src/components/site/visitor/roles";
import { scriptFor, STORIES, STORY_LINE_MAX, STORY_MAX_LINES, STORY_MIN_LINES } from "../../src/components/site/visitor/guide/guide-story";

const contentDir = join(import.meta.dir, "../../content");
const CONTENT = [join(contentDir, "site.ts"), ...readdirSync(join(contentDir, "projects")).map((f) => join(contentDir, "projects", f))].map((p) => readFileSync(p, "utf8")).join("\n");

describe("guide stories (DRAFT copy, shape only)", () => {
  test("every section has a story", () => {
    for (const id of GUIDE_SECTION_IDS) expect(STORIES[id]).toBeDefined();
  });

  test("each (role, section) script is 2-4 lines, <= 90 chars, no duplicates", () => {
    for (const role of ROLE_IDS)
      for (const section of GUIDE_SECTION_IDS) {
        const script = scriptFor(role, section);
        expect(script.length).toBeGreaterThanOrEqual(STORY_MIN_LINES);
        expect(script.length).toBeLessThanOrEqual(STORY_MAX_LINES);
        for (const line of script) {
          expect(line.length).toBeGreaterThan(0);
          expect(line.length).toBeLessThanOrEqual(STORY_LINE_MAX);
        }
        expect(new Set(script).size).toBe(script.length);
      }
  });

  test("line 1 is the role table's guide line: one source, never repeated by the extras", () => {
    for (const role of ROLE_IDS)
      for (const section of GUIDE_SECTION_IDS) {
        const script = scriptFor(role, section);
        expect(script[0]).toBe(ROLES[role].guideLines[section]!);
      }
    for (const section of GUIDE_SECTION_IDS) {
      const story = STORIES[section];
      const extras = [...story.more, ...Object.values(story.byRole ?? {}).flat()];
      const firsts = new Set(ROLE_IDS.map((r) => ROLES[r].guideLines[section]));
      for (const line of extras) expect(firsts.has(line)).toBe(false);
    }
  });

  test("a role without its own extras falls back to the section's default", () => {
    expect(scriptFor("marketer", "linkedin").slice(1)).toEqual([...STORIES.linkedin.more]);
    expect(scriptFor("recruiter", "statement").slice(1)).toEqual([...STORIES.statement.byRole!.recruiter!]);
  });

  test("no invented numbers: any digit in a line also appears in content/", () => {
    for (const role of ROLE_IDS)
      for (const section of GUIDE_SECTION_IDS)
        for (const line of scriptFor(role, section))
          for (const n of line.match(/\d+/g) ?? []) expect(CONTENT).toContain(n);
  });
});
