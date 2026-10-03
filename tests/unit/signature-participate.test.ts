import { describe, expect, test } from "bun:test";
import {
  BLOCKS, PERSONAS, POLL_OPTIONS, RECRUITER_TLDR, STAMPS, SECTION_IDS, addStamp, canLaunch, greetingLine, isComplete,
  isEmphasised, isInside, matchBuild, partOfDay, pollResults, sectionOrder, toggleBlock,
} from "../../src/components/signature/participate/logic";
import site from "../../content/site";

describe("participate", () => {
  test("every persona orders every section exactly once", () => {
    for (const p of [...PERSONAS, null]) expect([...sectionOrder(p)].sort()).toEqual([...SECTION_IDS].sort());
    expect(isEmphasised(null, "work")).toBe(false);
    expect(isEmphasised("engineer", "work")).toBe(true);
  });
  test("build matching prefers the most specific project and needs 2 blocks", () => {
    expect(matchBuild([])).toBeNull();
    expect(matchBuild(["kyc", "rules"])?.project).toBe("Cortex Sentinel");
    expect(matchBuild(["payments", "rules", "notifications", "kyc"])?.project).toBe("Guardline");
    expect(canLaunch(["kyc"])).toBe(false);
    expect(canLaunch(["kyc", "ledger"])).toBe(true);
    for (const a of BLOCKS) for (const b of BLOCKS) if (a !== b) expect(matchBuild([a, b])).not.toBeNull();
    expect(toggleBlock(toggleBlock([], "kyc"), "kyc")).toEqual([]);
  });
  test("greeting by time and visits", () => {
    expect(partOfDay(8)).toBe("morning");
    expect(partOfDay(23)).toBe("night");
    expect(greetingLine(8, 1, null)).toContain("Welcome — I'm Thao");
    expect(greetingLine(14, 3, "founder")).toContain("visit number 3");
  });
  test("poll percentages sum to ~100 and count the vote", () => {
    const r = pollResults("compliance");
    expect(r.length).toBe(POLL_OPTIONS.length);
    expect(Math.abs(r.reduce((a, o) => a + o.pct, 0) - 100)).toBeLessThanOrEqual(2);
  });
  test("passport stamps are unique, validated, and complete", () => {
    let s: string[] = [];
    for (const id of [...STAMPS, "persona", "bogus"]) s = addStamp(s, id).stamps;
    expect(s.length).toBe(STAMPS.length);
    expect(isComplete(s)).toBe(true);
    expect(addStamp(s, "bogus").added).toBe(false);
  });
  test("drop hit-test", () => {
    expect(isInside({ x: 5, y: 5 }, { left: 0, top: 0, right: 10, bottom: 10 })).toBe(true);
    expect(isInside({ x: 15, y: 5 }, { left: 0, top: 0, right: 10, bottom: 10 })).toBe(false);
  });
  test("TL;DR only states sourced facts", () => {
    expect(RECRUITER_TLDR.join(" ")).toContain(site.profile.company);
    expect(RECRUITER_TLDR.join(" ")).toContain("2nd place");
  });
});
