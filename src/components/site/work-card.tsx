"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Project } from "@content/schema.ts";
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
 * Hover (mouse only): scale 1.02 over 200 ms plus a tilt capped at 2 degrees.
 * Touch only gets an `active:` press, so nothing can stay stuck.
 */
export function WorkCard({ project, className, priority, headingLevel = "h2" }: WorkCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { meta } = project;
  const deep = meta.tone === "deep";
  const Heading = headingLevel;

  function onMove(event: React.PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 2).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 2).toFixed(2)}deg`);
  }
  function onLeave() {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  }

  return (
    <Link
      ref={ref}
      href={`/work/${project.slug}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      data-testid="project-card"
      data-category={project.category}
      data-tone={meta.tone}
      className={cn(
        "group relative flex h-full min-h-[560px] flex-col items-center overflow-hidden rounded-[26px] px-6 pt-10 text-center md:rounded-[20px] md:px-10 xl:min-h-[742px]",
        "[transform:perspective(1200px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] transition-[transform,box-shadow] duration-200 ease-out",
        "hover:shadow-card-hover hover:[transform:perspective(1200px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))_scale(1.02)]",
        "focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-accent",
        "active:scale-[0.985] motion-reduce:transition-[box-shadow] motion-reduce:hover:[transform:none]",
        deep ? "bg-navy text-white" : TINT_BG[meta.tint],
        className
      )}
    >
      <p className={cn("text-base font-medium", deep ? "text-white/70" : "text-ink-2")}>
        {meta.company}
        {meta.status ? ` · ${meta.status}` : ""}
      </p>
      <Heading className={cn("mt-3 text-[2rem] leading-[1.2]", deep && "!text-white")}>{project.title}</Heading>
      <p className={cn("mt-3 max-w-[22rem] text-base leading-[1.6]", deep ? "text-white/80" : "text-ink-2")}>
        {meta.subtitle}
      </p>
      {/* Visual: anchored to the bottom, wider than the card, running off the
          bottom edge (and the sides, for laptops). */}
      <div className="relative flex w-full flex-1 items-end justify-center pt-12">
        {/* Soft spotlight behind the visual so the lower half never reads empty. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-[-10%] bottom-[-10%] h-[85%] rounded-[50%] blur-2xl",
            deep ? "bg-white/10" : "bg-white/55"
          )}
        />
        <div
          style={{ viewTransitionName: `project-card-${project.slug}` }}
          className={cn(
            "shrink-0 transition-transform duration-300 ease-out group-hover:-translate-y-2 motion-reduce:transform-none",
            meta.visual.kind === "illustration" ? "w-[112%] translate-y-[8%]" : "w-[118%] translate-y-[12%]"
          )}
        >
          <ProjectVisual visual={meta.visual} label={project.title} logo={meta.logo} tone={meta.tone} priority={priority} />
        </div>
      </div>
    </Link>
  );
}
