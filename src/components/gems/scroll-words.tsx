"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { wordRange } from "./logic";

function Word({ word, i, n, progress }: { word: string; i: number; n: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, wordRange(i, n) as unknown as number[], [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {word}{" "}
    </motion.span>
  );
}

/**
 * One editorial statement whose words go from grey to ink as it scrolls
 * through the viewport. The full sentence is real text for screen readers and
 * search (the per-word spans are presentation only). Reduced motion: full
 * ink, no scroll link. Works the same on touch.
 */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <p ref={ref} className={cn("text-balance", className)} data-testid="scroll-words">
      <span className="sr-only">{text}</span>
      {reduce ? (
        <span aria-hidden="true">{text}</span>
      ) : (
        <span aria-hidden="true">
          {words.map((w, i) => (
            <Word key={`${w}-${i}`} word={w} i={i} n={words.length} progress={scrollYProgress} />
          ))}
        </span>
      )}
    </p>
  );
}
