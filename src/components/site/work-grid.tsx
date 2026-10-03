"use client";

import { useMemo, useState } from "react";
import type { Project } from "@content/schema.ts";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./project-card";
import { Reveal } from "./reveal";

/** All projects with category filter chips (filtering is client-side). */
export function WorkGrid({ projects }: { projects: Project[] }) {
  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const project of projects) if (project.category && !seen.includes(project.category)) seen.push(project.category);
    return seen;
  }, [projects]);
  const [filter, setFilter] = useState<string>("All");
  const visible = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="flex flex-col gap-8">
      <div
        role="group"
        aria-label="Filter projects by category"
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0"
      >
        {["All", ...categories].map((name) => {
          const count = name === "All" ? projects.length : projects.filter((p) => p.category === name).length;
          const selected = filter === name;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={selected}
              data-testid="filter-chip"
              onClick={() => setFilter(name)}
              className={cn(
                "flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-200",
                selected
                  ? "border-navy bg-navy text-bg"
                  : "border-hairline bg-bg text-ink-2 hover:border-border-strong hover:text-ink-1"
              )}
            >
              {name}
              <span className={cn("font-mono text-xs", selected ? "text-accent-tint" : "text-ink-3")}>{count}</span>
            </button>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {visible.length} project{visible.length === 1 ? "" : "s"}
      </p>
      <ul className="grid gap-5 md:grid-cols-2" data-testid="work-grid">
        {visible.map((project, index) => (
          <Reveal as="li" key={project.id} index={index} className="h-full">
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
