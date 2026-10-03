// Pure helpers for the liquid-glass refraction map. No DOM here, so they are
// unit-testable; the canvas encoding lives in liquid-glass.tsx.

/** Chromium is the only engine that renders an SVG filter inside backdrop-filter (WebKit bug 245510; Firefox likewise). `CSS.supports` lies, so sniff. */
export function supportsSvgBackdrop(ua: string) {
  if (!/Chrome\/\d+/.test(ua)) return false;
  // iOS browsers are WebKit underneath whatever the brand says.
  return !/(CriOS|FxiOS|EdgiOS|Firefox)/.test(ua);
}

/** Signed distance from a point to a rounded rectangle centred at the origin (negative inside). */
export function roundedRectSdf(px: number, py: number, halfW: number, halfH: number, radius: number) {
  const r = Math.min(radius, halfW, halfH);
  const qx = Math.abs(px) - (halfW - r);
  const qy = Math.abs(py) - (halfH - r);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
}

/**
 * Displacement for one pixel as [r, g] bytes (128 = no shift). Inside the
 * bezel band the backdrop is pulled toward the edge along the outward normal,
 * strongest right at the rim and fading to zero `bezel` px inward: that curve
 * is what reads as a thick lens edge.
 */
export function displacementAt(x: number, y: number, w: number, h: number, radius: number, bezel: number) {
  const px = x + 0.5 - w / 2;
  const py = y + 0.5 - h / 2;
  const d = roundedRectSdf(px, py, w / 2, h / 2, radius);
  if (d > 0 || bezel <= 0) return [128, 128] as const;
  const depth = -d; // px inward from the rim
  if (depth >= bezel) return [128, 128] as const;
  // Numerical gradient of the SDF = outward normal.
  const e = 0.5;
  const nx = roundedRectSdf(px + e, py, w / 2, h / 2, radius) - roundedRectSdf(px - e, py, w / 2, h / 2, radius);
  const ny = roundedRectSdf(px, py + e, w / 2, h / 2, radius) - roundedRectSdf(px, py - e, w / 2, h / 2, radius);
  const len = Math.hypot(nx, ny) || 1;
  const t = 1 - depth / bezel;
  const strength = t * t; // ease: steep at the rim
  const r = Math.round(128 + (nx / len) * strength * 127);
  const g = Math.round(128 + (ny / len) * strength * 127);
  return [clampByte(r), clampByte(g)] as const;
}

function clampByte(n: number) {
  return Math.max(0, Math.min(255, n));
}

/** Map size is capped so a wide element never encodes a huge PNG; the SVG stretches it. */
export const MAX_MAP = 400;

export function mapSize(w: number, h: number) {
  const scale = Math.min(1, MAX_MAP / Math.max(w, h, 1));
  return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)), scale };
}
