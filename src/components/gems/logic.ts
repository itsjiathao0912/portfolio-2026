// Pure helpers for the hidden-gem layer. No React, no DOM: everything here is
// unit-tested in tests/unit/gems.test.ts. All gem code is our own (no 21st.dev
// or other third-party component was adapted, so there is no licence to record).

/** Hidden gems per page. Rule from the wow-ideas report: never more than 3. */
export const GEM_BUDGET = {
  home: ["secret-word", "cursor-reveal"],
  about: ["secret-word"],
  notFound: ["secret-word", "drag-game"],
  work: ["secret-word"],
} as const;
export const MAX_GEMS_PER_PAGE = 3;

/** "It's 18:30 in Saigon" — always Ho Chi Minh City time, 24h, whatever the visitor's zone. */
export function saigonTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}

export function localTimeLine(date: Date) {
  return `It's ${saigonTime(date)} in Saigon`;
}

export const SECRET_WORD = "thao";

/** Append a typed key to the rolling buffer; returns the new buffer and whether the secret was just completed. */
export function pushSecretKey(buffer: string, key: string, word = SECRET_WORD) {
  if (key.length !== 1) return { buffer, hit: false } as const;
  const next = (buffer + key.toLowerCase()).slice(-word.length);
  return next === word ? ({ buffer: "", hit: true } as const) : ({ buffer: next, hit: false } as const);
}

/** Keys typed into a form field never count toward the secret word. */
export function isTypingTarget(tag: string | undefined, editable: boolean) {
  return editable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

// ── Doodle pad ───────────────────────────────────────────────────────────────
export type Point = readonly [number, number];
export type Stroke = readonly Point[];

export const DOODLE_KEY = "thao:doodle:v1";
const MAX_STROKES = 200;
const MAX_POINTS = 4000;

/** Normalised 0..1 coordinates, 3 decimals, so a doodle redraws at any pad size. */
export function serializeDoodle(strokes: readonly Stroke[]) {
  let budget = MAX_POINTS;
  const kept: number[][][] = [];
  for (const s of strokes.slice(-MAX_STROKES)) {
    if (budget <= 0) break;
    const pts = s.slice(0, budget).map(([x, y]) => [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000]);
    budget -= pts.length;
    if (pts.length > 0) kept.push(pts);
  }
  return JSON.stringify(kept);
}

/** Parse a stored doodle; anything malformed (or from another site) gives an empty pad, never a throw. */
export function parseDoodle(raw: string | null): Stroke[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter((s): s is unknown[] => Array.isArray(s))
      .map((s) =>
        s.filter(
          (p): p is [number, number] =>
            Array.isArray(p) && p.length === 2 && p.every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1)
        )
      )
      .filter((s) => s.length > 0)
      .slice(-MAX_STROKES);
  } catch {
    return [];
  }
}

// ── 404 drag game ─────────────────────────────────────────────────────────────
export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** The note counts as "back on the board" when its centre is inside the board. */
export function isOnBoard(note: Box, board: Box) {
  const cx = note.left + note.width / 2;
  const cy = note.top + note.height / 2;
  return cx >= board.left && cx <= board.left + board.width && cy >= board.top && cy <= board.top + board.height;
}

// ── Peelable sticker ──────────────────────────────────────────────────────────
export const PEEL_DISTANCE = 90;

/** 0..1 peel progress from a drag offset (any direction). */
export function peelProgress(dx: number, dy: number, distance = PEEL_DISTANCE) {
  return Math.min(1, Math.hypot(dx, dy) / distance);
}

// ── Scroll word reveal ────────────────────────────────────────────────────────
/** Opacity window for word i of n as scroll progress p goes 0→1 (grey 0.2 → ink 1). */
export function wordRange(i: number, n: number) {
  const start = n <= 1 ? 0 : (i / n) * 0.8;
  return [start, Math.min(1, start + 0.2)] as const;
}
