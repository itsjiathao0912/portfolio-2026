// Pure helpers for the character cast. No React, no DOM: unit-tested.
import site, { photos } from "../../../../content/site";

export const CHARACTER_NAMES = ["audit", "sprout", "settle", "linh", "mai", "an"] as const;
export type CharacterName = (typeof CHARACTER_NAMES)[number];
export const POSES = ["idle", "wave", "jump", "cheer"] as const;
export type Pose = (typeof POSES)[number];
export const EXPRESSIONS = ["happy", "wow", "wink", "focus"] as const;
export type Expression = (typeof EXPRESSIONS)[number];

/** Who each character is. Original designs, drawn in code for this site. */
export const CAST: Record<CharacterName, { label: string; role: string }> = {
  audit: { label: "Audit", role: "the compliance guard" },
  sprout: { label: "Sprout", role: "the growth sprout" },
  settle: { label: "Settle", role: "the payment coin" },
  linh: { label: "Builder Linh", role: "a community builder" },
  mai: { label: "Builder Mai", role: "a community builder" },
  an: { label: "Builder An", role: "a community builder" },
};

/** Pupil offset toward a target, clamped to a circle of radius `max`. */
export function pupilOffset(dx: number, dy: number, max = 2.2) {
  const d = Math.hypot(dx, dy);
  if (!Number.isFinite(d) || d === 0) return { x: 0, y: 0 };
  const k = Math.min(1, d / 240) * max;
  return { x: (dx / d) * k, y: (dy / d) * k };
}

/** Next blink delay: 2.4 to 5.6 s, from a 0..1 random value. */
export function blinkDelay(r: number) {
  const c = Math.min(1, Math.max(0, r));
  return Math.round(2400 + c * 3200);
}

/** Deterministic pseudo-random (mulberry32) so cursor paths are stable per seed. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Waypoints (percent of the stage, kept inside a 6..94 safe box) for a drifting cursor. */
export function cursorPath(seed: number, steps = 6) {
  const rnd = seeded(seed);
  return Array.from({ length: steps }, () => ({
    x: Math.round(6 + rnd() * 74),
    y: Math.round(8 + rnd() * 84),
  }));
}

/** The friendly fake cursors. Labels describe roles, never real people. */
export const COMMUNITY_CURSORS = [
  { id: "c1", name: "Builder", note: "Shipped it!", color: "#2563eb", avatar: "linh" as CharacterName },
  { id: "c2", name: "Mentee", note: "Can I ask a question?", color: "#db2777", avatar: "mai" as CharacterName },
  { id: "c3", name: "Organiser", note: "Demo time", color: "#059669", avatar: "an" as CharacterName },
  { id: "c4", name: "Sprout", note: "+1 growing", color: "#d97706", avatar: "sprout" as CharacterName },
] as const;

export type WallTile = {
  id: string;
  front: string;
  kicker: string;
  back: string;
  source: string;
  tint: string;
  character: CharacterName;
};

const creatio = site.experience.find((e) => e.id === "creatio");
const aabw = site.awards.find((a) => a.id === "aabw");
const bs33 = photos.find((p) => p.id === "bs33-ledgr-demo");

/**
 * Wall tiles: ONLY facts that exist in content/site.ts (read at build time,
 * so the wall can never drift from the source). Missing facts = no tile.
 */
export function buildWallTiles(): WallTile[] {
  const tiles: WallTile[] = [];
  const cb: readonly string[] = (creatio && "bullets" in creatio ? creatio.bullets : undefined) ?? [];
  if (creatio && cb[0]) {
    tiles.push({ id: "creatio-reach", kicker: creatio.company, front: "2,500+ participants", back: cb[0], source: `${creatio.role} · ${creatio.period}`, tint: "var(--tint-rose)", character: "mai" });
  }
  if (creatio && cb[1]) {
    tiles.push({ id: "creatio-partners", kicker: creatio.company, front: "20+ sponsors", back: cb[1], source: creatio.domain, tint: "var(--tint-butter)", character: "settle" });
  }
  if (bs33) {
    tiles.push({ id: "build-stuffs", kicker: "Build Stuffs", front: "Demoing with builders", back: `${bs33.caption}: showing Ledgr, an AI compliance assistant, to a room of builders.`, source: "buildstuffs.duma.so", tint: "var(--tint-sky)", character: "linh" });
  }
  if (aabw) {
    tiles.push({ id: "aabw", kicker: "Agentic AI Build Week", front: aabw.result, back: `${aabw.name}: ${aabw.result}.`, source: "AABW 2026", tint: "var(--tint-mint)", character: "audit" });
  }
  return tiles;
}

/** Numbers shown on the wall must appear verbatim in the tile's own sourced text. */
export function numbersAreSourced(tile: WallTile) {
  const nums = tile.front.match(/\d[\d,.]*\+?/g) ?? [];
  return nums.every((n) => tile.back.includes(n) || tile.source.includes(n));
}
