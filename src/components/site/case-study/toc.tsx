"use client";

import { ArrowUp, List, Mail, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import type { SectionIcon } from "@content/schema.ts";
import { cn } from "@/lib/utils";
import { sectionIcon } from "../case-study-toc";

interface Entry {
  id: string;
  label: string;
  icon?: SectionIcon;
}

interface TocProps {
  entries: Entry[];
  /** Id of the element where the body starts; navigators appear when it reaches the reading line. */
  startId: string;
}

/** Last heading whose top has passed the reading line; bottom-of-page fallback. */
function useActiveSection(entries: Entry[]) {
  const [active, setActive] = useState(entries[0]?.id ?? "");
  useEffect(() => {
    const headings = entries.map((e) => document.getElementById(e.id)).filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;
    let ticking = false;
    function compute() {
      ticking = false;
      const line = Math.min(window.innerHeight * 0.45, 300);
      let current = headings[0].id;
      for (const heading of headings) if (heading.getBoundingClientRect().top <= line) current = heading.id;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = headings[headings.length - 1].id;
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
  return active;
}

/** True once the top of the body has scrolled up to 70% of the viewport height. */
function useInBody(startId: string) {
  const [inBody, setInBody] = useState(false);
  useEffect(() => {
    const start = document.getElementById(startId);
    if (!start) return;
    function check() {
      setInBody(start!.getBoundingClientRect().top < window.innerHeight * 0.7);
    }
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [startId]);
  return inBody;
}

/** True while any full-width block (`[data-wide]`) passes under the margin TOC. */
function useWideInView() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-wide]"));
    if (els.length === 0) return;
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        setWide(visible.size > 0);
      },
      { rootMargin: "-140px 0px -30% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return wide;
}

/**
 * Hide while reading: true while the user scrolls down; false again after a
 * scroll up of 24 px or near the end of the page.
 */
function useReadingDown() {
  const [down, setDown] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let anchor = last;
    function onScroll() {
      const y = window.scrollY;
      const nearEnd = window.innerHeight + y >= document.documentElement.scrollHeight - 160;
      if (nearEnd) setDown(false);
      else if (y > last) {
        anchor = y;
        if (y > 40) setDown(true);
      } else if (anchor - y > 24) setDown(false);
      last = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return down;
}

const SPRING = { type: "spring", stiffness: 420, damping: 32 } as const;

/** Desktop navigator in the left margin (xl+), visible from the start of the body. */
export function CaseToc({ entries, startId }: TocProps) {
  const active = useActiveSection(entries);
  const inBody = useInBody(startId);
  const wide = useWideInView();
  const shown = inBody && !wide;
  const reduce = useReducedMotion();
  const rows = [
    ...entries.map((e) => ({ ...e, href: `#${e.id}`, Icon: sectionIcon(e), section: true })),
    { id: "contact", label: "Get in touch", href: "#get-in-touch", Icon: Mail, section: false },
    { id: "top", label: "Top", href: "#top", Icon: ArrowUp, section: false },
  ];
  return (
    <nav
      aria-label="On this page"
      data-testid="toc"
      data-shown={shown ? "true" : "false"}
      className={cn(
        "fixed top-[162px] left-[84px] z-30 hidden w-[228px] transition-[opacity,transform] duration-300 ease-out xl:block",
        shown ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-3 opacity-0",
      )}
    >
      <ol className="flex flex-col">
        {rows.map((row, i) => {
          const isActive = row.section && row.id === active;
          return (
            <motion.li
              key={row.id}
              initial={false}
              animate={shown || reduce ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={reduce ? { duration: 0 } : { ...SPRING, delay: shown ? i * 0.03 : 0 }}
            >
              <a
                href={row.href}
                tabIndex={shown ? undefined : -1}
                aria-current={isActive ? "location" : undefined}
                data-active={row.section ? (isActive ? "true" : "false") : undefined}
                data-section={row.section ? "" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-full px-4 py-3.5 text-base transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent",
                  isActive ? "font-semibold text-ink-1" : "text-ink-3 hover:text-ink-1",
                )}
              >
                {isActive ? (
                  <motion.span layoutId="case-toc-pill" aria-hidden="true" className="absolute inset-0 -z-10 rounded-full bg-bg shadow-nav" transition={reduce ? { duration: 0 } : SPRING} />
                ) : null}
                <span className="flex items-center gap-3 transition-transform duration-200 ease-out group-hover:translate-x-[5px] motion-reduce:transform-none">
                  <row.Icon className="size-6 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                  <span className="truncate">{row.label}</span>
                </span>
              </a>
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Thin reading-progress bar along the top of the screen. */
export function CaseProgress() {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  const spring = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      data-testid="reading-progress"
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-accent"
      style={{ scaleX: reduce ? scrollYProgress : spring }}
    />
  );
}

/**
 * Phone/tablet navigator (below xl): a compact pill docked at the bottom above
 * the safe area. It hides while you scroll down to read and comes back on a
 * scroll up or at the end of the page, so it never sits on the text you read.
 */
export function CaseSectionMenu({ entries, startId }: TocProps) {
  const active = useActiveSection(entries);
  const inBody = useInBody(startId);
  const down = useReadingDown();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const current = entries.find((e) => e.id === active);
  const shown = open || (inBody && !down);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="xl:hidden" data-testid="section-menu" data-shown={shown ? "true" : "false"}>
      <AnimatePresence>
        {open ? (
          <motion.button
            key="scrim"
            type="button"
            aria-label="Close sections"
            className="fixed inset-0 z-40 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={() => setOpen(false)}
          />
        ) : null}
      </AnimatePresence>
      <motion.div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]"
        initial={false}
        animate={shown ? { y: 0, opacity: 1 } : { y: 90, opacity: 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
      >
        <AnimatePresence>
          {open ? (
            <motion.div
              key="sheet"
              id="section-sheet"
              role="dialog"
              aria-label="Sections"
              initial={{ opacity: 0, y: reduce ? 0 : 20, scale: reduce ? 1 : 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduce ? 0 : 20, scale: reduce ? 1 : 0.96 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }}
              className="pointer-events-auto mb-3 w-full max-w-md origin-bottom rounded-[26px] bg-bg p-3 shadow-nav"
            >
              <ol className="flex flex-col">
                {entries.map((entry) => {
                  const Icon = sectionIcon(entry);
                  const isActive = entry.id === active;
                  return (
                    <li key={entry.id}>
                      <a
                        href={`#${entry.id}`}
                        onClick={() => setOpen(false)}
                        aria-current={isActive ? "location" : undefined}
                        className={cn("flex min-h-12 items-center gap-3 rounded-full px-4 text-base", isActive ? "bg-canvas font-semibold text-ink-1" : "text-ink-2")}
                      >
                        <Icon className="size-5 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                        {entry.label}
                      </a>
                    </li>
                  );
                })}
                <li>
                  <a href="#top" onClick={() => setOpen(false)} className="flex min-h-12 items-center gap-3 rounded-full px-4 text-base text-ink-2">
                    <ArrowUp className="size-5 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                    Top
                  </a>
                </li>
              </ol>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="section-sheet"
          tabIndex={shown ? undefined : -1}
          data-testid="section-menu-button"
          onClick={() => setOpen((v) => !v)}
          className="pointer-events-auto flex h-11 max-w-[min(100%,18rem)] items-center gap-2 rounded-full bg-navy/95 px-4 text-sm font-medium text-white shadow-nav backdrop-blur active:scale-95"
        >
          {open ? <X className="size-4 shrink-0" aria-hidden="true" /> : <List className="size-4 shrink-0" aria-hidden="true" />}
          <span className="truncate">{open ? "Close" : (current?.label ?? "Sections")}</span>
        </button>
      </motion.div>
    </div>
  );
}
