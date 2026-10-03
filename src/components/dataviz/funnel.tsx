"use client";

import { motion, useReducedMotion } from "motion/react";
import { VIZ_SPRING, VIZ_VIEWPORT, vizDelay } from "./motion";
import { formatValue } from "./scale";
import { VizFigure, type VizFrameProps } from "./viz-figure";

interface FunnelProps extends VizFrameProps {
  /** Values are percent of the first stage. */
  stages: { label: string; value: number; detail?: string }[];
}

/**
 * Centred funnel. Each band's width is its share of the first stage; a band
 * that is zero (or too thin to read) draws as a dashed outline so a "0" still
 * reads as a deliberate result rather than a missing bar.
 */
export function Funnel({ stages, ...frame }: FunnelProps) {
  const reduce = useReducedMotion();
  const top = stages[0]?.value || 1;
  return (
    <VizFigure kind="funnel" {...frame}>
      <ol className="flex flex-col gap-3">
        {stages.map((stage, i) => {
          const share = (stage.value / top) * 100;
          const thin = share < 4;
          return (
            <li key={stage.label} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="font-medium text-ink-1">{stage.label}</span>
                <span className="font-display text-xl text-ink-1 tabular-nums">{formatValue(stage.value)}%</span>
              </div>
              <div className="relative flex h-10 justify-center rounded-lg bg-bg">
                {thin ? (
                  <span
                    className="absolute inset-y-1 left-1/2 w-24 -translate-x-1/2 rounded-md border-2 border-dashed border-ink-3/60"
                    aria-hidden="true"
                    data-testid="funnel-zero"
                  />
                ) : null}
                <motion.span
                  aria-hidden="true"
                  className={i === 0 ? "rounded-md bg-ink-3/30" : "rounded-md bg-navy"}
                  style={{ width: `${Math.max(share, thin ? 0 : 1)}%` }}
                  initial={{ scaleX: reduce ? 1 : 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={VIZ_VIEWPORT}
                  transition={reduce ? { duration: 0 } : { ...VIZ_SPRING, delay: vizDelay(i, 0.18) }}
                  data-testid="bar"
                />
              </div>
              {stage.detail ? <p className="text-sm leading-snug text-ink-2">{stage.detail}</p> : null}
            </li>
          );
        })}
      </ol>
    </VizFigure>
  );
}
