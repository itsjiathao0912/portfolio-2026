// Which project cards come first for each kind of visitor. Pure: unit-tested.
// Slugs that are not listed keep their default order after the listed ones,
// so adding a project never breaks a persona.

export const HOME_PERSONAS = ["recruiter", "founder", "engineer"] as const;
export type HomePersona = (typeof HOME_PERSONAS)[number];

export const HOME_PERSONA_NOTE: Record<HomePersona, string> = {
  recruiter: "Recruiter view: the award and the products with the clearest results first.",
  founder: "Founder view: what she shipped and how, her own product first.",
  engineer: "Engineer view: data platforms, systems and specs first.",
};

const ORDER: Record<HomePersona, readonly string[]> = {
  recruiter: ["cortex-sentinel", "pac", "cosap", "lumicap", "reorc-data-platform", "zalo-game-center"],
  founder: ["ledgr", "lumicap", "cosap", "gocrypto", "guardline", "cortex-sentinel"],
  engineer: ["reorc-data-platform", "pac", "cosap", "cortex-sentinel", "guardline", "zalo-game-center"],
};

/** A stored persona that is not one of the three home personas means "Everything". */
export function homePersona(value: string | null | undefined): HomePersona | null {
  return (HOME_PERSONAS as readonly string[]).includes(value ?? "") ? (value as HomePersona) : null;
}

/** Reorder `items` for a persona (stable; unlisted items keep their default order after). */
export function orderForPersona<T extends { slug: string }>(items: readonly T[], persona: HomePersona | null): T[] {
  if (!persona) return [...items];
  const rank = new Map(ORDER[persona].map((slug, i) => [slug, i]));
  return items
    .map((item, index) => ({ item, index, rank: rank.get(item.slug) ?? ORDER[persona].length }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((x) => x.item);
}

/** Furthest a card glides when the persona changes. Cards further off than this appear in place. */
export const FLIP_MAX = 400;

/**
 * Persona reorder as a viewport-local FLIP. `delta` is how far a card was above (+) the
 * place it now sits (old top minus new top). Returns the starting offset to animate from,
 * or null when the card is nowhere near the viewport before or after (jump instantly).
 * Pure: unit-tested.
 */
export function flipOffset(oldTop: number, newTop: number, scrollY: number, viewH: number, margin = 200) {
  const inView = (top: number) => top > scrollY - margin && top < scrollY + viewH + margin;
  if (!inView(oldTop) && !inView(newTop)) return null;
  const delta = oldTop - newTop;
  if (Math.abs(delta) < 2) return null;
  return Math.max(-FLIP_MAX, Math.min(FLIP_MAX, delta));
}
