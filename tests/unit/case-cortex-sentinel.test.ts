import { describe, expect, test } from "bun:test";
import project from "../../content/projects/cortex-sentinel";
import { blocks } from "../../src/components/case/cortex-sentinel";
import { AST, MAX_REWRITES, PROMPT, STAGES, step } from "../../src/components/case/cortex-sentinel/agent-loop";
import { decide, MIN_CLEARED } from "../../src/components/case/cortex-sentinel/auto-clear-gate";
import { LAYERS } from "../../src/components/case/cortex-sentinel/honesty-map";

const ok = { cls: "noise", prec: "4-0", sanctions: false, travelRuleIncomplete: false, scorerUp: true } as const;

describe("cortex-sentinel case study", () => {
  test("every custom block resolves and cites a deck page", () => {
    const custom = project.blocks.filter((b) => b.type === "custom");
    expect(custom.length).toBeGreaterThanOrEqual(3);
    for (const b of custom) {
      expect(blocks[b.component.split("/")[1]]).toBeTypeOf("function");
      expect(b.source).toMatch(/p\.\d+/);
    }
  });
  test("agent loop matches the deck (p.5, p.6, p.13)", () => {
    expect(PROMPT).toContain("9,000–10,000");
    expect(AST).toContain("9000");
    expect(MAX_REWRITES).toBe(3);
    expect(STAGES.at(-1)?.id).toBe("human");
    let p = { stage: -1, attempt: 1, failed: false, saved: false };
    for (let i = 0; i < 5; i++) p = step(p, 1);
    expect(p.failed).toBe(true);
    p = step(p, 1);
    expect(p.attempt).toBe(2);
  });
  test("the gate fails closed (p.15, p.16, p.19)", () => {
    expect(MIN_CLEARED).toBe(3);
    expect(decide(ok).autoClear).toBe(true);
    expect(decide({ ...ok, cls: "coinflip" }).autoClear).toBe(false);
    expect(decide({ ...ok, prec: "4-1" }).autoClear).toBe(false);
    expect(decide({ ...ok, prec: "2-0" }).autoClear).toBe(false);
    expect(decide({ ...ok, sanctions: true }).autoClear).toBe(false);
    expect(decide({ ...ok, travelRuleIncomplete: true }).autoClear).toBe(false);
    expect(decide({ ...ok, scorerUp: false }).autoClear).toBe(false);
  });
  test("our layer is the prototyped triage, not the platform capabilities (p.20)", () => {
    const parts = LAYERS.flatMap((l) => l.parts);
    expect(parts.filter((p) => p.owner === "ours").every((p) => p.status !== "live")).toBe(true);
    expect(parts.find((p) => p.label === "Plain English → rule")?.owner).toBe("platform");
  });
  test("no unconfirmed figure, no confidential names, no team photo", () => {
    const s = JSON.stringify(project);
    expect(s).not.toMatch(/−186|\b186\b|Chong Wei|WAPS|Taiwan Steel|ARIZE|\/stage\.webp|demo-loop/);
  });
});
