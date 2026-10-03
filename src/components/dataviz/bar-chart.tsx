"use client";

import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useState } from "react";
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
 * Bars grow from the axis on scroll. Hover, focus or tap a bar for a tooltip;
 * with 2+ groups, the legend chips filter the bars (the axis rescales).
 */
export function BarChart({ unit = "", items, ...frame }: BarChartProps) {
  const reduce = useReducedMotion();
  const groups = groupsOf(items);
  const [hidden, setHidden] = useState<string[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const visible = items.map((item, i) => ({ item, i })).filter(({ item }) => !hidden.includes(item.group ?? ""));
  const max = niceMax(Math.max(...(visible.length ? visible : items.map((item, i) => ({ item, i }))).map(({ item }) => item.value)));
  const axis = ticks(max, 4);
  const toggle = (name: string) =>
    setHidden((h) => (h.includes(name) ? h.filter((n) => n !== name) : h.length + 1 >= groups.length ? h : [...h, name]));

  return (
    <VizFigure kind="bar" legend={groups} hidden={hidden} onLegendToggle={groups.length > 1 ? toggle : undefined} {...frame}>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-[minmax(8rem,34%)_1fr]">
        <ul className="contents" role="list">
          {visible.map(({ item, i }, order) => {
            const color = SERIES_BG[Math.max(0, groups.indexOf(item.group ?? "")) % SERIES_BG.length];
            const isActive = active === i;
            return (
              <li key={`${item.label}-${i}`} className="contents">
                <span className="pt-3 text-sm leading-snug text-ink-1 sm:py-2.5 sm:text-right">{item.label}</span>
                <span
                  className="relative flex cursor-default items-center gap-3 rounded-md py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-accent sm:py-2.5"
                  tabIndex={0}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  onClick={() => setActive(isActive ? null : i)}
                  aria-label={`${item.label}: ${formatValue(item.value, unit)}${item.group ? `, ${item.group}` : ""}`}
                  data-testid="bar-row"
                >
                  <span className="relative h-7 flex-1">
                    {axis.map((t) => (
                      <span key={t} aria-hidden="true" className="absolute inset-y-[-6px] w-px bg-hairline" style={{ left: `${(t / max) * 100}%` }} />
                    ))}
                    <motion.span
                      className={cn("absolute inset-y-0 left-0 origin-left rounded-r-md transition-[filter]", color, isActive && "brightness-110")}
                      initial={{ scaleX: reduce ? 1 : 0, width: `${(item.value / max) * 100}%` }}
                      animate={{ width: `${(item.value / max) * 100}%` }}
                      whileInView={{ scaleX: 1 }}
                      viewport={VIZ_VIEWPORT}
                      transition={reduce ? { duration: 0 } : { ...VIZ_SPRING, delay: vizDelay(order) }}
                      data-testid="bar"
                    />
                    <AnimatePresence>
                      {isActive ? (
                        <motion.span
                          role="tooltip"
                          className="absolute -top-9 z-10 -translate-x-1/2 rounded-lg bg-ink-1 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-white shadow-lg"
                          style={{ left: `${Math.min(85, Math.max(15, (item.value / max) * 100))}%` }}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: reduce ? 0 : 0.15 }}
                          data-testid="viz-tooltip"
                        >
                          {item.label}
                          {item.group ? ` · ${item.group}` : ""}: {formatValue(item.value, unit)}
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </span>
                  <span className="w-16 shrink-0 text-right font-semibold text-ink-1 tabular-nums">{formatValue(item.value, unit)}</span>
                </span>
              </li>
            );
          })}
        </ul>
        <span aria-hidden="true" className="hidden sm:block" />
        <span aria-hidden="true" className="flex items-center gap-3">
          <span className="relative mt-2 h-5 flex-1 border-t border-border-strong">
            {axis.map((t) => (
              <span key={t} className="absolute top-1 -translate-x-1/2 text-xs text-ink-3 tabular-nums" style={{ left: `${(t / max) * 100}%` }}>
                {formatValue(t, unit)}
              </span>
            ))}
          </span>
          <span className="w-16 shrink-0" />
        </span>
      </div>
    </VizFigure>
  );
}
