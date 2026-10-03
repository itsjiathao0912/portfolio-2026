"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { VizFigure } from "@/components/dataviz/viz-figure";
import type { CaseBlockProps } from "../types";

const MIN_DAYS = 15;

/** Reader plays the HR admin: types an annual-leave allowance, COSAP blocks anything under the legal floor. */
export function LeaveGuard({ source }: CaseBlockProps) {
  const [raw, setRaw] = useState("8");
  const days = raw === "" ? null : Number(raw);
  const blocked = days !== null && Number.isFinite(days) && days < MIN_DAYS;
  const saved = days !== null && Number.isFinite(days) && days >= MIN_DAYS;

  return (
    <VizFigure
      kind="cosap-leave-guard"
      title="Write a leave policy. Try to break the law."
      badge="Company example"
      caption="You are the HR admin for a Korean team. Type an annual-leave allowance for staff with a year of service. The rule below is the one shown in the COSAP launch deck."
      source={source}
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-3 text-sm text-ink-2">
          <label htmlFor="cosap-leave" className="font-medium text-ink-1">Annual leave (days)</label>
          <input
            id="cosap-leave"
            inputMode="numeric"
            type="number"
            min={0}
            max={60}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            aria-describedby="cosap-leave-result"
            aria-invalid={blocked}
            className={cn(
              "rounded-lg border bg-bg px-3 py-2 text-lg text-ink-1 transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2",
              blocked ? "border-red-400 bg-red-50" : saved ? "border-emerald-400" : "border-hairline",
            )}
          />
          <div className="flex gap-2">
            {[8, 15].map((n) => (
              <button key={n} type="button" onClick={() => setRaw(String(n))} className="min-h-11 rounded-full border border-hairline px-4 text-ink-1 hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2">
                Try {n}
              </button>
            ))}
          </div>
        </div>
        <div id="cosap-leave-result" role="status" aria-live="polite" className="min-h-[9rem] rounded-2xl border border-hairline bg-bg p-5 text-sm">
          {days === null && <p className="text-ink-2">Waiting for a number.</p>}
          {blocked && (
            <div className="flex flex-col gap-2">
              <span className="w-fit rounded-full border border-red-200 bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">BLOCKED</span>
              <p className="font-medium text-ink-1">Labor Standards Act §60</p>
              <p className="text-ink-2">Employees with at least one year of service in Korea need a minimum of {MIN_DAYS} days. The policy cannot be saved at {days}.</p>
            </div>
          )}
          {saved && (
            <div className="flex flex-col gap-2">
              <span className="w-fit rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">SAVED</span>
              <p className="font-medium text-ink-1">Policy deployed.</p>
              <p className="text-ink-2">It now shows in each Korean employee&apos;s Telegram portal. The check happened before the save, not in an audit afterwards.</p>
            </div>
          )}
        </div>
      </div>
    </VizFigure>
  );
}
