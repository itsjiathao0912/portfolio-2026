"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useRef } from "react";
import { SPRING } from "./springs";
import { useFinePointer } from "./use-fine-pointer";

/**
 * 3D tilt toward the cursor (max 6deg) with the child lifted on a parallax
 * layer. Fine pointers only; touch and reduced motion stay flat.
 */
export function Tilt({ children, className, max = 6 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), SPRING.tilt);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), SPRING.tilt);
  const x = useSpring(useTransform(px, [-0.5, 0.5], [-8, 8]), SPRING.tilt);
  const y = useSpring(useTransform(py, [-0.5, 0.5], [-6, 6]), SPRING.tilt);
  const live = fine && !reduce;

  return (
    <div
      ref={ref}
      className={className}
      style={{ perspective: 1000 }}
      data-tilt=""
      onPointerMove={(e) => {
        if (!live || e.pointerType !== "mouse") return;
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
    >
      <motion.div style={live ? { rotateX, rotateY, x, y, transformStyle: "preserve-3d" } : undefined}>{children}</motion.div>
    </div>
  );
}
