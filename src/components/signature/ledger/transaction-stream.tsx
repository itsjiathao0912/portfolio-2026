"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ledgerTransactions, type LedgerTransaction } from "./ledger-data";

type Props = {
  items?: readonly LedgerTransaction[];
  /** Seconds for one full loop. */
  speed?: number;
  className?: string;
};

/**
 * A marquee of real, sourced metrics styled as settled transactions. Each chip
 * flips pending → settled ✓ once the row scrolls into view. Pauses on hover /
 * focus; reduced motion gets a static, wrapping list of the same rows.
 */
export function TransactionStream({ items = ledgerTransactions, speed = 48, className = "" }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const [paused, setPaused] = useState(false);

  return (
    <section
      ref={ref}
      aria-label="Results ledger"
      className={`ledger-stream relative overflow-hidden border-y border-[var(--hairline)] bg-[var(--bg)] py-4 ${className}`}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {reduce ? (
        <ul className="flex flex-wrap justify-center gap-3 px-4">
          {items.map((t) => (
            <Row key={t.id} t={t} settled />
          ))}
        </ul>
      ) : (
        <>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--bg)] to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--bg)] to-transparent" />
          <ul
            className="flex w-max gap-3"
            style={{
              animation: `ledger-marquee ${speed}s linear infinite`,
              animationPlayState: paused || !inView ? "paused" : "running",
            }}
          >
            {[...items, ...items].map((t, i) => (
              <Row key={`${t.id}-${i}`} t={t} settled={inView} delay={(i % items.length) * 0.25} dup={i >= items.length} />
            ))}
          </ul>
          <style>{`@keyframes ledger-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
        </>
      )}
    </section>
  );
}

function Row({ t, settled, delay = 0, dup = false }: { t: LedgerTransaction; settled: boolean; delay?: number; dup?: boolean }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!settled) return;
    const id = window.setTimeout(() => setDone(true), 400 + delay * 1000);
    return () => window.clearTimeout(id);
  }, [settled, delay]);
  return (
    <li
      aria-hidden={dup || undefined}
      tabIndex={dup ? -1 : 0}
      title={t.quote}
      className="flex shrink-0 items-center gap-3 rounded-full border border-[var(--hairline)] bg-white px-4 py-2 font-mono text-[13px] text-[var(--ink-2)] shadow-[var(--shadow-card)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      <span className="font-semibold text-[var(--ink-1)] tabular-nums">{t.amount}</span>
      <span>{t.memo}</span>
      <span className="text-[var(--ink-3)]">· {t.party}</span>
      <span className="relative inline-grid h-6 min-w-[86px] [perspective:400px]">
        <motion.span
          initial={false}
          animate={{ rotateX: done ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative col-start-1 row-start-1 grid"
        >
          <span
            className="col-start-1 row-start-1 grid place-items-center rounded-full bg-[var(--tint-butter)] px-2 text-[11px] font-semibold uppercase tracking-wide text-[#7a5b00] [backface-visibility:hidden]"
          >
            pending…
          </span>
          <span
            className="col-start-1 row-start-1 grid place-items-center rounded-full bg-[var(--tint-mint)] px-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--success)] [backface-visibility:hidden] [transform:rotateX(180deg)]"
          >
            settled ✓
          </span>
        </motion.span>
        <span className="sr-only">{done ? "settled" : "pending"}</span>
      </span>
    </li>
  );
}
