"use client";

import { motion, useReducedMotion } from "motion/react";
import { VIZ_SPRING, VIZ_VIEWPORT, vizDelay } from "./motion";
import { VizFigure, type VizFrameProps } from "./viz-figure";

interface TimelineProps extends VizFrameProps {
  items: { date: string; label: string; detail?: string }[];
}

/** Vertical timeline: a rail that draws down, a dot and card per event. */
export function Timeline({ items, ...frame }: TimelineProps) {
  const reduce = useReducedMotion();
  return (
    <VizFigure kind="timeline" {...frame}>
      <div className="relative">
        <motion.span
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-[7px] w-0.5 origin-top bg-border-strong"
          initial={{ scaleY: reduce ? 1 : 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={VIZ_VIEWPORT}
          transition={reduce ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        <ol className="flex flex-col gap-6">
          {items.map((item, i) => (
            <motion.li
              key={`${item.date}-${item.label}`}
              className="relative grid gap-1 pl-9 sm:grid-cols-[9rem_1fr] sm:gap-6"
              initial={{ opacity: reduce ? 1 : 0, x: reduce ? 0 : -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={VIZ_VIEWPORT}
              transition={reduce ? { duration: 0 } : { ...VIZ_SPRING, stiffness: 260, delay: 0.2 + vizDelay(i, 0.15) }}
            >
              <span aria-hidden="true" className="absolute top-1.5 left-0 size-4 rounded-full border-[3px] border-canvas bg-accent" />
              <time className="text-sm font-semibold text-ink-3 tabular-nums">{item.date}</time>
              <span className="flex flex-col gap-0.5">
                <span className="font-semibold text-ink-1">{item.label}</span>
                {item.detail ? <span className="text-sm leading-snug text-ink-2">{item.detail}</span> : null}
              </span>
            </motion.li>
          ))}
        </ol>
      </div>
    </VizFigure>
  );
}
