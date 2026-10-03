// Pure helpers for the people avatars. No React, no DiceBear: unit-tested.
//
// Avatars are DiceBear "notionists" (artwork by Zoish, CC0), rendered locally.
// Seeds are role labels, never real names, so nobody mistakes them for real
// people. Real people only appear in real photos.

/** Soft pastel fills (design tokens, never raw hex). */
export const PASTEL_TOKENS = [
  "--tint-sky",
  "--tint-periwinkle",
  "--tint-lavender",
  "--tint-rose",
  "--tint-peach",
  "--tint-mint",
  "--tint-aqua",
  "--tint-butter",
] as const;

/** FNV-1a: a small stable string hash (same seed, same colour, every render). */
export function hashSeed(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** CSS colour for a seed's circle. */
export function pastelFor(seed: string) {
  return `var(${PASTEL_TOKENS[hashSeed(seed) % PASTEL_TOKENS.length]})`;
}

/** Id of the shared <symbol> for a seed (letters, digits and dashes only). */
export function symbolId(seed: string) {
  return `av-${seed.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

/** Split a stack into the avatars shown and the "+N" overflow. */
export function stackSplit<T>(items: readonly T[], max = 5) {
  const shown = items.slice(0, max);
  return { shown, more: Math.max(0, items.length - shown.length) } as const;
}

/** Role-label seeds, grouped so each stat card gets a stable, distinct cast. */
export const PEOPLE_SEEDS = {
  participants: ["mentee-1", "mentee-2", "mentee-3", "mentee-4", "mentee-5", "mentee-6"],
  sponsors: ["sponsor-1", "sponsor-2", "sponsor-3", "sponsor-4"],
  builders: ["builder-1", "builder-2", "builder-3", "builder-4", "builder-5"],
  judges: ["judge-1", "judge-2", "judge-3"],
} as const;

export const ALL_SEEDS: readonly string[] = [...new Set(Object.values(PEOPLE_SEEDS).flat())];
