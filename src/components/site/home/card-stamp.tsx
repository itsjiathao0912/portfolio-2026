"use client";

import { motion, useInView } from "motion/react";
import { useId, useRef } from "react";
import { SPRING } from "@/components/motion/springs";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { stampFor } from "./project-meta";

/**
 * M1: the stamp that lands on the top edge of a project card, once, as the card
 * scrolls in. scale 1.4 -> 1, rotate -14 -> -8, spring `stamp`, and a press
 * halo that blooms under it and fades. Ink = navy at 88%, multiplied, with SVG
 * grain. Reduced motion: drawn at rest from first paint. The word is real text
 * in an accessible label; the frame is decorative.
 */
export function CardStamp({ slug }: { slug: string }) {
  const { word, sub } = stampFor(slug);
  const ref = useRef<HTMLDivElement>(null);
  // The stamp sits on the card's top edge, so "the stamp is inside the top 70%
  // of the viewport" is the same moment as "the card's top edge reached 70%".
  const landed = useInView(ref, { once: true, margin: "0px 0px -30% 0px" });
  const reduce = useReducedMotion();
  const grain = useId().replace(/:/g, "");

  return (
    <div
      ref={ref}
      data-testid="card-stamp"
      data-landed={landed || reduce ? "true" : "false"}
      role="img"
      aria-label={`Stamp: ${word}${sub ? `, ${sub}` : ""}`}
      className="pointer-events-none absolute -top-9 right-4 z-10 h-[90px] w-[150px] select-none md:-top-12 md:right-10 md:h-[144px] md:w-[240px]"
    >
      <motion.div
        className="relative size-full"
        style={{ mixBlendMode: "multiply", opacity: 0.88 }}
        initial={reduce ? { rotate: -8 } : { scale: 1.4, rotate: -14, opacity: 0 }}
        animate={reduce ? { rotate: -8 } : landed ? { scale: 1, rotate: -8, opacity: 1 } : undefined}
        transition={SPRING.stamp}
      >
        {reduce ? null : (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-[12px]"
            initial={{ boxShadow: "0 0 0 0 rgba(11,21,51,0)" }}
            animate={landed ? { boxShadow: ["0 0 0 0 rgba(11,21,51,0)", "0 0 0 6px rgba(11,21,51,0.10)", "0 0 0 0 rgba(11,21,51,0)"] } : undefined}
            transition={{ delay: 0.18, duration: 0.6, times: [0, 0.3, 1], ease: "easeOut" }}
          />
        )}
        <svg viewBox="0 0 120 72" className="size-full" aria-hidden="true" focusable="false">
          <defs>
            <filter id={grain}>
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
              <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.3" />
              <feComposite in="SourceGraphic" operator="in" />
            </filter>
          </defs>
          <g filter={`url(#${grain})`} fill="none" stroke="var(--navy-ink, #0b1533)">
            <rect x="2.5" y="2.5" width="115" height="67" rx="10" strokeWidth="2.5" />
            <rect x="7.5" y="7.5" width="105" height="57" rx="6" strokeWidth="1" />
            <text
              x="60"
              y={sub ? 37 : 42}
              textAnchor="middle"
              fill="var(--navy-ink, #0b1533)"
              stroke="none"
              className="font-display"
              fontWeight="800"
              fontSize={word.length > 7 ? 13 : 16}
              letterSpacing="1.8"
            >
              {word}
            </text>
            {sub ? (
              <text x="60" y="53" textAnchor="middle" fill="var(--navy-ink, #0b1533)" stroke="none" className="font-mono" fontSize="7.5" letterSpacing="0.8">
                {sub}
              </text>
            ) : null}
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
