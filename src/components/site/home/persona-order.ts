// Which project cards come first for each kind of visitor. Pure: unit-tested.
// The per-role orders live in roles.ts (one content table). Slugs that are not
// listed keep their default order after the listed ones, so adding a project
// never breaks a role.

import { ROLES } from "@/components/site/visitor/roles";
import type { RoleId } from "@/components/site/visitor/role-ids";

/** The project order for a role, or undefined when the role (or no role) means the default order. */
export function orderFor(role: RoleId | null | undefined) {
  return role ? ROLES[role].order : undefined;
}

/**
 * Reorder `items` for a role (stable; unlisted items keep their default order after).
 * No role, or a role without its own order, returns the default order untouched.
 */
export function orderForPersona<T extends { slug: string }>(items: readonly T[], persona: RoleId | null): T[] {
  const order = orderFor(persona);
  if (!order) return [...items];
  const rank = new Map(order.map((slug, i) => [slug, i]));
  return items
    .map((item, index) => ({ item, index, rank: rank.get(item.slug) ?? order.length }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((x) => x.item);
}

/** Furthest a card glides when the persona changes. Cards further off than this appear in place. */
export const FLIP_MAX = 400;

/** What the reorder animation actually shows: a short nudge (px) from the final place, so no frame is ever empty. */
export const GLIDE_NUDGE = 40;

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
