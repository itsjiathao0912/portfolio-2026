"use client";

import { useInView } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { lerp } from "./scale";
import { VizFigure, type VizFrameProps } from "./viz-figure";

interface CompareRow {
  label: string;
  before: { value: number; display: string };
  after: { value: number; display: string };
  change?: string;
}
interface CompareSliderProps extends VizFrameProps {
  beforeLabel: string;
  afterLabel: string;
  rows: CompareRow[];
}

/**
 * Before/after slider: one range input drives every row from the "before"
 * state to the "after" state. Each row is scaled to its own larger value, so
 * rows with different units (days vs minutes) stay comparable as shapes.
 * It sweeps to "after" once on first view; then it's the reader's.
 */
export function CompareSlider({ beforeLabel, afterLabel, rows, ...frame }: CompareSliderProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [t, setT] = useState(reduce ? 1 : 0);
  const [touched, setTouched] = useState(false);
  const [sweeping, setSweeping] = useState(false);
  const id = useId();

  useEffect(() => {
    if (!inView || touched || reduce) return;
    const timer = window.setTimeout(() => {
      setSweeping(true);
      setT(1);
      window.setTimeout(() => setSweeping(false), 1000);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [inView, touched, reduce]);

  const after = t >= 0.5;

  return (
    <VizFigure kind="compare-slider" {...frame}>
      <div ref={ref} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm font-semibold">
            <span className={cn(after ? "text-ink-3" : "text-ink-1")}>{beforeLabel}</span>
            <span className={cn(after ? "text-accent" : "text-ink-3")}>{afterLabel}</span>
          </div>
          <label htmlFor={id} className="sr-only">
            Drag from {beforeLabel} to {afterLabel}
          </label>
          <input
            id={id}
            type="range"
            min={0}
            max={100}
            value={Math.round(t * 100)}
            onChange={(e) => {
              setTouched(true);
              setSweeping(false);
              setT(Number(e.target.value) / 100);
            }}
            className="h-11 w-full cursor-grab accent-[var(--accent)] active:cursor-grabbing"
            data-testid="compare-range"
          />
        </div>

        <ul className="flex flex-col gap-5">
          {rows.map((row) => {
            const top = Math.max(row.before.value, row.after.value) || 1;
            const width = (lerp(row.before.value, row.after.value, t) / top) * 100;
            return (
              <li key={row.label} className="grid grid-cols-1 gap-1.5 sm:grid-cols-[minmax(9rem,32%)_1fr] sm:items-center sm:gap-4" data-testid="compare-row">
                <span className="text-sm leading-snug text-ink-1">{row.label}</span>
                <span className="flex items-center gap-3">
                  <span className="relative h-7 flex-1 overflow-hidden rounded-md bg-bg">
                    <span
                      className={cn("absolute inset-y-0 left-0 rounded-md", after ? "bg-accent" : "bg-ink-3/50")}
                      style={{ width: `${Math.max(width, 1.5)}%`, transition: sweeping ? "width 900ms cubic-bezier(.22,1,.36,1), background-color 300ms" : "width 120ms linear, background-color 200ms" }}
                    />
                  </span>
                  <span className="flex w-36 shrink-0 items-center justify-end gap-2 text-right">
                    <span className="font-semibold text-ink-1 tabular-nums" data-testid="compare-value">
                      {after ? row.after.display : row.before.display}
                    </span>
                    {row.change ? (
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold transition-opacity", t > 0.9 ? "bg-accent-tint text-accent opacity-100" : "opacity-0")}>{row.change}</span>
                    ) : null}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </VizFigure>
  );
}
