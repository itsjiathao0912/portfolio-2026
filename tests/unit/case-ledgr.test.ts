import { describe, expect, test } from "bun:test";
import { crossCheck, evaluateContract, MIN_WAGE } from "../../src/components/case/ledgr/rules.ts";
import { blocks } from "../../src/components/case/ledgr/index.tsx";
import project from "../../content/projects/ledgr.ts";

const base = { region: "I" as const, monthlyWage: 6_000_000, level: "degree_graduate" as const, probationDays: 30, probationWagePct: 0.9, otHoursPerDay: 2, renewals: 1, bhxhClause: true };
const sev = (k: string, f = base) => evaluateContract(f).find((x) => x.key === k)?.severity;

describe("ledgr rule mirror", () => {
  test("a clean contract passes every rule", () => {
    expect(evaluateContract(base).every((x) => x.severity === "green")).toBe(true);
  });
  test("exactly at the wage floor is amber, below is red (engine.ts)", () => {
    expect(sev("min_wage", { ...base, monthlyWage: MIN_WAGE.I })).toBe("amber");
    expect(sev("min_wage", { ...base, monthlyWage: MIN_WAGE.I - 1 })).toBe("red");
  });
  test("unknown region is flagged, not decided", () => {
    const f = evaluateContract({ ...base, region: null }).find((x) => x.key === "min_wage");
    expect(f?.severity).toBe("amber");
    expect(f?.trust).toBe("llm_fallback");
  });
  test("probation, pay, overtime, renewals, BHXH limits", () => {
    expect(sev("probation_days", { ...base, probationDays: 61 })).toBe("red");
    expect(sev("probation_wage", { ...base, probationWagePct: 0.84 })).toBe("red");
    expect(sev("ot_day", { ...base, otHoursPerDay: 5 })).toBe("red");
    expect(sev("renewals", { ...base, renewals: 2 })).toBe("red");
    expect(sev("bhxh", { ...base, bhxhClause: false })).toBe("red");
  });
  test("cross-check thresholds 1% / 5%", () => {
    expect(crossCheck(10_000_000, 120_000_000).status).toBe("match");
    expect(crossCheck(10_000_000, 123_000_000).status).toBe("amber");
    expect(crossCheck(10_000_000, 130_000_000).status).toBe("red");
  });
  test("every custom block in the content is registered", () => {
    const used = project.blocks.filter((b) => b.type === "custom").map((b) => (b as { component: string }).component.split("/")[1]);
    for (const name of used) expect(blocks[name]).toBeDefined();
  });
});
