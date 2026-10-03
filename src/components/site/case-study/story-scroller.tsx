"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useEffect, useRef, useState } from "react";
import type { BlockOf } from "@content/schema.ts";
import { cn } from "@/lib/utils";
import { ScreenFrame } from "./screen-frame";
import { Tilt } from "./tilt";

/**
 * Sticky storytelling. From `lg`, steps scroll in a left column while a pinned
 * device on the right crossfades to the screen of the step nearest the middle
 * of the viewport. Below `lg` each step is a plain text-then-screen pair (no
 * pinning: pinned scenes feel broken on phones).
 */
export function StoryScroller({ block }: { block: BlockOf<"story"> }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const reduce = useReducedMotion();

  useEffect(() => {
    const els = refs.current.filter((el): el is HTMLLIElement => el !== null);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const screens = block.steps.map((s) => ({ src: s.src, alt: s.alt }));
  const wide = block.device !== "phone";

  return (
    <div
      className={cn("relative my-12 lg:left-1/2 lg:grid lg:w-[min(1180px,100vw)] lg:-translate-x-1/2 lg:gap-14 lg:px-8", wide ? "lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]" : "lg:grid-cols-2")}
      data-testid="story"
      data-wide=""
    >
      <ol className="flex flex-col gap-16 lg:gap-0">
        {block.steps.map((step, i) => (
          <li
            key={step.title}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-index={i}
            data-active={active === i ? "true" : "false"}
            className="flex flex-col gap-6 lg:min-h-[78vh] lg:justify-center"
          >
            <div className={cn("flex flex-col gap-3 transition-opacity duration-300 lg:max-w-[24rem]", active === i ? "lg:opacity-100" : "lg:opacity-35")}>
              <span className="font-display text-[2rem] leading-none text-ink-1 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-2xl leading-tight font-semibold text-ink-1">{step.title}</p>
              <p className="text-[1.05rem] leading-[1.7] text-ink-2">{step.text}</p>
            </div>
            <div className="lg:hidden">
              <ScreenFrame device={block.device === "phone" ? "phone" : "browser"} screens={[{ src: step.src, alt: step.alt }]} />
            </div>
          </li>
        ))}
      </ol>
      <div className="hidden lg:block">
        <div className="sticky top-[calc(50vh-min(22vw,300px))] py-6">
          <Tilt max={5} rest={{ x: 4, y: -6 }}>
            <ScreenFrame device={block.device} screens={screens} active={active} sizes="(min-width: 1024px) 700px, 90vw" />
          </Tilt>
          <ol className="mt-6 flex justify-center gap-2" aria-hidden="true">
            {block.steps.map((step, i) => (
              <li key={step.title} className="relative h-1.5 w-8 overflow-hidden rounded-full bg-hairline">
                {active === i ? (
                  <motion.span layoutId="story-dot" className="absolute inset-0 rounded-full bg-accent" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }} />
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
