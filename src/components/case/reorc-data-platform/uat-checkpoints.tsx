"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import { cn } from "@/lib/utils";
import type { CaseBlockProps } from "../types";

export const STAGES = ["Requirements", "UAT", "After release"] as const;
export const CHECKS = [
  { id: "req", label: "Requirement review", stage: 0 },
  { id: "data", label: "Data validation scenarios", stage: 1 },
  { id: "func", label: "Functional scenarios", stage: 1 },
] as const;
// Which check can catch which defect. Invented defects, one per kind of failure the CV names.
export const DEFECTS = [
  { id: "vague", label: "A requirement that two people read differently", by: "req" },
  { id: "join", label: "A join that quietly drops rows", by: "data" },
  { id: "button", label: "A button that does nothing for a read-only role", by: "func" },
] as const;

/** Stage index where a defect is caught: its check's stage if that check is on, else after release. */
export function caughtAt(defectId: string, on: readonly string[]) {
  const d = DEFECTS.find((x) => x.id === defectId)!;
  const c = CHECKS.find((x) => x.id === d.by)!;
  return on.includes(c.id) ? c.stage : 2;
}

/** Reader switches the checkpoints on and watches where each defect gets caught. Later means more rework. */
export function UatCheckpoints({ source }: CaseBlockProps) {
  const [on, setOn] = useState<string[]>([]);
  const toggle = (id: string) => setOn((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  return (
    <VizFigure
      kind="reorc-uat"
      title="Where does each defect get caught?"
      badge="Illustrative example"
      caption="Three made-up defects. Turn on a checkpoint and the defect it targets is caught earlier. A defect found after release is the most expensive kind of rework."
      source={source}
    >
      <div className="flex flex-wrap gap-2" role="group" aria-label="Checkpoints">
        {CHECKS.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={on.includes(c.id)}
            onClick={() => toggle(c.id)}
            className={cn(
              "min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none",
              on.includes(c.id) ? "border-ink-1 bg-ink-1 text-white" : "border-hairline bg-bg text-ink-2 hover:border-border-strong",
            )}
          >
            {c.label}: {on.includes(c.id) ? "on" : "off"}
          </button>
        ))}
      </div>
      <ul className="flex flex-col gap-3" aria-label="Defects">
        {DEFECTS.map((d) => {
          const at = caughtAt(d.id, on);
          return (
            <li key={d.id} className="rounded-2xl bg-bg p-4">
              <p className="text-sm font-semibold text-ink-1">{d.label}</p>
              <div className="mt-2 grid grid-cols-3 gap-1.5" aria-hidden>
                {STAGES.map((s, i) => (
                  <span key={s} className={cn("rounded-full px-2 py-1 text-center text-xs font-semibold transition-colors motion-reduce:transition-none", i === at ? (at === 2 ? "bg-tint-peach text-ink-1" : "bg-tint-mint text-ink-1") : "bg-ink-1/5 text-ink-2")}>{s}</span>
                ))}
              </div>
              <p className="sr-only" data-testid={`caught-${d.id}`}>Caught at: {STAGES[at]}</p>
            </li>
          );
        })}
      </ul>
    </VizFigure>
  );
}
