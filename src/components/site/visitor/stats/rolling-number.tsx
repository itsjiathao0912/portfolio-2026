"use client";

import { motion, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * A number that rolls to its new value (a soft spring), so a live count visibly
 * ticks instead of snapping. The first value counts up from 0. Under reduced
 * motion it simply shows the number. `format` defaults to thousands separators.
 */
export function RollingNumber({ value, className, format = (n: number) => Math.round(n).toLocaleString("en-US"), ...rest }: { value: number; className?: string; format?: (n: number) => string; "data-testid"?: string }) {
  const reduce = useReducedMotion();
  const spring = useSpring(reduce ? value : 0, { stiffness: 90, damping: 18, mass: 0.9 });
  const text = useTransform(spring, (v) => format(v));
  useEffect(() => {
    if (reduce) spring.jump(value);
    else spring.set(value);
  }, [value, reduce, spring]);
  if (reduce) return <span className={className} {...rest}>{format(value)}</span>;
  return (
    <motion.span className={className} {...rest}>
      {text}
    </motion.span>
  );
}
