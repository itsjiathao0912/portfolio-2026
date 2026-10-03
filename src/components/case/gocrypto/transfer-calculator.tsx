"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import { cn } from "@/lib/utils";
import type { CaseBlockProps } from "../types";
import { Segmented } from "./segmented";

// Deck p.21: a $5 flat fee plus 0.6% FX, as a share of the amount sent. Only the three published tickets.
export const TICKETS = [
  { value: "150", label: "$150", cost: 3.9 },
  { value: "317", label: "$317", cost: 2.3 },
  { value: "1000", label: "$1,000", cost: 1.1 },
] as const;
type Ticket = (typeof TICKETS)[number]["value"];

// Deck p.27: Ana's brother sends $317 from Riyadh at ₱58.20, nominally ₱18,400.
export const ROUTES = [
  { value: "bank", label: "His own bank", arrives: 17050, cost: 7.3, time: "1–5 days", knowable: "No: banks deduct on the way" },
  { value: "swift", label: "GoTyme via SWIFT", arrives: 17980, cost: 2.3, time: "1–5 days", knowable: "No: banks deduct on the way" },
  { value: "rail", label: "Corridor rail", arrives: 18290, cost: 0.7, time: "Minutes, any day", knowable: "Guaranteed up front" },
] as const;
type Route = (typeof ROUTES)[number]["value"];
const SENT = 18400;

/** Two-step explorable: why the Gulf ticket size matters, then what Ana actually receives. */
export function TransferCalculator({ source }: CaseBlockProps) {
  const [ticket, setTicket] = useState<Ticket>("317");
  const [route, setRoute] = useState<Route>("bank");
  const t = TICKETS.find((x) => x.value === ticket)!;
  const r = ROUTES.find((x) => x.value === route)!;
  const lost = SENT - r.arrives;
  return (
    <VizFigure
      kind="gocrypto-transfer"
      title="Send Ana's money home"
      badge="Worked example"
      caption="Gulf workers send small, regular amounts, so a flat fee bites hardest exactly where this strategy aims. And cost is only half of it: today Ana cannot know what will arrive, or when. The fee chart only shows the three ticket sizes the deck publishes."
      source={source}
    >
      <section aria-label="Step 1: the ticket size" className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-ink-2 uppercase tracking-wide">1 · How much is sent?</p>
        <Segmented label="Amount sent" options={TICKETS} value={ticket} onChange={setTicket} />
        <div className="flex items-end gap-3" aria-hidden="true">
          {TICKETS.map((x) => (
            <div key={x.value} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end rounded-lg bg-bg">
                <div
                  className={cn(
                    "w-full rounded-lg transition-[height,background-color] duration-500 motion-reduce:transition-none",
                    x.value === ticket ? "bg-accent" : "bg-ink-1/15",
                  )}
                  style={{ height: `${(x.cost / 3.9) * 100}%` }}
                />
              </div>
              <span className="text-xs text-ink-3">{x.label}</span>
            </div>
          ))}
        </div>
        <p className="text-ink-1" aria-live="polite">
          A $5 flat fee plus FX costs <strong>{t.cost}%</strong> of {t.label}.
          {ticket === "317" ? " That is the typical ticket from Riyadh." : ""}
        </p>
      </section>
      <section aria-label="Step 2: the route" className="flex flex-col gap-3 border-t border-hairline pt-5">
        <p className="text-sm font-semibold text-ink-2 uppercase tracking-wide">2 · Miguel sends $317 from Riyadh. Pick the route.</p>
        <Segmented label="Route" options={ROUTES} value={route} onChange={setRoute} />
        <div className="grid grid-cols-3 gap-3 text-sm" aria-live="polite" data-testid="transfer-result">
          <div className="rounded-xl bg-bg p-3">
            <span className="block text-ink-3">Ana receives</span>
            <strong className="text-xl text-ink-1">₱{r.arrives.toLocaleString("en-US")}</strong>
          </div>
          <div className="rounded-xl bg-bg p-3">
            <span className="block text-ink-3">Lost on the way</span>
            <strong className="text-xl text-ink-1">₱{lost.toLocaleString("en-US")}</strong>
            <span className="block text-ink-3">{r.cost}%</span>
          </div>
          <div className="rounded-xl bg-bg p-3">
            <span className="block text-ink-3">Arrives in</span>
            <strong className="text-xl text-ink-1">{r.time}</strong>
          </div>
        </div>
        <p className="text-sm text-ink-2" aria-live="polite">
          Amount known in advance? <strong className="text-ink-1">{r.knowable}</strong>
          {route !== "rail" ? ". Nothing settles on weekends: sent Friday, it lands Tuesday." : "."}
        </p>
      </section>
    </VizFigure>
  );
}
