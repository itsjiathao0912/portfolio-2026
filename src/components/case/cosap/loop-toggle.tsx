"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { VizFigure } from "@/components/dataviz/viz-figure";
import type { CaseBlockProps } from "../types";

const PILLARS = {
  automate: {
    label: "Automate",
    tagline: "Remove the manual chain, not just the form.",
    steps: [
      { n: "Capture", d: "Bank, card, tax, POS and shop-floor data flow in on their own." },
      { n: "Classify", d: "AI decides category, tax treatment, business or personal." },
      { n: "Route", d: "The right approver gets one tap in Telegram, with context." },
      { n: "Post", d: "Balanced journals, payroll and reports with no re-entry." },
    ],
  },
  optimize: {
    label: "Optimize",
    tagline: "Learn from every transaction the automation creates.",
    steps: [
      { n: "Sense", d: "Anomaly models watch every PO, batch, shift and settlement." },
      { n: "Decide", d: "Inventory, pricing and staffing tuned on evidence." },
      { n: "Act", d: "Auto-holds, reorder points and rate-audit flags." },
      { n: "Learn", d: "Every outcome feeds the next decision." },
    ],
  },
} as const;

type Key = keyof typeof PILLARS;

/** Reader toggles the two pillars of COSAP's thesis and steps through each loop. */
export function LoopToggle({ source }: CaseBlockProps) {
  const [key, setKey] = useState<Key>("automate");
  const [i, setI] = useState(0);
  const p = PILLARS[key];
  const step = p.steps[i];

  return (
    <VizFigure
      kind="cosap-loop-toggle"
      title="A layer above your systems, not a replacement"
      badge="Company framing"
      caption="The product thesis in the later COSAP deck: your ERP, accounting and HR software stay the book of record. COSAP runs the work between them."
      source={source}
    >
      <div className="flex flex-col gap-5">
        <div role="group" aria-label="Pillar" className="flex w-fit gap-1 rounded-full border border-hairline bg-bg p-1">
          {(Object.keys(PILLARS) as Key[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={key === k}
              onClick={() => { setKey(k); setI(0); }}
              className={cn("min-h-11 rounded-full px-5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2", key === k ? "bg-ink-1 text-canvas" : "text-ink-2")}
            >
              {PILLARS[k].label}
            </button>
          ))}
        </div>
        <p className="text-sm text-ink-2">{p.tagline}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {p.steps.map((s, idx) => (
            <button
              key={s.n}
              type="button"
              aria-pressed={i === idx}
              onClick={() => setI(idx)}
              className={cn("min-h-11 rounded-md border px-3 py-3 text-left text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2", i === idx ? "border-ink-1 bg-bg text-ink-1" : "border-hairline text-ink-2")}
            >
              <span className="text-xs text-ink-2">{idx + 1}</span> {s.n}
            </button>
          ))}
        </div>
        <p role="status" aria-live="polite" className="rounded-md bg-bg p-4 text-sm text-ink-1">{step.d}</p>
        <p className="rounded-md border border-dashed border-hairline p-3 text-xs text-ink-2">
          Stays underneath: ERP · accounting · HR software · e-invoice and tax portals · banks and cards. The Automate loop produces clean data as a by-product, and the Optimize loop only works because of it.
        </p>
      </div>
    </VizFigure>
  );
}
