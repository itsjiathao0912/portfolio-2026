// Pure helpers for the glass lane (unit-tested, no DOM).

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Pointer position inside a rect as 0..100 percentages. */
export function pointerPercent(x: number, y: number, rect: { left: number; top: number; width: number; height: number }) {
  if (rect.width <= 0 || rect.height <= 0) return { px: 50, py: 50 };
  return {
    px: clamp(((x - rect.left) / rect.width) * 100, 0, 100),
    py: clamp(((y - rect.top) / rect.height) * 100, 0, 100),
  };
}

/** macOS dock magnification: scale for an item at `center` given pointer `x`. */
export const DOCK_MAX_SCALE = 1.6;
export const DOCK_RANGE = 140;
export function dockScale(pointerX: number | null, center: number, max = DOCK_MAX_SCALE, range = DOCK_RANGE) {
  if (pointerX === null) return 1;
  const d = Math.abs(pointerX - center);
  if (d >= range) return 1;
  // cosine falloff: 1 at d=0, 0 at d=range
  const t = (Math.cos((d / range) * Math.PI) + 1) / 2;
  return 1 + (max - 1) * t;
}

/** Scroll progress of an element through the viewport: 0 when its top hits the
 * viewport top, 1 when its bottom reaches the viewport bottom. */
export function sectionProgress(top: number, height: number, viewport: number) {
  const travel = height - viewport;
  if (travel <= 0) return top <= 0 ? 1 : 0;
  return clamp(-top / travel, 0, 1);
}

/** Linear blend between two #rrggbb colours. */
export function mixHex(a: string, b: string, t: number) {
  const pa = parseHex(a);
  const pb = parseHex(b);
  if (!pa || !pb) return a;
  const k = clamp(t, 0, 1);
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * k));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
function parseHex(h: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(h.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Archivo variable axes for the kinetic headline. wght 100–900, wdth 62–125. */
export function kineticAxes(scroll: number, proximity: number) {
  const s = clamp(scroll, 0, 1);
  const p = clamp(proximity, 0, 1);
  return {
    wght: Math.round(clamp(400 + s * 400 + p * 100, 100, 900)),
    wdth: Math.round(clamp(100 + s * 25 - p * 30, 62, 125)),
  };
}
