"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import { cn } from "@/lib/utils";
import type { CaseBlockProps } from "../types";
import { Pills, Toggle } from "./ui";

// Deck p.5: the investigator's JSON verdict (demo data) and its self-check. Deck p.6: novel:true limits the guard to mild, reversible actions.
export const KNOWN_RECORDS = ["dev_2211", "ord_88410", "shop_517"] as const;
export const FORGED_ID = "ord_99999";
export const FIELDS = [
  { value: "decision", label: "decision", note: "A recommendation, never an action. The agent never acts itself; the guard decides what happens." },
  { value: "pattern", label: "pattern", note: "The named fraud pattern the agent believes it found. Here, a shop colluding on cash-outs." },
  { value: "scores", label: "risk · confidence · novel", note: "Demo-data values. If novel is true, the case matches no known pattern, and the guard allows only mild, reversible actions and escalates." },
  { value: "evidence", label: "evidence", note: "Every claim cites a real record ID. The code guard checks each one exists before anything happens." },
  { value: "report_vi", label: "report_vi", note: "A Vietnamese case report for the analyst, written from the cited evidence." },
] as const;
type Field = (typeof FIELDS)[number]["value"];

/** The self-check: every cited record must exist, or the agent retries, then escalates. */
export function selfCheck(evidence: readonly string[]) {
  const missing = evidence.filter((id) => !(KNOWN_RECORDS as readonly string[]).includes(id));
  return { ok: missing.length === 0, missing } as const;
}

/** Reader inspects each field of the verdict, then forges a citation to watch the guard refuse it. */
export function VerdictCheck({ source }: CaseBlockProps) {
  const [field, setField] = useState<Field>("evidence");
  const [forged, setForged] = useState(false);
  const evidence = forged ? ["dev_2211", FORGED_ID, "shop_517"] : [...KNOWN_RECORDS];
  const check = selfCheck(evidence);
  const note = FIELDS.find((f) => f.value === field)!.note;
  const hl = (f: Field) => (field === f ? "rounded bg-tint-butter px-1 text-ink-1" : "px-1");
  return (
    <VizFigure
      kind="guardline-verdict"
      title="Read the agent's verdict, then try to fool the guard"
      badge="Demo data"
      caption="The example verdict from the deck. The tamper switch is mine, to show the self-check; the deck says only that a missing record means retry, then escalate."
      source={source}
    >
      <Pills label="Field to explain" options={FIELDS} value={field} onChange={setField} />
      <pre className="overflow-x-auto rounded-2xl bg-bg p-4 text-xs leading-6 text-ink-2 sm:text-sm" aria-label="Agent verdict, JSON">
        <code>
          {"{\n"}
          {"  "}<span className={hl("decision")}>{'"decision": "hold_and_escalate"'}</span>{",\n"}
          {"  "}<span className={hl("pattern")}>{'"pattern": "cash_out_colluding_shop"'}</span>{",\n"}
          {"  "}<span className={hl("scores")}>{'"risk": 0.91, "confidence": 0.88, "novel": false'}</span>{",\n"}
          {"  "}<span className={hl("evidence")}>{`"evidence": [${evidence.map((e) => `"${e}"`).join(", ")}]`}</span>{",\n"}
          {"  "}<span className={hl("report_vi")}>{'"report_vi": "14 tài khoản, 3 thiết bị …"'}</span>{"\n}"}
        </code>
      </pre>
      <p aria-live="polite" className="rounded-2xl bg-canvas p-4 text-sm text-ink-2">{note}</p>
      <Toggle label={`Tamper: cite a record that doesn't exist (${FORGED_ID})`} on={forged} onChange={setForged} />
      <div aria-live="polite" data-testid="verdict-guard" className={cn("rounded-2xl p-5 transition-colors motion-reduce:transition-none", check.ok ? "bg-tint-mint" : "bg-tint-peach")}>
        <p className="text-2xl font-semibold text-ink-1">{check.ok ? "Every citation checks out: handed to the guard" : "Citation not found: the agent must retry"}</p>
        <p className="mt-1 text-sm text-ink-2">
          {check.ok ? "Only then does the policy guard weigh the recommendation." : `${check.missing.join(", ")} is not a real record. The agent retries, then escalates; nothing is acted on.`}
        </p>
      </div>
    </VizFigure>
  );
}
