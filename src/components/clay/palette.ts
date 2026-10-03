// Clay art palette. These hex values are ILLUSTRATION constants (skin, hair,
// clothing, props), not UI tokens: they only exist inside the avatar art and
// are the one documented exception to the "tokens only" rule. Every colour is
// expanded to light / mid / dark by shade() so the SVG gradients read as soft
// plasticine rather than flat fills.

export type Shade = { light: string; mid: string; dark: string };

function parse(hex: string) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}
function toHex(rgb: readonly number[]) {
  return `#${rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
}
/** Linear mix of two hex colours: t=0 gives a, t=1 gives b. */
export function mix(a: string, b: string, t: number) {
  const pa = parse(a);
  const pb = parse(b);
  return toHex(pa.map((v, i) => v + (pb[i]! - v) * t));
}
/** Light, mid and dark stops for one base colour (dark leans warm so shadows stay soft). */
export function shade(base: string): Shade {
  return { light: mix(base, "#ffffff", 0.38), mid: base, dark: mix(mix(base, "#3a1f1a", 0.18), "#000000", 0.14) };
}

export const INK = "#2a2522";
export const PAPER = "#fbfaf7";

export const SKINS = ["#f6d7bf", "#efc19c", "#dba074", "#bf8153", "#93603b", "#6b4429"] as const;
export const HAIRS = ["#2a211d", "#4a3426", "#7a5236", "#b9824a", "#d9b46a", "#8f3b2c", "#6c7078", "#3d4a6b"] as const;

export type OutfitColors = { top: string; bottom: string; accent: string };

/** Per-role clothing colours: calm, slightly desaturated, tasteful on a white base. */
export const ROLE_COLORS = {
  recruiter: { top: "#3f4c68", bottom: "#33394a", accent: "#e9b44c" },
  founder: { top: "#d98a70", bottom: "#3b4252", accent: "#f1c35d" },
  engineer: { top: "#4d5a6a", bottom: "#2f3541", accent: "#ef7f6b" },
  designer: { top: "#a99be0", bottom: "#3c3f52", accent: "#f08fa8" },
  marketer: { top: "#f0c250", bottom: "#394150", accent: "#e8695a" },
  growth: { top: "#62b79c", bottom: "#35404a", accent: "#2f8f78" },
  data: { top: "#5f72d4", bottom: "#343a52", accent: "#78d0c0" },
  investor: { top: "#2f5047", bottom: "#2f3a37", accent: "#e3b94d" },
  student: { top: "#7cb6e6", bottom: "#454d63", accent: "#f2a65a" },
  pm: { top: "#f0a47e", bottom: "#3a4152", accent: "#7cc4a8" },
  curious: { top: "#e591a8", bottom: "#3d4153", accent: "#8fb8e8" },
} as const satisfies Record<string, OutfitColors>;

export type ClayRoleKey = keyof typeof ROLE_COLORS;
export const SHOE = "#f1ede6";

/** Outfit accent colours addressed by AvatarSpec.accent (prop and trim colour). */
export const ACCENTS = ["#e9b44c", "#ef7f6b", "#f08fa8", "#78d0c0", "#8fb8e8", "#f2a65a", "#7cc4a8", "#a99be0"] as const;
