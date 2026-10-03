"use client";

import { motion, useReducedMotion } from "motion/react";
import { VIZ_SPRING, VIZ_VIEWPORT, vizDelay } from "./motion";
import { VizFigure, type VizFrameProps } from "./viz-figure";

interface ModuleMapProps extends VizFrameProps {
  center: string;
  items: { label: string; detail?: string }[];
}

/**
 * Hub and spokes: the core in the middle, modules on a ring around it, joined
 * by lines that draw in. Below `sm` it becomes the core plus a two-column list.
 */
export function ModuleMap({ center, items, ...frame }: ModuleMapProps) {
  const reduce = useReducedMotion();
  // Ring positions (percent of the box), starting at 12 o'clock.
  const pos = items.map((_, i) => {
    const angle = (i / items.length) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + Math.cos(angle) * 37, y: 50 + Math.sin(angle) * 38 };
  });
  return (
    <VizFigure kind="module-map" {...frame}>
      {/* phone */}
      <div className="flex flex-col gap-3 sm:hidden">
        <span className="self-center rounded-full bg-navy px-5 py-2.5 font-semibold text-white">{center}</span>
        <ul className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <li key={item.label} className="rounded-xl bg-bg p-3 text-sm shadow-nav">
              <span className="font-semibold text-ink-1">{item.label}</span>
              {item.detail ? <span className="mt-0.5 block leading-snug text-ink-2">{item.detail}</span> : null}
            </li>
          ))}
        </ul>
      </div>
      {/* tablet + desktop */}
      <div className="relative hidden aspect-[16/10] sm:block" data-testid="module-ring">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true">
          {pos.map((p, i) => (
            <motion.line
              key={i}
              x1={50}
              y1={50}
              x2={p.x}
              y2={p.y}
              className="stroke-border-strong"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: reduce ? 1 : 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={VIZ_VIEWPORT}
              transition={reduce ? { duration: 0 } : { duration: 0.6, delay: 0.2 + vizDelay(i) }}
            />
          ))}
        </svg>
        <motion.span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy px-6 py-3 text-center font-semibold whitespace-nowrap text-white shadow-nav"
          initial={{ scale: reduce ? 1 : 0.6, opacity: reduce ? 1 : 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={VIZ_VIEWPORT}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 16 }}
        >
          {center}
        </motion.span>
        <ul>
          {items.map((item, i) => (
            <motion.li
              key={item.label}
              className="absolute w-[30%] max-w-[13rem] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-bg px-3 py-2.5 text-center text-sm shadow-nav"
              style={{ left: `${pos[i].x}%`, top: `${pos[i].y}%` }}
              initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={VIZ_VIEWPORT}
              transition={reduce ? { duration: 0 } : { ...VIZ_SPRING, stiffness: 300, delay: 0.35 + vizDelay(i) }}
            >
              <span className="font-semibold text-ink-1">{item.label}</span>
              {item.detail ? <span className="mt-0.5 block text-xs leading-snug text-ink-2">{item.detail}</span> : null}
            </motion.li>
          ))}
        </ul>
      </div>
    </VizFigure>
  );
}
