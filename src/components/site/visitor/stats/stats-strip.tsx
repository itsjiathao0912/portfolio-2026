"use client";

import { motion } from "motion/react";
import { SPRING } from "@/components/motion/springs";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { RoleId } from "../role-ids";
import { PLURALS, countryRows, type StatsView } from "./stats-copy";
import { RollingNumber } from "./rolling-number";

function Big({ value, label, testId, prefix }: { value: number; label: string; testId: string; prefix?: string }) {
  return (
    <div className="min-w-[140px] text-center">
      <p className="font-display text-[36px] leading-none tracking-tight text-ink-1 tabular-nums md:text-[44px]">
        {prefix}
        <RollingNumber value={value} data-testid={testId} />
      </p>
      <p className="label-mono mt-2 text-[11px] text-ink-3">{label}</p>
    </div>
  );
}

/**
 * The big live numbers: total visitors, your number, how many share your role, and
 * the top countries with flags. Real figures only; nothing renders before the first
 * stats arrive. Numbers roll when they change.
 */
export function StatsStrip({ data, ordinal, role }: { data: StatsView; ordinal: number | null; role: RoleId | null }) {
  const reduce = useReducedMotion();
  const countries = countryRows(data.topCountries);
  // Right after a pick the server total can lag the visitor's own number: never show fewer visitors than your number.
  const total = Math.max(data.total, ordinal ?? 0);
  const roleCount = role ? data.you.roleCount : 0;
  return (
    <motion.div
      data-testid="visitor-stats-strip"
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : SPRING.glide}
      className="mt-8 flex flex-col items-center gap-5 border-t border-hairline pt-6"
    >
      <div className="flex w-full max-w-[860px] flex-wrap justify-evenly gap-x-8 gap-y-6">
        <Big value={total} label={total === 1 ? "visitor so far" : "visitors so far"} testId="stat-total" />
        {ordinal && ordinal > 0 ? <Big value={ordinal} prefix="#" label="your visitor number" testId="stat-ordinal" /> : null}
        {role && roleCount > 0 ? <Big value={roleCount} label={`${PLURALS[role]} like you`} testId="stat-role" /> : null}
      </div>
      {countries.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
        <p className="label-mono text-[11px] text-ink-3">Top countries</p>
        <ul data-testid="visitor-countries" aria-label="Top countries" className="flex flex-wrap justify-center gap-2">
          {countries.map((c) => (
            <li key={c.country} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-hairline bg-bg px-3.5 text-[14px] text-ink-2 shadow-1">
              <span aria-hidden="true" className="text-[17px] leading-none">{c.flag}</span>
              <span>{c.name}</span>
              <RollingNumber value={c.count} className="font-medium text-ink-1 tabular-nums" />
            </li>
          ))}
        </ul>
        </div>
      ) : null}
    </motion.div>
  );
}
