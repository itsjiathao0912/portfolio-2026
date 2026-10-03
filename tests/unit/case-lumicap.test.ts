import { describe, expect, test } from "bun:test";
import { approveResume, chainStart, databaseView, JOURNEY, nextPhase, pause, thresholdMet, tryTransfer } from "../../src/components/case/lumicap/logic.ts";
import { blocks } from "../../src/components/case/lumicap/index.tsx";
import project from "../../content/projects/lumicap.ts";

describe("lumicap quorum", () => {
  test("one approval is not a quorum, two distinct are", () => {
    expect(thresholdMet(["you"])).toBe(false);
    expect(thresholdMet(["you", "you"])).toBe(false);
    expect(thresholdMet(["you", "b"])).toBe(true);
  });
  test("phases advance only through the threshold", () => {
    expect(nextPhase([], false)).toBe("requested");
    expect(nextPhase(["you"], false)).toBe("collecting");
    expect(nextPhase(["you", "c"], false)).toBe("signing");
    expect(nextPhase(["you", "c"], true)).toBe("deployed");
  });
  test("the database never holds signatures or keys", () => {
    expect(databaseView(["you", "b", "c"])).toEqual({ request: 1, approvalRecords: 3, signatures: 0, privateKeys: 0 });
  });
});

describe("lumicap journey and pause", () => {
  test("seven steps, platform records before chain", () => {
    expect(JOURNEY.length).toBe(7);
    expect(chainStart()).toBe(5);
    expect(JOURNEY.slice(0, 4).every((s) => s.layer === "platform")).toBe(true);
  });
  test("pause needs a reason and blocks transfers; resume needs two approvals", () => {
    const idle = { paused: false, approvals: 0 };
    expect(pause(idle, " ").paused).toBe(false);
    const p = pause(idle, "x");
    expect(tryTransfer(p).ok).toBe(false);
    const one = approveResume(p, "ok");
    expect(one.paused).toBe(true);
    expect(approveResume(one, "ok").paused).toBe(false);
    expect(tryTransfer(idle).ok).toBe(true);
  });
});

describe("lumicap content", () => {
  test("custom blocks resolve and never leak confidential client names", () => {
    const keys = project.blocks.filter((b) => b.type === "custom").map((b) => (b as { component: string }).component.split("/")[1]!);
    expect(keys.length).toBe(3);
    for (const k of keys) expect(blocks[k]).toBeDefined();
    expect(JSON.stringify(project)).not.toMatch(/Chong Wei|WAPS|Taiwan Steel|ARIZE/);
  });
});
