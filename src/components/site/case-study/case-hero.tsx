"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import type { Project } from "@content/schema.ts";
import { TINT_BG, TINT_GRADIENT } from "@/lib/tints";
import { cn } from "@/lib/utils";
import { ScreenFrame } from "./screen-frame";
import { Tilt } from "./tilt";

/** Shared-element name; the work cards use the same scheme. */
export function projectTransitionName(slug: string) {
  return `project-card-${slug}`;
}

/** The hero subline: the lede, else the summary — never a copy of the headline. */
export function heroLede(project: Project) {
  const headline = (project.meta.headline || project.title).trim().toLowerCase();
  const lede = (project.meta.lede || project.summary).trim();
  return lede.toLowerCase() === headline ? "" : lede;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Case-study hero. One header (badge, short headline, distinct lede) and a
 * visual that depends on the layout:
 * - story: one big tilted device with the real screen, on the project tint.
 * - showcase: a fan of real screens that spreads as you scroll.
 * - magazine: no device; a thin tint band and the lead figure, if any.
 */
export function CaseHero({ project, coverId }: { project: Project; coverId: string }) {
  const { meta } = project;
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const spread = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  // Text starts at 70% opacity so the headline is readable on the first frame.
  const rise = (index: number, from = 0.7) => ({
    initial: { opacity: reduce ? 1 : from, y: reduce ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0 : 0.45, ease: EASE, delay: reduce ? 0 : index * 0.06 },
  });
  const lede = heroLede(project);
  const headline = meta.headline || project.title;
  const words = headline.split(" ");
  const layout = meta.layout;
  const screens = [
    ...(meta.visual.kind === "mockup" ? [{ ...meta.visual.screen, device: meta.visual.device }] : []),
    ...meta.screens,
  ];
  const hasScreens = screens.length > 0;
  // Magazine lead figure: the first proof point the headline doesn't already state.
  const digits = (text: string) => text.replace(/[^0-9]/g, "");
  const figure = meta.proof.find((p) => !digits(p.value) || !headline.includes(digits(p.value)));

  return (
    <header
      ref={ref}
      className={cn("relative overflow-hidden", layout === "magazine" ? "bg-bg" : cn("bg-gradient-to-b via-bg/60 to-bg", TINT_GRADIENT[meta.tint]))}
      data-testid="case-hero"
      data-layout={layout}
    >
      {layout === "magazine" ? <div aria-hidden="true" className={cn("h-2 w-full", TINT_BG[meta.tint])} /> : null}
      <div className={cn("mx-auto flex flex-col px-5 pt-32 md:pt-[150px]", layout === "magazine" ? "max-w-[800px] items-start text-left" : "max-w-[960px] items-center text-center")}>
        <motion.div {...rise(0)} className="flex items-center gap-3" data-testid="project-badge">
          <span className="flex size-12 items-center justify-center overflow-hidden rounded-md bg-bg shadow-2">
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
        <h1
          className="mt-8 max-w-[920px] text-[2.6rem] leading-[1.1] tracking-normal text-balance [font-stretch:100%] md:text-[4.7rem] md:leading-[1.06]"
          data-testid="case-headline"
        >
          {/* Kinetic headline: words rise on a short stagger; readable from the first frame. */}
          {words.map((word, i) => (
            <span key={`${word}-${i}`}>
              <motion.span className="inline-block" {...rise(1 + i * 0.35)}>
                {word}
              </motion.span>
              {i < words.length - 1 ? " " : null}
            </span>
          ))}
        </h1>
        {lede ? (
          <motion.p {...rise(4)} className="mt-6 max-w-[40rem] text-xl leading-[1.45] text-pretty text-ink-2 md:text-[1.6rem] md:leading-[1.4]" data-testid="case-lede">
            {lede}
          </motion.p>
        ) : null}
        {layout === "magazine" && figure ? (
          <motion.p {...rise(5)} className="mt-10 flex items-baseline gap-4 border-t border-hairline pt-6" data-testid="hero-figure">
            <span className="font-display text-[3.5rem] leading-none text-ink-1 md:text-[5rem]">{figure.value}</span>
            <span className="max-w-[16rem] text-base leading-snug text-ink-2">{figure.label}</span>
          </motion.p>
        ) : null}
      </div>

      {layout !== "magazine" && hasScreens ? (
        <motion.div
          {...rise(6, 0)}
          id={coverId}
          style={{ viewTransitionName: projectTransitionName(project.slug) }}
          className="relative mx-auto mt-14 max-w-[1040px] px-5 md:mt-20"
          data-testid="case-cover"
        >
          {layout === "showcase" ? (
            <Fan screens={screens} spread={spread} reduce={!!reduce} />
          ) : (
            <div className="mx-auto max-w-[900px] [mask-image:linear-gradient(#000_80%,transparent)]">
              <Tilt max={6} rest={{ x: 8, y: 0 }}>
                <ScreenFrame device={screens[0].device} screens={[screens[0]]} priority sizes="(min-width: 1024px) 900px, 92vw" />
              </Tilt>
            </div>
          )}
        </motion.div>
      ) : (
        <div id={coverId} aria-hidden="true" className="h-16" style={{ viewTransitionName: projectTransitionName(project.slug) }} />
      )}
    </header>
  );
}

/** Up to three real screens fanned out; scrolling spreads them further. */
function Fan({ screens, spread, reduce }: { screens: { src: string; alt: string; device: "laptop" | "phone" | "browser-free" }[]; spread: MotionValue<number>; reduce: boolean }) {
  const [main, ...rest] = screens;
  const side = rest.slice(0, 2);
  const leftX = useTransform(spread, [0, 1], ["0%", "-14%"]);
  const rightX = useTransform(spread, [0, 1], ["0%", "14%"]);
  const leftR = useTransform(spread, [0, 1], [-6, -12]);
  const rightR = useTransform(spread, [0, 1], [6, 12]);
  const sideStyle = (i: number) => (reduce ? { rotate: i === 0 ? -6 : 6 } : { x: i === 0 ? leftX : rightX, rotate: i === 0 ? leftR : rightR });
  return (
    <div className="relative mx-auto flex max-w-[960px] items-end justify-center pb-10" data-testid="fan">
      {side.map((screen, i) => (
        <motion.div
          key={screen.src}
          style={sideStyle(i)}
          className={cn("absolute bottom-6 w-[34%] md:w-[30%]", i === 0 ? "left-[2%] origin-bottom-right" : "right-[2%] origin-bottom-left", screen.device === "phone" && "w-[24%] md:w-[19%]")}
        >
          <ScreenFrame device={screen.device === "phone" ? "phone" : "plain"} screens={[screen]} sizes="320px" />
        </motion.div>
      ))}
      <div className={cn("relative z-10", main.device === "phone" ? "w-[44%] md:w-[30%]" : "w-[78%] md:w-[66%]")}>
        <Tilt max={5}>
          <ScreenFrame device={main.device} screens={[main]} priority sizes="(min-width: 1024px) 640px, 80vw" />
        </Tilt>
      </div>
    </div>
  );
}
