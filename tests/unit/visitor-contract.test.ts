import { describe, expect, test } from "bun:test";
import {
  GUIDE_SECTION_IDS,
  isPollOptionId,
  isRoleId,
  POLL_OPTION_IDS,
  ROLE_IDS,
  ROLE_LABELS,
} from "../../src/components/site/visitor/role-ids";
import { CLAY_POSES } from "../../src/components/site/visitor/types";

// The SPEC's role list, in order (SPEC requirement 2).
const SPEC_LABELS = [
  "Recruiter",
  "Founder",
  "Engineer",
  "Product designer",
  "Marketer",
  "Growth",
  "Data",
  "Investor",
  "Student",
  "Fellow PM",
  "Just curious",
];

describe("role contract", () => {
  test("keeps 11 unique role ids with labels matching the SPEC list", () => {
    expect(ROLE_IDS.length).toBe(11);
    expect(new Set(ROLE_IDS).size).toBe(11);
    expect<string[]>(ROLE_IDS.map((id) => ROLE_LABELS[id])).toEqual(SPEC_LABELS);
    expect(Object.keys(ROLE_LABELS).sort()).toEqual([...ROLE_IDS].sort());
  });

  test("isRoleId accepts only the 11 ids", () => {
    for (const id of ROLE_IDS) expect(isRoleId(id)).toBe(true);
    for (const bad of [null, undefined, "", "none", "Founder", "skip", 3, {}, ["founder"]]) {
      expect(isRoleId(bad)).toBe(false);
    }
  });
});

describe("guide + poll + pose contract", () => {
  test("guide section ids are at most 6 and unique", () => {
    expect(GUIDE_SECTION_IDS.length).toBeLessThanOrEqual(6);
    expect(new Set(GUIDE_SECTION_IDS).size).toBe(GUIDE_SECTION_IDS.length);
  });

  test("poll option ids are 4 unique ids and guarded", () => {
    expect(POLL_OPTION_IDS.length).toBe(4);
    expect(new Set(POLL_OPTION_IDS).size).toBe(4);
    for (const id of POLL_OPTION_IDS) expect(isPollOptionId(id)).toBe(true);
    for (const bad of [null, "", "nope", 1]) expect(isPollOptionId(bad)).toBe(false);
  });

  test("there are exactly the 4 clay poses", () => {
    expect([...CLAY_POSES]).toEqual(["walk", "wave", "point", "talk"]);
  });
});
