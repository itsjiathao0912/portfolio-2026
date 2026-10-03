"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import { cn } from "@/lib/utils";
import type { CaseBlockProps } from "../types";
import { Pills, Toggle } from "./ui";

// Deck p.7: who decides each action, and the limit. Deck p.4: more than 10 accounts, or a novel case, goes to a person.
export const PERSON_THRESHOLD = 10;
export const ACTIONS = [
  { value: "stepup", label: "Step-up verification", owner: "agent", limit: "OTP for low risk, face match for high risk" },
  { value: "hold", label: "Hold an order or reserve part of a payout", owner: "agent", limit: "Expires within 3 working days, then released or escalated" },
  { value: "limit", label: "Cut a limit or freeze credit", owner: "bank", limit: "The bank is the lender; the agent recommends with evidence" },
] as const;
type ActionId = (typeof ACTIONS)[number]["value"];

export interface RouteInput { action: ActionId; accounts: number; novel: boolean; killSwitch: boolean }

/** Pure routing, mirrored from the deck's permission table. The guard is code; the agent never gets a vote here. */
export function route(i: RouteInput) {
  const a = ACTIONS.find((x) => x.value === i.action)!;
  if (i.accounts > PERSON_THRESHOLD || i.novel) {
    return { who: "person", reason: i.novel ? "A novel case always goes to a person. The analyst decides before seeing the AI's call." : `Touches more than ${PERSON_THRESHOLD} accounts, so a person decides. The analyst decides before seeing the AI's call.`, limit: a.limit } as const;
  }
  if (i.killSwitch) {
    return { who: "recommend", reason: "Kill switch is on: the agent drops to recommend-only mode, so nothing happens until a person acts.", limit: a.limit } as const;
  }
  if (a.owner === "bank") return { who: "bank", reason: a.limit, limit: a.limit } as const;
  return { who: "agent", reason: a.limit, limit: a.limit } as const;
}

const WHO = {
  agent: { title: "Agent alone", tint: "bg-tint-mint" },
  bank: { title: "Partner bank decides", tint: "bg-tint-butter" },
  person: { title: "A person decides", tint: "bg-tint-peach" },
  recommend: { title: "Recommend-only: waits for a person", tint: "bg-tint-peach" },
} as const;

/** The reader plays the policy guard: propose an action, see who is allowed to take it. */
export function ActionDesk({ source }: CaseBlockProps) {
  const [action, setAction] = useState<ActionId>("hold");
  const [accounts, setAccounts] = useState(4);
  const [novel, setNovel] = useState(false);
  const [killSwitch, setKillSwitch] = useState(false);
  const r = route({ action, accounts, novel, killSwitch });
  const w = WHO[r.who];
  return (
    <VizFigure
      kind="guardline-action-desk"
      title="Who is allowed to take this action?"
      badge="Design, not production"
      caption="The agent proposes; the guard (code, not AI) decides who may act. The account count here is a control you set, not data from the build."
      source={source}
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-ink-1">The agent proposes</p>
        <Pills label="Proposed action" options={ACTIONS} value={action} onChange={setAction} />
        <label className="mt-2 flex flex-col gap-2 text-sm font-semibold text-ink-1">
          <span>
            Accounts the action touches: <span data-testid="desk-accounts">{accounts}</span>
          </span>
          <input
            type="range"
            min={1}
            max={20}
            value={accounts}
            onChange={(e) => setAccounts(Number(e.target.value))}
            aria-valuetext={`${accounts} accounts`}
            className="h-11 w-full accent-[var(--color-ink-1)] focus-visible:outline-2 focus-visible:outline-offset-2"
          />
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          <Toggle label="The case matches no known pattern (novel)" on={novel} onChange={setNovel} />
          <Toggle label="Kill switch pulled" on={killSwitch} onChange={setKillSwitch} onText="On" offText="Off" />
        </div>
      </div>
      <div aria-live="polite" data-testid="desk-verdict" className={cn("rounded-2xl p-5 transition-colors motion-reduce:transition-none", w.tint)}>
        <p className="text-2xl font-semibold text-ink-1">{w.title}</p>
        <p className="mt-1 text-sm text-ink-2">{r.reason}</p>
      </div>
    </VizFigure>
  );
}
