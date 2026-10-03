"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { VIZ_SPRING, VIZ_VIEWPORT, vizDelay } from "./motion";
import { VizFigure, type VizFrameProps } from "./viz-figure";

interface FlowProps extends VizFrameProps {
  fanIn?: string[];
  steps: { label: string; detail?: string }[];
}

/**
 * A sequence of numbered steps joined by arrows: a row from `md`, a column on
 * phones. Optional `fanIn` inputs stack in front of the first step.
 */
export function FlowDiagram({ fanIn = [], steps, ...frame }: FlowProps) {
  const reduce = useReducedMotion();
  const pop = (i: number) => ({
    initial: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: VIZ_VIEWPORT,
    transition: reduce ? { duration: 0 } : { ...VIZ_SPRING, stiffness: 260, delay: vizDelay(i, 0.12) },
  });
  const nodes = [
    ...(fanIn.length > 0 ? [{ kind: "fan" as const }] : []),
    ...steps.map((step, i) => ({ kind: "step" as const, step, n: i + 1 })),
  ];

  return (
    <VizFigure kind="flow" {...frame}>
      <ol className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
        {nodes.map((node, i) => (
          <li key={i} className="flex flex-col items-center gap-2 md:flex-1 md:flex-row">
            {i > 0 ? (
              <motion.span {...pop(i)} aria-hidden="true" className="text-ink-3">
                <ArrowDown className="size-5 md:hidden" />
                <ArrowRight className="hidden size-5 md:block" />
              </motion.span>
            ) : null}
            {node.kind === "fan" ? (
              <motion.ul {...pop(i)} className="flex w-full flex-wrap justify-center gap-1.5 md:w-auto md:flex-col" aria-label="Inputs">
                {fanIn.map((input) => (
                  <li key={input} className="rounded-full border border-hairline bg-bg px-3 py-1 text-center text-xs font-medium text-ink-2">
                    {input}
                  </li>
                ))}
              </motion.ul>
            ) : (
              <motion.div {...pop(i)} className="flex w-full flex-1 flex-col gap-1 rounded-2xl bg-bg p-4 shadow-2" data-testid="flow-step">
                <span className="font-display text-sm text-accent tabular-nums">{String(node.n).padStart(2, "0")}</span>
                <span className="text-[0.95rem] leading-snug font-semibold text-ink-1">{node.step.label}</span>
                {node.step.detail ? <span className="text-sm leading-snug text-ink-2">{node.step.detail}</span> : null}
              </motion.div>
            )}
          </li>
        ))}
      </ol>
    </VizFigure>
  );
}
