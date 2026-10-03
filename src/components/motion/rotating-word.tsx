"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { SPRING } from "./springs";

/**
 * Slot-machine word swap. The first word is server-rendered at full opacity
 * (sharp first paint); rotation starts after 2.4s. Reduced motion: the first
 * word only. Screen readers get the full list once, not every swap.
 */
export function RotatingWord({ words, className }: { words: readonly string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || words.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), 2400);
    return () => window.clearInterval(id);
  }, [reduce, words.length]);

  return (
    <span className={className} data-testid="rotating-word">
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden="true" className="relative inline-grid overflow-hidden text-left align-bottom">
        {/* Reserve width of the longest word so the line never jumps. */}
        {words.map((w) => (
          <span key={w} className="invisible col-start-1 row-start-1 whitespace-nowrap">
            {w}
          </span>
        ))}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={words[index]}
            className="col-start-1 row-start-1 whitespace-nowrap"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={SPRING.ui}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
