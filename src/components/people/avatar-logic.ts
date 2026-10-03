// Pure helpers for the people avatars. No React: unit-tested.
//
// Avatars are the site's original clay characters (src/components/clay), the
// same family as the role picker tiles. Seeds are role labels, never real names,
// so nobody mistakes them for real people. Real people only appear in real photos.

import type { RoleId } from "../site/visitor/role-ids";

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

/** Clay roles each seed group draws from (props only: sponsors carry coins, builders carry laptops). */
const GROUP_ROLES: Record<string, readonly RoleId[]> = {
  mentee: ["student", "curious", "designer", "growth"],
  sponsor: ["investor", "marketer", "founder"],
  builder: ["engineer", "designer", "founder", "data", "pm"],
  judge: ["investor", "pm", "data"],
};

/** Deterministic clay role for a seed: the group (text before the last dash) picks the pool, the hash picks the role. */
export function roleForPerson(seed: string): RoleId {
  const pool = GROUP_ROLES[seed.replace(/-\d+$/, "")] ?? GROUP_ROLES.builder!;
  return pool[hashSeed(`role:${seed}`) % pool.length]!;
}
