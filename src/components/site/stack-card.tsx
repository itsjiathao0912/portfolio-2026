"use client";

import { ArrowRight } from "lucide-react";
import type { Project } from "@content/schema.ts";
import { EmojiBurst } from "@/components/motion/emoji-burst";
import { Magnetic } from "@/components/motion/magnetic";
import { RollingCounter } from "@/components/motion/rolling-counter";
import { Tilt } from "@/components/motion/tilt";
import { TransitionLink } from "@/components/motion/transition-link";
import { LiftCard } from "@/components/ui/lift-card";
import { cn } from "@/lib/utils";
import { CardStamp } from "./home/card-stamp";
import { ProjectVisual } from "./project-visual";

export type StackSurface = "white" | "gradient" | "dark";

const GRADIENT: Record<Project["meta"]["tint"], string> = {
  sky: "from-tint-sky",
  periwinkle: "from-tint-periwinkle",
  lavender: "from-tint-lavender",
  rose: "from-tint-rose",
  peach: "from-tint-peach",
  butter: "from-tint-butter",
  mint: "from-tint-mint",
  aqua: "from-tint-aqua",
};

/** Fallback accent when a project has no colour of its own. */
export const DEFAULT_PROJECT_COLOR = "#6b6c72";

/**
 * One project in the home stack: logo/eyebrow, big outcome headline, blurb,
 * the cover visual (3D tilt on fine pointers), and a proof bar with rolling
 * counters + a short "Case study" CTA. Hover floods the card with the
 * project's own colour from where the pointer entered; the eyebrow emoji
 * bursts on hover/tap. Clicking the CTA morphs the visual into the case hero.
 */
export function StackCard({ project, surface = "white" }: { project: Project; surface?: StackSurface }) {
  const { meta } = project;
  const dark = surface === "dark";
  const color = meta.color ?? DEFAULT_PROJECT_COLOR;
  const href = `/work/${project.slug}`;

  function onEnter(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--fx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--fy", `${event.clientY - rect.top}px`);
  }

  return (
    <div id={`project-${project.slug}`} data-testid="stack-card" data-slug={project.slug} className="relative scroll-mt-28">
      <LiftCard radius="rounded-[16px]">
        <CardStamp slug={project.slug} />
        <article
          data-morph-root=""
          onPointerEnter={onEnter}
          style={{ ["--project-color" as string]: color }}
          className={cn(
            "flood group/card relative overflow-hidden rounded-[16px] px-3 pt-12 pb-3 text-center md:px-5 md:pt-[52px] md:pb-5",
            surface === "white" && "bg-bg",
            surface === "gradient" && cn("bg-gradient-to-b to-bg to-60%", GRADIENT[meta.tint]),
            dark && "bg-ink-1 text-bg"
          )}
        >
      <div className="relative z-[1]">
        <p className={cn("flex items-center justify-center gap-2 text-[15px] font-semibold", dark ? "text-white/70" : "text-ink-1")}>
          {meta.emoji ? (
            <EmojiBurst emojis={[meta.emoji, meta.emoji, "✨"]} className="relative inline-flex">
              <span aria-hidden="true" className="text-[18px] leading-none" data-testid="project-emoji">
                {meta.emoji}
              </span>
            </EmojiBurst>
          ) : null}
          <span>
            {project.title}
            <span className={cn("font-normal", dark ? "text-white/50" : "text-ink-3")}> · {meta.company}</span>
          </span>
        </p>
        <h3 className={cn("mx-auto mt-5 max-w-[620px] text-balance text-[30px] leading-[1.12] md:text-[46px]", dark && "!text-bg")}>
          {meta.headline || meta.subtitle || project.title}
        </h3>
        <p className={cn("mx-auto mt-4 max-w-[600px] px-2 text-[16px] leading-[1.6] md:text-[18px]", dark ? "text-white/80" : "text-ink-1")}>
          {project.summary}
        </p>
        <Tilt className="mx-auto mt-10 max-w-[640px] px-2 md:mt-8">
          <div data-morph-target="">
            <ProjectVisual visual={meta.visual} label={project.title} logo={meta.logo} tone={dark ? "deep" : "light"} size="hero" />
          </div>
        </Tilt>
        <div
          className={cn(
            "mt-8 flex flex-col items-center gap-6 rounded-[16px] p-6 text-left md:mt-8 md:flex-row md:justify-between md:px-10 md:py-6",
            dark ? "bg-white/10" : "bg-black/[0.04]"
          )}
        >
          {meta.proof.length > 0 ? (
            <dl className="flex flex-wrap justify-center gap-x-10 gap-y-4 md:justify-start">
              {meta.proof.map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1 text-center md:flex-row md:items-baseline md:gap-2 md:text-left">
                  <dt className="sr-only">{item.label}</dt>
                  <dd className={cn("font-display text-[28px] md:text-[24px]", dark ? "text-bg" : "text-ink-1")}>
                    <RollingCounter value={item.value} />
                  </dd>
                  <dd className={cn("max-w-[200px] text-[14px] leading-[1.35]", dark ? "text-white/70" : "text-ink-1")}>{item.label}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <span />
          )}
          <Magnetic>
            <TransitionLink
              href={href}
              morphSelector="[data-morph-target]"
              data-testid="stack-cta"
              className={cn(
                "font-display inline-flex shrink-0 items-center gap-3 rounded-full px-8 py-4 text-[16px] whitespace-nowrap transition-colors duration-[400ms] md:px-10 md:py-5",
                dark ? "bg-bg text-ink-1 hover:bg-white/85" : "bg-ink-1 text-bg hover:bg-ink-hover"
              )}
            >
              Case study <ArrowRight className="size-5" aria-hidden="true" />
              <span className="sr-only">: {project.title}</span>
            </TransitionLink>
          </Magnetic>
        </div>
      </div>
        </article>
      </LiftCard>
    </div>
  );
}
