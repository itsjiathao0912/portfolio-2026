/**
 * A faithful, simplified mirror of Ledgr's deterministic labour-contract checks.
 * Values: supabase/migrations/20260616000002_seed_labor_rules.sql.
 * Severity logic: src/lib/compliance/engine.ts (below min = red, exactly at min = amber).
 * Cross-check thresholds: src/lib/compliance/cross-check.ts (>5% red, >1% amber).
 */
export type Severity = "red" | "amber" | "green";
export type Region = "I" | "II" | "III" | "IV" | null;
export type Level = "degree_graduate" | "technical_worker" | "other";

export const MIN_WAGE: Record<Exclude<Region, null>, number> = { I: 5_310_000, II: 4_730_000, III: 4_140_000, IV: 3_700_000 };
export const PROBATION_MAX: Record<Level, number> = { degree_graduate: 60, technical_worker: 30, other: 6 };

export interface ContractFacts {
  region: Region;
  monthlyWage: number;
  level: Level;
  probationDays: number;
  probationWagePct: number; // 0..1
  otHoursPerDay: number;
  renewals: number;
  bhxhClause: boolean;
}

export interface Finding {
  key: string;
  label: string;
  severity: Severity;
  detail: string;
  citation: string;
  /** "llm_fallback" when the engine cannot pin a source-backed rule. */
  trust: "source_backed" | "llm_fallback";
}

const vnd = (n: number) => `${n.toLocaleString("en-US")} ₫`;
const minMax = (value: number, limit: number, lowerIsBad: boolean): Severity =>
  value === limit ? "amber" : (lowerIsBad ? value < limit : value > limit) ? "red" : "green";

export function evaluateContract(f: ContractFacts): Finding[] {
  const out: Finding[] = [];
  if (f.region === null) {
    out.push({ key: "min_wage", label: "Regional minimum wage", severity: "amber", detail: "Region not stated, so no regional floor can be pinned. Flagged for a human, not decided.", citation: "Decree 293/2025/ND-CP, Art. 3", trust: "llm_fallback" });
  } else {
    const min = MIN_WAGE[f.region];
    out.push({ key: "min_wage", label: `Minimum wage, region ${f.region}`, severity: minMax(f.monthlyWage, min, true), detail: `${vnd(f.monthlyWage)} against a floor of ${vnd(min)} a month.`, citation: "Decree 293/2025/ND-CP, Art. 3.1", trust: "source_backed" });
  }
  const max = PROBATION_MAX[f.level];
  out.push({ key: "probation_days", label: "Probation length", severity: minMax(f.probationDays, max, false), detail: `${f.probationDays} days against a maximum of ${max}.`, citation: "Labour Code 2019, Art. 25", trust: "source_backed" });
  out.push({ key: "probation_wage", label: "Probation pay", severity: f.probationWagePct < 0.85 ? "red" : "green", detail: `${Math.round(f.probationWagePct * 100)}% of the full wage; the floor is 85%.`, citation: "Labour Code 2019, Art. 26", trust: "source_backed" });
  out.push({ key: "ot_day", label: "Overtime per day", severity: f.otHoursPerDay > 4 ? "red" : "green", detail: `${f.otHoursPerDay} h a day; the cap is 50% of a normal day (about 4 h).`, citation: "Labour Code 2019, Art. 107.2(b)", trust: "source_backed" });
  out.push({ key: "renewals", label: "Fixed-term renewals", severity: f.renewals > 1 ? "red" : "green", detail: `${f.renewals} renewal(s); after one, the contract must become indefinite.`, citation: "Labour Code 2019, Art. 20.2", trust: "source_backed" });
  out.push({ key: "bhxh", label: "Social insurance (BHXH)", severity: f.bhxhClause ? "green" : "red", detail: f.bhxhClause ? "The contract enrols the employee in BHXH." : "Contracts of one month or more must enrol the employee; this one does not say so.", citation: "Social Insurance Law 2024, Art. 2.1(a)", trust: "source_backed" });
  return out;
}

export type CrossStatus = "match" | "amber" | "red";
/** Contract wage × 12 vs PIT taxable income. Mirrors cross-check.ts thresholds. */
export function crossCheck(monthlyWage: number, taxableIncome: number) {
  const annual = monthlyWage * 12;
  const gap = Math.abs(taxableIncome - annual) / annual;
  const status: CrossStatus = gap > 0.05 ? "red" : gap > 0.01 ? "amber" : "match";
  return { annual, gap, delta: taxableIncome - annual, status };
}
