"use client";

import { useEffect, useState } from "react";
import type { Project } from "@content/schema.ts";
import { cn } from "@/lib/utils";
import { StackCard, type StackSurface } from "./stack-card";

interface Group {
  label: string;
  projects: Project[];
}

/** Split projects into the two TOC groups, keeping sortOrder. */
export function groupProjects(projects: readonly Project[]) {
  const groups: Group[] = [
    { label: "Shipped platforms", projects: projects.filter((p) => p.category !== "Personal") },
    { label: "Personal products", projects: projects.filter((p) => p.category === "Personal") },
  ];
  return groups.filter((g) => g.projects.length > 0);
}

/** Card surfaces: mostly white, every third a soft gradient, the last a solid black card. */
export function surfaceFor(index: number, total: number): StackSurface {
  if (index === total - 1 && total > 2) return "dark";
  return index % 3 === 1 ? "gradient" : "white";
}

/**
 * Home project stack: a sticky grouped table of contents in a 300px gutter
 * (≥1024px) with scroll-spy, next to one centred card per project. Phones get
 * a horizontal chip bar instead of the TOC.
 */
export function ProjectStack({ projects }: { projects: Project[] }) {
  const groups = groupProjects(projects);
  const ordered = groups.flatMap((g) => g.projects);
  const [active, setActive] = useState(ordered[0]?.slug ?? "");

  useEffect(() => {
    const cards = ordered
      .map((p) => document.getElementById(`project-${p.slug}`))
      .filter((el): el is HTMLElement => el !== null);
    if (cards.length === 0) return;
    let ticking = false;
    function compute() {
      ticking = false;
      const line = window.innerHeight * 0.4;
      let current = cards[0].id;
      for (const card of cards) if (card.getBoundingClientRect().top <= line) current = card.id;
      setActive(current.replace(/^project-/, ""));
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(compute);
    }
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // ordered is derived from props; slugs are the stable key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordered.map((p) => p.slug).join("|")]);

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="bg-canvas pb-24 md:pb-[150px]"
      data-testid="section-work"
    >
      <h2 id="work-title" className="sr-only">
        Work
      </h2>
      <div className="mx-auto max-w-[1440px] px-2.5 md:px-[45px] lg:grid lg:grid-cols-[300px_1fr] lg:gap-0">
        <nav aria-label="Projects" className="hidden lg:block" data-testid="home-toc">
          <div className="sticky top-[120px] flex flex-col gap-10 pr-6 pl-4">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="text-[14px] font-semibold text-ink-3">{group.label}</p>
                <ul className="mt-4 flex flex-col">
                  {group.projects.map((p) => {
                    const isActive = p.slug === active;
                    return (
                      <li key={p.slug}>
                        <a
                          href={`#project-${p.slug}`}
                          data-active={isActive ? "true" : "false"}
                          aria-current={isActive ? "location" : undefined}
                          className={cn(
                            "flex items-center gap-4 py-3 text-[15px] transition-colors duration-200",
                            isActive ? "font-semibold text-ink-1" : "text-ink-3 hover:text-ink-1"
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn("size-1.5 rounded-full transition-colors", isActive ? "bg-ink-1" : "bg-ink-3/50")}
                          />
                          {p.title}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="flex flex-col gap-6 md:gap-[100px]">
          <ul className="-mx-2.5 flex gap-2 overflow-x-auto px-2.5 pb-1 [scrollbar-width:none] lg:hidden" aria-label="Jump to project">
            {ordered.map((p) => (
              <li key={p.slug} className="shrink-0">
                <a href={`#project-${p.slug}`} className="flex h-10 items-center rounded-full bg-bg px-4 text-[14px] font-medium text-ink-1 shadow-card">
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
          {ordered.map((project, index) => (
            <StackCard key={project.id} project={project} surface={surfaceFor(index, ordered.length)} />
          ))}
        </div>
      </div>
    </section>
  );
}
