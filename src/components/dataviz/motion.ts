// One spring family for every chart (see round3 motion report house rules).
export const VIZ_SPRING = { type: "spring", stiffness: 160, damping: 24 } as const;
export const VIZ_VIEWPORT = { once: true, amount: 0.35 } as const;
/** Stagger delay for the i-th mark, capped so long charts don't drag. */
export function vizDelay(index: number, step = 0.08) {
  return Math.min(index, 8) * step;
}
