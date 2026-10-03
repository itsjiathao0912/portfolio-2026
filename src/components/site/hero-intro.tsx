"use client";

import { motion, useReducedMotion } from "motion/react";

interface HeroIntroProps {
  headline: string;
  intro: string;
  children?: React.ReactNode;
}

/**
 * Hero text. Server-rendered already visible (opacity 0.3, never 0), then
 * settles up over ~500ms once hydrated — so the hero is never blank on load.
 * Reduced motion: a short fade only.
 */
export function HeroIntro({ headline, intro, children }: HeroIntroProps) {
  const reduce = useReducedMotion();
  const item = (i: number) => ({
    initial: { opacity: 0.3, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0.15 : 0.5, ease: [0.22, 1, 0.36, 1] as const, delay: reduce ? 0 : 0.05 * i },
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
      {intro ? (
        <motion.p {...item(1)} className="max-w-[832px] text-[24px] leading-[1.3] font-medium text-ink-1 md:text-[28px]">
          {intro}
        </motion.p>
      ) : null}
      {children ? <motion.div {...item(2)} className="w-full">{children}</motion.div> : null}
    </div>
  );
}
