"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import type { CaseBlockProps } from "../types";
import { Segmented } from "./segmented";

const GAP_M = 4000;
// Deck p.11 and p.44: trading revenue per scenario and the share of the ₱4.0B gap it closes.
export const TRADING_SCENARIOS = [
  { value: "today", label: "Today", revenue: 75, share: 1.9 },
  { value: "3x", label: "3× volume", revenue: 203, share: 5.1 },
  { value: "10x", label: "10× best case", revenue: 556, share: 13.9 },
] as const;
type Scenario = (typeof TRADING_SCENARIOS)[number]["value"];

/** Reader pushes trading volume up and watches how little of the breakeven gap it fills. */
export function GapFiller({ source }: CaseBlockProps) {
  const [value, setValue] = useState<Scenario>("today");
  const s = TRADING_SCENARIOS.find((x) => x.value === value)!;
  return (
    <VizFigure
      kind="gocrypto-gap"
      title="Push trading as hard as you like"
      badge="Strategy model"
      caption="Spread compresses as volume grows, because more volume invites price competition from GCash and Coins.ph. Even the best case leaves 86% of the gap open."
      source={source}
    >
      <Segmented label="Trading volume" options={TRADING_SCENARIOS} value={value} onChange={setValue} />
      <div>
        <div className="mb-2 flex items-baseline justify-between text-sm text-ink-2">
          <span>
            Trading revenue <strong className="text-ink-1">₱{s.revenue}M</strong> a year
          </span>
          <span>Gap ₱4.0B a year</span>
        </div>
        <div
          className="relative h-12 overflow-hidden rounded-md border border-hairline bg-bg"
          role="img"
          aria-label={`Trading at ${s.label} earns ₱${s.revenue}M, closing ${s.share}% of the ₱4.0B gap`}
        >
          <div
            className="h-full bg-accent transition-[width] duration-700 ease-out motion-reduce:transition-none"
            style={{ width: `${(s.revenue / GAP_M) * 100}%` }}
            data-testid="gap-fill"
          />
        </div>
        <p className="mt-4 text-3xl font-semibold text-ink-1" aria-live="polite">
          {s.share}% <span className="text-base font-normal text-ink-2">of the gap closed</span>
        </p>
      </div>
    </VizFigure>
  );
}
