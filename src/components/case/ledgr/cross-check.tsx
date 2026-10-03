"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { VizFigure } from "@/components/dataviz/viz-figure";
import type { CaseBlockProps } from "../types";
import { crossCheck } from "./rules";

const WAGE = 12_000_000;
const STATUS = {
  match: { text: "Documents agree", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  amber: { text: "Small gap, worth a look", cls: "bg-amber-100 text-amber-900 border-amber-200" },
  red: { text: "Mismatch: one document is wrong", cls: "bg-red-100 text-red-800 border-red-200" },
} as const;
const m = (n: number) => `${(n / 1_000_000).toFixed(1)}M ₫`;

/** Two documents that should tell the same story; drag one until they don't. */
export function CrossCheck({ source }: CaseBlockProps) {
  const [taxable, setTaxable] = useState(WAGE * 12);
  const r = crossCheck(WAGE, taxable);
  const s = STATUS[r.status];

  return (
    <VizFigure
      kind="ledgr-cross-check"
      title="One document can be fine and still be wrong"
      badge="Illustrative figures"
      caption="Each document passes on its own. Only reading them together shows that the payroll, the tax return and the contract disagree. Gaps above 1% are flagged, above 5% fail. The figures are made up."
      source={source}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-hairline bg-bg p-4">
          <p className="text-xs font-semibold tracking-wide text-ink-2 uppercase">Labour contract</p>
          <p className="mt-2 text-2xl font-semibold text-ink-1">{m(WAGE)} / month</p>
          <p className="text-sm text-ink-2">= {m(r.annual)} a year</p>
        </div>
        <div className="rounded-xl border border-hairline bg-bg p-4">
          <p className="text-xs font-semibold tracking-wide text-ink-2 uppercase">Year-end PIT return</p>
          <p className="mt-2 text-2xl font-semibold text-ink-1">{m(taxable)} taxable</p>
          <label className="mt-2 flex flex-col gap-1 text-sm text-ink-2">
            Drag the declared income
            <input type="range" min={120_000_000} max={168_000_000} step={500_000} value={taxable} onChange={(e) => setTaxable(Number(e.target.value))} className="accent-[#1f5bff]" aria-valuetext={m(taxable)} />
          </label>
        </div>
      </div>
      <p className={cn("rounded-xl border px-4 py-3 text-sm font-semibold", s.cls)} aria-live="polite">
        {s.text} · gap {(r.gap * 100).toFixed(1)}% ({r.delta >= 0 ? "+" : "−"}{m(Math.abs(r.delta))})
      </p>
    </VizFigure>
  );
}
