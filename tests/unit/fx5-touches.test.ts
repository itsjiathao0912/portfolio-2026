import { describe, expect, test } from "bun:test";
import { parseVisitorRole, isRoleStorageKey } from "../../src/lib/visitor-role-adapter";
import { startersFor, starterHref } from "../../src/components/site/ask-me-data";
import { DISCLOSURES } from "../../src/components/site/disclosures-data";
import {
  deltaFromSaigon, formatMin, offsetLabel, overlapOnSaigonAxis, overlapSentence, wrapSpan,
} from "../../src/components/site/saigon-desk-logic";

describe("visitor role adapter", () => {
  test("new store wins over the legacy persona key", () => {
    expect(parseVisitorRole(JSON.stringify({ v: 1, role: "founder" }), JSON.stringify("recruiter"))).toBe("founder");
  });
  test("falls back to the legacy persona, then to null", () => {
    expect(parseVisitorRole(null, JSON.stringify("engineer"))).toBe("engineer");
    expect(parseVisitorRole(JSON.stringify({ v: 1, role: null }), JSON.stringify("recruiter"))).toBe("recruiter");
    expect(parseVisitorRole(null, null)).toBeNull();
  });
  test("bad JSON and unknown roles never throw", () => {
    expect(parseVisitorRole("{nope", "also nope")).toBeNull();
    expect(parseVisitorRole(JSON.stringify({ role: "wizard" }), JSON.stringify("wizard"))).toBeNull();
  });
  test("storage key filter", () => {
    expect(isRoleStorageKey("thao:visitor:v1")).toBe(true);
    expect(isRoleStorageKey("other")).toBe(false);
  });
});

describe("ask-me starters", () => {
  test("always three, neutral by default", () => {
    expect(startersFor(null)).toHaveLength(3);
    expect(startersFor("curious")).toEqual(startersFor(null));
    expect(startersFor("recruiter")).toHaveLength(3);
    expect(startersFor("recruiter")).not.toEqual(startersFor("engineer"));
  });
  test("mailto subject is encoded", () => {
    const [s] = startersFor(null);
    const href = starterHref("a@b.co", s!);
    expect(href.startsWith("mailto:a@b.co?subject=")).toBe(true);
    expect(href).not.toContain(" ");
  });
  test("only sourced figures appear in copy", () => {
    const text = (["recruiter", "founder", "engineer", "data", "investor", null] as const)
      .flatMap((r) => startersFor(r).map((s) => s.label + s.subject)).join(" ");
    const nums = text.match(/\d+/g) ?? [];
    for (const n of nums) expect(["83", "27"]).toContain(n);
  });
});

describe("disclosures", () => {
  test("five labels, each with meaning and example", () => {
    expect(DISCLOSURES).toHaveLength(5);
    for (const d of DISCLOSURES) {
      expect(d.meaning.length).toBeGreaterThan(10);
      expect(d.example.length).toBeGreaterThan(10);
    }
  });
});

describe("saigon desk", () => {
  const east = (h: number) => deltaFromSaigon(h * 60);
  test("same zone overlaps the whole day", () => {
    expect(overlapOnSaigonAxis(0)).toEqual([[540, 1080]]);
  });
  test("London (UTC+1) overlaps 15:00-18:00 Saigon", () => {
    // London UTC+1: their 09:00-18:00 is Saigon 15:00-24:00, overlap 15:00-18:00 Saigon.
    expect(overlapOnSaigonAxis(east(1))).toEqual([[900, 1080]]);
  });
  test("San Francisco has no overlap", () => {
    expect(overlapOnSaigonAxis(east(-7))).toEqual([]);
    expect(overlapSentence(east(-7))).toContain("No office-hours overlap");
  });
  test("half-hour zones and wrap-around", () => {
    expect(overlapOnSaigonAxis(east(5.5)).length).toBe(1);
    expect(wrapSpan(-60, 120)).toEqual([[1380, 1440], [0, 120]]);
  });
  test("format helpers", () => {
    expect(formatMin(1440)).toBe("00:00");
    expect(offsetLabel(0)).toBe("Same time as Saigon");
    expect(offsetLabel(-360)).toBe("6 h behind Saigon");
    expect(offsetLabel(90)).toBe("1.5 h ahead of Saigon");
  });
});
