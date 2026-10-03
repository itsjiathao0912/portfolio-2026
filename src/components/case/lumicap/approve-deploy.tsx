"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { VizFigure } from "@/components/dataviz/viz-figure";
import type { CaseBlockProps } from "../types";
import { databaseView, nextPhase, SIGNING_STAGES, thresholdMet, type ApproverId } from "./logic";

const DEMO_CODE = "246810";

/** Play approver one of three: your approval alone moves nothing, and nothing signs until two are in. */
export function ApproveDeploy({ source }: CaseBlockProps) {
  const [approved, setApproved] = useState<ApproverId[]>([]);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [stage, setStage] = useState(-1);
  const [signed, setSigned] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const phase = nextPhase(approved, signed);
  const db = databaseView(approved);
  const youIn = approved.includes("you");

  function approve() {
    if (code !== DEMO_CODE) {
      setError(`Enter the demo code ${DEMO_CODE}.`);
      return;
    }
    setError("");
    setApproved((a) => (a.includes("you") ? a : [...a, "you"]));
  }
  function other(id: "b" | "c") {
    if (!youIn) return;
    setApproved((a) => (a.includes(id) ? a : [...a, id]));
  }
  function execute() {
    if (!thresholdMet(approved)) return;
    SIGNING_STAGES.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStage(i), 450 * (i + 1)));
    });
    timers.current.push(setTimeout(() => setSigned(true), 450 * (SIGNING_STAGES.length + 1)));
  }
  function reset() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setApproved([]);
    setCode("");
    setError("");
    setStage(-1);
    setSigned(false);
  }

  const busy = stage >= 0 && !signed;

  return (
    <VizFigure
      kind="lumicap-approve-deploy"
      title="You are one of three approvers. Deploy this fund."
      badge="Illustrative simulation"
      caption="Approving is only a record. The keys are used once, in one step, after the second approval, and then they are cleared. Demo code and approvers are made up; the flow follows the deck."
      source={source}
    >
      <ol className="grid gap-3 sm:grid-cols-3" aria-label="Approvers">
        {(["you", "b", "c"] as const).map((id, i) => {
          const done = approved.includes(id);
          return (
            <li key={id} className={cn("rounded-xl border p-4 transition-colors", done ? "border-success" : "border-hairline bg-bg")} style={done ? { backgroundColor: "var(--tint-mint)" } : undefined}>
              <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Approver {i + 1}{id === "you" ? " (you)" : ""}</p>
              <p className="mt-1 text-sm font-semibold text-ink-1">{done ? "Approved" : id === "you" ? "Waiting for you" : youIn ? "Not yet signed" : "Waits for you first"}</p>
              {id !== "you" && !done ? (
                <button type="button" onClick={() => other(id)} disabled={!youIn} className="mt-3 w-full rounded-full border border-border-strong px-3 py-2 text-sm font-semibold text-ink-1 transition-colors enabled:hover:bg-canvas disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                  Ask them to approve
                </button>
              ) : null}
            </li>
          );
        })}
      </ol>

      {!youIn ? (
        <div className="flex flex-col gap-2 rounded-xl border border-hairline bg-bg p-4 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm text-ink-2">
            Approval two-factor code (second factor, after your login)
            <input inputMode="numeric" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder={DEMO_CODE} aria-describedby="lc-code-hint" className="rounded-lg border border-border-strong bg-bg px-3 py-2 font-mono text-ink-1 focus-visible:outline-2 focus-visible:outline-accent" />
          </label>
          <button type="button" onClick={approve} className="rounded-full bg-ink-1 px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            Approve deploy
          </button>
          <p id="lc-code-hint" className="text-xs text-ink-3 sm:basis-full" aria-live="polite">{error || `Demo code: ${DEMO_CODE}`}</p>
        </div>
      ) : null}

      <div className="rounded-xl border border-hairline bg-bg p-4" aria-live="polite">
        <p className="text-sm font-semibold text-ink-1">
          {phase === "requested" && "A fund admin has requested the deploy. Nothing can happen yet."}
          {phase === "collecting" && `${approved.length} of 3 approved. One more is needed: the keys are still locked away.`}
          {phase === "signing" && !busy && "Threshold met (2 of 3). Signing has not happened yet."}
          {busy && "Signing, in one atomic step…"}
          {phase === "deployed" && "Deployed. The signature was never stored, and the keys are cleared."}
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {SIGNING_STAGES.map((s, i) => (
            <li key={s.id} className={cn("rounded-lg border px-3 py-2 text-sm transition-opacity", i <= stage || signed ? "border-ink-1 opacity-100" : "border-hairline opacity-45")}>
              <span className="font-semibold text-ink-1">{s.label}</span>
              <span className="block text-ink-3">{s.detail}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={execute} disabled={!thresholdMet(approved) || busy || signed} className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors enabled:hover:bg-accent-hover disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            Run signing
          </button>
          <button type="button" onClick={reset} className="rounded-full px-3 py-2 text-sm font-semibold text-ink-2 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent">
            Start over
          </button>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="What the database holds">
        {[
          ["Deploy request", db.request],
          ["Approval records", db.approvalRecords],
          ["Signatures stored", db.signatures],
          ["Private keys stored", db.privateKeys],
        ].map(([label, n]) => (
          <div key={label as string} className="rounded-xl border border-hairline bg-bg p-3">
            <dt className="text-xs font-semibold tracking-wide text-ink-3 uppercase">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold text-ink-1">{n}</dd>
          </div>
        ))}
      </dl>
    </VizFigure>
  );
}
