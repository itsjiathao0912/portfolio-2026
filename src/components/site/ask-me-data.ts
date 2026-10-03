// "Ask me about..." starters. Every topic comes from a figure or fact already
// published in content/ (COSAP -83% company figure, Ledgr 27 seeded rules,
// Cortex Sentinel 2nd place at AABW 2026, GoCrypto Gulf corridor). No new numbers.

import type { RoleId } from "@/lib/visitor-role-adapter";

export type Starter = { id: string; label: string; subject: string };

const ALL = {
  po: { id: "po", label: "how we cut PO errors 83%", subject: "Question: how did you cut purchase-order errors by 83%?" },
  rules: { id: "rules", label: "how I scoped 27 labour rules", subject: "Question: how did you scope the 27 rules in Ledgr?" },
  gate: { id: "gate", label: "why the AI proposes and humans decide", subject: "Question: Cortex Sentinel, why does the AI propose and a human decide?" },
  gulf: { id: "gulf", label: "why I picked the Gulf remittance corridor", subject: "Question: GoCrypto, why the Gulf corridor?" },
  split: { id: "split", label: "why rules decide and the AI only explains", subject: "Question: Ledgr, why do rules decide and the AI only explain?" },
} as const satisfies Record<string, Starter>;

const NEUTRAL: readonly Starter[] = [ALL.po, ALL.gate, ALL.rules];

const BY_ROLE: Partial<Record<RoleId, readonly Starter[]>> = {
  recruiter: [ALL.po, ALL.rules, ALL.gate],
  founder: [ALL.gulf, ALL.rules, ALL.po],
  investor: [ALL.gulf, ALL.po, ALL.gate],
  engineer: [ALL.split, ALL.gate, ALL.rules],
  data: [ALL.gate, ALL.split, ALL.po],
};

/** Three starters for a role; unknown or missing role gets the neutral set. */
export function startersFor(role: RoleId | null): readonly Starter[] {
  return (role && BY_ROLE[role]) || NEUTRAL;
}

export function starterHref(email: string, starter: Starter) {
  return `mailto:${email}?subject=${encodeURIComponent(starter.subject)}`;
}
