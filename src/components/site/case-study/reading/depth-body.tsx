"use client";

import { motion } from "motion/react";
import { Fragment, useState, type ReactNode } from "react";
import { SPRING } from "@/components/motion/springs";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useReadingDepth } from "./depth-context";
import { DEPTH_LABEL, isVisibleAt, shallowest, type Depth } from "./logic";

export interface BodyRun {
  depth: Depth;
  node: ReactNode;
  /** Level-2 headings inside this run (for the "N more sections" stub). */
  headings: string[];
}

const GAP = 28; // matches gap-7 between blocks

/**
 * Renders the case-study runs. A run hidden at the current depth collapses (height animation) and is
 * marked inert + aria-hidden but stays in the DOM, so crawlers and "find in page" still see everything.
 * Consecutive hidden runs share ONE stub that says what the next depth adds and opens it on click.
 */
export function DepthBody({ runs }: { runs: BodyRun[] }) {
  const { depth, setDepth } = useReadingDepth();
  const reduce = useReducedMotion();
  const transition = reduce ? { duration: 0 } : SPRING.sheet;

  const items: ReactNode[] = [];
  let pending: BodyRun[] = [];
  let seenVisible = false;
  const flush = (key: string) => {
    if (pending.length === 0) return;
    const headings = pending.flatMap((run) => run.headings);
    const unlock = shallowest(pending.map((run) => run.depth));
    const count = Math.max(headings.length, 1);
    items.push(
      <button
        key={`stub-${key}`}
        type="button"
        data-testid="depth-stub"
        onClick={() => setDepth(unlock)}
        className="flex min-h-11 w-full items-center justify-between gap-4 rounded-lg border border-dashed border-hairline px-4 py-3 text-left text-sm text-ink-3 transition-colors hover:border-ink-3 hover:text-ink-1 focus-visible:outline-2 focus-visible:outline-accent"
        style={{ marginTop: seenVisible ? GAP : 0 }}
      >
        <span className="min-w-0">
          {count} more {count === 1 ? "section" : "sections"} in {DEPTH_LABEL[unlock].name}
          {headings.length > 0 ? <span className="hidden sm:inline">{`: ${headings.join(", ")}`}</span> : null}
        </span>
        <span aria-hidden="true" className="shrink-0 font-semibold text-accent">Show</span>
      </button>,
    );
    pending = [];
  };

  runs.forEach((run, i) => {
    const visible = isVisibleAt(run.depth, depth);
    if (visible) flush(String(i));
    items.push(
      <RunBox key={`run-${i}`} run={run} visible={visible} margin={visible && seenVisible ? GAP : 0} transition={transition} />,
    );
    if (visible) seenVisible = true;
    else pending.push(run);
  });
  flush("end");

  return <Fragment>{items}</Fragment>;
}

/** One collapsible run. Overflow is clipped only while it animates, so card lifts and shadows are never cut off. */
function RunBox({ run, visible, margin, transition }: { run: BodyRun; visible: boolean; margin: number; transition: object }) {
  const [animating, setAnimating] = useState(false);
  return (
    <motion.div
      data-testid="depth-run"
      data-depth={run.depth}
      data-visible={visible ? "true" : "false"}
      initial={false}
      animate={{ height: visible ? "auto" : 0, opacity: visible ? 1 : 0, marginTop: margin }}
      transition={transition}
      onAnimationStart={() => setAnimating(true)}
      onAnimationComplete={() => setAnimating(false)}
      style={{ overflow: visible && !animating ? "visible" : "hidden" }}
      {...(visible ? {} : { inert: true, "aria-hidden": true })}
    >
      <div className="flex flex-col gap-7">{run.node}</div>
    </motion.div>
  );
}
