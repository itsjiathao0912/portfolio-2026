"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useId, useRef } from "react";

type Tone = "approved" | "shipped" | "compliant";

const TONES: Record<Tone, string> = {
  approved: "#1d4ed8",
  shipped: "#15803d",
  compliant: "#4f46e5",
};

type Props = {
  /** Word on the stamp. Defaults to the tone name in caps. */
  label?: string;
  tone?: Tone;
  /** Small line under the word, e.g. "Q3 · AABW". */
  sublabel?: string;
  /** Degrees of tilt. */
  rotate?: number;
  size?: number;
  className?: string;
};

/**
 * A rubber stamp that slams onto a result when it scrolls into view: scale-in,
 * a small card shake, and an ink-spread SVG noise texture. Reduced motion just
 * fades the stamp in at rest. Decorative frame; the word is real text.
 */
export function ApprovedStamp({ label, tone = "approved", sublabel, rotate = -8, size = 168, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduce = useReducedMotion();
  const filterId = useId().replace(/:/g, "");
  const ink = TONES[tone];
  const word = (label ?? tone).toUpperCase();

  return (
    <motion.div
      ref={ref}
      role="img"
      aria-label={`Stamp: ${word}${sublabel ? `, ${sublabel}` : ""}`}
      className={`inline-block select-none ${className}`}
      style={{ width: size, height: size * 0.62 }}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 2.4, rotate: rotate - 10 }}
      animate={inView ? (reduce ? { opacity: 0.92 } : { opacity: 0.92, scale: 1, rotate }) : undefined}
      transition={reduce ? { duration: 0.3 } : { type: "spring", stiffness: 520, damping: 18, mass: 0.9 }}
    >
      <motion.div
        className="h-full w-full"
        animate={inView && !reduce ? { x: [0, -3, 3, -2, 1, 0] } : undefined}
        transition={{ delay: 0.18, duration: 0.32 }}
      >
        <svg viewBox="0 0 200 124" className="h-full w-full" aria-hidden>
          <defs>
            <filter id={filterId}>
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
              <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.25" />
              <feComposite in="SourceGraphic" operator="in" />
            </filter>
          </defs>
          <g filter={`url(#${filterId})`} fill="none" stroke={ink}>
            <rect x="6" y="6" width="188" height="112" rx="14" strokeWidth="6" />
            <rect x="16" y="16" width="168" height="92" rx="8" strokeWidth="2" />
            <text
              x="100"
              y={sublabel ? 70 : 76}
              textAnchor="middle"
              fill={ink}
              stroke="none"
              fontFamily="var(--font-mono, ui-monospace, monospace)"
              fontWeight="800"
              fontSize={word.length > 8 ? 24 : 30}
              letterSpacing="3"
            >
              {word}
            </text>
            {sublabel && (
              <text x="100" y="94" textAnchor="middle" fill={ink} stroke="none" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="2">
                {sublabel.toUpperCase()}
              </text>
            )}
          </g>
        </svg>
      </motion.div>
    </motion.div>
  );
}
