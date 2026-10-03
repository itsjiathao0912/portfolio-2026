// Pure math for the settlement globe. No DOM, no React — unit-tested.

export type Vec3 = readonly [number, number, number];

const DEG = Math.PI / 180;

/** Unit-sphere point; +Y up, longitude 0 faces +Z. */
export function latLonToVec(lat: number, lon: number): Vec3 {
  const phi = lat * DEG;
  const lam = lon * DEG;
  return [Math.cos(phi) * Math.sin(lam), Math.sin(phi), Math.cos(phi) * Math.cos(lam)];
}

/** Rotate around Y (yaw) then X (tilt). */
export function rotate(v: Vec3, yaw: number, tilt: number): Vec3 {
  const [x, y, z] = v;
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  return [x1, y * ct - z1 * st, y * st + z1 * ct];
}

/** Orthographic projection to screen. z > 0 means facing the viewer. */
export function project(v: Vec3, cx: number, cy: number, r: number) {
  return { x: cx + v[0] * r, y: cy - v[1] * r, z: v[2] } as const;
}

/** Great-circle points between two unit vectors, lifted off the surface. */
export function arcPoints(a: Vec3, b: Vec3, steps = 48, lift = 0.22): Vec3[] {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  const s = Math.sin(omega) || 1;
  const out: Vec3[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const k1 = omega === 0 ? 1 - t : Math.sin((1 - t) * omega) / s;
    const k2 = omega === 0 ? t : Math.sin(t * omega) / s;
    const h = 1 + lift * Math.sin(Math.PI * t) * Math.min(1, omega * 1.4);
    out.push([(a[0] * k1 + b[0] * k2) * h, (a[1] * k1 + b[1] * k2) * h, (a[2] * k1 + b[2] * k2) * h]);
  }
  return out;
}

/** Evenly spaced points on a sphere (Fibonacci lattice). */
export function fibonacciSphere(n: number): Vec3[] {
  const pts: Vec3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    pts.push([Math.cos(th) * rad, y, Math.sin(th) * rad]);
  }
  return pts;
}

export function vecToLatLon(v: Vec3) {
  return { lat: Math.asin(v[1]) / DEG, lon: Math.atan2(v[0], v[2]) / DEG } as const;
}

// A deliberately coarse, hand-drawn land mask: a handful of ellipses in
// lat/lon space. Not a map — just enough silhouette to read as Earth.
const LAND: readonly (readonly [number, number, number, number])[] = [
  // [centerLat, centerLon, radiusLat, radiusLon]
  [50, 15, 14, 28], [58, 95, 18, 55], [30, 80, 16, 25], [22, 45, 10, 12], [15, 103, 10, 8],
  [36, 128, 5, 4], [2, 113, 6, 14], [-2, 135, 5, 10], [12, 122, 6, 3], [5, 20, 22, 18],
  [-20, 25, 14, 12], [-25, 134, 11, 17], [48, -100, 15, 30], [64, -110, 9, 30], [20, -100, 8, 10],
  [-12, -58, 18, 14], [-38, -66, 12, 6], [72, -40, 8, 14],
];

export function isLand(lat: number, lon: number) {
  for (const [cl, co, rl, ro] of LAND) {
    let d = lon - co;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    if ((lat - cl) ** 2 / (rl * rl) + (d * d) / (ro * ro) <= 1) return true;
  }
  return false;
}

/** Distance from point p to segment ab (2D). */
export function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Inertia step: returns the next velocity after friction, snapping tiny values to 0. */
export function decay(velocity: number, dtMs: number, friction = 0.94) {
  const v = velocity * Math.pow(friction, dtMs / 16.67);
  return Math.abs(v) < 1e-5 ? 0 : v;
}
