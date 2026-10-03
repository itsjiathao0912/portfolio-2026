"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * 3D tilt for mockups: the child leans up to `max` degrees toward a fine
 * pointer and springs back on leave. Touch and reduced motion get a flat frame
 * (`rest` tilt only), so nothing can stick.
 */
export function Tilt({ children, className, max = 6, rest = { x: 0, y: 0 } }: { children: React.ReactNode; className?: string; max?: number; rest?: { x: number; y: number } }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 220, damping: 22 };
  const rotateY = useSpring(useTransform(px, (v) => rest.y + v * max), spring);
  const rotateX = useSpring(useTransform(py, (v) => rest.x - v * max), spring);

  function onMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  }
  function onLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <div className={cn("[perspective:1400px]", className)} onPointerMove={onMove} onPointerLeave={onLeave} data-testid="tilt">
      <motion.div style={reduce ? { rotateX: rest.x, rotateY: rest.y } : { rotateX, rotateY }} className="[transform-style:preserve-3d]">
        {children}
      </motion.div>
    </div>
  );
}
