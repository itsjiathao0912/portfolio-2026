"use client";
import { useEffect, useState } from "react";
import { POLL_OPTIONS, pollResults, readJSON, writeJSON, type PollId } from "./logic";
import { usePassport } from "./store";
import { card, eyebrow } from "./fx";

const isPoll = (v: unknown): v is PollId => POLL_OPTIONS.some((o) => o.id === v);

/** "What should Thao build next?" — one local vote, animated bars. */
export function BuildNextPoll() {
  const [vote, setVote] = useState<PollId | null>(null);
  const { collect } = usePassport();
  useEffect(() => {
    queueMicrotask(() => {
      const v = readJSON<unknown>("poll", null);
      if (isPoll(v)) setVote(v);
    });
  }, []);
  const cast = (id: PollId) => { setVote(id); writeJSON("poll", id); collect("poll"); };
  const results = pollResults(vote);

  return (
    <section className={card} aria-labelledby="poll-title">
      <p className={eyebrow}>Your call</p>
      <h2 id="poll-title" className="mt-2 text-2xl font-semibold text-ink-1 sm:text-3xl">What should Thao build next?</h2>
      <ul className="mt-5 space-y-2.5">
        {results.map((o) => {
          const mine = vote === o.id;
          return (
            <li key={o.id}>
              <button type="button" onClick={() => cast(o.id)} aria-pressed={mine}
                className={`relative w-full overflow-hidden rounded-xl border px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${mine ? "border-accent" : "border-hairline hover:border-border-strong"}`}>
                <span aria-hidden className="absolute inset-y-0 left-0 bg-accent-tint transition-[width] duration-700 ease-[var(--ease-out)] motion-reduce:transition-none" style={{ width: vote ? `${o.pct}%` : "0%" }} />
                <span className="relative flex items-center justify-between gap-3">
                  <span className="font-medium text-ink-1">{mine && "✓ "}{o.label}</span>
                  {vote && <span className="text-sm tabular-nums text-ink-3">{o.pct}%</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-ink-3" aria-live="polite">
        {vote ? "Saved in your browser only. Bars include a small illustrative baseline, not real votes." : "One tap to vote. Change your mind any time."}
      </p>
    </section>
  );
}
