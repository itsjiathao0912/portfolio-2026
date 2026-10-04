"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";
import { useRef, type KeyboardEvent } from "react";
import { SPRING } from "@/components/motion/springs";
import { ClayAvatar } from "@/components/clay/clay-avatar";
import { variantFor } from "@/components/clay/avatar-spec";
import { pastelFor } from "@/components/people/avatar-logic";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { POLL_OPTIONS } from "@/lib/poll-options";
import { ROLE_LABELS, type PollOptionId, type RoleId } from "../role-ids";
import { pollRows } from "./stats-copy";
import { facesFor, usePoll } from "./use-poll";
import { useVisitor } from "../store";

const NOTES = {
  "pick-role": "Pick who you are at the top of the page first, then vote.",
  "slow-down": "Easy there. Try again in a moment.",
  failed: "Could not save that vote. Try again.",
} as const;

// One soft pastel per option, in option order: light fills that accent the white page.
const FILLS = ["var(--tint-sky)", "var(--tint-peach)", "var(--tint-lavender)", "var(--tint-rose)", "var(--tint-butter)", "var(--tint-aqua)"] as const;
const MINE_FILL = "var(--tint-mint)";

/** Up to 4 overlapping clay busts: the roles of the people who picked this option. */
function VoterFaces({ roles: all, optionId, total }: { roles: readonly RoleId[]; optionId: string; total: number }) {
  const { shown: roles, more: extra } = facesFor(all, total);
  if (roles.length === 0) return null;
  const label = `Voters include ${roles.map((r) => ROLE_LABELS[r]).join(", ")}${extra > 0 ? ` and ${extra} more` : ""}`;
  return (
    <span role="img" aria-label={label} data-testid={`poll-faces-${optionId}`} className="flex items-center">
      {roles.map((r, i) => (
        <span
          key={r}
          style={{ marginLeft: i === 0 ? 0 : -8, background: pastelFor(r), zIndex: roles.length - i }}
          className="relative inline-block size-7 shrink-0 overflow-hidden rounded-full shadow-1 ring-2 ring-bg"
        >
          <ClayAvatar role={r} {...variantFor(`${r}:${optionId}`)} view="bust" size={28} decorative />
        </span>
      ))}
      {extra > 0 ? (
        <span style={{ marginLeft: -8 }} className="relative grid size-7 shrink-0 place-items-center rounded-full bg-canvas text-[11px] font-semibold text-ink-2 ring-2 ring-bg">
          +{extra}
        </span>
      ) : null}
    </span>
  );
}

/**
 * "What should Thao build next?" One vote per browser, changeable. Each option
 * is a rounded bar that fills in its own pastel, with the clay faces of the
 * roles who chose it. Counts are real; percentages only appear once 20 people
 * have voted, and before that numbers and faces show only after you vote.
 * If the poll cannot load, nothing renders.
 */
export function VisitorPoll({ className }: { className?: string }) {
  const { visitorId, ready, role } = useVisitor();
  const { data, note, vote, ref } = usePoll({ visitorId, ready, hasRole: role !== null, role });
  const reduce = useReducedMotion();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const view = data ? pollRows(POLL_OPTIONS, data.counts, data.total) : null;
  const revealed = !!data && !!view && (view.showPercent || data.mine !== null);
  const calmNote = !data ? "" : view?.showPercent ? `${data.total} votes · tap another option to change your vote` : data.mine ? `Vote saved. ${data.total} ${data.total === 1 ? "vote" : "votes"} so far · tap another to change` : data.total === 0 ? "Cast the first votes" : `Cast the first votes. ${data.total} so far`;

  // Roving focus: arrows move between options, Enter / Space votes (arrows never cast a vote).
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = buttons.current.length;
    const to = e.key === "ArrowDown" || e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowUp" || e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    buttons.current[to]?.focus();
  };
  const focusIndex = data && view ? Math.max(0, view.rows.findIndex((r) => r.id === data.mine)) : 0;

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
          <p className="mt-2 text-[14px] text-ink-3">Pick one. You will see who else picked it.</p>
          <div role="radiogroup" aria-labelledby="visitor-poll-title" className="mt-6 grid gap-2.5">
            {view.rows.map((row, i) => {
              const mine = data.mine === row.id;
              const faces = data.roles?.[row.id as PollOptionId] ?? [];
              const fill = mine ? MINE_FILL : FILLS[i % FILLS.length];
              // Under 20 votes a bar would be a percentage in disguise: every row gets the same soft full-width tint; from 20 votes the bars fill to their share.
              const calm = !view.showPercent;
              const width = !revealed ? 0 : calm ? 1 : Math.max(row.count > 0 ? 0.06 : 0, row.fraction);
              return (
                <motion.button
                  key={row.id}
                  ref={(el) => {
                    buttons.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={mine}
                  tabIndex={i === focusIndex ? 0 : -1}
                  data-testid={`poll-option-${row.id}`}
                  data-mine={mine || undefined}
                  onClick={() => vote(row.id as PollOptionId)}
                  onKeyDown={(e) => onKey(e, i)}
                  whileHover={reduce ? undefined : { y: -1 }}
                  whileTap={reduce ? undefined : { scale: 0.985 }}
                  transition={SPRING.glide}
                  className={cn(
                    "group relative min-h-14 w-full overflow-hidden rounded-2xl border bg-bg px-3.5 py-3 text-left outline-none transition-[border-color,box-shadow] duration-200",
                    "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                    mine ? "border-success/50 shadow-1" : "border-hairline hover:border-border-strong hover:shadow-1",
                  )}
                >
                  {/* Soft wash on hover so an unvoted bar still feels alive. */}
                  <span aria-hidden="true" className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-40" style={{ background: fill }} />
                  <motion.span
                    aria-hidden="true"
                    data-testid={`poll-bar-${row.id}`}
                    data-mode={calm ? "tint" : "share"}
                    className="absolute inset-y-0 left-0 w-full origin-left"
                    style={{ background: fill }}
                    initial={false}
                    animate={{ scaleX: width, opacity: calm && !mine ? 0.45 : 1 }}
                    transition={reduce ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                  />
                  <span className="relative flex items-center gap-3 text-[14px] leading-snug">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors duration-200",
                        mine ? "border-success bg-success text-white" : "border-border-strong bg-bg text-transparent group-hover:border-ink-3",
                      )}
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    <span className={cn("min-w-0 flex-1", mine ? "font-medium text-ink-1" : "text-ink-1")}>{row.label}</span>
                    {revealed ? (
                      <span className="flex shrink-0 items-center gap-2.5">
                        <VoterFaces roles={faces} optionId={row.id} total={row.count} />
                        {row.percent !== null || row.count > 0 ? (
                          <span data-testid={`poll-value-${row.id}`} className={cn("min-w-[2.5ch] text-right tabular-nums", mine ? "font-semibold text-ink-1" : "text-ink-2")}>
                            {row.percent ?? row.count}
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                  </span>
                </motion.button>
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
