"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import { cn } from "@/lib/utils";
import type { CaseBlockProps } from "../types";
import { Pills } from "./ui";

// Deck p.8: the demo ring is 14 accounts sharing devices (the verdict on p.5 cites 3 devices). Deck p.4/p.7: more than 10 accounts goes to a person.
export const RING_ACCOUNTS = 14;
export const PERSON_THRESHOLD = 10;
// Illustrative split of the 14 accounts across 3 devices. The deck gives only the totals.
export const RING_DEVICES = [
  { id: "dev_a", accounts: 5 },
  { id: "dev_b", accounts: 5 },
  { id: "dev_c", accounts: 4 },
] as const;
// Illustrative decoy: one shared phone. The deck says a family on one phone (or a busy nhà trọ) is cleared by the desk.
export const DECOY_DEVICES = [{ id: "dev_family", accounts: 3 }] as const;

export const MODES = [
  { value: "ring", label: "The ring" },
  { value: "decoy", label: "The decoy: a family on one phone" },
] as const;
type Mode = (typeof MODES)[number]["value"];

export function linkedCount(devices: readonly { id: string; accounts: number }[], opened: readonly string[]) {
  return devices.filter((d) => opened.includes(d.id)).reduce((n, d) => n + d.accounts, 0);
}
export function verdict(mode: Mode, linked: number) {
  if (linked > PERSON_THRESHOLD) return "person" as const;
  return linked === 0 ? ("idle" as const) : mode === "decoy" ? ("clear" as const) : ("watch" as const);
}

/** Reader opens devices one by one; accounts light up, and past 10 the case goes to a person. */
export function RingUnmask({ source }: CaseBlockProps) {
  const [mode, setMode] = useState<Mode>("ring");
  const [opened, setOpened] = useState<string[]>([]);
  const devices = mode === "ring" ? RING_DEVICES : DECOY_DEVICES;
  const linked = linkedCount(devices, opened);
  const total = devices.reduce((n, d) => n + d.accounts, 0);
  const v = verdict(mode, linked);
  const toggle = (id: string) => setOpened((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  return (
    <VizFigure
      kind="guardline-ring"
      title="No single order shows it. Follow the devices."
      badge="Illustrative layout"
      caption="Every order looks normal alone; the link only shows across accounts and devices. The deck gives 14 accounts for the demo ring; how they split across devices here is illustrative."
      source={source}
    >
      <Pills label="Scenario" options={MODES} value={mode} onChange={(m) => { setMode(m); setOpened([]); }} />
      <div className="grid gap-4 sm:grid-cols-3">
        {devices.map((d) => {
          const on = opened.includes(d.id);
          return (
            <div key={d.id} className="flex flex-col gap-2 rounded-2xl bg-bg p-3">
              <button
                type="button"
                aria-pressed={on}
                onClick={() => toggle(d.id)}
                className={cn(
                  "min-h-11 rounded-xl border px-3 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                  on ? "border-ink-1 bg-ink-1 text-white" : "border-hairline bg-bg text-ink-1 hover:border-border-strong",
                )}
              >
                <span className="block">{mode === "decoy" ? "Shared phone" : `Device ${d.id.slice(-1).toUpperCase()}`}</span>
                <span className="block text-xs font-normal opacity-80">{on ? `${d.accounts} accounts linked` : "Tap to see who uses it"}</span>
              </button>
              <div className="flex flex-wrap gap-1.5" aria-hidden>
                {Array.from({ length: d.accounts }, (_, i) => (
                  <span key={i} className={cn("size-5 rounded-full border transition-colors motion-reduce:transition-none", on ? "border-transparent " + (mode === "decoy" ? "bg-success" : "bg-danger") : "border-hairline bg-canvas")} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-ink-2">
        Accounts linked so far: <strong data-testid="ring-linked" className="text-ink-1">{linked}</strong> of {total}. A person decides above {PERSON_THRESHOLD}.
      </p>
      <div aria-live="polite" data-testid="ring-verdict" className={cn("rounded-2xl p-5 transition-colors motion-reduce:transition-none", v === "person" ? "bg-tint-peach" : v === "clear" ? "bg-tint-mint" : "bg-canvas")}>
        <p className="text-2xl font-semibold text-ink-1">
          {v === "person" ? "Hold the orders, escalate to a person" : v === "clear" ? "Genuine: the desk clears them" : v === "watch" ? "A pattern is forming" : "Open a device to start"}
        </p>
        <p className="mt-1 text-sm text-ink-2">
          {v === "person"
            ? "More than 10 linked accounts: orders are held automatically, the credit freeze goes to the partner bank, and an analyst decides."
            : v === "clear"
              ? "The agent weighs fraud against innocent reasons, like a shared rental house. A blunt shared-device rule would have blocked them; the desk does not."
              : v === "watch"
                ? "Still under the line. Keep following the links."
                : "Each device is shared by several accounts. Tap them one at a time."}
        </p>
      </div>
    </VizFigure>
  );
}
