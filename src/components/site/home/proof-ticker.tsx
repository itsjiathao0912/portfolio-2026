"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SPRING } from "@/components/motion/springs";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { TICKER_ITEMS, type TickerItem } from "./ticker-data";

function jump(slug: string) {
  document.getElementById(`project-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Chip({ settled }: { settled: boolean }) {
  return (
    <span className="relative inline-grid h-[22px] min-w-[84px] [perspective:400px]" aria-hidden="true">
      <motion.span initial={false} animate={{ rotateX: settled ? 180 : 0 }} transition={SPRING.ui} style={{ transformStyle: "preserve-3d" }} className="relative col-start-1 row-start-1 grid">
        <span className="col-start-1 row-start-1 grid place-items-center rounded-lg bg-canvas px-2 text-[12px] font-semibold text-ink-3 [backface-visibility:hidden]">Pending</span>
        <span className="col-start-1 row-start-1 grid place-items-center rounded-lg bg-[color-mix(in_srgb,var(--success)_10%,white)] px-2 text-[12px] font-semibold text-success [backface-visibility:hidden] [transform:rotateX(180deg)]">✓ Settled</span>
      </motion.span>
    </span>
  );
}

function Row({ t, settled, dup }: { t: TickerItem; settled: boolean; dup?: boolean }) {
  const [done, setDone] = useState(settled);
  useEffect(() => {
    if (!settled) return;
    const id = window.setTimeout(() => setDone(true), 500);
    return () => window.clearTimeout(id);
  }, [settled]);
  return (
    <li aria-hidden={dup || undefined} className="flex shrink-0 items-center gap-8">
      <button
        type="button"
        tabIndex={dup ? -1 : 0}
        onClick={() => jump(t.slug)}
        title={t.quote}
        data-testid="ticker-item"
        className="flex min-h-11 items-center gap-3 rounded-lg py-1 text-[13px] outline-none md:min-h-0 focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="font-mono text-[14px] font-semibold tabular-nums text-[var(--navy-ink,#0b1533)]">{t.amount}</span>
        <span className="text-ink-3">{t.memo}</span>
        <span className="text-ink-3">· {t.party}</span>
        <Chip settled={done} />
        <span className="sr-only">{done ? "settled" : "pending"}</span>
      </button>
      <span aria-hidden="true" className="size-1 rounded-full bg-ink-3/50" />
    </li>
  );
}

/** One hairline-bordered line of sourced metrics. Hover pauses; click jumps to the project card. */
export function ProofTicker() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const [paused, setPaused] = useState(false);
  // Keyboard focus pauses the strip too, so the focused item cannot drift away (WCAG 2.2.2).
  const [focused, setFocused] = useState(false);
  // Touch: a tap on the moving strip pauses it (and shows it); a tap on a still item then jumps.
  const [touchPaused, setTouchPaused] = useState(false);
  const touchDown = useRef(false);

  return (
    <section
      ref={ref}
      aria-label="Results"
      data-testid="proof-ticker"
      className="relative overflow-hidden border-y border-hairline bg-bg py-1.5"
      data-paused={paused || touchPaused || focused ? "true" : "false"}
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
      onPointerDown={(e) => {
        touchDown.current = e.pointerType !== "mouse" && !touchPaused;
      }}
      onClickCapture={(e) => {
        const target = e.target as HTMLElement;
        // Only a real touch tap (detail > 0) on a still-running strip is swallowed; keyboard Enter is not.
        if (touchDown.current && e.detail > 0 && !target.closest("[data-ticker-pause]")) {
          e.preventDefault();
          e.stopPropagation();
          setTouchPaused(true);
        }
        touchDown.current = false;
      }}
      onFocus={(e) => setFocused(e.target.matches(":focus-visible"))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      {reduce ? (
        <ul className="mx-auto flex max-w-[1100px] gap-8 overflow-x-auto px-6 [scrollbar-width:none]">
          {TICKER_ITEMS.map((t) => <Row key={t.id} t={t} settled />)}
        </ul>
      ) : (
        <>
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg to-transparent" />
          <ul className="flex w-max gap-8 [animation:ticker-scroll_105s_linear_infinite]" style={{ animationPlayState: paused || focused || touchPaused || !inView ? "paused" : "running" }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => <Row key={`${t.id}-${i}`} t={t} settled={inView} dup={i >= TICKER_ITEMS.length} />)}
          </ul>
          {touchPaused ? (
            <button
              type="button"
              data-ticker-pause
              data-testid="ticker-resume"
              onClick={() => setTouchPaused(false)}
              aria-label="Ticker paused. Resume"
              className="absolute top-1/2 right-1 z-20 inline-flex min-h-11 -translate-y-1/2 items-center gap-1 rounded-full bg-bg/95 px-3 text-[13px] font-semibold text-ink-1 shadow-2 ring-1 ring-black/5"
            >
              <span aria-hidden="true">▶</span> Resume
            </button>
          ) : null}
          <style>{`@keyframes ticker-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
        </>
      )}
    </section>
  );
}
