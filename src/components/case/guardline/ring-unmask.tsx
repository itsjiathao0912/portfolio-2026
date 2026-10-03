"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import { cn } from "@/lib/utils";
import type { CaseBlockProps } from "../types";
import { Pills } from "./ui";

// Deck p.8: the demo ring is 14 accounts sharing devices (the verdict on p.5 cites 3 devices). Deck p.4/p.7: more than 10 accounts goes to a person.
export const RING_ACCOUNTS = 14;
export const PERSON_THRESHOLD = 10;
export const MODES = [
  { value: "ring", label: "The ring" },
  { value: "decoy", label: "The decoy: a family on one phone" },
] as const;
type Mode = (typeof MODES)[number]["value"];

export function verdict(mode: Mode, linked: number) {
  if (mode === "decoy") return "clear" as const;
  if (linked > PERSON_THRESHOLD) return "person" as const;
  return linked === 0 ? ("idle" as const) : ("watch" as const);
}

/** Reader links the ring's accounts one by one; past 10 the case goes to a person. Only deck figures are used. */
export function RingUnmask({ source }: CaseBlockProps) {
  const [mode, setMode] = useState<Mode>("ring");
  const [linked, setLinked] = useState(0);
  const v = verdict(mode, linked);
  return (
    <VizFigure
      kind="guardline-ring"
      title="No single order shows it. Follow the devices."
      caption="Every order looks normal alone; the link only shows across accounts and devices. The deck gives 14 accounts for the demo ring and a limit of 10 before a person decides."
      source={source}
    >
      <Pills label="Scenario" options={MODES} value={mode} onChange={(m) => { setMode(m); setLinked(0); }} />
      {mode === "ring" ? (
        <div className="flex flex-col gap-4 rounded-2xl bg-bg p-5 shadow-1">
          <label className="flex flex-col gap-3 text-sm font-semibold text-ink-1">
            Accounts linked through shared devices
            <input
              type="range"
              min={0}
              max={RING_ACCOUNTS}
              value={linked}
              onChange={(e) => setLinked(Number(e.target.value))}
              data-testid="ring-slider"
              className="h-11 w-full accent-[var(--color-accent)]"
            />
          </label>
          <div className="flex flex-wrap gap-2" aria-hidden>
            {Array.from({ length: RING_ACCOUNTS }, (_, i) => (
              <span key={i} className={cn("size-6 rounded-full border transition-colors motion-reduce:transition-none", i < linked ? "border-transparent bg-danger" : "border-hairline bg-canvas")} />
            ))}
          </div>
          <p className="text-sm text-ink-2">
            Accounts linked so far: <strong data-testid="ring-linked" className="text-ink-1">{linked}</strong> of {RING_ACCOUNTS}. A person decides above {PERSON_THRESHOLD}.
          </p>
        </div>
      ) : null}
      <div aria-live="polite" data-testid="ring-verdict" className={cn("rounded-2xl p-5 transition-colors motion-reduce:transition-none", v === "person" ? "bg-tint-peach" : v === "clear" ? "bg-tint-mint" : "bg-canvas")}>
        <p className="text-2xl font-semibold text-ink-1">
          {v === "person" ? "Hold the orders, escalate to a person" : v === "clear" ? "Genuine: the desk clears them" : v === "watch" ? "A pattern is forming" : "Drag to link accounts"}
        </p>
        <p className="mt-1 text-sm text-ink-2">
          {v === "person"
            ? "More than 10 linked accounts: orders are held automatically, the credit freeze goes to the partner bank, and an analyst decides."
            : v === "clear"
              ? "The agent weighs fraud against innocent reasons, like a family on one phone or a busy shared rental house. A blunt shared-device rule would have blocked them; the desk does not."
              : v === "watch"
                ? "Still under the line. Keep following the links."
                : "Each shared device ties accounts together. Drag the slider to follow them."}
        </p>
      </div>
    </VizFigure>
  );
}
