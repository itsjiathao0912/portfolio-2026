"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import { cn } from "@/lib/utils";
import type { CaseBlockProps } from "../types";

export const STORY = "As a business user, I want to see where a number in my report comes from, so I can trust it.";

/** Each requirement closes the developer question a vague story leaves open. Invented example, not a real ticket. */
export const GAPS = [
  { id: "scope", ask: "Which objects does “where it comes from” cover?", add: "Lineage covers sources, models and pipelines. Dashboards are out of scope for v1." },
  { id: "depth", ask: "How many hops upstream and downstream?", add: "Show every hop upstream; downstream shows direct dependents first, expandable." },
  { id: "access", ask: "Can everyone see every upstream table?", add: "A user sees only the nodes they have access to; hidden nodes appear as “restricted”." },
  { id: "gone", ask: "What if an upstream source was deleted?", add: "Show the node as “removed”, keep the edge, and flag dependents as at risk." },
  { id: "done", ask: "How will we know it is done?", add: "Acceptance: pick a report column, reach its raw source in ≤ 3 clicks, on a seeded test project." },
] as const;

/** Questions still open after the reader has added `added` requirements. */
export function openQuestions(added: readonly string[]) {
  return GAPS.filter((g) => !added.includes(g.id));
}

/** Reader writes the missing requirements; the developer's open questions close one by one. */
export function StoryGap({ source }: CaseBlockProps) {
  const [added, setAdded] = useState<string[]>([]);
  const open = openQuestions(added);
  const toggle = (id: string) => setAdded((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  return (
    <VizFigure
      kind="reorc-story-gap"
      title="Spot the gap in a user story"
      badge="Illustrative example"
      caption="A made-up story, written to show the craft: a vague line becomes buildable only when its hidden questions get answers. Add the requirement that answers each one."
      source={source}
    >
      <p className="rounded-2xl bg-bg px-4 py-3 text-base font-semibold text-ink-1">“{STORY}”</p>
      <ul className="flex flex-col gap-2" aria-label="Developer questions and requirements">
        {GAPS.map((g) => {
          const on = added.includes(g.id);
          return (
            <li key={g.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => toggle(g.id)}
                className={cn(
                  "flex min-h-11 w-full flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none",
                  on ? "border-transparent bg-tint-mint" : "border-hairline bg-bg hover:border-border-strong",
                )}
              >
                <span className="font-semibold text-ink-1">{on ? "✓ " : "? "}{g.ask}</span>
                <span className="text-ink-2">{on ? g.add : "Tap to add the requirement that answers this."}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p aria-live="polite" data-testid="open-questions" className="text-sm text-ink-2">
        {open.length === 0 ? (
          <><strong className="text-ink-1">No open questions.</strong> A developer can build this and a tester can check it.</>
        ) : (
          <><strong className="text-ink-1">{open.length}</strong> of {GAPS.length} questions still land on a developer as a message.</>
        )}
      </p>
    </VizFigure>
  );
}
