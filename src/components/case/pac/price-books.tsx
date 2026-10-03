"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import { cn } from "@/lib/utils";
import type { CaseBlockProps } from "../types";

/**
 * Toy price books. Rates and units are invented to show the problem class
 * (one workload quoted in different units). They are NOT any provider's real
 * pricing, and the books are not mapped to AWS/Azure/Huawei/Alibaba.
 */
export interface Book { id: string; unit: string; perHour: number; qty: (hours: number) => number; rate: number }
export const BOOKS: readonly Book[] = [
  { id: "A", unit: "hour", rate: 0.04, perHour: 0.04, qty: (h) => h },
  { id: "B", unit: "minute", rate: 0.00062, perHour: 0.0372, qty: (h) => h * 60 },
  { id: "C", unit: "1,000 hours", rate: 36, perHour: 0.036, qty: (h) => h / 1000 },
  { id: "D", unit: "day", rate: 0.936, perHour: 0.039, qty: (h) => h / 24 },
];

export const total = (b: Book, hours: number) => b.qty(hours) * b.rate;
export const cheapest = (hours: number) => BOOKS.reduce((a, b) => (total(b, hours) < total(a, hours) ? b : a));
const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { maximumFractionDigits: d });

/** Reader guesses the cheapest book from raw quotes, then normalises to one unit and checks. */
export function PriceBooks({ source }: CaseBlockProps) {
  const [hours, setHours] = useState(720);
  const [guess, setGuess] = useState<string | null>(null);
  const [normal, setNormal] = useState(false);
  const best = cheapest(hours);
  return (
    <VizFigure
      kind="pac-price-books"
      title="Same workload, four ways to quote it"
      badge="Illustrative"
      caption="Toy rates and units, invented to show the problem. They are not any provider's real prices. The point: you cannot compare quotes by eye until they share one unit."
      source={source}
    >
      <label className="flex flex-col gap-2 text-sm text-ink-2">
        <span>One tenant ran a single instance for <strong className="text-ink-1">{fmt(hours, 0)} hours</strong> this month</span>
        <input type="range" min={100} max={1440} step={10} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full accent-[var(--accent)]" aria-label="Instance hours this month" />
      </label>
      <ul className="grid gap-3 sm:grid-cols-2">
        {BOOKS.map((b) => {
          const isBest = normal && b.id === best.id;
          return (
            <li key={b.id} className={cn("rounded-2xl border bg-bg p-4 text-sm transition-colors motion-reduce:transition-none", isBest ? "border-2 border-accent" : "border-hairline")}>
              <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Price book {b.id}</p>
              <p className="mt-1 text-ink-1">
                {normal ? <>{fmt(hours, 0)} hours × {fmt(b.perHour, 4)} per hour</> : <>{fmt(b.qty(hours), b.id === "C" ? 3 : 1)} {b.unit}s × {fmt(b.rate, 5)} per {b.unit}</>}
              </p>
              <p className="mt-1 font-semibold text-ink-1">{fmt(total(b, hours))} credits{isBest ? " · lowest" : ""}</p>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Which book is cheapest?">
        <span className="text-sm text-ink-2">Which book is cheapest?</span>
        {BOOKS.map((b) => (
          <button
            key={b.id}
            type="button"
            aria-pressed={guess === b.id}
            onClick={() => setGuess(b.id)}
            className={cn("min-h-10 rounded-full border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2", guess === b.id ? "border-ink-1 bg-ink-1 text-white" : "border-hairline bg-bg text-ink-2 hover:border-border-strong")}
          >
            {b.id}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={normal}
          onClick={() => setNormal((n) => !n)}
          className="min-h-10 rounded-full border border-hairline bg-bg px-4 text-sm font-semibold text-ink-1 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {normal ? "Show raw quotes" : "Normalise to one unit"}
        </button>
      </div>
      <p className="text-sm text-ink-2" aria-live="polite">
        {!guess ? "Pick a book, then normalise to check." : normal ? (guess === best.id ? `Yes, book ${best.id} is lowest at this usage.` : `Not quite: book ${best.id} is lowest. You guessed ${guess}.`) : "Normalise to see if you were right."}
      </p>
    </VizFigure>
  );
}
