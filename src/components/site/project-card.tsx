"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import type { Project } from "@content/schema.ts";
import { mutedOnTint, TINT_BG } from "@/lib/tints";
import { cn } from "@/lib/utils";
import { MediaFrame } from "./media-frame";

interface ProjectCardProps {
  project: Project;
  size?: "large" | "compact";
  className?: string;
}

/**
 * Project card. On hover-capable devices it lifts, tilts slightly toward the
 * cursor and the screenshot slides up a few pixels. Touch gets a press dip that
 * releases on lift (active: state only — nothing can stay stuck).
 */
export function ProjectCard({ project, size = "large", className }: ProjectCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { meta } = project;

  function onMove(event: React.PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 4).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 5).toFixed(2)}deg`);
  }
  function onLeave() {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  }

  const muted = mutedOnTint(meta.tint);

  return (
    <Link
      ref={ref}
      href={`/work/${project.slug}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      data-testid="project-card"
      data-slug={project.slug}
      data-category={project.category}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[var(--radius)] p-6 shadow-card md:p-8",
        "[transform:perspective(1200px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] transition-[transform,box-shadow] duration-300 ease-out",
        "hover:shadow-card-hover hover:[transform:perspective(1200px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))_scale(1.015)]",
        "active:scale-[0.985] motion-reduce:transition-[box-shadow] motion-reduce:hover:[transform:none]",
        TINT_BG[meta.tint],
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <span className={cn("label-mono", muted)}>
          {meta.company}
          {meta.status ? ` · ${meta.status}` : ""}
        </span>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg text-ink-1 transition-colors duration-300 group-hover:bg-accent group-hover:text-bg">
          <ArrowUpRight className="size-4.5" aria-hidden="true" />
        </span>
      </div>
      <h3 className={cn("mt-4", size === "large" ? "text-3xl md:text-[2.5rem]" : "text-2xl")}>{project.title}</h3>
      <p className="mt-1 font-medium text-ink-1">{meta.subtitle}</p>
      <p className="mt-3 max-w-xl text-[0.97rem] leading-relaxed text-ink-2">{project.summary}</p>
      {meta.proof.length > 0 ? (
        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
          {meta.proof.map((item) => (
            <div key={item.label}>
              <dt className="sr-only">{item.label}</dt>
              <dd className="font-display text-2xl text-ink-1">{item.value}</dd>
              <dd className={cn("text-sm", muted)}>{item.label}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {size === "large" ? (
        <div className="mt-auto pt-8">
          <div className="-mb-14 transition-transform duration-500 ease-out group-hover:-translate-y-2 motion-reduce:transform-none md:-mb-20">
            <MediaFrame
              src={project.cover}
              alt={meta.coverAlt || `${project.title} preview`}
              label={project.title}
              sizes="(min-width: 1024px) 560px, 100vw"
            />
          </div>
        </div>
      ) : null}
    </Link>
  );
}
