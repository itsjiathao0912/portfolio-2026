/**
 * Pure logic for the "participate" lane. No React, no DOM — unit-tested.
 * Every claim about Thao's work here must come from content/ (no invented numbers).
 */

export const STORAGE_PREFIX = "thao:participate:";

/* ── safe localStorage ─────────────────────────────────────────────────── */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}
export function writeJSON(key: string, value: unknown) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    /* private mode / quota — the UI still works for this visit */
  }
}

/* ── personas ──────────────────────────────────────────────────────────── */
export const PERSONAS = ["recruiter", "founder", "engineer", "curious"] as const;
export type Persona = (typeof PERSONAS)[number];

export const PERSONA_META: Record<Persona, { label: string; blurb: string; emoji: string }> = {
  recruiter: { label: "Recruiter", blurb: "The 30-second version", emoji: "📋" },
  founder: { label: "Founder", blurb: "What she ships and how", emoji: "🚀" },
  engineer: { label: "Engineer", blurb: "Systems, specs and stacks", emoji: "🛠️" },
  curious: { label: "Just curious", blurb: "Show me the fun bits", emoji: "✨" },
};

/** Section ids other sections can use to reorder/emphasise themselves. */
export const SECTION_IDS = ["highlights", "work", "experience", "skills", "community", "contact"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

const ORDER: Record<Persona, SectionId[]> = {
  recruiter: ["highlights", "experience", "skills", "work", "contact", "community"],
  founder: ["work", "highlights", "community", "experience", "contact", "skills"],
  engineer: ["work", "skills", "experience", "highlights", "community", "contact"],
  curious: ["community", "work", "highlights", "experience", "skills", "contact"],
};

export function sectionOrder(p: Persona | null): SectionId[] {
  return p ? ORDER[p] : [...SECTION_IDS];
}
/** Lower = show earlier. Unknown persona keeps the default order. */
export function sectionRank(p: Persona | null, id: SectionId) {
  return sectionOrder(p).indexOf(id);
}
export function isEmphasised(p: Persona | null, id: SectionId) {
  return p != null && sectionRank(p, id) < 2;
}
export function isPersona(v: unknown): v is Persona {
  return typeof v === "string" && (PERSONAS as readonly string[]).includes(v);
}

/** Recruiter TL;DR — every line traceable to content/site.ts or content/projects. */
export const RECRUITER_TLDR = [
  "Technical Product Manager at SkyLab Group, 4+ years in product (Ho Chi Minh City).",
  "Owned a cloud billing domain end-to-end (PAC).",
  "Primary PM on COSAP, an AI ERP across Korea and Singapore markets.",
  "2nd place, Agentic AI Build Week — Fintech track (Cortex Sentinel).",
  "Builds her own products too: Ledgr, a compliance copilot for Vietnamese SMEs.",
] as const;

/* ── build-a-product ───────────────────────────────────────────────────── */
export const BLOCKS = ["kyc", "payments", "rules", "ledger", "notifications"] as const;
export type BlockId = (typeof BLOCKS)[number];

export const BLOCK_META: Record<BlockId, { label: string; color: string; glyph: string }> = {
  kyc: { label: "KYC", color: "#7c3aed", glyph: "ID" },
  payments: { label: "Payments", color: "#2563eb", glyph: "₫" },
  rules: { label: "Rules engine", color: "#db2777", glyph: "⚙" },
  ledger: { label: "Ledger", color: "#059669", glyph: "≡" },
  notifications: { label: "Notifications", color: "#ea580c", glyph: "◔" },
};

type Match = { project: string; slug: string; why: string; needs: BlockId[] };
/** Ordered most-specific first. Descriptions paraphrase content/projects summaries. */
const MATCHES: Match[] = [
  { project: "Guardline", slug: "guardline", needs: ["payments", "rules", "notifications"], why: "an AI fraud desk for SPayLater that holds risky orders and writes a new rule for each new trick" },
  { project: "Cortex Sentinel", slug: "cortex-sentinel", needs: ["kyc", "rules"], why: "an AML triage layer where analysts write rules in plain English — 2nd place at AABW" },
  { project: "PAC", slug: "pac", needs: ["payments", "ledger"], why: "billing for a multi-region cloud platform, owned end-to-end" },
  { project: "Ledgr", slug: "ledgr", needs: ["rules", "ledger"], why: "a labour and payroll compliance copilot for small Vietnamese companies" },
  { project: "GoCrypto", slug: "gocrypto", needs: ["payments", "kyc"], why: "a strategy to turn crypto into a remittance rail for Filipino families abroad" },
  { project: "COSAP", slug: "cosap", needs: ["ledger"], why: "an AI ERP spanning accounting, legal compliance and payroll" },
  { project: "Guardline", slug: "guardline", needs: ["notifications"], why: "an AI fraud desk that alerts people only when a human decision is needed" },
  { project: "Cortex Sentinel", slug: "cortex-sentinel", needs: ["kyc"], why: "AML screening and triage for fiat and crypto" },
  { project: "PAC", slug: "pac", needs: ["payments"], why: "billing for a multi-region cloud platform" },
  { project: "Ledgr", slug: "ledgr", needs: ["rules"], why: "a compliance copilot that checks documents against verified rules" },
];

export function matchBuild(blocks: readonly BlockId[]) {
  const set = new Set(blocks);
  if (set.size === 0) return null;
  let best: Match | null = null;
  for (const m of MATCHES) {
    if (m.needs.every((b) => set.has(b)) && (!best || m.needs.length > best.needs.length)) best = m;
  }
  return best;
}
export const MIN_BLOCKS_TO_LAUNCH = 2;
export function canLaunch(blocks: readonly BlockId[]) {
  return new Set(blocks).size >= MIN_BLOCKS_TO_LAUNCH;
}
export function toggleBlock(blocks: readonly BlockId[], id: BlockId): BlockId[] {
  return blocks.includes(id) ? blocks.filter((b) => b !== id) : [...blocks, id];
}

/* ── greeting ──────────────────────────────────────────────────────────── */
export function partOfDay(hour: number) {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}
export function greetingLine(hour: number, visits: number, persona: Persona | null) {
  const pod = partOfDay(hour);
  const hello = pod === "night" ? "Burning the midnight oil?" : `Good ${pod}!`;
  if (visits <= 1) return `${hello} Welcome — I'm Thao.`;
  const who = persona ? ` ${PERSONA_META[persona].label.toLowerCase() === "just curious" ? "friend" : PERSONA_META[persona].label.toLowerCase()}` : "";
  return `${hello} Welcome back${who} — visit number ${visits}.`;
}

/* ── poll ──────────────────────────────────────────────────────────────── */
export const POLL_OPTIONS = [
  { id: "payments", label: "A payments app for small shops" },
  { id: "compliance", label: "More compliance automation" },
  { id: "community", label: "Tools for builder communities" },
  { id: "ai-agents", label: "AI agents for finance teams" },
] as const;
export type PollId = (typeof POLL_OPTIONS)[number]["id"];
/** Local-only illustrative baseline so the bars aren't empty. Labelled as such in the UI. */
export const POLL_BASELINE: Record<PollId, number> = { payments: 3, compliance: 2, community: 2, "ai-agents": 3 };
export function pollResults(vote: PollId | null) {
  const counts = { ...POLL_BASELINE };
  if (vote) counts[vote] += 1;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return POLL_OPTIONS.map((o) => ({ ...o, count: counts[o.id], pct: Math.round((counts[o.id] / total) * 100) }));
}

/* ── passport ──────────────────────────────────────────────────────────── */
export const STAMPS = ["persona", "builder", "coin", "poll", "greeting", "explorer"] as const;
export type StampId = (typeof STAMPS)[number];
export const STAMP_META: Record<StampId, { label: string; color: string }> = {
  persona: { label: "Introduced", color: "#2563eb" },
  builder: { label: "Builder", color: "#7c3aed" },
  coin: { label: "Settled", color: "#059669" },
  poll: { label: "Voter", color: "#db2777" },
  greeting: { label: "Regular", color: "#ea580c" },
  explorer: { label: "Explorer", color: "#0891b2" },
};
export function isStamp(v: unknown): v is StampId {
  return typeof v === "string" && (STAMPS as readonly string[]).includes(v);
}
export function addStamp(have: readonly string[], id: string) {
  const clean = have.filter(isStamp);
  if (!isStamp(id) || clean.includes(id)) return { stamps: clean, added: false };
  return { stamps: [...clean, id], added: true };
}
export function isComplete(have: readonly string[]) {
  return STAMPS.every((s) => have.includes(s));
}

/* ── coin drop ─────────────────────────────────────────────────────────── */
export function isInside(p: { x: number; y: number }, r: { left: number; top: number; right: number; bottom: number }) {
  return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
}
