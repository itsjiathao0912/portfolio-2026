"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";
import { SPRING } from "@/components/motion/springs";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { POLL_OPTIONS } from "@/lib/poll-options";
import type { PollOptionId } from "../role-ids";
import { pollRows } from "./stats-copy";
import { usePoll } from "./use-poll";
import { useVisitor } from "../store";

const NOTES = {
  "pick-role": "Pick who you are at the top of the page first, then vote.",
  "slow-down": "Easy there. Try again in a moment.",
  failed: "Could not save that vote. Try again.",
} as const;

/**
 * "What should Thao build next?" A small, calm module for near the footer
 * contact. One vote per browser, changeable. Counts are real; percentages only
 * appear once 20 people have voted. If the poll cannot load, nothing renders.
 */
export function VisitorPoll({ className }: { className?: string }) {
  const { visitorId, ready } = useVisitor();
  const { data, note, vote, ref } = usePoll({ visitorId, ready });
  const reduce = useReducedMotion();

  // Always render the wrapper so the observer can find it; the card appears once data is in.
  const view = data ? pollRows(POLL_OPTIONS, data.counts, data.total) : null;
  // Real numbers appear once they mean something: a settled vote, or enough votes to read. Before that, calm chips and a small total.
  const revealed = !!data && !!view && (view.showPercent || data.mine !== null);
  const calmNote = !data ? "" : view?.showPercent ? `${data.total} votes` : data.mine ? `Vote saved. ${data.total} ${data.total === 1 ? "vote" : "votes"} so far` : data.total === 0 ? "Cast the first votes" : `Cast the first votes. ${data.total} so far`;

  return (
    <section ref={ref} aria-labelledby="visitor-poll-title" data-testid="visitor-poll" className={cn(view ? "" : "min-h-px", className)}>
      {data && view ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0 } : SPRING.glide}
          className="border-t border-hairline pt-10"
        >
          <p className="label-mono text-[12px] text-accent">Quick poll</p>
          <h3 id="visitor-poll-title" className="font-display mt-2 text-[26px] leading-[1.1] text-ink-1 md:text-[32px]">
            What should Thao build next?
          </h3>
          <div role="radiogroup" aria-labelledby="visitor-poll-title" className="mt-5 flex flex-wrap gap-2">
            {view.rows.map((row) => {
              const mine = data.mine === row.id;
              return (
                <button
                  key={row.id}
                  type="button"
                  role="radio"
                  aria-checked={mine}
                  data-testid={`poll-option-${row.id}`}
                  onClick={() => vote(row.id as PollOptionId)}
                  className={cn(
                    "relative min-h-11 max-w-full overflow-hidden rounded-full border px-4 py-2 text-left outline-none transition-colors duration-[120ms]",
                    "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                    mine ? "border-accent" : "border-hairline hover:border-border-strong",
                  )}
                >
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 bg-accent-tint"
                    initial={false}
                    animate={{ width: revealed ? `${Math.round(row.fraction * 100)}%` : "0%" }}
                    transition={reduce ? { duration: 0 } : SPRING.glide}
                  />
                  <span className="relative flex items-center gap-2.5 text-[14px] leading-snug">
                    <span
                      aria-hidden="true"
                      className={cn("grid size-5 shrink-0 place-items-center rounded-full border transition-colors", mine ? "border-accent bg-accent text-bg" : "border-hairline text-transparent")}
                    >
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    <span className="min-w-0 flex-1 text-ink-1">{row.label}</span>
                    {revealed && (row.percent !== null || row.count > 0) ? (
                      <span data-testid={`poll-value-${row.id}`} className="shrink-0 tabular-nums text-ink-3">
                        {row.percent ?? row.count}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
          <p data-testid="poll-note" className="mt-4 text-[12px] text-ink-3" aria-live="polite">
            {note ? NOTES[note] : calmNote}
          </p>
        </motion.div>
      ) : null}
    </section>
  );
}
