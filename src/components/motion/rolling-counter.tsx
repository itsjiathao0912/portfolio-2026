"use client";

import { animate, useInView } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useEffect, useRef, useState } from "react";
import { formatCounter, parseCounter } from "./springs";

/**
 * Rolls a real number up from 0 when it scrolls into view, keeping the
 * source's prefix/suffix ("+30%", "~20"). Server render and no-JS show the
 * final value; reduced motion shows it immediately. Non-numeric values
 * ("2nd") render as-is.
 */
export function RollingCounter({ value, className }: { value: string; className?: string }) {
  const spec = parseCounter(value);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const [text, setText] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    if (!spec || reduce || !inView || started.current) return;
    started.current = true;
    const controls = animate(0, spec.target, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (n) => setText(formatCounter(n, spec)),
      onComplete: () => setText(value),
    });
    return () => controls.stop();
    // spec is derived from value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }} aria-label={value} data-counter="">
      <span aria-hidden="true">{text}</span>
    </span>
  );
}
