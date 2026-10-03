"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import { cn } from "@/lib/utils";
import type { CaseBlockProps } from "../types";
import { Pills } from "./ui";

export const CHOICES = [
  { value: "a", label: "Placement A" },
  { value: "b", label: "Placement B" },
] as const;
export type Choice = (typeof CHOICES)[number]["value"];

/** Company figure from Thao's CV (Zalo, Feb 2023 to Apr 2024). Baseline and per-test results are not disclosed. */
export const RESULT = { value: "+30%", label: "total ad revenue within six months" } as const;

/** What the reveal may say. Never names a winner: which placement won is not in any source Thao has shared. */
export function reveal(choice: Choice | null) {
  if (!choice) return null;
  return {
    headline: "Neither picture tells you. That is why we tested.",
    body: `Whichever you picked, the layout alone cannot answer it, and I am not publishing which real placement won. What I can say is that testing in-game ad placements across the portfolio took total ad revenue up ${RESULT.value} within six months.`,
  } as const;
}

function Phone({ slot, name, picked, dim }: { slot: "top" | "bottom"; name: string; picked: boolean; dim: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "mx-auto flex w-32 flex-col rounded-2xl border-2 bg-bg p-2 transition-all motion-reduce:transition-none sm:w-36",
        picked ? "border-ink-1" : "border-hairline",
        dim && "opacity-60",
      )}
    >
      <div className="mb-1 h-1 w-8 self-center rounded-full bg-ink-1/20" />
      <div className={cn("flex h-40 flex-col gap-1.5 sm:h-44", slot === "bottom" && "flex-col-reverse")}>
        <div className="grid h-9 place-items-center rounded-lg bg-[#0068ff] text-[10px] font-semibold text-white">Ad slot</div>
        <div className="grid flex-1 place-items-center rounded-lg bg-tint-aqua text-[10px] font-semibold text-ink-2">Game screen</div>
      </div>
      <p className="mt-2 text-center text-xs font-semibold text-ink-1">{name}</p>
    </div>
  );
}

/** Reader makes the call a Product Owner can't make by looking: which placement earns more? */
export function ExperimentReveal({ source }: CaseBlockProps) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const out = reveal(choice);
  return (
    <VizFigure
      kind="zalo-experiment-reveal"
      title="Which ad placement earned more?"
      badge="Illustrative layout · company figure"
      caption="The phones are a schematic: two different slot positions, not real Zalo Game Center screens. The only real number is the +30%."
      source={source}
    >
      <div className="grid grid-cols-2 gap-4">
        <Phone slot="top" name="Placement A" picked={choice === "a"} dim={choice === "b"} />
        <Phone slot="bottom" name="Placement B" picked={choice === "b"} dim={choice === "a"} />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-ink-1">Make your call</p>
        <Pills label="Pick the placement you think earned more" options={CHOICES} value={choice} onChange={setChoice} />
      </div>
      <div aria-live="polite" data-testid="reveal" className={cn("rounded-2xl p-5 transition-colors motion-reduce:transition-none", out ? "bg-tint-mint" : "bg-bg")}>
        {out ? (
          <>
            <p className="text-xl font-semibold text-ink-1">{out.headline}</p>
            <p className="mt-2 text-sm text-ink-2">{out.body}</p>
            <p className="mt-4 text-4xl font-semibold text-ink-1">{RESULT.value}</p>
            <p className="text-sm text-ink-2">{RESULT.label} · company figure, baseline not disclosed</p>
          </>
        ) : (
          <p className="text-sm text-ink-2">Pick one to see what the tests were for.</p>
        )}
      </div>
    </VizFigure>
  );
}
