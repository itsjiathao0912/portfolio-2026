// Default look per role and deterministic variants for the people section.
// Pure: no React. AvatarSpec indexes into the tables in palette.ts / parts.tsx.

import { ROLE_IDS, type RoleId } from "../site/visitor/role-ids";
import type { AvatarSpec } from "../site/visitor/types";
import { ACCENTS, HAIRS, SKINS } from "./palette";
import { HAIR_STYLES } from "./parts";

/** Default skin / hair / hair style / accent per role (a varied, friendly cast). */
export const ROLE_AVATAR: Record<RoleId, AvatarSpec> = {
  recruiter: { skin: 1, hair: 1, hairStyle: 2, accent: 0 },
  founder: { skin: 3, hair: 0, hairStyle: 1, accent: 5 },
  engineer: { skin: 0, hair: 3, hairStyle: 6, accent: 1 },
  designer: { skin: 2, hair: 5, hairStyle: 3, accent: 2 },
  marketer: { skin: 4, hair: 0, hairStyle: 5, accent: 7 },
  growth: { skin: 1, hair: 4, hairStyle: 4, accent: 6 },
  data: { skin: 5, hair: 0, hairStyle: 0, accent: 3 },
  investor: { skin: 0, hair: 6, hairStyle: 2, accent: 0 },
  student: { skin: 2, hair: 2, hairStyle: 1, accent: 5 },
  pm: { skin: 3, hair: 7, hairStyle: 4, accent: 6 },
  curious: { skin: 4, hair: 1, hairStyle: 6, accent: 4 },
};

/** FNV-1a, local copy so this module has no dependency on the people section. */
export function seedHash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** Deterministic skin / hair / accent for a seed (same seed, same person, every render). */
export function variantFor(seed: string): AvatarSpec {
  const h = seedHash(seed);
  return {
    skin: h % SKINS.length,
    hair: (h >>> 3) % HAIRS.length,
    hairStyle: (h >>> 7) % HAIR_STYLES.length,
    accent: (h >>> 11) % ACCENTS.length,
  };
}

/** Deterministic role for a seed, used when a person has no role of their own. */
export function roleForSeed(seed: string): RoleId {
  return ROLE_IDS[seedHash(`role:${seed}`) % ROLE_IDS.length]!;
}
