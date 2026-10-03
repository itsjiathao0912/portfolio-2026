"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocProps {
  entries: { id: string; label: string }[];
}

/**
 * Sticky table of contents (desktop only — hidden below lg). The entry for the
 * section currently being read is highlighted (scroll-spy): the active section
 * is the last heading whose top has passed 35% of the viewport.
 */
export function CaseStudyToc({ entries }: TocProps) {
  const [active, setActive] = useState(entries[0]?.id ?? "");

  useEffect(() => {
    const headings = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    let ticking = false;
    function compute() {
      ticking = false;
      const line = window.innerHeight * 0.35;
      let current = headings[0].id;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= line) current = heading.id;
      }
      // At the very bottom the last section wins even if it is short.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = headings[headings.length - 1].id;
      }
      setActive(current);
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
  }, [entries]);

  return (
    <nav aria-label="On this page" className="sticky top-28" data-testid="toc">
      <p className="label-mono mb-4 text-ink-3">On this page</p>
      <ol className="relative flex flex-col border-l border-hairline">
        {entries.map((entry) => {
          const isActive = entry.id === active;
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                aria-current={isActive ? "location" : undefined}
                data-active={isActive ? "true" : "false"}
                className={cn(
                  "-ml-px block border-l-2 py-1.5 pl-4 text-[0.92rem] transition-colors duration-200",
                  isActive
                    ? "border-accent font-semibold text-ink-1"
                    : "border-transparent text-ink-3 hover:text-ink-1"
                )}
              >
                {entry.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
