import type { Tint } from "@content/schema.ts";

/** Background utility per project tint. Literal class names so Tailwind generates them. */
export const TINT_BG: Record<Tint, string> = {
  sky: "bg-tint-sky",
  periwinkle: "bg-tint-periwinkle",
  lavender: "bg-tint-lavender",
  rose: "bg-tint-rose",
  peach: "bg-tint-peach",
  butter: "bg-tint-butter",
  mint: "bg-tint-mint",
  aqua: "bg-tint-aqua",
};

/** Hero gradient (tint → white) for case-study pages. */
export const TINT_GRADIENT: Record<Tint, string> = {
  sky: "from-tint-sky",
  periwinkle: "from-tint-periwinkle",
  lavender: "from-tint-lavender",
  rose: "from-tint-rose",
  peach: "from-tint-peach",
  butter: "from-tint-butter",
  mint: "from-tint-mint",
  aqua: "from-tint-aqua",
};

/** Muted text is not AA on two tints (design-tokens report) — use ink-2 there. */
export function mutedOnTint(tint: Tint) {
  return tint === "periwinkle" || tint === "lavender" ? "text-ink-2" : "text-ink-3";
}
