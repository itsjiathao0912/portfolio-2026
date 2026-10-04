// Pure copy for the live stats line and the poll view. No React, no fetch.
// Honest by construction: every number comes from the API, nothing is padded.

import { MIN_POLL_VOTES } from "@/lib/poll-options";
import { ROLE_LABELS, type RoleId } from "../role-ids";

// Same deny list as src/lib/geo.ts (a client file cannot import that module).
const UNKNOWN_COUNTRIES = new Set(["XX", "T1", "ZZ", "EU", "UN", "QO", "AA", "QU"]);

export const PLURALS: Record<RoleId, string> = {
  recruiter: "recruiters",
  founder: "founders",
  engineer: "engineers",
  designer: "product designers",
  marketer: "marketers",
  growth: "growth people",
  data: "data people",
  investor: "investors",
  student: "students",
  pm: "fellow PMs",
  curious: "curious visitors",
};

/** A leader needs at least this many visitors before we call it a lead. */
export const LEAD_MIN = 3;

export type TopCountry = { country: string; count: number };

export type StatsView = {
  total: number;
  /** most-visited countries, biggest first (already limited by the API) */
  topCountries: TopCountry[];
  byRole: Partial<Record<RoleId, number>>;
  you: { country: string | null; countryCount: number; countryRank: number; roleCount: number };
};

export function countryName(code: string | null | undefined): string | null {
  if (typeof code !== "string" || !/^[A-Z]{2}$/.test(code) || UNKNOWN_COUNTRIES.has(code)) return null;
  try {
    const name = new Intl.DisplayNames(["en"], { type: "region" }).of(code);
    return name && name !== code ? name : null;
  } catch {
    return null;
  }
}

/** Regional-indicator flag for a valid country code; "" when unknown. */
export function flagOf(code: string | null | undefined): string {
  if (countryName(code) === null || !code) return "";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/**
 * "You're visitor #213 · 12 founders · 48 from Vietnam 🇻🇳". Returns null when
 * there is nothing true to say yet (stats not loaded).
 */
export function rankLine(input: {
  ordinal: number | null;
  role: RoleId | null;
  roleCount: number;
  country: string | null;
  countryCount: number;
  countryRank?: number;
  total: number;
}): string | null {
  const { ordinal, role, roleCount, country, countryCount, total } = input;
  const parts: string[] = [];
  if (ordinal && ordinal > 0) parts.push(`You're visitor #${ordinal}`);
  else if (total > 0) parts.push(`${total} ${total === 1 ? "visitor" : "visitors"} so far`);
  else return null;

  if (role) {
    if (roleCount === 1) parts.push(`the first ${ROLE_LABELS[role]}`);
    else if (roleCount > 1) parts.push(`${roleCount} ${PLURALS[role]}`);
  }
  const name = countryName(country);
  if (name) {
    const flag = flagOf(country);
    const tail = flag ? ` ${flag}` : "";
    if (countryCount === 1) parts.push(`the first from ${name}${tail}`);
    else if (countryCount > 1) parts.push(`${countryCount} from ${name}${tail}`);
  }
  return parts.join(" · ");
}

/** The playful second line, or null when no role has a clear lead yet. */
export function leaderLine(byRole: Partial<Record<RoleId, number>>, mine: RoleId | null): string | null {
  const entries = (Object.entries(byRole) as [RoleId, number][]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  const top = entries[0];
  if (!top || top[1] < LEAD_MIN) return null;
  if (entries[1] && entries[1][1] === top[1]) return null; // a tie is not a lead
  const label = PLURALS[top[0]];
  const head = label.charAt(0).toUpperCase() + label.slice(1);
  return top[0] === mine ? `${head} are leading so far. That's you.` : `${head} are leading so far.`;
}

/** Country rows for the big stats: only real, known countries with a count, flag + name, biggest first. */
export function countryRows(top: readonly TopCountry[] | null | undefined, limit = 5) {
  const out: { country: string; name: string; flag: string; count: number }[] = [];
  for (const t of top ?? []) {
    const name = countryName(t.country);
    if (!name || !(t.count > 0)) continue;
    out.push({ country: t.country, name, flag: flagOf(t.country), count: t.count });
  }
  return out.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, limit);
}

/**
 * One source for "how many from your country": the cached top-countries aggregate
 * can lag the fresh per-visitor count (which includes you). Use the larger of the
 * two for your own country, and add it to the list when the aggregate missed it.
 */
export function withOwnCountry(top: readonly TopCountry[] | null | undefined, you: { country: string | null; countryCount: number }): TopCountry[] {
  const list = (top ?? []).map((t) => ({ ...t }));
  if (!you.country || !(you.countryCount > 0)) return list;
  const mine = list.find((t) => t.country === you.country);
  if (mine) mine.count = Math.max(mine.count, you.countryCount);
  else list.push({ country: you.country, count: you.countryCount });
  return list;
}

/** Tile counts: one per role, only when a number is known. */
export function tileCounts(byRole: Partial<Record<RoleId, number>> | null): Partial<Record<RoleId, number>> | undefined {
  if (!byRole) return undefined;
  return { ...byRole };
}

/** Optimistic own move: new role +1, previous role -1 (never below 0). */
export function moveOwnCount(
  byRole: Partial<Record<RoleId, number>>,
  from: RoleId | null,
  to: RoleId | null,
): Partial<Record<RoleId, number>> {
  if (from === to) return byRole;
  const next = { ...byRole };
  if (from) next[from] = Math.max(0, (next[from] ?? 0) - 1);
  if (to) next[to] = (next[to] ?? 0) + 1;
  return next;
}

// ---- poll view ----

export const MIN_VOTES_FOR_PERCENT = MIN_POLL_VOTES;

export type PollRowView = { id: string; count: number; fraction: number; label: string };

/**
 * Per-option display: counts always; the percent label only when total >= 20.
 * `fraction` (bar width) is share of votes, 0 when there are none.
 */
export function pollRows<T extends string>(
  options: readonly { id: T; label: string }[],
  counts: Partial<Record<T, number>>,
  total: number,
) {
  const showPercent = total >= MIN_VOTES_FOR_PERCENT;
  const rows = options.map((o) => {
    const count = counts[o.id] ?? 0;
    return {
      id: o.id,
      label: o.label,
      count,
      fraction: total > 0 ? count / total : 0,
      percent: showPercent ? `${Math.round((count / total) * 100)}%` : null,
    };
  });
  const note = showPercent ? `${total} votes` : total === 0 ? "Be one of the first 20 votes" : `${total} ${total === 1 ? "vote" : "votes"} so far. Be one of the first 20 votes`;
  return { rows, showPercent, note };
}
