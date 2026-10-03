"use client";

import { motion, useReducedMotion } from "motion/react";

interface HeroIntroProps {
  eyebrow: string;
  headline: string;
  nameLine: React.ReactNode;
  tagline: string;
  children: React.ReactNode;
}

/** Hero text with a short staggered entrance (fade only under reduced motion). */
export function HeroIntro({ eyebrow, headline, nameLine, tagline, children }: HeroIntroProps) {
  const reduce = useReducedMotion();
  const item = (i: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0.2 : 0.6, ease: [0.22, 1, 0.36, 1] as const, delay: reduce ? 0 : 0.08 * i },
  });

  return (
    <div className="relative mx-auto flex max-w-5xl flex-col items-start gap-6 px-5 pt-36 pb-28 md:items-center md:px-8 md:pt-48 md:pb-36 md:text-center">
      <motion.p {...item(0)} className="label-mono flex items-center gap-2 text-ink-3">
        <span className="size-2 rounded-full bg-success" aria-hidden="true" />
        {eyebrow}
      </motion.p>
      <motion.h1 {...item(1)} id="hero-title" className="text-[2.75rem] leading-[1.08] md:text-[5.5rem]">
        {headline}
      </motion.h1>
      <motion.p {...item(2)} className="font-display text-xl text-ink-1 md:text-2xl">
        {nameLine}
      </motion.p>
      <motion.p {...item(3)} className="max-w-2xl text-lg leading-relaxed text-ink-2 md:text-xl">
        {tagline}
      </motion.p>
      <motion.div {...item(4)} className="mt-2 flex flex-wrap gap-3 md:justify-center">
        {children}
      </motion.div>
    </div>
  );
}
