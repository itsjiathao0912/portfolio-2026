"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import { cn } from "@/lib/utils";
import type { CaseBlockProps } from "../types";

export type Action = "credit" | "bill" | "collect" | "none";
export interface Row { tenant: string; metered: number; invoiced: number; paid: number }
/** Fictional tenants and amounts, in credits. */
export const ROWS: readonly Row[] = [
  { tenant: "Tenant 1", metered: 120, invoiced: 120, paid: 120 },
  { tenant: "Tenant 2", metered: 80, invoiced: 95, paid: 95 },
  { tenant: "Tenant 3", metered: 150, invoiced: 130, paid: 130 },
  { tenant: "Tenant 4", metered: 60, invoiced: 60, paid: 20 },
];
export const ACTIONS: readonly { value: Action; label: string }[] = [
  { value: "none", label: "Leave it" },
  { value: "credit", label: "Issue credit note" },
  { value: "bill", label: "Bill the gap" },
  { value: "collect", label: "Chase payment" },
];

/** The one right action: the invoice is never edited, only corrected. */
export function correct(r: Row): Action {
  if (r.invoiced > r.metered) return "credit";
  if (r.invoiced < r.metered) return "bill";
  if (r.paid < r.invoiced) return "collect";
  return "none";
}

const WHY: Record<Action, string> = {
  none: "Usage, invoice and payment agree. Nothing to do.",
  credit: "Invoiced more than was metered. An issued invoice is not edited; a credit note corrects it.",
  bill: "Metered more than was invoiced. The gap is billed, so the invoice trail stays whole.",
  collect: "Usage and invoice agree, but less was paid. This is a collection problem, not a billing one.",
};

/** Reader reconciles four tenants: pick the correction for each mismatch. */
export function Reconcile({ source }: CaseBlockProps) {
  const [picked, setPicked] = useState<Record<number, Action>>({});
  const done = ROWS.filter((r, i) => picked[i] === correct(r)).length;
  return (
    <VizFigure
      kind="pac-reconcile"
      title="Close the gap between usage, invoice and payment"
      badge="Illustrative"
      caption="Fictional tenants and amounts in credits. Each row compares what was metered, what was invoiced and what was paid. Choose the correction."
      source={source}
    >
      <ul className="flex flex-col gap-3">
        {ROWS.map((r, i) => {
          const p = picked[i];
          const right = p !== undefined && p === correct(r);
          return (
            <li key={r.tenant} className="rounded-2xl border border-hairline bg-bg p-4 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold text-ink-1">{r.tenant}</span>
                <span className="text-ink-2">Metered {r.metered} · Invoiced {r.invoiced} · Paid {r.paid}</span>
              </div>
              <div role="group" aria-label={`Correction for ${r.tenant}`} className="mt-3 flex flex-wrap gap-2">
                {ACTIONS.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    aria-pressed={p === a.value}
                    onClick={() => setPicked((s) => ({ ...s, [i]: a.value }))}
                    className={cn("min-h-11 rounded-full border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2", p === a.value ? "border-ink-1 bg-ink-1 text-white" : "border-hairline bg-bg text-ink-2 hover:border-border-strong")}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 min-h-5 text-ink-2" aria-live="polite">
                {p === undefined ? "" : right ? `Correct. ${WHY[p]}` : `Not this one. ${p === "none" ? "These figures do not agree." : "Check which of the three numbers differs."}`}
              </p>
            </li>
          );
        })}
      </ul>
      <p className="text-sm font-semibold text-ink-1" aria-live="polite">{done} of {ROWS.length} reconciled</p>
    </VizFigure>
  );
}
