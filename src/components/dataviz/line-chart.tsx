"use client";

import { motion, useReducedMotion } from "motion/react";
import { VIZ_VIEWPORT, vizDelay } from "./motion";
import { formatValue, niceMax, ticks } from "./scale";
import { VizFigure, type VizFrameProps } from "./viz-figure";

interface LineChartProps extends VizFrameProps {
  xLabel: string;
  yLabel: string;
  points: { label: string; value: number }[];
}

/**
 * Line over ordered categories. The line is an SVG stretched to the plot box
 * (non-scaling stroke); every label is HTML so text stays readable at phone
 * width. The line draws itself in, then the dots pop.
 */
export function LineChart({ xLabel, yLabel, points, ...frame }: LineChartProps) {
  const reduce = useReducedMotion();
  const max = niceMax(Math.max(...points.map((p) => p.value)));
  const axis = ticks(max, 4);
  const x = (i: number) => (points.length === 1 ? 50 : 6 + (i / (points.length - 1)) * 88);
  const y = (v: number) => 100 - (v / max) * 100;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");

  return (
    <VizFigure kind="line" {...frame}>
      <div className="flex gap-3">
        {/* y axis */}
        <div className="flex flex-col items-end">
          <span className="mb-2 text-xs font-semibold text-ink-3">{yLabel}</span>
          <div className="relative h-56 w-10 sm:h-64" aria-hidden="true">
            {axis.map((t) => (
              <span key={t} className="absolute right-0 -translate-y-1/2 text-xs text-ink-3 tabular-nums" style={{ top: `${y(t)}%` }}>
                {formatValue(t)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <span className="mb-2 block text-xs">&nbsp;</span>
          <div className="relative h-56 border-b border-l border-border-strong sm:h-64">
            {axis.slice(1).map((t) => (
              <span key={t} aria-hidden="true" className="absolute inset-x-0 h-px bg-hairline" style={{ top: `${y(t)}%` }} />
            ))}
            {/* Static line that fades up; the dots spring in after it. */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIZ_VIEWPORT}
              transition={reduce ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="size-full overflow-visible" aria-hidden="true">
                <path d={path} fill="none" className="stroke-accent" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </motion.div>
            <ul>
              {points.map((p, i) => (
                <motion.li
                  key={p.label}
                  className="absolute size-0"
                  style={{ left: `${x(i)}%`, top: `${y(p.value)}%` }}
                  initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.4 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={VIZ_VIEWPORT}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 18, delay: 0.5 + vizDelay(i, 0.15) }}
                  data-testid="point"
                >
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-bg px-1.5 text-sm font-semibold whitespace-nowrap text-ink-1 tabular-nums shadow-nav">
                    {formatValue(p.value)}
                  </span>
                  <span className="absolute top-1/2 left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-bg bg-accent shadow" />
                  <span className="sr-only">
                    {p.label}: {formatValue(p.value)}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="relative mt-2 h-10" aria-hidden="true">
            {points.map((p, i) => (
              <span key={p.label} className="absolute w-24 -translate-x-1/2 text-center text-xs leading-tight text-ink-2" style={{ left: `${x(i)}%` }}>
                {p.label}
              </span>
            ))}
          </div>
          <p className="text-center text-xs font-semibold text-ink-3">{xLabel}</p>
        </div>
      </div>
    </VizFigure>
  );
}
