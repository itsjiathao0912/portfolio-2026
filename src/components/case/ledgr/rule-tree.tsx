"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { VizFigure } from "@/components/dataviz/viz-figure";
import type { CaseBlockProps } from "../types";

/** Rule labels translated from the seed migrations (label_vi). */
export const RULE_TREE = [
  { type: "Labour contract", rules: ["Minimum wage, region I", "Minimum wage, region II", "Minimum wage, region III", "Minimum wage, region IV", "Probation max: degree roles", "Probation max: technical roles", "Probation max: other work", "Probation pay floor (85%)", "Overtime per day", "Overtime per year", "Social insurance required", "PIT withheld at source", "Fixed-term renewals", "Normal working hours", "Minimum annual leave"] },
  { type: "PIT finalisation", rules: ["Personal deduction", "Dependent deduction", "Finalisation deadline"] },
  { type: "Vendor service contract", rules: ["Penalty cap", "Payment terms", "Required clauses"] },
  { type: "Accounting voucher", rules: ["Signatory required", "Voucher numbering"] },
  { type: "E-invoice", rules: ["Required fields", "Seller tax code"] },
  { type: "VAT declaration", rules: ["Standard rate", "Filing deadline"] },
] as const;
export const RULE_COUNT = RULE_TREE.reduce((n, t) => n + t.rules.length, 0);

/** Click a document type to open its rules; the roadmap stays visibly unbuilt. */
export function RuleTree({ source }: CaseBlockProps) {
  const [open, setOpen] = useState<string>(RULE_TREE[0].type);
  const max = RULE_TREE[0].rules.length;
  return (
    <VizFigure kind="ledgr-rule-tree" title={`${RULE_COUNT} verified rules, and what each one checks`} badge="Code count" caption="Open a document type to see its rules. Labour contracts carry most of the set. The landing page's 100+ is the goal, shown dashed because it is not built." source={source}>
      <ul className="flex flex-col gap-2">
        {RULE_TREE.map((t) => {
          const isOpen = open === t.type;
          return (
            <li key={t.type}>
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? "" : t.type)} className="grid min-h-11 w-full grid-cols-[10rem_1fr_2rem] items-center gap-3 text-left text-sm text-ink-1 sm:grid-cols-[12rem_1fr_2rem]">
                <span className="font-semibold">{t.type}</span>
                <span className="h-3 rounded-full bg-hairline">
                  <span className={cn("block h-3 rounded-full", isOpen ? "bg-[#1f5bff]" : "bg-[#1f5bff]/50")} style={{ width: `${(t.rules.length / max) * 100}%` }} />
                </span>
                <span className="text-right tabular-nums">{t.rules.length}</span>
              </button>
              {isOpen ? (
                <ul className="mt-2 mb-1 flex flex-wrap gap-1.5 sm:pl-[12.75rem]">
                  {t.rules.map((r) => (
                    <li key={r} className="rounded-full border border-hairline bg-bg px-2.5 py-1 text-xs text-ink-2">{r}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p className="rounded-md border border-dashed border-hairline px-4 py-3 text-sm text-ink-2">
        <span className="font-semibold text-ink-1">Roadmap: 100+ rules.</span> A goal on the landing page, not shipped.
      </p>
    </VizFigure>
  );
}
