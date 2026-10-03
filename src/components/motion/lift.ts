// Pure logic for the shared card hover (LiftCard). Kept free of React so the
// numbers the design spec fixes (lift 12px, scale 1.025, press 0.985) are unit
// tested directly.

import { magnetOffset } from "./springs";

export type LiftMode = "rest" | "hover" | "press";
export type LiftVariant = "card" | "row";

// Same two-layer structure at every step so box-shadow interpolates smoothly.
export const LIFT_SHADOW = {
  rest: "0 1px 2px 0 rgba(11,21,51,0.06), 0 0 0 0 rgba(11,21,51,0)",
  press: "0 8px 20px -6px rgba(11,21,51,0.12), 0 2px 4px 0 rgba(11,21,51,0.05)",
  hover: "0 24px 44px -14px rgba(11,21,51,0.2), 0 6px 12px -4px rgba(11,21,51,0.08)",
} as const;

/** Max px the inner layer drifts opposite to the pointer. */
export const PARALLAX_MAX = 4;

/** Wanted visible rise of the card's TOP EDGE on hover, px (design band is 10 to 14, a little spring overshoot sits on top). */
export const LIFT_RISE = 11.5;
/** Hover growth. Kept small: growth moves the top edge by (scale-1)*height/2, which is large on tall cards. */
export const LIFT_SCALE = 1.014;
export const PRESS_SCALE_CARD = 0.985;

/** How far the top edge ends up above its rest position for a given pose and card height. */
export function topEdgeRise(y: number, scale: number, height: number) {
  return -y + ((scale - 1) * height) / 2;
}

/** translateY that makes the hover top-edge rise LIFT_RISE px whatever the card height (never less than 3px of real travel). */
export function hoverTranslate(height: number) {
  return -Math.max(3, Math.round((LIFT_RISE - ((LIFT_SCALE - 1) * height) / 2) * 100) / 100);
}

/** Target pose for each state. Reduced motion: shadow only, never a transform. `height` = card offsetHeight in px. */
export function liftTarget(mode: LiftMode, variant: LiftVariant = "card", reduce = false, height = 0) {
  const shadow = mode === "rest" ? LIFT_SHADOW.rest : mode === "press" ? LIFT_SHADOW.press : LIFT_SHADOW.hover;
  if (reduce) return { y: 0, scale: 1, boxShadow: mode === "rest" ? LIFT_SHADOW.rest : LIFT_SHADOW.hover };
  if (variant === "row") {
    if (mode === "rest") return { y: 0, scale: 1, boxShadow: shadow };
    return { y: mode === "press" ? -1 : -2, scale: 1, boxShadow: shadow };
  }
  if (mode === "rest") return { y: 0, scale: 1, boxShadow: shadow };
  if (mode === "press") return { y: -4, scale: PRESS_SCALE_CARD, boxShadow: shadow };
  return { y: hoverTranslate(height), scale: LIFT_SCALE, boxShadow: shadow };
}

/** Inner content shifts opposite to the pointer, capped at PARALLAX_MAX px. */
export function parallaxOffset(dx: number, dy: number, halfW: number, halfH: number) {
  const o = magnetOffset(dx, dy, halfW, halfH, PARALLAX_MAX);
  return { x: -o.x || 0, y: -o.y || 0 };
}
