"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import type { CaseBlockProps } from "../types";
import { Segmented } from "./segmented";

// Deck p.48 (appendix, corrected): 2029 contribution lines, ₱M a year.
export const FX_SPREAD_M = 1239;
export const NIM_M = 252;
// Deck p.46: at 20% retention instead of 38%, "the NIM line halves". The deck gives no exact figure,
// so the bar is drawn at half and the label says "about half" rather than inventing a number.
const OPTIONS = [
  { value: "38", label: "38% kept (model)" },
  { value: "20", label: "20% kept (stress)" },
] as const;

/** Reader breaks the model's most sensitive assumption and sees which revenue line survives. */
export function RetentionStress({ source }: CaseBlockProps) {
  const [value, setValue] = useState<(typeof OPTIONS)[number]["value"]>("38");
  const stressed = value === "20";
  const rows = [
    { label: "FX and remittance spread", width: FX_SPREAD_M, display: `₱${FX_SPREAD_M.toLocaleString("en-US")}M` },
    { label: "Interest on balances (NIM)", width: stressed ? NIM_M / 2 : NIM_M, display: stressed ? "about half of ₱252M" : `₱${NIM_M}M` },
  ];
  return (
    <VizFigure
      kind="gocrypto-retention"
      title="Break the model's weakest assumption"
      badge="Strategy model"
      caption="The model assumes a receiving household keeps 38% of each month's ₱18,400 as balance, about ₱7,000. It is the most sensitive input, and the deck names how to test it: a 90-day cohort on existing Wise-corridor recipients, with no new build."
      source={source}
    >
      <Segmented label="Share of monthly inflow kept as balance" options={OPTIONS} value={value} onChange={setValue} />
      <div className="flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1.5 flex justify-between gap-3 text-sm">
              <span className="text-ink-2">{row.label}</span>
              <strong className="text-ink-1">{row.display}</strong>
            </div>
            <div className="h-6 overflow-hidden rounded-lg bg-bg">
              <div
                className="h-full rounded-lg bg-accent transition-[width] duration-700 ease-out motion-reduce:transition-none"
                style={{ width: `${(row.width / FX_SPREAD_M) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-ink-1" aria-live="polite">
        {stressed
          ? "Interest income halves. The case still stands on FX spread and new customers, which is why the spread, not yield, carries the plan."
          : "In 2029 the FX and remittance spread earns about five times what interest on balances does."}
      </p>
    </VizFigure>
  );
}
