"use client";

import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useEffect, useState } from "react";
import { SPRING } from "@/components/motion/springs";

const SEEN_KEY = "thao:noto-seen";
const STAY_MS = 7000;

/**
 * "Noto": our own little sticky-note character (an original drawing made for
 * this site — not based on any brand or existing character). A square yellow
 * note with a folded corner, two dot eyes and a small smile.
 */
export function NotoFace({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <path d="M8 6h48v38L42 58H8z" fill="#fde68a" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M56 44H42v14" fill="#facc15" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="23" cy="26" r="3.2" fill="#000" />
      <circle cx="39" cy="26" r="3.2" fill="#000" />
      <path d="M25 35q6 5 12 0" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="18" cy="33" r="2.6" fill="#fda4af" opacity=".8" />
      <circle cx="44" cy="33" r="2.6" fill="#fda4af" opacity=".8" />
    </svg>
  );
}

/**
 * Hidden gem (home only): place this near the bottom of the page. The first
 * time the visitor reaches it (once per tab session), Noto peeks in from the
 * right edge, waits, then ducks away. Click/tap it for a one-line hello.
 * Reduced motion: it simply appears and disappears, no slide. No sound.
 */
export function Mascot() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [talking, setTalking] = useState(false);

  function reach() {
    try {
      if (sessionStorage.getItem(SEEN_KEY) === "1") return;
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // storage blocked: still peek, just not remembered
    }
    setVisible(true);
  }

  useEffect(() => {
    if (!visible || talking) return;
    const id = window.setTimeout(() => setVisible(false), STAY_MS);
    return () => window.clearTimeout(id);
  }, [visible, talking]);

  return (
    <>
      <motion.div aria-hidden="true" className="h-px w-full" data-testid="mascot-sentinel" viewport={{ once: true, margin: "0px 0px -10% 0px" }} onViewportEnter={reach} />
      <AnimatePresence>
        {visible ? (
          <motion.div
            key="noto"
            data-testid="mascot"
            className="fixed right-0 bottom-28 z-40 flex items-end gap-2 md:bottom-32"
            initial={reduce ? { opacity: 0 } : { x: 90, rotate: 12 }}
            animate={reduce ? { opacity: 1 } : { x: 18, rotate: -6 }}
            exit={reduce ? { opacity: 0 } : { x: 110, rotate: 12 }}
            transition={reduce ? { duration: 0 } : SPRING.ui}
          >
            {talking ? (
              <p role="status" className="mb-8 max-w-[220px] rounded-2xl bg-ink-1 px-4 py-3 text-[14px] leading-snug text-bg shadow-card-hover" data-testid="mascot-bubble">
                Hi, I&apos;m Noto. Thanks for reading all the way down — I&apos;ll stick around.
              </p>
            ) : null}
            <button
              type="button"
              aria-label={talking ? "Say bye to Noto" : "Say hi to Noto, the sticky-note mascot"}
              aria-expanded={talking}
              onClick={() => (talking ? (setTalking(false), setVisible(false)) : setTalking(true))}
              className="size-[72px] cursor-pointer rounded-xl outline-offset-4"
            >
              <NotoFace className="size-full drop-shadow-[0_6px_8px_rgba(0,0,0,0.15)]" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
