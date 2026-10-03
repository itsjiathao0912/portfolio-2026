import { describe, expect, test } from "bun:test";
import { PEOPLE_SEEDS, PASTEL_TOKENS, pastelFor, stackSplit, symbolId } from "../../src/components/people/avatar-logic.ts";
import { PROJECT_EMOJI, STAMPS, stampFor } from "../../src/components/site/home/project-meta.ts";
import { FLIP_MAX, HOME_PERSONAS, flipOffset, homePersona, orderForPersona } from "../../src/components/site/home/persona-order.ts";
import { TICKER_ITEMS } from "../../src/components/site/home/ticker-data.ts";

const SLUGS = ["lumicap", "cosap", "gocrypto", "pac", "zalo-game-center", "reorc-data-platform", "ledgr", "cortex-sentinel", "guardline"];

describe("avatars", () => {
  test("pastel is stable per seed and from the token list", () => {
    expect(pastelFor("mentee-1")).toBe(pastelFor("mentee-1"));
    expect(PASTEL_TOKENS.some((t) => pastelFor("builder-2") === `var(${t})`)).toBe(true);
  });
  test("symbol ids are safe; stacks cap at 5 with overflow", () => {
    expect(symbolId("Mentee 1")).toBe("av-mentee-1");
    expect(stackSplit(PEOPLE_SEEDS.participants, 5)).toEqual({ shown: PEOPLE_SEEDS.participants.slice(0, 5), more: 1 });
  });
});

describe("project meta", () => {
  test("every project has an emoji and a stamp", () => {
    for (const s of SLUGS) {
      expect(PROJECT_EMOJI[s]).toBeTruthy();
      expect(STAMPS[s]).toBeTruthy();
    }
  });
  test("stamp words stay truthful", () => {
    expect(stampFor("cortex-sentinel").word).toBe("2ND PLACE");
    expect(stampFor("gocrypto").word).toBe("STRATEGY");
    expect(stampFor("guardline").word).toBe("HACKATHON");
    expect(stampFor("ledgr").word).toBe("LIVE DEMO");
  });
});

describe("persona order", () => {
  const items = SLUGS.map((slug) => ({ slug }));
  test("everything keeps the default order", () => {
    expect(orderForPersona(items, null).map((i) => i.slug)).toEqual(SLUGS);
  });
  test("each persona moves a card and keeps every project once", () => {
    for (const p of HOME_PERSONAS) {
      const out = orderForPersona(items, p).map((i) => i.slug);
      expect(out).not.toEqual(SLUGS);
      expect([...out].sort()).toEqual([...SLUGS].sort());
    }
  });
  test("unknown stored personas mean everything", () => {
    expect(homePersona("curious")).toBeNull();
    expect(homePersona("founder")).toBe("founder");
  });
});

describe("ticker", () => {
  test("every item scrolls to a real project", () => {
    expect(TICKER_ITEMS.length).toBeGreaterThanOrEqual(5);
    for (const t of TICKER_ITEMS) expect(SLUGS).toContain(t.slug);
  });
});

describe("persona reorder glide", () => {
  test("visible cards glide at most FLIP_MAX, never thousands of px", () => {
    expect(flipOffset(5000, 900, 800, 900)).toBe(FLIP_MAX);
    expect(flipOffset(900, 5000, 800, 900)).toBe(-FLIP_MAX);
    expect(flipOffset(1100, 900, 800, 900)).toBe(200);
  });
  test("cards nowhere near the viewport, before or after, jump instantly", () => {
    expect(flipOffset(6000, 9000, 800, 900)).toBeNull();
  });
  test("a card that did not move is not animated", () => {
    expect(flipOffset(1000, 1001, 800, 900)).toBeNull();
  });
});
