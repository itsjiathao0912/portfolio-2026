"use client";

import { motion, useReducedMotion } from "motion/react";
import { VIZ_SPRING, VIZ_VIEWPORT } from "./motion";
import { formatValue, niceMax, percentChange } from "./scale";
import { VizFigure, type VizFrameProps } from "./viz-figure";

interface BeforeAfterProps extends VizFrameProps {
  unit?: string;
  before: { label: string; value: number };
  after: { label: string; value: number };
}

/** Two columns, before and after, with the percent change called out. */
export function BeforeAfter({ unit = "", before, after, ...frame }: BeforeAfterProps) {
  const reduce = useReducedMotion();
  const max = niceMax(Math.max(before.value, after.value));
  const change = percentChange(before.value, after.value);
  const bars = [
    { ...before, tone: "bg-ink-3/40", text: "text-ink-2" },
    { ...after, tone: "bg-navy", text: "text-ink-1" },
  ];
  return (
    <VizFigure kind="before-after" {...frame}>
      <div className="flex items-end gap-6 sm:gap-10">
        <div className="grid flex-1 grid-cols-2 items-end gap-4 sm:gap-8" style={{ height: 240 }}>
          {bars.map((bar, i) => (
            <div key={bar.label} className="flex h-full flex-col justify-end gap-2">
              <span className={`text-center font-display text-2xl tabular-nums sm:text-3xl ${bar.text}`}>{formatValue(bar.value, unit)}</span>
              <motion.span
                className={`block origin-bottom rounded-t-xl ${bar.tone}`}
                style={{ height: `${(bar.value / max) * 75}%` }}
                initial={{ scaleY: reduce ? 1 : 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={VIZ_VIEWPORT}
                transition={reduce ? { duration: 0 } : { ...VIZ_SPRING, delay: i * 0.25 }}
                data-testid="bar"
              />
              <span className="border-t border-border-strong pt-2 text-center text-sm leading-snug text-ink-2">{bar.label}</span>
            </div>
          ))}
        </div>
        {change !== null ? (
          <motion.span
            className="mb-10 shrink-0 rounded-full bg-navy px-4 py-2 font-semibold text-white tabular-nums"
            initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={VIZ_VIEWPORT}
            transition={reduce ? { duration: 0 } : { ...VIZ_SPRING, stiffness: 320, damping: 16, delay: 0.6 }}
            data-testid="change"
          >
            {change > 0 ? "+" : ""}
            {formatValue(change)}%
          </motion.span>
        ) : null}
      </div>
    </VizFigure>
  );
}
