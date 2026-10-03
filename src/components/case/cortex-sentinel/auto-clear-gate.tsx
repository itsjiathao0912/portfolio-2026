"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import { cn } from "@/lib/utils";
import type { CaseBlockProps } from "../types";
import { Pills, Toggle } from "./ui";

// Deck p.3 / p.16: on 2,000 resolved alerts, some classes were cleared every time; kyt_high_exposure split ≈ 53/52.
export const ALERT_CLASSES = [
  { value: "noise", label: "A class analysts cleared 10 times out of 10", lowBand: true },
  { value: "coinflip", label: "kyt_high_exposure (split ≈ 53 / 52)", lowBand: false },
] as const;
// Deck p.19: the precedent vote needs at least 3 cleared and 0 escalated neighbours.
export const MIN_CLEARED = 3;
export const PRECEDENTS = [
  { value: "4-0", label: "4 cleared · 0 escalated", cleared: 4, escalated: 0 },
  { value: "2-0", label: "2 cleared · 0 escalated", cleared: 2, escalated: 0 },
  { value: "4-1", label: "4 cleared · 1 escalated", cleared: 4, escalated: 1 },
] as const;

type Cls = (typeof ALERT_CLASSES)[number]["value"];
type Prec = (typeof PRECEDENTS)[number]["value"];
export interface GateInput { cls: Cls; prec: Prec; sanctions: boolean; travelRuleIncomplete: boolean; scorerUp: boolean }

/** The fail-closed gate, exported for tests. Every check must pass; anything else goes to a person. */
export function decide(i: GateInput) {
  const cls = ALERT_CLASSES.find((c) => c.value === i.cls)!;
  const prec = PRECEDENTS.find((p) => p.value === i.prec)!;
  const checks = [
    { label: "Scorer and model available", pass: i.scorerUp, why: "If the scorer or model is down, nothing is auto-cleared." },
    { label: "Score lands in the low-risk band", pass: i.scorerUp && cls.lowBand, why: "A class that splits down the middle is a call only a human should make." },
    { label: `Precedent vote: ≥ ${MIN_CLEARED} cleared, 0 escalated`, pass: i.scorerUp && prec.cleared >= MIN_CLEARED && prec.escalated === 0, why: "One escalated look-alike is enough to stop." },
    { label: "Guard: no sanctions match", pass: !i.sanctions, why: "Anything touching sanctions is never auto-closed." },
    { label: "Guard: Travel Rule message complete", pass: !i.travelRuleIncomplete, why: "An incomplete Travel Rule message fails closed." },
  ];
  return { checks, autoClear: checks.every((c) => c.pass) } as const;
}

/** Reader plays the gate: change the alert and its context, see whether the machine may close it. */
export function AutoClearGate({ source }: CaseBlockProps) {
  const [cls, setCls] = useState<Cls>("noise");
  const [prec, setPrec] = useState<Prec>("4-0");
  const [sanctions, setSanctions] = useState(false);
  const [travel, setTravel] = useState(false);
  const [scorerUp, setScorerUp] = useState(true);
  const { checks, autoClear } = decide({ cls, prec, sanctions, travelRuleIncomplete: travel, scorerUp });
  return (
    <VizFigure
      kind="cortex-auto-clear"
      title="Can the machine close this alert on its own?"
      badge="Prototyped offline"
      caption="The model only recommends. A fixed, auditable gate decides, and every check has to agree. Two of the gate's guard blocks are shown here; the precedent counts are illustrative settings for the deck's rule."
      source={source}
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-ink-1">The alert</p>
        <Pills label="Alert class" options={ALERT_CLASSES} value={cls} onChange={setCls} />
        <p className="mt-2 text-sm font-semibold text-ink-1">Similar past cases the system retrieves</p>
        <Pills label="Precedents" options={PRECEDENTS} value={prec} onChange={setPrec} />
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <Toggle label="Counterparty hits a sanctions list" on={sanctions} onChange={setSanctions} />
          <Toggle label="Travel Rule data missing" on={travel} onChange={setTravel} />
          <Toggle label="Scorer online" on={scorerUp} onChange={setScorerUp} onText="Up" offText="Down" />
        </div>
      </div>
      <ul className="flex flex-col gap-2" aria-label="Gate checks">
        {checks.map((c) => (
          <li key={c.label} className="flex items-start gap-3 rounded-2xl bg-bg px-4 py-3 text-sm">
            <span aria-hidden className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-xs font-bold text-white", c.pass ? "bg-success" : "bg-danger")}>{c.pass ? "✓" : "✕"}</span>
            <span>
              <span className="font-semibold text-ink-1">{c.label}</span>
              <span className="sr-only">{c.pass ? ": passes" : ": fails"}</span>
              {!c.pass ? <span className="block text-ink-2">{c.why}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      <div
        aria-live="polite"
        data-testid="gate-verdict"
        className={cn("rounded-2xl p-5 transition-colors motion-reduce:transition-none", autoClear ? "bg-tint-mint" : "bg-tint-peach")}
      >
        <p className="text-2xl font-semibold text-ink-1">{autoClear ? "Auto-cleared, with a written rationale" : "Sent to an analyst"}</p>
        <p className="mt-1 text-sm text-ink-2">
          {autoClear ? "The clear is logged with its reason codes and stays replayable for the regulator." : "When in doubt, the system says “we don't know” and a person decides."}
        </p>
      </div>
      <p className="text-sm text-ink-2">
        On the backtest corpus this gate auto-closed <strong className="text-ink-1">6.5%</strong> of alerts, with <strong className="text-ink-1">0</strong> true positives among them. Backtest on sample data, not production.
      </p>
    </VizFigure>
  );
}
