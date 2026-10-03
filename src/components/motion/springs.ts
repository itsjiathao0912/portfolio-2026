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
  /** Soft tilt for cards and pointer parallax. */
  tilt: { type: "spring", stiffness: 180, damping: 24 },
  /** Card hover lift (LiftCard): one small overshoot, settles in ~0.5s. */
  lift: { type: "spring", stiffness: 190, damping: 20, mass: 1 },
  /** Stamp landing (project stamps). */
  stamp: { type: "spring", stiffness: 520, damping: 22, mass: 0.9 },
  /** Pointer-follow (sheen, cursor masks): slow and smooth. */
  glide: { type: "spring", stiffness: 120, damping: 26, mass: 1 },
} as const;

/** Non-spring durations in seconds (mirror --d-* in globals.css). */
export const DURATION = { micro: 0.12, short: 0.2, med: 0.32, reveal: 0.52 } as const;

/** Scroll reveal: the only reveal pattern (opacity 0 to 1, y 16 to 0, once). */
export const REVEAL = { y: 16, duration: DURATION.reveal, stagger: 0.06, maxStaggered: 6 } as const;

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
