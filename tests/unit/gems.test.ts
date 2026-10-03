import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import {
  GEM_BUDGET, MAX_GEMS_PER_PAGE, isOnBoard, isTypingTarget, localTimeLine, parseDoodle,
  peelProgress, pushSecretKey, serializeDoodle, wordRange,
} from "../../src/components/gems/logic";
import { photos } from "../../content/site";

describe("gems", () => {
  test("never more than 3 hidden gems per page", () => {
    for (const list of Object.values(GEM_BUDGET)) expect(list.length).toBeLessThanOrEqual(MAX_GEMS_PER_PAGE);
  });
  test("local time is Saigon time, 24h", () => {
    expect(localTimeLine(new Date("2026-10-03T11:30:00Z"))).toBe("It's 18:30 in Saigon");
  });
  test("secret word fires on 'thao', case-insensitive, ignores special keys", () => {
    let b = "";
    for (const k of ["x", "T", "Shift", "h", "a"]) b = pushSecretKey(b, k).buffer;
    expect(pushSecretKey(b, "o").hit).toBe(true);
    expect(pushSecretKey("tha", "x").hit).toBe(false);
    expect(isTypingTarget("INPUT", false)).toBe(true);
    expect(isTypingTarget("DIV", true)).toBe(true);
    expect(isTypingTarget("BODY", false)).toBe(false);
  });
  test("doodle round-trips and rejects garbage", () => {
    const s = [[[0.1, 0.2], [0.5, 0.5]]] as const;
    expect(parseDoodle(serializeDoodle(s))).toEqual([[[0.1, 0.2], [0.5, 0.5]]]);
    expect(parseDoodle("{oops")).toEqual([]);
    expect(parseDoodle(JSON.stringify([[[2, 3]], "x"]))).toEqual([]);
    expect(parseDoodle(null)).toEqual([]);
  });
  test("drop zone, peel and word ranges", () => {
    const board = { left: 0, top: 0, width: 100, height: 100 };
    expect(isOnBoard({ left: 60, top: 60, width: 30, height: 30 }, board)).toBe(true);
    expect(isOnBoard({ left: 120, top: 0, width: 30, height: 30 }, board)).toBe(false);
    expect(peelProgress(0, 0)).toBe(0);
    expect(peelProgress(300, 0)).toBe(1);
    const [a, b] = wordRange(9, 10);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(b).toBeLessThanOrEqual(1);
  });
  test("photos exist, are webp, and never the laptop-desk shot", () => {
    for (const p of photos) {
      expect(p.src.endsWith(".webp")).toBe(true);
      expect(p.src).not.toContain("laptop");
      expect(readFileSync(`public${p.src}`).length).toBeGreaterThan(1000);
    }
  });
  test("gem code adapts no third-party component", () => {
    for (const f of ["logic.ts", "cursor-reveal.tsx", "lost-note-game.tsx"]) {
      expect(readFileSync(`src/components/gems/${f}`, "utf8")).not.toContain("21st.dev/");
    }
  });
});
