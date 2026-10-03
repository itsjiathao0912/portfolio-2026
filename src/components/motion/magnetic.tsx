"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { MAGNET_MAX, PRESS_SCALE, SPRING, magnetOffset } from "./springs";
import { useFinePointer } from "./use-fine-pointer";

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  /** Max travel in px (capped at 6). */
  strength?: number;
  /** Grow on press (default true). */
  press?: boolean;
}

/**
 * Squishy magnetic wrapper. Fine pointers: drifts up to 6px toward the cursor
 * and springs back on leave. Every pointer: grows to 1.06 on press. Reduced
 * motion: static. Wraps a single inline child (button or link).
 */
export function Magnetic({ children, className, strength = MAGNET_MAX, press = true }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), SPRING.magnet);
  const y = useSpring(useMotionValue(0), SPRING.magnet);
  const live = fine && !reduce;

  function onMove(event: React.PointerEvent) {
    if (!live || event.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const o = magnetOffset(
      event.clientX - (rect.left + rect.width / 2),
      event.clientY - (rect.top + rect.height / 2),
      rect.width / 2,
      rect.height / 2,
      Math.min(strength, MAGNET_MAX)
    );
    x.set(o.x);
    y.set(o.y);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.span
      ref={ref}
      data-magnetic=""
      className={cn("inline-flex", className)}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
      whileTap={press && !reduce ? { scale: PRESS_SCALE } : undefined}
      transition={SPRING.press}
    >
      {children}
    </motion.span>
  );
}
