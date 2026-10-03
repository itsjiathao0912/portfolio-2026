"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Position within a staggered group (0-based). */
  index?: number;
  as?: "div" | "li";
  /** Seconds for the fade + rise (default 0.6). */
  duration?: number;
  /** Seconds between siblings in a stagger (default 0.07, capped at 6 steps). */
  stagger?: number;
}

/**
 * Fade + rise once when the element first enters the viewport. Reduced motion
 * keeps a short fade and drops the movement.
 */
export function Reveal({ children, className, index = 0, as = "div", duration = 0.6, stagger = 0.07 }: RevealProps) {
  const reduce = useReducedMotion();
  const Component = as === "li" ? motion.li : motion.div;
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -6% 0px" }}
      transition={{
        duration: reduce ? 0.2 : duration,
        ease: [0.22, 1, 0.36, 1],
        delay: reduce ? 0 : Math.min(index, 6) * stagger,
      }}
      data-reveal=""
    >
      {children}
    </Component>
  );
}
