// Ledger lane — pure data helpers. Every number below is copied verbatim from
// content/site.ts (Thao's CV + previous portfolio). Each transaction carries a
// `quote` that must appear word-for-word in content/site.ts; the unit test
// tests/unit/signature-ledger.test.ts enforces that, so nothing can be invented.

import site from "@content/site.ts";

export type LedgerTransaction = {
  id: string;
  /** Short amount, shown big — e.g. "+30%". */
  amount: string;
  /** What moved. */
  memo: string;
  /** Counterparty — the company. */
  party: string;
  /** Exact phrase from content/site.ts that sources the number. */
  quote: string;
};

export const ledgerTransactions: readonly LedgerTransaction[] = [
  { id: "zalo-ads", amount: "+30%", memo: "ad revenue in six months", party: "Zalo", quote: "increasing total ad revenue by 30% within six months" },
  { id: "reorc-rework", amount: "−40%", memo: "rework", party: "ReOrc AI", quote: "Reduced rework by 40%" },
  { id: "reorc-speed", amount: "+20%", memo: "faster feature delivery", party: "ReOrc AI", quote: "accelerated feature delivery by 20%" },
  { id: "reorc-uat", amount: "95%", memo: "first-pass UAT", party: "ReOrc AI", quote: "95% first-pass success rate" },
  { id: "zalo-engage", amount: "+15%", memo: "user engagement", party: "Zalo", quote: "boosting user engagement by 15%" },
  { id: "zalo-dash", amount: "−40%", memo: "manual data extraction", party: "Zalo", quote: "reducing manual data extraction by 40%" },
  { id: "skylab-erp", amount: "8", memo: "AI ERP modules designed", party: "SkyLab Group", quote: "across 8 modules for an AI ERP platform" },
  { id: "skylab-rwa", amount: "6", memo: "RWA investor modules shipped", party: "SkyLab Group", quote: "across 6 modules for a blockchain-based RWA investment platform" },
  { id: "skylab-cloud", amount: "4", memo: "cloud providers, one pricing logic", party: "SkyLab Group", quote: "across 4 cloud providers" },
  { id: "chotot-crm", amount: "+12%", memo: "revenue via in-app CRM", party: "Chợ Tốt", quote: "uplifted revenue by 12%" },
  { id: "aabw", amount: "2nd", memo: "place, AABW Fintech track", party: "Cortex Sentinel", quote: "2nd place · Cortex Sentinel" },
  { id: "creatio", amount: "20+", memo: "sponsors secured", party: "Creatio", quote: "Secured partnerships with 20+ sponsors" },
];

export type ReceiptLine = {
  id: string;
  company: string;
  role: string;
  period: string;
  /** Short year label printed at the left, e.g. "2025". */
  year: string;
  win?: string;
};

/** Career lines oldest → newest, the way a till prints. */
export function buildReceiptLines(): ReceiptLine[] {
  return [...site.experience].reverse().map((e) => {
    const start = e.period.match(/(\d{4})/)?.[1] ?? "";
    const highlight = "highlight" in e && typeof e.highlight === "string" ? e.highlight : undefined;
    const firstBullet = "bullets" in e && Array.isArray(e.bullets) ? (e.bullets as string[])[0] : undefined;
    return { id: e.id, company: e.company, role: e.role, period: e.period, year: start, win: highlight ?? firstBullet };
  });
}

export const receiptTotals = {
  companies: site.experience.length,
  awards: site.awards.length,
  certifications: site.certifications.length,
  /** Quoted as written in the profile — never recomputed. */
  years: site.profile.intro.match(/\d+\+ years/)?.[0] ?? "",
  email: site.profile.email,
  name: site.profile.name,
};

/** Deterministic barcode bar widths (1–4) from a string — original, no font. */
export function barcodeBars(seed: string, count = 46): number[] {
  let h = 2166136261;
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    h ^= seed.charCodeAt(i % seed.length) + i;
    h = Math.imul(h, 16777619) >>> 0;
    out.push(1 + (h % 4));
  }
  return out;
}

export type RailStop = { id: string; company: string; role: string; period: string; domain: string; wash: string; ink: string };

// Original colour washes per chapter, built from the site's tint tokens.
const WASHES: Record<string, { wash: string; ink: string }> = {
  creatio: { wash: "var(--tint-butter)", ink: "#7a5b00" },
  momo: { wash: "var(--tint-rose)", ink: "#9d1748" },
  chotot: { wash: "var(--tint-peach)", ink: "#9a3d00" },
  zalo: { wash: "var(--tint-sky)", ink: "#1e40af" },
  reorc: { wash: "var(--tint-mint)", ink: "#0f6b3e" },
  skylab: { wash: "var(--tint-periwinkle)", ink: "#3730a3" },
};

export function buildRailStops(): RailStop[] {
  return [...site.experience].reverse().map((e) => ({
    id: e.id,
    company: e.company,
    role: e.role,
    period: e.period,
    domain: "domain" in e && typeof e.domain === "string" ? e.domain : "",
    ...(WASHES[e.id] ?? { wash: "var(--tint-aqua)", ink: "#0e5566" }),
  }));
}

/**
 * End-cap line for the career rail, derived from content (never typed by hand).
 * `products` is passed by server pages so the client bundle does not import every project file.
 */
export function railSummary(products?: number): string {
  return [`${site.experience.length} roles`, receiptTotals.years, products ? `${products} products` : ""].filter(Boolean).join(" · ");
}
