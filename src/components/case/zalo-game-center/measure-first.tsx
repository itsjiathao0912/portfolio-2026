"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import { cn } from "@/lib/utils";
import type { CaseBlockProps } from "../types";
import { Pills } from "./ui";

/** The three workstreams, in the order I would tell them. The CV gives no dates, so this is a dependency order, not a calendar. */
export const STEPS = [
  {
    id: "measure",
    label: "1 · Measure",
    title: "Replace manual reporting with a tracking dashboard",
    what: "I developed and rolled out a tracking dashboard for Zalo Game Center, so the numbers came from one self-serve surface instead of requests.",
    unlocks: "Every later change could be judged on data.",
    result: { value: "−40%", label: "manual data extraction" },
  },
  {
    id: "test",
    label: "2 · Test",
    title: "A/B test in-game ad placements",
    what: "I optimised in-game ad placements through A/B testing across the Game Center portfolio.",
    unlocks: "Placement choices became a measured result, not an opinion.",
    result: { value: "+30%", label: "total ad revenue within six months" },
  },
  {
    id: "engage",
    label: "3 · Engage",
    title: "Run in-game events every month",
    what: "I ran a monthly cadence of in-game events, including events aimed at paying users.",
    unlocks: "A rhythm players could expect, measured on the same dashboard.",
    result: { value: "+15%", label: "user engagement", extra: "+3% paying users" },
  },
] as const;
export type StepId = (typeof STEPS)[number]["id"];

/** Results visible once the reader has reached step `index` (inclusive). */
export function resultsThrough(index: number) {
  return STEPS.slice(0, index + 1).flatMap((s) => [s.result.value, ...("extra" in s.result ? [s.result.extra] : [])]);
}

/** Reader steps through the three workstreams and watches the CV numbers accumulate. */
export function MeasureFirst({ source }: CaseBlockProps) {
  const [id, setId] = useState<StepId>("measure");
  const index = STEPS.findIndex((s) => s.id === id);
  const step = STEPS[index];
  return (
    <VizFigure
      kind="zalo-measure-first"
      title="Measure before you optimise"
      badge="CV figures"
      caption="The order is how I would tell the logic: you cannot test what you cannot measure. The CV gives no dates for each stream, so this is not a calendar."
      source={source}
    >
      <Pills label="Workstream" options={STEPS.map((s) => ({ value: s.id, label: s.label }))} value={id} onChange={setId} />
      <div className="rounded-2xl bg-bg p-5" aria-live="polite">
        <p className="text-lg font-semibold text-ink-1">{step.title}</p>
        <p className="mt-2 text-sm text-ink-2">{step.what}</p>
        <p className="mt-3 text-sm text-ink-1">
          <span className="font-semibold">What it unlocked: </span>
          {step.unlocks}
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-3" aria-label="Results so far">
        {STEPS.map((s, i) => {
          const on = i <= index;
          return (
            <li key={s.id} className={cn("rounded-2xl p-4 transition-all motion-reduce:transition-none", on ? "bg-tint-aqua" : "border border-dashed border-border-strong opacity-60")}>
              <p className="text-3xl font-semibold text-ink-1">{on ? s.result.value : "—"}</p>
              <p className="text-sm text-ink-2">{s.result.label}</p>
              {"extra" in s.result && on ? <p className="mt-1 text-sm font-semibold text-ink-1">{s.result.extra}</p> : null}
            </li>
          );
        })}
      </ul>
    </VizFigure>
  );
}
