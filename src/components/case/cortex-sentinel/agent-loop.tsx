"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import { cn } from "@/lib/utils";
import type { CaseBlockProps } from "../types";
import { Toggle } from "./ui";

// Deck p.5 (the example prompt and AST), p.6 (rewrite up to 3×), p.13 (two chained calls, validate, human saves).
export const PROMPT = "Flag transfers of 9,000–10,000 into a high-risk corridor";
export const AST = 'And( ≥(amount, 9000), <(amount, 10000), In(corridor, ["US-VN","DE-CN","GB-IN"]) )';
export const MAX_REWRITES = 3;
export const STAGES = [
  { id: "plan", label: "Plan", text: "First model call drafts a rule plan in plain language, with reasoning switched on." },
  { id: "ground", label: "Ground", text: "The plan is grounded in the bank's own data model, custom lists and trigger type." },
  { id: "generate", label: "Draft", text: "Second model call emits a typed rule tree (AST), not free text." },
  { id: "validate", label: "Validate", text: "The server checks the tree against the scenario and returns is_valid, errors and warnings." },
  { id: "human", label: "Human saves", text: "Nothing is saved by the agent. A person reviews the rule and presses save." },
] as const;

type Phase = { stage: number; attempt: number; failed: boolean; saved: boolean };
const START: Phase = { stage: -1, attempt: 1, failed: false, saved: false };

/** Pure step function, exported for tests: how many invalid drafts the reader asked for drives the loop. */
export function step(p: Phase, badDrafts: number): Phase {
  if (p.saved) return p;
  const validate = STAGES.findIndex((s) => s.id === "validate");
  if (p.stage === validate && !p.failed && p.attempt <= badDrafts && p.attempt <= MAX_REWRITES) return { ...p, failed: true };
  if (p.failed) return { ...p, stage: STAGES.findIndex((s) => s.id === "generate"), attempt: p.attempt + 1, failed: false };
  return { ...p, stage: Math.min(p.stage + 1, STAGES.length - 1) };
}

/** Reader steps the rule-authoring agent through its loop, optionally breaking the first draft. */
export function AgentLoop({ source }: CaseBlockProps) {
  const [broken, setBroken] = useState(true);
  const [p, setP] = useState<Phase>(START);
  const atHuman = STAGES[p.stage]?.id === "human";
  const current = p.stage >= 0 ? STAGES[p.stage] : null;
  return (
    <VizFigure
      kind="cortex-agent-loop"
      title="Write a rule in plain English, then watch the agent check its own work"
      badge="Live in product"
      caption="An invalid draft never reaches a person: the errors go back to the model and it rewrites, up to three times. The prompt and rule are the deck's illustrative example."
      source={source}
    >
      <div className="rounded-2xl border border-hairline bg-bg p-4">
        <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Analyst types</p>
        <p className="mt-1 text-base text-ink-1">“{PROMPT}”</p>
      </div>
      <Toggle label="Make the first draft invalid" on={broken} onChange={(v) => { setBroken(v); setP(START); }} />
      <ol className="grid grid-cols-5 gap-1 sm:gap-2" aria-label="Agent stages">
        {STAGES.map((s, i) => {
          const done = i < p.stage || p.saved;
          const here = i === p.stage && !p.saved;
          return (
            <li
              key={s.id}
              aria-current={here ? "step" : undefined}
              className={cn(
                "rounded-md border px-1.5 py-2 text-[11px] leading-tight break-words sm:rounded-2xl sm:px-3 sm:py-3 sm:text-sm transition-colors motion-reduce:transition-none",
                here && p.failed ? "border-danger bg-danger/10 text-ink-1" : here ? "border-ink-1 bg-ink-1 text-white" : done ? "border-hairline bg-tint-mint text-ink-1" : "border-hairline bg-bg text-ink-3",
              )}
            >
              <span className="block text-xs opacity-70">{i + 1}</span>
              <span className="font-semibold">{s.label}</span>
            </li>
          );
        })}
      </ol>
      <div className="min-h-24 rounded-2xl bg-bg p-4 text-sm text-ink-2" aria-live="polite" data-testid="agent-loop-status">
        {p.saved ? (
          <p className="text-ink-1"><strong>Saved by a person.</strong> The rule now goes to a shadow test before anyone can publish it.</p>
        ) : !current ? (
          <p>Press “Next step” to run the agent.</p>
        ) : p.failed ? (
          <p className="text-ink-1"><strong>Draft {p.attempt} rejected.</strong> {"{ is_valid: false, errors }"} goes back to the model. Rewrite {p.attempt} of {MAX_REWRITES}.</p>
        ) : (
          <>
            <p>{current.text}</p>
            {current.id === "generate" || current.id === "validate" || atHuman ? (
              <code className="mt-3 block overflow-x-auto rounded-md bg-ink-1 px-3 py-2 text-xs text-white">{AST}</code>
            ) : null}
            {current.id === "validate" ? <p className="mt-2 text-ink-1">Draft {p.attempt} is valid.</p> : null}
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {atHuman && !p.saved ? (
          <button type="button" onClick={() => setP({ ...p, saved: true })} className="min-h-11 rounded-full bg-accent px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2">
            Save rule (you are the analyst)
          </button>
        ) : (
          <button type="button" disabled={p.saved} onClick={() => setP(step(p, broken ? 1 : 0))} className="min-h-11 rounded-full bg-ink-1 px-5 text-sm font-semibold text-white disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2">
            Next step
          </button>
        )}
        <button type="button" onClick={() => setP(START)} className="min-h-11 rounded-full border border-hairline px-5 text-sm font-semibold text-ink-2 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2">
          Reset
        </button>
      </div>
    </VizFigure>
  );
}
