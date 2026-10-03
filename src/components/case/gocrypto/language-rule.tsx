"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import { cn } from "@/lib/utils";
import type { CaseBlockProps } from "../types";

// Deck p.18, "The language rule — the words are the product".
export const LANGUAGE_PAIRS = [
  { never: "Stablecoin", say: "Digital dollars" },
  { never: "On-chain transfer", say: "Send money home" },
  { never: "Custody · wallet", say: "Held safely by the bank" },
] as const;

/** Tap a card to rewrite the accurate-but-alienating term into the word Ana hears. */
export function LanguageRule({ source }: CaseBlockProps) {
  const [fixed, setFixed] = useState<boolean[]>(() => LANGUAGE_PAIRS.map(() => false));
  return (
    <VizFigure
      kind="gocrypto-language"
      title="The words are the product"
      badge="Product rule"
      caption="Every term on the left is accurate, and every one loses the customer. The rule holds everywhere: in the app, in support scripts and in the press release."
      source={source}
    >
      <ul className="grid gap-3 sm:grid-cols-3">
        {LANGUAGE_PAIRS.map((p, i) => {
          const on = fixed[i];
          return (
            <li key={p.say}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setFixed((f) => f.map((v, j) => (j === i ? !v : v)))}
                className={cn(
                  "flex min-h-28 w-full flex-col items-start justify-between gap-3 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none",
                  on ? "border-accent bg-accent-tint" : "border-hairline bg-bg hover:border-border-strong",
                )}
                data-testid="language-card"
              >
                <span className="text-xs font-semibold tracking-wide text-ink-3 uppercase">{on ? "Say" : "Never say"}</span>
                <span className={cn("text-lg font-semibold", on ? "text-ink-1" : "text-ink-2 line-through decoration-ink-3")}>
                  {on ? p.say : p.never}
                </span>
                <span className="text-xs text-ink-3">{on ? `instead of "${p.never}"` : "Tap to rewrite"}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </VizFigure>
  );
}
