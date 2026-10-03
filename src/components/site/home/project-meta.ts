// Pure, per-project presentation data for the home stack. No React.
// Stamp words must stay TRUE for each project (design SPEC section 5.6).

/** TOC emoji per project (decorative; the label is the accessible name). */
export const PROJECT_EMOJI: Readonly<Record<string, string>> = {
  lumicap: "🏦",
  cosap: "🏭",
  gocrypto: "🪙",
  pac: "☁️",
  "zalo-game-center": "🎮",
  "reorc-data-platform": "📊",
  "cortex-sentinel": "🛡️",
  guardline: "🚨",
  ledgr: "📒",
};

export function emojiFor(slug: string) {
  return PROJECT_EMOJI[slug] ?? "✨";
}

export interface StampSpec {
  word: string;
  sub: string;
}

/**
 * What each card's stamp says. Shipped platforms say SHIPPED; the rest say
 * exactly what they are (an award, a hackathon build, a live demo, a strategy).
 */
export const STAMPS: Readonly<Record<string, StampSpec>> = {
  lumicap: { word: "SHIPPED", sub: "2025 · SKYLAB" },
  cosap: { word: "SHIPPED", sub: "2025 · SKYLAB" },
  gocrypto: { word: "STRATEGY", sub: "INDEPENDENT" },
  pac: { word: "SHIPPED", sub: "2025 · SKYLAB" },
  "zalo-game-center": { word: "SHIPPED", sub: "2023 · ZALO" },
  "reorc-data-platform": { word: "SHIPPED", sub: "2024 · REORC" },
  "cortex-sentinel": { word: "2ND PLACE", sub: "AABW 2026" },
  guardline: { word: "HACKATHON", sub: "VIETNAM 2026" },
  ledgr: { word: "LIVE DEMO", sub: "VIETNAM" },
};

export function stampFor(slug: string): StampSpec {
  return STAMPS[slug] ?? { word: "SHIPPED", sub: "" };
}
