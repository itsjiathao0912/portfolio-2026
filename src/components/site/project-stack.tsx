"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Project } from "@content/schema.ts";
import { SPRING } from "@/components/motion/springs";
import { usePersona } from "@/components/signature/participate/store";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { emojiFor } from "./home/project-meta";
import { PersonaControl } from "./home/persona-control";
import { FLIP_MAX, HOME_PERSONA_NOTE, flipOffset, homePersona, orderForPersona } from "./home/persona-order";
import { StackCard, type StackSurface } from "./stack-card";

interface Group {
  label: string;
  projects: Project[];
}

/** Split projects into the TOC groups, keeping sortOrder. */
export function groupProjects(projects: readonly Project[]) {
  const groups: Group[] = [
    { label: "Shipped platforms", projects: projects.filter((p) => p.category !== "Personal" && p.category !== "Hackathon") },
    { label: "Hackathons", projects: projects.filter((p) => p.category === "Hackathon") },
    { label: "Personal products", projects: projects.filter((p) => p.category === "Personal") },
  ];
  return groups.filter((g) => g.projects.length > 0);
}

/** Card surfaces: white, with every third a soft gradient. No black cards: the home stays light and calm. */
export function surfaceFor(index: number): StackSurface {
  return index % 3 === 1 ? "gradient" : "white";
}

/** A TOC row: emoji, label, and the shared sliding glass pill behind the active one. */
function TocItem({ project, active, reduce }: { project: Project; active: boolean; reduce: boolean }) {
  return (
    <li>
      <a
        href={`#project-${project.slug}`}
        data-testid="toc-item"
        data-active={active ? "true" : "false"}
        aria-current={active ? "location" : undefined}
        className={cn(
          "relative flex h-10 items-center gap-2 rounded-full px-3 text-[15px] outline-none transition-colors duration-[120ms] focus-visible:ring-2 focus-visible:ring-accent",
          active ? "font-semibold text-ink-1" : "text-ink-3 hover:text-ink-1"
        )}
      >
        {active ? <motion.span layoutId="toc-pill" transition={reduce ? { duration: 0 } : SPRING.indicator} className="absolute inset-0 rounded-full bg-white/80 shadow-2" /> : null}
        <motion.span
          key={active ? "on" : "off"}
          aria-hidden="true"
          className="relative grid w-7 place-items-center text-[18px] leading-none"
          initial={false}
          animate={active && !reduce ? { scale: [1, 1.18, 1] } : { scale: 1 }}
          transition={active && !reduce ? { duration: 0.32, ease: "easeOut" } : { duration: 0 }}
        >
          {emojiFor(project.slug)}
        </motion.span>
        <span className="relative">{project.title}</span>
      </a>
    </li>
  );
}

/**
 * Home project stack. Heading and the persona control sit on the same canvas
 * surface as the highlights above and the cards below, so there is no seam. A
 * sticky grouped TOC (≥1024px) has an emoji per project and a sliding active
 * pill; phones get a chip rail. Choosing a persona reorders the cards (layout
 * animation) and the TOC to match.
 */
