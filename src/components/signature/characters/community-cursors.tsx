"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useEffect, useRef, useState } from "react";
import { Character } from "./character";
import { COMMUNITY_CURSORS, cursorPath } from "./logic";

const HOP_MS = 2600;

/**
 * Friendly, clearly-fake multiplayer cursors that drift over a section and now
 * and then "click" (a ripple + a sticky note). Purely decorative: aria-hidden,
 * pointer-events none, never covers interactive content. Hidden on touch-only
 * devices and with reduced motion (renders nothing; the section reads the same).
 * Only animates while on screen.
 */
export function CommunityCursors({ count = 3, className = "" }: { count?: number; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -15% 0px" });
  const [fine, setFine] = useState(false);
  const [tick, setTick] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const set = () => setFine(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  useEffect(() => {
    if (!inView || reduce || !fine || hidden) return;
    const id = window.setInterval(() => setTick((t) => t + 1), HOP_MS);
    return () => window.clearInterval(id);
  }, [inView, reduce, fine, hidden]);

  const on = fine && !reduce && !hidden;
  const cursors = COMMUNITY_CURSORS.slice(0, Math.max(1, Math.min(count, COMMUNITY_CURSORS.length)));

  return (
    <div ref={ref} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true" data-testid="community-cursors">
      {on && inView
        ? cursors.map((c, i) => {
            const path = cursorPath(i * 97 + 13, 8);
            const p = path[(tick + i * 3) % path.length];
            const clicking = (tick + i) % 3 === 0;
            return (
              <motion.div
                key={c.id}
                className="absolute top-0 left-0"
                initial={false}
                animate={{ left: `${p.x}%`, top: `${p.y}%` }}
                transition={{ type: "spring", stiffness: 40, damping: 14, mass: 1.2 }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]">
                  <path d="M3 2l15 7-6.5 2L9 18z" fill={c.color} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                <AnimatePresence>
                  {clicking ? (
                    <motion.span
                      key={`r${tick}`}
                      className="absolute -top-2 -left-2 size-6 rounded-full border-2"
                      style={{ borderColor: c.color }}
                      initial={{ scale: 0.3, opacity: 0.9 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7 }}
                    />
                  ) : null}
                </AnimatePresence>
                <div className="mt-0.5 ml-4 flex items-center gap-1 rounded-full py-0.5 pr-2.5 pl-0.5 text-[12px] font-medium whitespace-nowrap text-white shadow-card" style={{ background: c.color }}>
                  <span className="grid size-5 place-items-center overflow-hidden rounded-full bg-white">
                    <Character name={c.avatar} size={18} lookAt={false} reactOnScroll={false} />
                  </span>
                  {c.name}
                </div>
                <AnimatePresence>
                  {clicking ? (
                    <motion.p
                      key={`n${tick}`}
                      className="mt-1 ml-6 w-max max-w-[160px] -rotate-2 rounded-md bg-[var(--tint-butter)] px-2 py-1 text-[12px] text-ink-2 shadow-card"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {c.note}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })
        : null}
      {fine && !reduce ? (
        <button
          type="button"
          onClick={() => setHidden((h) => !h)}
          aria-hidden="false"
          aria-pressed={!hidden}
          className="pointer-events-auto absolute right-3 bottom-3 rounded-full border border-hairline bg-bg/90 px-3 py-1 text-[12px] text-ink-3 hover:text-ink-1"
        >
          {hidden ? "Show friends" : "Hide friends"}
        </button>
      ) : null}
    </div>
  );
}
