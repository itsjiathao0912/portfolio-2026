"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import { cn } from "@/lib/utils";
import type { CaseBlockProps } from "../types";

// The columns follow the Recurve flow in docs.reorc.com (sources, models, pipelines, health dashboard). Names are invented.
export const COLUMNS = ["Sources", "Models", "Pipeline", "Report"] as const;
export const NODES = [
  { id: "orders", col: 0, label: "orders_db" },
  { id: "crm", col: 0, label: "crm_export" },
  { id: "clean", col: 1, label: "clean_orders" },
  { id: "ltv", col: 1, label: "customer_value" },
  { id: "daily", col: 2, label: "daily_refresh" },
  { id: "rev", col: 3, label: "Revenue by customer" },
] as const;
export const EDGES: readonly (readonly [string, string])[] = [
  ["orders", "clean"], ["crm", "ltv"], ["clean", "ltv"], ["clean", "daily"], ["ltv", "daily"], ["daily", "rev"],
];

/** Every node reachable from `id` going upstream (trace) or downstream (impact), including itself. */
export function related(id: string, dir: "up" | "down") {
  const seen = new Set([id]);
  const queue = [id];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const [from, to] of EDGES) {
      const [a, b] = dir === "up" ? [to, from] : [from, to];
      if (a === cur && !seen.has(b)) { seen.add(b); queue.push(b); }
    }
  }
  return seen;
}

/** Reader picks a node. A report number lights up where it came from; a source lights up what depends on it. */
export function LineageTrace({ source }: CaseBlockProps) {
  const [picked, setPicked] = useState("rev");
  const dir = NODES.find((n) => n.id === picked)!.col === 3 ? "up" : "down";
  const lit = related(picked, dir);
  return (
    <VizFigure
      kind="reorc-lineage"
      title="Trace a number, or test a change"
      badge="Illustrative example"
      caption="Pick the report to see everything it comes from. Pick a source or model to see everything that would change if it did. Names are invented; the stages follow Recurve's documented flow."
      source={source}
    >
      <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4">
        {COLUMNS.map((c, i) => (
          <div key={c} className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-2">{c}</p>
            {NODES.filter((n) => n.col === i).map((n) => {
              const on = lit.has(n.id);
              return (
                <button
                  key={n.id}
                  type="button"
                  aria-pressed={n.id === picked}
                  data-lit={on ? "" : undefined}
                  onClick={() => setPicked(n.id)}
                  className={cn(
                    "min-h-11 rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none",
                    n.id === picked ? "border-ink-1 bg-ink-1 text-white" : on ? "border-transparent bg-tint-lavender text-ink-1" : "border-hairline bg-bg text-ink-2 opacity-60",
                  )}
                >
                  {n.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <p aria-live="polite" data-testid="lineage-summary" className="text-sm text-ink-2">
        {dir === "up"
          ? <>This number depends on <strong className="text-ink-1">{lit.size - 1}</strong> upstream steps.</>
          : <>A change here reaches <strong className="text-ink-1">{lit.size - 1}</strong> downstream steps, up to the report.</>}
      </p>
    </VizFigure>
  );
}