export function ProjectStack({ projects }: { projects: Project[] }) {
  const reduce = useReducedMotion();
  const { persona: stored, setPersona } = usePersona();
  const persona = homePersona(stored);
  const groups = groupProjects(projects);
  const ordered = persona ? orderForPersona(projects, persona) : groups.flatMap((g) => g.projects);
  const [active, setActive] = useState(ordered[0]?.slug ?? "");
  const rail = useRef<HTMLUListElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  // Cards stay mounted; before a persona change we remember where each sits (document y).
  const cardEls = useRef(new Map<string, HTMLElement>());
  const before = useRef<Map<string, number> | null>(null);
  const orderKey = ordered.map((p) => p.slug).join("|");

  const choosePersona = useCallback(
    (next: Parameters<typeof setPersona>[0]) => {
      const tops = new Map<string, number>();
      cardEls.current.forEach((el, slug) => tops.set(slug, el.getBoundingClientRect().top + window.scrollY));
      before.current = tops;
      setPersona(next);
    },
    [setPersona]
  );

  useLayoutEffect(() => {
    const tops = before.current;
    before.current = null;
    if (!tops) return;
    const h = heading.current;
    if (h) {
      // Keep "Selected work" clear of the fixed nav however the page re-flows.
      const top = h.getBoundingClientRect().top;
      if (top < 90) window.scrollBy({ top: top - 110, behavior: "auto" });
    }
    if (reduce) return;
    cardEls.current.forEach((el, slug) => {
      const old = tops.get(slug);
      if (old === undefined) return;
      const offset = flipOffset(old, el.getBoundingClientRect().top + window.scrollY, window.scrollY, window.innerHeight);
      if (offset === null) return;
      const far = Math.abs(offset) >= FLIP_MAX;
      el.animate(
        [
          { transform: `translateY(${offset}px)`, opacity: far ? 0.35 : 0.85 },
          { transform: "translateY(0)", opacity: 1 },
        ],
        { duration: 460, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
    });
  }, [orderKey, reduce]);

  // Phones: keep the active chip centred in the rail as the page scrolls.
  useEffect(() => {
    const list = rail.current;
    const chip = list?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!list || !chip || list.offsetParent === null) return;
    const left = chip.offsetLeft - (list.clientWidth - chip.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: reduce ? "auto" : "smooth" });
  }, [active, reduce]);

  useEffect(() => {
    const cards = ordered.map((p) => document.getElementById(`project-${p.slug}`)).filter((el): el is HTMLElement => el !== null);
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
    // slugs are the stable key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordered.map((p) => p.slug).join("|")]);

  const tocGroups: Group[] = persona ? [{ label: "In your order", projects: ordered }] : groups;

  return (
    <section id="work" aria-labelledby="work-title" className="bg-canvas pb-20 md:pb-[96px]" data-testid="section-work">
      <div className="mx-auto max-w-[1440px] px-2.5 md:px-[45px]">
        <div className="px-3 pt-4 md:px-4">
          <h2 id="work-title" ref={heading} className="scroll-mt-[110px] text-[32px] md:text-[46px]">Selected work</h2>
          <div className="mt-6">
            <PersonaControl value={persona} onChange={choosePersona} />
            <div aria-live="polite" className="mt-3 min-h-6">
              <AnimatePresence mode="wait">
                {persona ? (
                  <motion.p key={persona} data-testid="persona-note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.32 }} className="text-[14px] text-ink-3">
                    {HOME_PERSONA_NOTE[persona]}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <LayoutGroup id="stack">
          <div className="mt-8 lg:grid lg:grid-cols-[300px_1fr] lg:gap-0">
            <nav aria-label="Projects" className="hidden lg:block" data-testid="home-toc">
              <div className="sticky top-[120px] flex flex-col gap-8 pr-6 pl-2">
                {tocGroups.map((group) => (
                  <div key={group.label}>
                    <p className="label-mono px-3 text-[12px] uppercase text-ink-3">{group.label}</p>
                    <ul className="mt-3 flex flex-col">
                      {group.projects.map((p) => (
                        <TocItem key={p.slug} project={p} active={p.slug === active} reduce={reduce} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>

            <div className="flex flex-col gap-10 [overflow-anchor:none] md:gap-[56px]">
              <ul ref={rail} className="sticky top-[76px] z-20 -mx-2.5 flex gap-2 overflow-x-auto bg-canvas/90 px-2.5 py-2 backdrop-blur-md [scrollbar-width:none] lg:hidden" aria-label="Jump to project" data-testid="toc-chips">
                {ordered.map((p) => (
                  <li key={p.slug} className="shrink-0">
                    <a
                      href={`#project-${p.slug}`}
                      aria-current={p.slug === active ? "location" : undefined}
                      data-testid="toc-chip"
                      className={cn("relative flex h-11 items-center gap-1.5 rounded-full px-4 text-[14px] font-medium transition-colors", p.slug === active ? "text-ink-1" : "text-ink-3")}
                    >
                      {p.slug === active ? <motion.span layoutId="toc-chip-pill" transition={reduce ? { duration: 0 } : SPRING.indicator} className="absolute inset-0 rounded-full bg-white shadow-2" /> : null}
                      <span aria-hidden="true" className="relative">{emojiFor(p.slug)}</span>
                      <span className="relative">{p.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
              {ordered.map((project, index) => (
                <div
                  key={project.id}
                  ref={(el) => {
                    if (el) cardEls.current.set(project.slug, el);
                    else cardEls.current.delete(project.slug);
                  }}
                >
                  <StackCard project={project} surface={surfaceFor(index)} />
                </div>
              ))}
            </div>
          </div>
        </LayoutGroup>
      </div>
    </section>
  );
}
