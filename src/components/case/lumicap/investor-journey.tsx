"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { VizFigure } from "@/components/dataviz/viz-figure";
import type { CaseBlockProps } from "../types";
import { JOURNEY, chainStart } from "./logic";

/** Seven steps from identity check to the on-chain record, and where each record lives. */
export function InvestorJourney({ source }: CaseBlockProps) {
  const [i, setI] = useState(0);
  const step = JOURNEY[i]!;
  const onChain = step.layer === "chain";

  return (
    <VizFigure
      kind="lumicap-investor-journey"
      title="Where does an investor's money live at each step?"
      caption="For the first four steps the record is the platform's own, kept by admins and investors. From the close of fundraising it becomes tokens and an on-chain state. The product had to make both halves read as one history."
      source={source}
    >
      <div role="tablist" aria-label="Investor journey steps" className="flex gap-1.5 overflow-x-auto pb-1" onKeyDown={(e) => {
        if (e.key === "ArrowRight") setI((v) => Math.min(JOURNEY.length - 1, v + 1));
        if (e.key === "ArrowLeft") setI((v) => Math.max(0, v - 1));
      }}>
        {JOURNEY.map((s, k) => (
          <button key={s.n} role="tab" type="button" aria-selected={k === i} tabIndex={k === i ? 0 : -1} onClick={() => setI(k)} className={cn("flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center rounded-xl border px-2 py-1 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-accent", k === i ? "border-ink-1 bg-ink-1 text-bg" : s.layer === "chain" ? "border-accent/40 bg-accent-tint text-ink-1" : "border-hairline bg-bg text-ink-2")}>
            <span className="text-base">{s.n}</span>
            <span className="hidden sm:block">{s.layer === "chain" ? "token" : "record"}</span>
          </button>
        ))}
      </div>
      <p className="-mt-3 text-xs text-ink-3">Steps 1 to {chainStart() - 1}: platform records. Steps {chainStart()} to {JOURNEY.length}: tokens and chain.</p>

      <div role="tabpanel" className="rounded-xl border border-hairline bg-bg p-5" aria-live="polite">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-canvas px-3 py-1 text-xs font-semibold tracking-wide text-ink-2 uppercase">{step.actor} acts</span>
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase", onChain ? "bg-accent-tint text-ink-1" : "bg-canvas text-ink-2")}>{onChain ? "Recorded as tokens and on-chain state" : "Recorded in the platform"}</span>
        </div>
        <p className="mt-3 text-xl font-semibold text-ink-1">{step.n}. {step.title}</p>
        <p className="mt-1 text-ink-2">{step.text}</p>
        {step.sub ? (
          <ol className="mt-4 grid gap-2 sm:grid-cols-5">
            {step.sub.map((s, k) => (
              <li key={s} className="rounded-lg border border-hairline px-3 py-2 text-sm text-ink-2"><span className="font-semibold text-ink-1">{k + 1}.</span> {s}</li>
            ))}
          </ol>
        ) : null}
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0} className="rounded-full border border-border-strong px-4 py-2 text-sm font-semibold text-ink-1 enabled:hover:bg-canvas disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-accent">Back</button>
          <button type="button" onClick={() => setI((v) => Math.min(JOURNEY.length - 1, v + 1))} disabled={i === JOURNEY.length - 1} className="rounded-full bg-ink-1 px-4 py-2 text-sm font-semibold text-bg enabled:hover:bg-ink-hover disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Next step</button>
        </div>
      </div>
    </VizFigure>
  );
}
