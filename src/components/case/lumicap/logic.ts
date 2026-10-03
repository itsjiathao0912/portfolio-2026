/**
 * Pure logic behind the Lumicap reading moments. Sources are the Luminet decks
 * (January 2026, private): "How it Works" (lhow) and "Platform Demo" (ldemo).
 * The simulations are illustrative: no real keys, codes or funds are involved.
 */

export const QUORUM_NEED = 2;
export const APPROVERS = ["you", "b", "c"] as const;
export type ApproverId = (typeof APPROVERS)[number];

export type SignPhase = "requested" | "collecting" | "signing" | "deployed";

/** The deploy request is "ready" only when enough distinct approvers have signed off. */
export function thresholdMet(approved: readonly ApproverId[], need = QUORUM_NEED) {
  return new Set(approved).size >= need;
}

export function nextPhase(approved: readonly ApproverId[], signed: boolean): SignPhase {
  if (signed) return "deployed";
  if (thresholdMet(approved)) return "signing";
  return approved.length === 0 ? "requested" : "collecting";
}

/** Stages of the single atomic signing operation (lhow p9). */
export const SIGNING_STAGES = [
  { id: "vault", label: "Vault releases the P-256 keys", detail: "Fetched only now, at execution." },
  { id: "tee", label: "Privy TEE verifies the quorum", detail: "The signature is assembled inside the enclave." },
  { id: "chain", label: "Contract deploys on-chain", detail: "The signed transaction goes out." },
  { id: "clear", label: "Keys are cleared", detail: "Nothing is kept once the transaction is sent." },
] as const;

/**
 * What the platform database holds at each moment. Approvals are plain records;
 * signatures and keys are never stored (lhow p9: "Approvals stored in database are just records").
 */
export function databaseView(approved: readonly ApproverId[]) {
  return {
    request: 1,
    approvalRecords: new Set(approved).size,
    signatures: 0,
    privateKeys: 0,
  } as const;
}

export type JourneyActor = "Investor" | "Admin" | "Platform";
export type JourneyStep = {
  n: number;
  title: string;
  actor: JourneyActor;
  text: string;
  /** Where the record of this step lives: the platform's own records, or the token and chain. */
  layer: "platform" | "chain";
  sub?: readonly string[];
};

export const KYC_SUBSTEPS = ["Personal information", "Identity verification", "Accredited investor status", "Source of funds", "Address verification"] as const;

export const JOURNEY: readonly JourneyStep[] = [
  { n: 1, title: "KYC onboarding", actor: "Investor", text: "The investor completes identity verification.", layer: "platform", sub: KYC_SUBSTEPS },
  { n: 2, title: "USD deposit", actor: "Admin", text: "The investor deposits USD. An admin records it with evidence of the deposit, stored with an MD5 hash.", layer: "platform" },
  { n: 3, title: "Fund selection", actor: "Investor", text: "The investor commits USD from their balance to a chosen fund.", layer: "platform" },
  { n: 4, title: "Investment recorded", actor: "Admin", text: "An admin records the investment and debits the account balance.", layer: "platform" },
  { n: 5, title: "LUMI minting", actor: "Platform", text: "When fundraising closes, the invested amount is minted as LUMI tokens into the investor's custodial wallet.", layer: "chain" },
  { n: 6, title: "Token deposit", actor: "Platform", text: "The LUMI tokens move to the fund wallet.", layer: "chain" },
  { n: 7, title: "On-chain recording", actor: "Platform", text: "A smart contract records every investor's USD deposit and LUMI allocation as immutable fund state.", layer: "chain" },
];

export function chainStart() {
  return JOURNEY.find((s) => s.layer === "chain")?.n ?? 0;
}

/** Emergency pause: transfers are blocked while paused; resuming needs a quorum of approvals. */
export type PauseState = { paused: boolean; approvals: number };

export const RESUME_NEED = QUORUM_NEED;

export function pause(s: PauseState, reason: string): PauseState {
  if (!reason.trim() || s.paused) return s;
  return { paused: true, approvals: 0 };
}

export function approveResume(s: PauseState, notes: string): PauseState {
  if (!s.paused || !notes.trim()) return s;
  const approvals = Math.min(RESUME_NEED, s.approvals + 1);
  return approvals >= RESUME_NEED ? { paused: false, approvals: 0 } : { paused: true, approvals };
}

export function tryTransfer(s: PauseState) {
  return s.paused ? ({ ok: false, reason: "Blocked: transfers are paused." } as const) : ({ ok: true } as const);
}
