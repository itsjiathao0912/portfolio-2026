import * as THREE from "three";

/** Original heater-shield outline (our own drawing from bezier curves). */
export function shieldShape(w = 1.6, h = 1.9) {
  const s = new THREE.Shape();
  const hw = w / 2;
  const top = h * 0.45;
  s.moveTo(0, top + 0.12);
  s.bezierCurveTo(hw * 0.45, top + 0.12, hw * 0.75, top, hw, top - 0.02);
  s.lineTo(hw, 0.05);
  s.bezierCurveTo(hw, -h * 0.3, hw * 0.45, -h * 0.45, 0, -h * 0.55);
  s.bezierCurveTo(-hw * 0.45, -h * 0.45, -hw, -h * 0.3, -hw, 0.05);
  s.lineTo(-hw, top - 0.02);
  s.bezierCurveTo(-hw * 0.75, top, -hw * 0.45, top + 0.12, 0, top + 0.12);
  return s;
}

/** Original check-mark used as the shield emblem. */
export function checkShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.38, 0.02);
  s.lineTo(-0.24, 0.16);
  s.lineTo(-0.08, 0.0);
  s.lineTo(0.3, 0.38);
  s.lineTo(0.44, 0.24);
  s.lineTo(-0.08, -0.28);
  s.lineTo(-0.38, 0.02);
  return s;
}

/** Speech-bubble outline for the chat token. */
export function bubbleShape() {
  const s = new THREE.Shape();
  const r = 0.12;
  const w = 0.5;
  const h = 0.36;
  s.moveTo(-w + r, h);
  s.lineTo(w - r, h);
  s.quadraticCurveTo(w, h, w, h - r);
  s.lineTo(w, -h + r);
  s.quadraticCurveTo(w, -h, w - r, -h);
  s.lineTo(-0.05, -h);
  s.lineTo(-0.3, -h - 0.22);
  s.lineTo(-0.25, -h);
  s.lineTo(-w + r, -h);
  s.quadraticCurveTo(-w, -h, -w, -h + r);
  s.lineTo(-w, h - r);
  s.quadraticCurveTo(-w, h, -w + r, h);
  return s;
}

export const PALETTE = {
  navy: "#0b1f4d",
  blue: "#2563eb",
  sky: "#93c5fd",
  white: "#ffffff",
  gold: "#f5b83d",
  rose: "#f472b6",
  mint: "#34d399",
  lavender: "#a78bfa",
} as const;
