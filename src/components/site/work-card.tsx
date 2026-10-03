"use client";

import Link from "next/link";
import type { Project } from "@content/schema.ts";
import { LiftCard } from "@/components/ui/lift-card";
import { TINT_BG } from "@/lib/tints";
import { cn } from "@/lib/utils";
import { ProjectVisual } from "./project-visual";

interface WorkCardProps {
  project: Project;
  className?: string;
  /** Load the cover eagerly (first row of the index). */
  priority?: boolean;
  /** Heading level for the title (h2 on the index, h3 inside sections). */
  headingLevel?: "h2" | "h3";
}

/**
 * Poster-style project card for the work index and the "next project" slot:
 * centred eyebrow, title and one-line blurb, with the device mockup or
 * illustration anchored to the bottom and running off the edge.
 *
 * Hover/press/touch behaviour comes from the shared LiftCard.
 */
export function WorkCard({ project, className, priority, headingLevel = "h2" }: WorkCardProps) {
  const { meta } = project;
  // Minimal direction: every card is light (project tint); `meta.tone` no longer makes a black slab.
  const Heading = headingLevel;

  return (
    <LiftCard radius="rounded-2xl" className={cn("h-full bg-bg shadow-1", className)}>
    <Link
      href={`/work/${project.slug}`}
      data-testid="project-card"
      data-slug={project.slug}
      data-category={project.category}
      data-tone={meta.tone}
      className={cn(
        "group relative flex h-full min-h-[440px] flex-col items-center overflow-hidden rounded-2xl px-6 pt-10 text-center md:px-10 xl:min-h-[500px]",
        "focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-accent",
        TINT_BG[meta.tint]
      )}
    >
      <p className={"text-base font-medium text-ink-2"}>
        {meta.company}
        {meta.status ? ` · ${meta.status}` : ""}
      </p>
      <Heading className={"mt-3 text-[2rem] leading-[1.2]"}>{project.title}</Heading>
      <p className={"mt-3 max-w-[22rem] text-base leading-[1.6] text-ink-2"}>
        {meta.subtitle}
      </p>
      {/* Visual: anchored to the bottom, wider than the card, running off the
          bottom edge (and the sides, for laptops). */}
      <div className="relative mt-6 -mx-6 flex h-[300px] w-[calc(100%+3rem)] flex-none items-end justify-center overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_8%)] md:-mx-10 md:h-[340px] md:w-[calc(100%+5rem)]">
        {/* Soft spotlight behind the visual so the lower half never reads empty. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[-10%] bottom-[-10%] h-[85%] rounded-[50%] bg-white/55 blur-2xl"
        />
        <div
          style={{ viewTransitionName: `project-card-${project.slug}` }}
          className={cn(
            "shrink-0",
            meta.visual.kind === "illustration" ? "w-[110%] translate-y-[6%]" : "w-[112%] translate-y-[8%]"
          )}
        >
          <ProjectVisual visual={meta.visual} label={project.title} logo={meta.logo} tone="light" priority={priority} />
        </div>
      </div>
    </Link>
    </LiftCard>
  );
}
