"use client";

import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Project } from "@content/schema.ts";
import { cn } from "@/lib/utils";
import { WorkCard } from "./work-card";
import { Reveal } from "./reveal";

/**
 * All projects: quiet centred category chips, then a 3-column wall of poster
 * cards (2 on tablet, 1 on phone). Filtering is client-side.
 */
export function WorkGrid({ projects }: { projects: Project[] }) {
  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const project of projects) if (project.category && !seen.includes(project.category)) seen.push(project.category);
    return seen;
  }, [projects]);
  const [filter, setFilter] = useState<string>("All");
  const visible = filter === "All" ? projects : projects.filter((p) => p.category === filter);
  // Phone: the chip row scrolls sideways. While more chips sit off the right
  // edge, a fade + chevron says so; it goes away once the reader reaches the end.
  const rowRef = useRef<HTMLDivElement>(null);
  const [moreRight, setMoreRight] = useState(false);
  const measure = useCallback(() => {
    const el = rowRef.current;
    if (el) setMoreRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <div className="relative -mx-5 md:mx-0">
      <div
        ref={rowRef}
        onScroll={measure}
        role="group"
        aria-label="Filter projects by category"
        data-testid="filter-chips"
        data-more-right={moreRight ? "true" : "false"}
        // Trailing padding is narrower than a chip, so the next chip always
        // peeks in half-cut: a visible hint that the row scrolls.
        className="flex snap-x scroll-px-5 gap-1 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:flex-wrap md:justify-center md:px-0"
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
                "flex h-11 shrink-0 snap-start items-center gap-1.5 rounded-full px-4 text-[0.94rem] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent",
                selected ? "bg-bg text-ink-1 shadow-nav" : "text-ink-3 hover:text-ink-1"
              )}
            >
              {name}
              <span className="text-xs text-ink-3 tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>
      <div
        aria-hidden="true"
        data-testid="filter-chips-more"
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 flex w-16 items-center justify-end bg-gradient-to-r from-transparent to-canvas pr-1 transition-opacity duration-200 md:hidden",
          moreRight ? "opacity-100" : "opacity-0"
        )}
      >
        <ChevronRight className="size-4 text-ink-3" />
      </div>
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {visible.length} project{visible.length === 1 ? "" : "s"}
      </p>
      <ul className="grid gap-5 md:grid-cols-2 md:gap-8 xl:grid-cols-3 xl:gap-10" data-testid="work-grid">
        {/* Work index cards: 400 ms reveal (other pages keep the default timing). */}
        {visible.map((project, index) => (
          <Reveal as="li" key={project.id} index={index} duration={0.4} stagger={0.05} className="h-full">
            <WorkCard project={project} priority={index < 3} />
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
