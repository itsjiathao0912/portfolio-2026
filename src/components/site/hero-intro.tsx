"use client";

import { motion, useReducedMotion } from "motion/react";
import { EmojiBurst } from "@/components/motion/emoji-burst";
import { RotatingWord } from "@/components/motion/rotating-word";

interface HeroIntroProps {
  headline: string;
  intro: string;
  /** Rolling words for "I build ___" (first one is the server-rendered word). */
  builds?: readonly string[];
  children?: React.ReactNode;
}

/**
 * Hero text. Server-rendered at FULL opacity (sharp first paint, never grey);
 * once hydrated it only settles 12px upward in ~250ms. Reduced motion: static.
 */
export function HeroIntro({ headline, intro, builds = [], children }: HeroIntroProps) {
  const reduce = useReducedMotion();
  const item = (i: number) => ({
    initial: reduce ? false : ({ opacity: 1, y: 12 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const, delay: 0.04 * i },
  });

  return (
    <div className="relative mx-auto flex max-w-[1180px] flex-col items-start gap-6 px-10 pt-[120px] md:items-center md:px-8 md:pt-[180px] md:text-center">
      <motion.h1
        {...item(0)}
        id="hero-title"
        className="text-balance text-[39px] leading-[1.12] md:text-[64px] md:leading-[1.1] lg:text-[80px]"
      >
        {headline}
      </motion.h1>
      {builds.length > 0 ? (
        <motion.p {...item(1)} className="font-display text-[24px] leading-[1.25] text-ink-1 md:text-[32px]" data-testid="hero-builds">
          I build <RotatingWord words={builds} className="text-ink-3" />
        </motion.p>
      ) : null}
      {intro ? (
        <motion.p {...item(2)} className="max-w-[832px] text-[20px] leading-[1.35] font-medium text-ink-1 md:text-[24px]">
          {intro}{" "}
          <EmojiBurst emojis={["🇻🇳", "🍜", "☕", "🛵", "🇻🇳"]} className="relative inline-flex cursor-default">
            <span role="img" aria-label="Vietnam flag" data-testid="hero-flag">
              🇻🇳
            </span>
          </EmojiBurst>
        </motion.p>
      ) : null}
      {children ? <motion.div {...item(3)} className="w-full">{children}</motion.div> : null}
    </div>
  );
}
