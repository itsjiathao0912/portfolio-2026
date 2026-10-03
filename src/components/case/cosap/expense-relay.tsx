"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { VizFigure } from "@/components/dataviz/viz-figure";
import type { CaseBlockProps } from "../types";

type Lang = "vi" | "en";

const STEPS = [
  { who: "Employee", label: "Snap and submit", detail: "A photo of the receipt in Telegram, plus a note." },
  { who: "Auto", label: "AI reads the receipt", detail: "Vendor, amount, date and tax ID are extracted and mapped to a category and account code." },
  { who: "Manager", label: "Approval request", detail: "The manager gets a message with amount, requester and policy in view." },
  { who: "Manager", label: "One-tap approval", detail: "No web login. The audit trail is recorded automatically." },
  { who: "Auto", label: "Journal entry posted", detail: "Tagged to the cost center and period." },
] as const;

const TEXT: Record<Lang, { name: string; role: string; note: string; hint: string }> = {
  vi: { name: "Linh", role: "Vietnam office", note: "đi ăn với đối tác", hint: "Linh wrote this justification in Vietnamese." },
  en: { name: "Kim", role: "Seoul HQ", note: "Dining with partners", hint: "Kim reads the same entry in English." },
};

/** Reader flips between two offices and approves one expense; the pipeline finishes. */
export function ExpenseRelay({ source }: CaseBlockProps) {
  const [lang, setLang] = useState<Lang>("en");
  const [done, setDone] = useState(false);
  const active = done ? 5 : 2;
  const t = TEXT[lang];

  return (
    <VizFigure
      kind="cosap-expense-relay"
      title="Approve one expense, in your language"
      badge="Company example"
      caption="One card transaction, two offices. Switch who is reading, then approve it as the manager."
      source={source}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div role="group" aria-label="Reader" className="flex w-fit gap-1 rounded-full border border-hairline bg-bg p-1">
            {(["vi", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
                className={cn("min-h-11 rounded-full px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2", lang === l ? "bg-ink-1 text-canvas" : "text-ink-2")}
              >
                {TEXT[l].name} · {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-hairline bg-bg p-5 text-sm">
            <p className="font-medium text-ink-1">GS Caltex Hannam</p>
            <p className="text-ink-2">₩72,000 · 2026-04-18 10:00 · hana_card</p>
            <p className="mt-4 text-xs uppercase tracking-wide text-ink-2">{t.role}</p>
            <p aria-live="polite" className="text-lg text-ink-1">“{t.note}”</p>
            <p className="mt-1 text-ink-2">{t.hint}</p>
          </div>
          <button
            type="button"
            onClick={() => setDone((d) => !d)}
            className="min-h-11 w-fit rounded-full bg-ink-1 px-5 text-sm font-medium text-canvas focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {done ? "Reset" : "Approve as manager"}
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <ol className="flex flex-col gap-2">
            {STEPS.map((s, i) => (
              <li
                key={s.label}
                aria-current={i === active ? "step" : undefined}
                className={cn("rounded-md border px-4 py-3 text-sm transition-colors motion-reduce:transition-none", i < active ? "border-emerald-300 bg-emerald-50 text-ink-1" : i === active ? "border-ink-1 bg-bg text-ink-1" : "border-hairline text-ink-2")}
              >
                <span className="font-medium">{i + 1}. {s.label}</span> <span className="text-xs uppercase tracking-wide">{s.who}</span>
                <span className="block text-ink-2">{s.detail}</span>
              </li>
            ))}
          </ol>
          <p role="status" aria-live="polite" className="min-h-10 text-sm text-ink-2">
            {done ? "Posted. COSAP reports an average of 2m 47s from receipt to ledger, down from about 3 days by email and manual entry." : "Waiting on the manager. Steps 1 and 2 happened on their own."}
          </p>
        </div>
      </div>
    </VizFigure>
  );
}
