import { describe, expect, test } from "bun:test";
import { ROLE_AVATAR } from "../../src/components/clay/avatar-spec";
import { GUIDE_SECTION_IDS, ROLE_IDS, ROLE_LABELS } from "../../src/components/site/visitor/role-ids";
import { GUIDE_LINE_MAX, PRIVACY_NOTE, ROLES, guideLineFor } from "../../src/components/site/visitor/roles";
import { greetingLine } from "../../src/components/site/visitor/visitor-panel";

describe("roles table", () => {
  test("every role has a label from ROLE_LABELS, an avatar, a note and a blurb", () => {
    for (const id of ROLE_IDS) {
      const r = ROLES[id];
      expect(r.label).toBe(ROLE_LABELS[id]);
      expect(r.avatar).toBe(ROLE_AVATAR[id]);
      expect(r.note.length).toBeGreaterThan(10);
      expect(r.blurb.length).toBeGreaterThan(2);
    }
  });
  test("guide lines: at most 6 keys, only real section ids, each 1..90 chars, no digits, no duplicates", () => {
    for (const id of ROLE_IDS) {
      const lines = ROLES[id].guideLines;
      const keys = Object.keys(lines);
      expect(keys.length).toBeLessThanOrEqual(6);
      expect(keys.length).toBeGreaterThan(0);
      for (const k of keys) expect((GUIDE_SECTION_IDS as readonly string[]).includes(k)).toBe(true);
      const text = Object.values(lines) as string[];
      for (const t of text) {
        expect(t.length).toBeGreaterThan(0);
        expect(t.length).toBeLessThanOrEqual(GUIDE_LINE_MAX);
        expect(t).not.toMatch(/\d/);
      }
      expect(new Set(text).size).toBe(text.length);
    }
  });
  test("every role has a line for every guide section (the single source of line 1)", () => {
    for (const id of ROLE_IDS) for (const s of GUIDE_SECTION_IDS) expect(guideLineFor(id, s)).toBeTruthy();
  });
  test("view notes follow the existing 'X view:' shape for the three original roles", () => {
    expect(ROLES.recruiter.note.startsWith("Recruiter view")).toBe(true);
    expect(ROLES.founder.note.startsWith("Founder view")).toBe(true);
    expect(ROLES.engineer.note.startsWith("Engineer view")).toBe(true);
  });
  test("orders never repeat a slug", () => {
    for (const id of ROLE_IDS) {
      const o = ROLES[id].order;
      if (o) expect(new Set(o).size).toBe(o.length);
    }
  });
  test("privacy note is the SPEC text verbatim", () => {
    expect(PRIVACY_NOTE).toBe("We count roles and countries anonymously. No IP addresses or personal data are stored.");
  });
});

describe("greeting line", () => {
  test("city wins, then country name, then stranger", () => {
    expect(greetingLine({ country: "VN", city: "Hanoi" })).toBe("Hey Hanoi");
    expect(greetingLine({ country: "VN", city: null })).toBe("Hey Vietnam");
    expect(greetingLine({ country: null, city: null })).toBe("Hey stranger");
    expect(greetingLine(null)).toBe("Hey stranger");
  });
  test("garbage never reaches the greeting as a raw code", () => {
    expect(greetingLine({ country: "xx", city: "" })).toBe("Hey stranger");
    expect(greetingLine({ country: "ZZZ", city: 5 })).toBe("Hey stranger");
    expect(greetingLine({ country: "ZZ", city: " " })).toBe("Hey stranger");
    expect(greetingLine({ country: "VN", city: "x".repeat(65) })).toBe("Hey Vietnam");
  });
});
