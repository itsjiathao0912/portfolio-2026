"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { VIZ_SPRING } from "./motion";
import { bandFor } from "./scale";
import { VizFigure, type VizFrameProps } from "./viz-figure";

type Tone = "calm" | "watch" | "alert" | "stop";
interface ScoreLadderProps extends VizFrameProps {
  rules: { label: string; points: number }[];
  bands: { label: string; from: number; tone: Tone }[];
  preset?: string[];
}

const ZONE: Record<Tone, string> = { calm: "bg-tint-mint", watch: "bg-tint-butter", alert: "bg-tint-peach", stop: "bg-tint-rose" };
const CHIP: Record<Tone, string> = { calm: "bg-success text-white", watch: "bg-[#b45309] text-white", alert: "bg-[#c2410c] text-white", stop: "bg-danger text-white" };

/**
 * Explorable risk score: tap rules to fire them; their points add up and a
 * marker slides along a band axis (approve / review / block / decline).
 */
export function ScoreLadder({ rules, bands, preset = [], ...frame }: ScoreLadderProps) {
  const reduce = useReducedMotion();
  const [fired, setFired] = useState<string[]>(preset);
  const sorted = [...bands].sort((a, b) => a.from - b.from);
  const score = rules.filter((r) => fired.includes(r.label)).reduce((s, r) => s + r.points, 0);
  const top = Math.max(sorted[sorted.length - 1].from + 40, rules.reduce((s, r) => s + r.points, 0));
  const pct = (v: number) => (Math.min(v, top) / top) * 100;
  const band = bandFor(score, sorted);

  return (
    <VizFigure kind="score-ladder" {...frame}>
      <div className="flex flex-col gap-6">
        <ul className="flex flex-wrap gap-2" aria-label="Rules">
          {rules.map((r) => {
            const on = fired.includes(r.label);
            return (
              <li key={r.label}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFired((f) => (on ? f.filter((x) => x !== r.label) : [...f, r.label]))}
                  className={cn(
                    "flex min-h-10 items-center gap-2 rounded-full border px-3.5 font-mono text-[0.8rem] transition-colors",
                    on ? "border-ink-1 bg-ink-1 text-white" : "border-hairline bg-bg text-ink-1 hover:border-border-strong",
                  )}
                  data-testid="ladder-rule"
                >
                  {r.label}
                  <span className={cn("rounded-full px-1.5 font-sans text-xs font-semibold tabular-nums", on ? "bg-white/20" : "bg-canvas")}>+{r.points}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="relative pt-12">
          <motion.div
            className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
            animate={{ left: `${pct(score)}%` }}
            initial={false}
            transition={reduce ? { duration: 0 } : VIZ_SPRING}
            data-testid="ladder-marker"
          >
            <span className="rounded-lg bg-ink-1 px-2.5 py-1 text-sm font-semibold text-white tabular-nums">{score}</span>
            <span aria-hidden="true" className="h-3 w-0.5 bg-ink-1" />
          </motion.div>
          <div className="flex h-10 overflow-hidden rounded-xl">
            {sorted.map((b, i) => {
              const end = i + 1 < sorted.length ? sorted[i + 1].from : top;
              return (
                <span
                  key={b.label}
                  className={cn("flex items-center justify-center border-r border-canvas text-xs font-semibold text-ink-1 last:border-r-0", ZONE[b.tone], b === band && "ring-2 ring-ink-1 ring-inset")}
                  style={{ width: `${pct(end) - pct(b.from)}%` }}
                >
                  <span className="truncate px-1">{b.label}</span>
                </span>
              );
            })}
          </div>
          <div className="relative mt-1 h-5 text-xs text-ink-3 tabular-nums" aria-hidden="true">
            {sorted.map((b) => (
              <span key={b.label} className="absolute -translate-x-1/2" style={{ left: `${pct(b.from)}%` }}>
                {b.from}
              </span>
            ))}
          </div>
        </div>

        <p className="flex flex-wrap items-center gap-2 text-sm text-ink-2" aria-live="polite">
          Score <strong className="text-ink-1 tabular-nums">{score}</strong> lands in
          <span className={cn("rounded-full px-3 py-0.5 font-semibold", CHIP[band.tone])} data-testid="ladder-band">
            {band.label}
          </span>
          <button type="button" onClick={() => setFired([])} className="ml-auto text-accent underline-offset-4 hover:underline">
            Reset
          </button>
        </p>
      </div>
    </VizFigure>
  );
}
