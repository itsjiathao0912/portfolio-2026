import { describe, expect, test } from "bun:test";
import project from "../../content/projects/gocrypto";
import { blocks } from "../../src/components/case/gocrypto";
import { TRADING_SCENARIOS } from "../../src/components/case/gocrypto/gap-filler";
import { ROUTES, TICKETS } from "../../src/components/case/gocrypto/transfer-calculator";
import { LANGUAGE_PAIRS } from "../../src/components/case/gocrypto/language-rule";
import { FX_SPREAD_M, NIM_M } from "../../src/components/case/gocrypto/retention-stress";

describe("gocrypto case study", () => {
  test("every custom block resolves and carries a deck source", () => {
    const custom = project.blocks.filter((b) => b.type === "custom");
    expect(custom.length).toBeGreaterThanOrEqual(2);
    for (const b of custom) {
      const name = b.component.split("/")[1];
      expect(b.component.startsWith("gocrypto/")).toBe(true);
      expect(blocks[name]).toBeDefined();
      expect(b.source).toMatch(/p\.\d+/);
    }
  });
  test("figures match the deck (p.11, p.21, p.27, p.48, p.18)", () => {
    expect(TRADING_SCENARIOS.map((s) => [s.revenue, s.share])).toEqual([[75, 1.9], [203, 5.1], [556, 13.9]]);
    expect(TICKETS.map((t) => t.cost)).toEqual([3.9, 2.3, 1.1]);
    expect(ROUTES.map((r) => r.arrives)).toEqual([17050, 17980, 18290]);
    expect([FX_SPREAD_M, NIM_M]).toEqual([1239, 252]);
    expect(LANGUAGE_PAIRS[0]).toEqual({ never: "Stablecoin", say: "Digital dollars" });
  });
  test("no confidential client names", () => {
    expect(JSON.stringify(project)).not.toMatch(/Chong Wei|WAPS|Taiwan Steel|ARIZE/i);
  });
});
