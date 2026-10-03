"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { barcodeBars, buildReceiptLines, receiptTotals, type ReceiptLine } from "./ledger-data";

type Props = {
  lines?: ReceiptLine[];
  title?: string;
  className?: string;
};

/**
 * A thermal till receipt that prints Thao's career line by line as the page
 * scrolls. Every line is real text in the DOM from the start (screen readers and
 * crawlers read it all); only its visual reveal is scroll-linked. Ends with
 * totals, a barcode, a torn edge and an email CTA. Reduced motion: printed.
 */
export function CareerReceipt({ lines = buildReceiptLines(), title = "CAREER RECEIPT", className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 70%"] });
  const steps = lines.length + 3;
  const bars = barcodeBars(receiptTotals.name + receiptTotals.email);

  return (
    <div ref={ref} className={`relative mx-auto w-full min-w-0 max-w-[380px] ${className}`}>
      {/* the till slot */}
      <div aria-hidden className="relative z-10 mx-auto h-3 w-[104%] -translate-x-[2%] rounded-full bg-[var(--navy)] shadow-[0_6px_10px_-4px_rgba(0,0,0,0.4)]" />
      <article
        aria-label={`${title} for ${receiptTotals.name}`}
        className="relative -mt-1.5 bg-[#fdfcf8] px-6 pb-2 pt-6 font-mono text-[12.5px] leading-relaxed text-[var(--ink-2)] shadow-[0_18px_30px_-16px_rgba(10,20,60,0.35)]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent 0 23px, rgba(10,20,60,0.025) 23px 24px)" }}
      >
        <header className="text-center">
          <p className="text-[15px] font-bold tracking-[0.25em] text-[var(--ink-1)]">{title}</p>
          <p className="text-[var(--ink-3)]">{receiptTotals.name.toUpperCase()} · PRODUCT</p>
          <Dash />
        </header>

        <ol>
          {lines.map((l, i) => (
            <Printed key={l.id} i={i} steps={steps} progress={scrollYProgress} reduce={reduce}>
              <li className="py-1.5">
                <div className="flex justify-between gap-3 font-semibold text-[var(--ink-1)]">
                  <span>{l.company.toUpperCase()}</span>
                  <span className="tabular-nums">{l.year}</span>
                </div>
                <div className="flex justify-between gap-3 text-[var(--ink-3)]">
                  <span>{l.role}</span>
                </div>
                <div className="text-[11px] text-[var(--ink-3)]">{l.period}</div>
                {l.win && <p className="mt-0.5 text-[11.5px]">↳ {l.win}</p>}
              </li>
            </Printed>
          ))}
        </ol>

        <Printed i={lines.length} steps={steps} progress={scrollYProgress} reduce={reduce}>
          <Dash />
          <dl className="space-y-0.5">
            <Total k="EXPERIENCE" v={receiptTotals.years.toUpperCase()} />
            <Total k="COMPANIES / TEAMS" v={String(receiptTotals.companies)} />
            <Total k="AWARDS" v={String(receiptTotals.awards)} />
            <Total k="CERTIFICATIONS" v={String(receiptTotals.certifications)} />
          </dl>
          <div className="mt-2 flex justify-between border-y-2 border-double border-[var(--ink-2)] py-1 text-[14px] font-bold text-[var(--ink-1)]">
            <span>STATUS</span>
            <span>OPEN TO ROLES</span>
          </div>
        </Printed>

        <Printed i={lines.length + 1} steps={steps} progress={scrollYProgress} reduce={reduce}>
          <div aria-hidden className="mt-4 flex h-12 items-stretch justify-center gap-[2px]">
            {bars.map((w, i) => (
              <span key={i} className="bg-[var(--ink-1)]" style={{ width: w, opacity: i % 3 === 0 ? 1 : 0.9 }} />
            ))}
          </div>
          <p className="mt-1 text-center text-[10px] tracking-[0.3em] text-[var(--ink-3)]">THANK YOU · COME AGAIN</p>
        </Printed>

        <Printed i={lines.length + 2} steps={steps} progress={scrollYProgress} reduce={reduce}>
          <Dash />
          <p className="text-center">✂ tear here, let&apos;s talk</p>
          <a
            href={`mailto:${receiptTotals.email}`}
            className="mx-auto mt-2 block w-fit rounded-full bg-[var(--accent)] px-4 py-2 font-sans text-[13px] font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          >
            {receiptTotals.email}
          </a>
        </Printed>
      </article>
      {/* torn edge */}
      <svg aria-hidden viewBox="0 0 380 12" preserveAspectRatio="none" className="block h-3 w-full">
        <path
          d={`M0 0 ${Array.from({ length: 38 }, (_, i) => `L${i * 10 + 5} 10 L${i * 10 + 10} 0`).join(" ")} Z`}
          fill="#fdfcf8"
        />
      </svg>
    </div>
  );
}

function Printed({
  i,
  steps,
  progress,
  reduce,
  children,
}: {
  i: number;
  steps: number;
  progress: MotionValue<number>;
  reduce: boolean;
  children: React.ReactNode;
}) {
  const start = i / steps;
  const end = (i + 0.85) / steps;
  const clip = useTransform(progress, [start, end], ["inset(0 0 100% 0)", "inset(0 0 0% 0)"]);
  const opacity = useTransform(progress, [start, end], [0.15, 1]);
  if (reduce) return <div>{children}</div>;
  return <motion.div style={{ clipPath: clip, opacity }}>{children}</motion.div>;
}

function Dash() {
  return <div aria-hidden className="my-2 w-0 min-w-full overflow-hidden whitespace-nowrap text-[var(--ink-3)]">{"- ".repeat(40)}</div>;
}

function Total({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt>{k}</dt>
      <dd className="tabular-nums">{v}</dd>
    </div>
  );
}
