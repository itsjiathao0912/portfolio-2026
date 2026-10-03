"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { VizFigure } from "@/components/dataviz/viz-figure";
import type { CaseBlockProps } from "../types";
import { approveResume, pause, RESUME_NEED, tryTransfer, type PauseState } from "./logic";

const REASONS = ["Suspicious transfer pattern detected", "Contract behaviour under investigation"] as const;

/** The emergency brake: stopping is one decision, restarting takes a quorum. */
export function PauseSwitch({ source }: CaseBlockProps) {
  const [s, setS] = useState<PauseState>({ paused: false, approvals: 0 });
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [log, setLog] = useState<string>("Transfers are flowing.");

  const hit = () => {
    const r = tryTransfer(s);
    setLog(r.ok ? "Transfer went through." : r.reason);
  };

  return (
    <VizFigure
      kind="lumicap-pause-switch"
      title="Pull the emergency brake"
      badge="Illustrative simulation"
      caption="Pausing blocks token transfers until the incident is resolved. The deck's demo confirms the pause and the approvals on the blockchain; here the reasons are made up and nothing is real."
      source={source}
    >
      <div className={cn("rounded-md border p-5 transition-colors", s.paused ? "border-danger" : "border-hairline bg-bg")} style={s.paused ? { backgroundColor: "#fff1f1" } : undefined}>
        <p className="text-lg font-semibold text-ink-1" aria-live="polite">{s.paused ? "PAUSED: all token transfers blocked" : "Running: token transfers allowed"}</p>
        {!s.paused ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1 text-sm text-ink-2">
              Justification
              <select value={reason} onChange={(e) => setReason(e.target.value)} className="rounded-lg border border-border-strong bg-bg px-3 py-2 text-ink-1 focus-visible:outline-2 focus-visible:outline-accent">
                {REASONS.map((r) => (<option key={r}>{r}</option>))}
              </select>
            </label>
            <button type="button" onClick={() => { setS(pause(s, reason)); setLog("Pause confirmed. Transfers are blocked."); }} className="min-h-11 rounded-full bg-danger px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Pause everything</button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-sm text-ink-2">To resume, approvals must collect first: {s.approvals} of {RESUME_NEED}.</p>
            <button type="button" onClick={() => { const n = approveResume(s, "Resolved after review"); setS(n); setLog(n.paused ? "One approval recorded. Still paused." : "Quorum reached. Transfers restored."); }} className="self-start rounded-full bg-ink-1 px-5 py-2.5 text-sm font-semibold text-bg hover:bg-ink-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Add an approval</button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={hit} className="min-h-11 rounded-full border border-border-strong px-5 py-2.5 text-sm font-semibold text-ink-1 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-accent">Try a token transfer</button>
        <p className="text-sm text-ink-2" aria-live="polite">{log}</p>
      </div>
    </VizFigure>
  );
}
