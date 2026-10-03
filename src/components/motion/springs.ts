// One spring family for the whole site, so every moving part feels related.
// Values are motion/react transition objects. Never invent a one-off spring in
// a component: add a named preset here instead.

export const SPRING = {
  /** Default UI spring: bouncy, settles fast (buttons, chips, bursts). */
  ui: { type: "spring", stiffness: 380, damping: 24, mass: 0.8 },
  /** Nav active indicator (layoutId). */
  indicator: { type: "spring", stiffness: 500, damping: 38, mass: 0.8 },
  /** Press feedback: grow, never shrink (iOS 26 "interactive" glass). */
  press: { type: "spring", stiffness: 600, damping: 30 },
  /** Magnetic hover follow. */
  magnet: { type: "spring", stiffness: 300, damping: 20, mass: 0.5 },
  /** Big layout moves and sheets. */
  sheet: { type: "spring", stiffness: 400, damping: 40 },
  /** Soft tilt for cards. */
  tilt: { type: "spring", stiffness: 180, damping: 24 },
} as const;

/** Instant transition used when the visitor prefers reduced motion. */
export const INSTANT = { duration: 0 } as const;

/** Press scale for every pressable surface. */
export const PRESS_SCALE = 1.06;

/** Max magnetic travel in px. */
export const MAGNET_MAX = 6;

/** Clamp a magnetic offset so a button never drifts more than MAGNET_MAX. */
export function magnetOffset(dx: number, dy: number, halfW: number, halfH: number, max = MAGNET_MAX) {
  const nx = halfW > 0 ? Math.max(-1, Math.min(1, dx / halfW)) : 0;
  const ny = halfH > 0 ? Math.max(-1, Math.min(1, dy / halfH)) : 0;
  return { x: Math.round(nx * max * 100) / 100, y: Math.round(ny * max * 100) / 100 };
}

/** Split a display value like "+30%", "~20", "$635M", "95%" into a number to roll and its affixes. Null = not rollable. */
export function parseCounter(value: string) {
  const match = /^([+\-~≈$€£]*)(\d{1,3}(?:,\d{3})*|\d+)(\.\d+)?([%+KMBkx×]*)$/.exec(value.trim());
  if (!match) return null;
  const [, prefix, int, frac = "", suffix] = match;
  const target = Number(int.replace(/,/g, "") + frac);
  if (!Number.isFinite(target)) return null;
  return { prefix, suffix, target, decimals: frac ? frac.length - 1 : 0, grouped: int.includes(",") } as const;
}

/** Format a rolling number back into the same shape as the source value. */
export function formatCounter(n: number, spec: NonNullable<ReturnType<typeof parseCounter>>) {
  const fixed = n.toFixed(spec.decimals);
  const body = spec.grouped ? Number(fixed).toLocaleString("en-US", { minimumFractionDigits: spec.decimals, maximumFractionDigits: spec.decimals }) : fixed;
  return `${spec.prefix}${body}${spec.suffix}`;
}
