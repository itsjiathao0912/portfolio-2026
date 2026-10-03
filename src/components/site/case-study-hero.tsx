"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import type { Project } from "@content/schema.ts";
import { TINT_GRADIENT } from "@/lib/tints";
import { cn } from "@/lib/utils";
import { ProjectVisual } from "./project-visual";

interface CaseStudyHeroProps {
  project: Project;
  /** Id on the cover wrapper; the section navigators watch it. */
  coverId: string;
}

/**
 * Centred cover: product badge (logo tile + name + one proof line), an
 * outcome-sentence headline, the summary as a subline, then the device mockup
 * or illustration running off the bottom of a tint-to-white gradient.
 * Children rise 16 px and fade in on a 500 ms stagger; the visual follows a
 * beat later. Reduced motion keeps a short fade only.
 */
export function CaseStudyHero({ project, coverId }: CaseStudyHeroProps) {
  const { meta } = project;
  const reduce = useReducedMotion();
  const rise = (index: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0.15 : 0.5, ease: [0.22, 1, 0.36, 1] as const, delay: reduce ? 0 : index * 0.08 },
  });

  return (
    <header className={cn("relative overflow-hidden bg-gradient-to-b via-bg/60 to-bg", TINT_GRADIENT[meta.tint])} data-testid="case-hero">
      <div className="mx-auto flex max-w-[800px] flex-col items-center px-5 pt-32 text-center md:pt-[150px]">
        <motion.div {...rise(0)} className="flex items-center gap-3" data-testid="project-badge">
          <span className="flex size-12 items-center justify-center overflow-hidden rounded-xl bg-bg shadow-nav">
            {meta.logo ? (
              <Image src={meta.logo} alt="" width={36} height={36} unoptimized className="size-8 object-contain" />
            ) : (
              <span className="font-display text-xl text-navy" aria-hidden="true">
                {project.title.slice(0, 1)}
              </span>
            )}
          </span>
          <span className="flex flex-col items-start text-left">
            <span className="text-sm font-bold text-ink-1">{project.title}</span>
            <span className="text-sm text-ink-2">{meta.status || meta.subtitle}</span>
          </span>
        </motion.div>
        <motion.h1
          {...rise(1)}
          className="mt-8 text-[2.6rem] leading-[1.15] tracking-normal text-balance [font-stretch:100%] md:text-[4.7rem] md:leading-[1.1]"
        >
          {meta.headline || project.summary}
        </motion.h1>
        <motion.p {...rise(2)} className="mt-6 max-w-[800px] text-xl leading-[1.45] text-pretty text-ink-2 md:text-[1.9rem] md:leading-[1.4]">
          {project.summary}
        </motion.p>
      </div>
      <motion.div
        {...rise(4)}
        id={coverId}
        className={cn("relative mx-auto mt-14 px-5 md:mt-20", meta.visual.kind === "illustration" ? "max-w-[620px]" : "max-w-[860px]")}
      >
        <div className="[mask-image:linear-gradient(#000_78%,transparent)]">
          <ProjectVisual visual={meta.visual} label={project.title} logo={meta.logo} tone="light" priority size="hero" />
        </div>
      </motion.div>
    </header>
  );
}
