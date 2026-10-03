"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { VizFigure } from "@/components/dataviz/viz-figure";
import type { CaseBlockProps } from "../types";
import { evaluateContract, type ContractFacts, type Level, type Region, type Severity } from "./rules";

export const SEV_STYLE: Record<Severity, { chip: string; label: string }> = {
  red: { chip: "bg-red-100 text-red-800 border-red-200", label: "Fails" },
  amber: { chip: "bg-amber-100 text-amber-900 border-amber-200", label: "Check" },
  green: { chip: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Passes" },
};

/** Fake sample contract, mirroring the "HĐ lao động (có lỗi)" sample in Ledgr's check page. */
const SAMPLE: ContractFacts = { region: "I", monthlyWage: 5_000_000, level: "degree_graduate", probationDays: 90, probationWagePct: 0.7, otHoursPerDay: 3, renewals: 2, bhxhClause: false };

const field = "flex flex-col gap-1.5 text-sm text-ink-2";
const input = "rounded-lg border border-hairline bg-bg px-3 py-2 text-ink-1 focus-visible:outline-2 focus-visible:outline-offset-2";

/** Reader edits a fake labour contract; the rule set re-runs on every change. */
export function ContractCheck({ source }: CaseBlockProps) {
  const [f, setF] = useState<ContractFacts>(SAMPLE);
  const set = <K extends keyof ContractFacts>(k: K, v: ContractFacts[K]) => setF((p) => ({ ...p, [k]: v }));
  const findings = evaluateContract(f);
  const fails = findings.filter((x) => x.severity === "red").length;

  return (
    <VizFigure
      kind="ledgr-contract-check"
      title="Fix the contract yourself"
      badge="Fake sample · real rules"
      caption="The contract is made up and starts with mistakes. The limits and the pass / check / fail logic are Ledgr's own: anything exactly at a legal floor is flagged for a human rather than passed."
      source={source}
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <form className="grid content-start gap-4 self-start sm:grid-cols-2" onSubmit={(e) => e.preventDefault()} aria-label="Sample contract terms">
          <label className={field}>
            Region
            <select className={input} value={f.region ?? ""} onChange={(e) => set("region", (e.target.value || null) as Region)}>
              {(["I", "II", "III", "IV"] as const).map((r) => (
                <option key={r} value={r}>Region {r}</option>
              ))}
              <option value="">Not stated</option>
            </select>
          </label>
          <label className={field}>
            Monthly wage (₫)
            <input className={input} type="number" step={10000} min={0} value={f.monthlyWage} onChange={(e) => set("monthlyWage", Number(e.target.value) || 0)} />
          </label>
          <label className={field}>
            Role level
            <select className={input} value={f.level} onChange={(e) => set("level", e.target.value as Level)}>
              <option value="degree_graduate">College degree or above</option>
              <option value="technical_worker">Technical / vocational</option>
              <option value="other">Other work</option>
            </select>
          </label>
          <label className={field}>
            Probation: {f.probationDays} days
            <input type="range" min={0} max={120} value={f.probationDays} onChange={(e) => set("probationDays", Number(e.target.value))} className="accent-[#1f5bff]" />
          </label>
          <label className={field}>
            Probation pay: {Math.round(f.probationWagePct * 100)}%
            <input type="range" min={50} max={100} value={Math.round(f.probationWagePct * 100)} onChange={(e) => set("probationWagePct", Number(e.target.value) / 100)} className="accent-[#1f5bff]" />
          </label>
          <label className={field}>
            Overtime: {f.otHoursPerDay} h/day
            <input type="range" min={0} max={8} value={f.otHoursPerDay} onChange={(e) => set("otHoursPerDay", Number(e.target.value))} className="accent-[#1f5bff]" />
          </label>
          <label className={field}>
            Renewals: {f.renewals}
            <input type="range" min={0} max={3} value={f.renewals} onChange={(e) => set("renewals", Number(e.target.value))} className="accent-[#1f5bff]" />
          </label>
          <label className="flex items-center gap-2 self-end text-sm text-ink-1">
            <input type="checkbox" checked={f.bhxhClause} onChange={(e) => set("bhxhClause", e.target.checked)} className="size-4 accent-[#1f5bff]" />
            Mentions social insurance
          </label>
          <button type="button" onClick={() => setF(SAMPLE)} className="h-fit justify-self-start rounded-full border border-hairline px-4 py-1.5 text-sm text-ink-2 hover:text-ink-1">
            Reset sample
          </button>
        </form>

        <div>
          <p className="mb-3 text-sm font-semibold text-ink-1" aria-live="polite">
            {fails === 0 ? "No rule fails." : `${fails} of ${findings.length} rules fail.`}
          </p>
          <ul className="flex flex-col gap-2">
            {findings.map((x) => (
              <li key={x.key} className="rounded-xl border border-hairline bg-bg p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-ink-1">{x.label}</span>
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", SEV_STYLE[x.severity].chip)}>{SEV_STYLE[x.severity].label}</span>
                </div>
                <p className="mt-1 text-sm text-ink-2">{x.detail}</p>
                <p className="mt-1 text-xs text-ink-2">
                  {x.citation}
                  {x.trust === "llm_fallback" ? " · not source-backed, needs review" : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </VizFigure>
  );
}
