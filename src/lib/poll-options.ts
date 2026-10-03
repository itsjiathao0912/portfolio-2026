// Client-safe poll option labels (no server imports). The ids live in
// src/components/site/visitor/role-ids.ts; poll.ts re-exports these.

import type { PollOptionId } from "../components/site/visitor/role-ids";

export const MIN_POLL_VOTES = 20;

// DRAFT labels (Thao to review).
export const POLL_OPTIONS = [
  { id: "compliance-copilot", label: "A compliance copilot for small businesses in Vietnam" },
  { id: "remittance", label: "A cross-border remittance app" },
  { id: "fraud-toolkit", label: "A fraud-detection toolkit for fintechs" },
  { id: "women-in-tech", label: "A community platform for women in tech in Southeast Asia" },
  { id: "backoffice-agent", label: "An AI agent for finance back-office work (reconciliation, invoices, close)" },
  { id: "agent-payments", label: "Safe payments for AI agents (spend limits, approvals, audit trail)" },
] as const satisfies readonly { id: PollOptionId; label: string }[];
