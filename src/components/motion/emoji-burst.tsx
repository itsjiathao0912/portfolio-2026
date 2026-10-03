"use client";

import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useCallback, useRef, useState } from "react";

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  rotate: number;
}

const MAX_PARTICLES = 10;
const THROTTLE_MS = 400;

/** Deterministic-enough spray: angles spread over an upward arc. */
export function burstParticles(emojis: readonly string[], count: number, seed: number) {
  const n = Math.min(count, MAX_PARTICLES);
  return Array.from({ length: n }, (_, i) => {
    const angle = -Math.PI / 2 + ((i / Math.max(1, n - 1)) - 0.5) * Math.PI * 0.9;
    const r = 46 + ((seed + i * 37) % 30);
    return {
      id: seed * 100 + i,
      emoji: emojis[i % emojis.length],
      x: Math.round(Math.cos(angle) * r),
      y: Math.round(Math.sin(angle) * r),
      rotate: ((seed + i * 53) % 60) - 30,
    };
  });
}

/**
 * Wraps a trigger; on hover (fine pointer) or tap it sprays a few emoji that
 * arc out and fade. Capped at 10 particles, one burst per 400ms. Reduced
 * motion: nothing. Decorative only (aria-hidden).
 */
export function EmojiBurst({
  emojis,
  children,
  className,
  count = 7,
}: {
  emojis: readonly string[];
  children: React.ReactNode;
  className?: string;
  count?: number;
}) {
  const reduce = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);
  const last = useRef(0);
  const seed = useRef(1);

  const fire = useCallback(() => {
    if (reduce || emojis.length === 0) return;
    const now = Date.now();
    if (now - last.current < THROTTLE_MS) return;
    last.current = now;
    seed.current += 1;
    const batch = burstParticles(emojis, count, seed.current);
    setParticles(batch);
    window.setTimeout(() => setParticles((p) => (p[0]?.id === batch[0]?.id ? [] : p)), 750);
  }, [reduce, emojis, count]);

  return (
    <span
      className={className ?? "relative inline-flex"}
      onPointerEnter={(e) => e.pointerType === "mouse" && fire()}
      onPointerDown={(e) => e.pointerType !== "mouse" && fire()}
      data-burst=""
    >
      {children}
      <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 z-20">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-[20px] leading-none select-none"
              initial={{ x: 0, y: 0, scale: 0.4, opacity: 1, rotate: 0 }}
              animate={{ x: p.x, y: p.y, scale: 1, opacity: [1, 1, 0], rotate: p.rotate }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, opacity: { duration: 0.7, times: [0, 0.6, 1] } }}
            >
              {p.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
    </span>
  );
}
