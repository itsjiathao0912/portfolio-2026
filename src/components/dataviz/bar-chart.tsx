"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { VIZ_SPRING, VIZ_VIEWPORT, vizDelay } from "./motion";
import { SERIES_BG, formatValue, groupsOf, niceMax, ticks } from "./scale";
import { VizFigure, type VizFrameProps } from "./viz-figure";

interface BarChartProps extends VizFrameProps {
  unit?: string;
  items: { label: string; value: number; group?: string }[];
}

/**
 * Horizontal bar chart: label above each bar on phones, beside it from `sm`.
 * A labelled value axis with gridlines sits under the bars. Bars grow from
 * the axis when the chart scrolls into view.
 */
export function BarChart({ unit = "", items, ...frame }: BarChartProps) {
  const reduce = useReducedMotion();
  const groups = groupsOf(items);
  const max = niceMax(Math.max(...items.map((i) => i.value)));
  const axis = ticks(max, 4);

  return (
    <VizFigure kind="bar" legend={groups} {...frame}>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-[minmax(8rem,34%)_1fr]">
        <ul className="contents" role="list">
          {items.map((item, i) => {
            const color = SERIES_BG[Math.max(0, groups.indexOf(item.group ?? "")) % SERIES_BG.length];
            return (
              <li key={`${item.label}-${i}`} className="contents">
                <span className="pt-3 text-sm leading-snug text-ink-1 sm:py-2.5 sm:text-right">{item.label}</span>
                <span className="relative flex items-center gap-3 py-1.5 sm:py-2.5">
                  <span className="relative h-7 flex-1">
                    {/* gridlines */}
                    {axis.map((t) => (
                      <span key={t} aria-hidden="true" className="absolute inset-y-[-6px] w-px bg-hairline" style={{ left: `${(t / max) * 100}%` }} />
                    ))}
                    <motion.span
                      className={cn("absolute inset-y-0 left-0 origin-left rounded-r-md", color)}
                      style={{ width: `${(item.value / max) * 100}%` }}
                      initial={{ scaleX: reduce ? 1 : 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={VIZ_VIEWPORT}
                      transition={reduce ? { duration: 0 } : { ...VIZ_SPRING, delay: vizDelay(i) }}
                      data-testid="bar"
                    />
                  </span>
                  <span className="w-14 shrink-0 text-right font-semibold text-ink-1 tabular-nums">{formatValue(item.value, unit)}</span>
                </span>
              </li>
            );
          })}
        </ul>
        {/* value axis */}
        <span aria-hidden="true" className="hidden sm:block" />
        <span aria-hidden="true" className="flex items-center gap-3">
          <span className="relative mt-2 h-5 flex-1 border-t border-border-strong">
            {axis.map((t) => (
              <span key={t} className="absolute top-1 -translate-x-1/2 text-xs text-ink-3 tabular-nums" style={{ left: `${(t / max) * 100}%` }}>
                {formatValue(t, unit)}
              </span>
            ))}
          </span>
          <span className="w-14 shrink-0" />
        </span>
      </div>
    </VizFigure>
  );
}
