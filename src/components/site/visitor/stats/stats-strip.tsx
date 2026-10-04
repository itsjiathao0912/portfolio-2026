"use client";

import { motion } from "motion/react";
import { SPRING } from "@/components/motion/springs";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { RoleId } from "../role-ids";
import { useRef, useState } from "react";
import { PLURALS, countryLabel, countryRows, type StatsView, withOwnCountry } from "./stats-copy";
import { RollingNumber } from "./rolling-number";

function Big({ value, label, testId, prefix }: { value: number; label: string; testId: string; prefix?: string }) {
  return (
    <div className="min-w-[88px] text-center sm:min-w-[140px]">
      <p className="font-display text-[28px] leading-none sm:text-[36px] tracking-tight text-ink-1 tabular-nums md:text-[40px]">
        {prefix}
        <RollingNumber value={value} data-testid={testId} />
      </p>
      <p className="label-mono mt-1.5 text-[11px] text-ink-3">{label}</p>
    </div>
  );
}

/**
 * One flag in a calm circle. Hover, keyboard focus or a tap shows "Vietnam: 64 people";
 * the same text is the button's accessible name, so a screen reader hears it too.
 */
function FlagDot({ code, flag, label }: { code: string; flag: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const tip = useRef<HTMLSpanElement>(null);
  // Keep the tooltip inside the viewport: measure it centred on the flag, then nudge it in from an edge.
  const place = () => {
    const el = tip.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left = r.left - shift;
    const right = left + r.width;
    const pad = 8;
    setShift(left < pad ? pad - left : right > window.innerWidth - pad ? window.innerWidth - pad - right : 0);
  };
  return (
    <li className="group relative" onPointerEnter={place} onFocus={place}>
      <button
        type="button"
        data-testid={`country-${code}`}
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className="grid size-10 place-items-center rounded-full border border-hairline bg-bg text-[20px] leading-none shadow-1 outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span aria-hidden="true">{flag}</span>
      </button>
      <span
        ref={tip}
        role="tooltip"
        style={shift ? { marginLeft: shift } : undefined}
        data-testid={`country-tip-${code}`}
        className={`pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink-1 px-2.5 py-1 text-[12px] text-white shadow-2 transition-opacity [@media(hover:hover)]:group-hover:opacity-100 group-has-[:focus-visible]:opacity-100 ${open ? "opacity-100" : "opacity-0"}`}
      >
        {label}
      </span>
    </li>
  );
}

/**
 * The big live numbers: total visitors, your number, how many share your role, and
 * the top countries with flags. Real figures only; nothing renders before the first
 * stats arrive. Numbers roll when they change.
 */
export function StatsStrip({ data, ordinal, role }: { data: StatsView; ordinal: number | null; role: RoleId | null }) {
  const reduce = useReducedMotion();
  const countries = countryRows(withOwnCountry(data.topCountries, data.you));
  // Right after a pick the server total can lag the visitor's own number: never show fewer visitors than your number.
  const total = Math.max(data.total, ordinal ?? 0);
  const roleCount = role ? data.you.roleCount : 0;
  return (
    <motion.div
      data-testid="visitor-stats-strip"
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : SPRING.glide}
      className="mt-5 flex flex-col items-center gap-4 border-t border-hairline pt-5 lg:mt-4 lg:pt-4 lg:flex-row lg:justify-center lg:gap-x-12"
    >
      <div className="flex w-full max-w-[860px] flex-wrap justify-evenly gap-x-4 gap-y-6 sm:gap-x-8 lg:w-auto lg:justify-center">
        <Big value={total} label={total === 1 ? "visitor so far" : "visitors so far"} testId="stat-total" />
        {ordinal && ordinal > 0 ? <Big value={ordinal} prefix="#" label="your visitor number" testId="stat-ordinal" /> : null}
        {role && roleCount > 0 ? <Big value={roleCount} label={`${PLURALS[role]} like you`} testId="stat-role" /> : null}
      </div>
      {countries.length > 0 ? (
        <div className="flex flex-col items-center gap-2 lg:max-w-[420px] lg:items-start">
          <p className="label-mono text-[11px] text-ink-3">
            {countries.length === 1 ? "Visitors from 1 country" : `Visitors from ${countries.length} countries`}
          </p>
          <ul data-testid="visitor-countries" aria-label="Visitor countries" className="flex max-w-[420px] flex-wrap justify-center gap-1.5 lg:justify-start">
            {countries.map((c) => (
              <FlagDot key={c.country} code={c.country} flag={c.flag} label={countryLabel(c.name, c.count)} />
            ))}
          </ul>
        </div>
      ) : null}
    </motion.div>
  );
}
