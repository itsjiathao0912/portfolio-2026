"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { VIZ_SPRING, VIZ_VIEWPORT, vizDelay } from "./motion";
import { formatValue } from "./scale";
import { VizFigure, type VizFrameProps } from "./viz-figure";

interface StackedBarProps extends VizFrameProps {
  unit?: string;
  segments: { label: string; value: number; detail?: string }[];
  highlight?: { label: string; members: string[]; note?: string };
}

/** Segment fills by index; literal classes so Tailwind generates them. */
const FILLS = ["bg-navy", "bg-accent", "bg-indigo", "bg-[#7c9cff]", "bg-[#a5b4fc]", "bg-ink-3", "bg-[#c7d2fe]", "bg-[#94a3b8]"] as const;

/**
 * One bar split into segments (shares of a whole). Segments grow in on scroll.
 * Tap/hover/focus a segment or its legend chip to focus it; the optional
 * `highlight` switch lights a named subset and sums it.
 */
export function StackedBar({ unit = "%", segments, highlight, ...frame }: StackedBarProps) {
  const reduce = useReducedMotion();
  const [focus, setFocus] = useState<string | null>(null);
  const [lit, setLit] = useState(false);
  const total = segments.reduce((s, x) => s + x.value, 0);
  const isOn = (label: string) => (lit && highlight ? highlight.members.includes(label) : focus ? focus === label : true);
  const active = segments.find((s) => s.label === focus);
  const litSum = highlight ? segments.filter((s) => highlight.members.includes(s.label)).reduce((a, s) => a + s.value, 0) : 0;

  return (
    <VizFigure kind="stacked" {...frame}>
      <div className="flex flex-col gap-4">
        <div className="flex h-14 w-full overflow-hidden rounded-md bg-bg" role="list">
          {segments.map((s, i) => (
            <motion.button
              key={s.label}
              type="button"
              role="listitem"
              className={cn(
                "relative h-full origin-left border-r-2 border-canvas text-left text-xs font-semibold text-white transition-opacity duration-200 last:border-r-0 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                FILLS[i % FILLS.length],
                !isOn(s.label) && "opacity-25",
              )}
              style={{ width: `${(s.value / total) * 100}%` }}
              initial={{ scaleX: reduce ? 1 : 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={VIZ_VIEWPORT}
              transition={reduce ? { duration: 0 } : { ...VIZ_SPRING, delay: vizDelay(i, 0.1) }}
              onMouseEnter={() => setFocus(s.label)}
              onMouseLeave={() => setFocus(null)}
              onFocus={() => setFocus(s.label)}
              onBlur={() => setFocus(null)}
              onClick={() => setFocus(focus === s.label ? null : s.label)}
              aria-label={`${s.label}: ${formatValue(s.value, unit)}`}
              data-testid="segment"
            >
              {s.value / total >= 0.09 ? <span className="absolute inset-x-2 top-1/2 -translate-y-1/2 truncate tabular-nums">{formatValue(s.value, unit)}</span> : null}
            </motion.button>
          ))}
        </div>

        <p className="min-h-6 text-sm text-ink-2" aria-live="polite" data-testid="segment-readout">
          {active ? (
            <>
              <strong className="text-ink-1">{active.label}</strong>: {formatValue(active.value, unit)}
              {active.detail ? ` · ${active.detail}` : ""}
            </>
          ) : lit && highlight ? (
            <>
              <strong className="text-ink-1">{highlight.label}</strong>: {formatValue(Math.round(litSum * 10) / 10, unit)}
              {highlight.note ? ` · ${highlight.note}` : ""}
            </>
          ) : (
            "Hover a segment, or tap a name below, to read it."
          )}
        </p>

        <ul className="flex flex-wrap gap-2 text-sm text-ink-2" aria-label="Legend">
          {segments.map((s, i) => (
            <li key={s.label}>
              <button
                type="button"
                aria-pressed={focus === s.label}
                onClick={() => {
                  setLit(false);
                  setFocus(focus === s.label ? null : s.label);
                }}
                className={cn("flex min-h-11 items-center gap-2 rounded-full border border-hairline px-3 hover:border-border-strong", focus === s.label && "border-ink-1 text-ink-1")}
                data-testid="legend-toggle"
              >
                <span aria-hidden="true" className={cn("size-3 rounded-sm", FILLS[i % FILLS.length])} />
                {s.label}
              </button>
            </li>
          ))}
          {highlight ? (
            <li>
              <button
                type="button"
                aria-pressed={lit}
                onClick={() => {
                  setFocus(null);
                  setLit(!lit);
                }}
                className={cn("flex min-h-11 items-center rounded-full px-4 font-semibold", lit ? "bg-ink-1 text-white" : "bg-accent-tint text-accent")}
                data-testid="highlight-toggle"
              >
                {lit ? `Showing ${highlight.label}` : `Show ${highlight.label}`}
              </button>
            </li>
          ) : null}
        </ul>
      </div>
    </VizFigure>
  );
}
