"use client";

import {
  ArrowUp,
  BadgeCheck,
  CalendarDays,
  ChartColumn,
  CircleAlert,
  Compass,
  FlaskConical,
  GitBranch,
  Hash,
  Layers,
  List,
  Mail,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
  UserRound,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface Entry {
  id: string;
  label: string;
}

interface TocProps {
  entries: Entry[];
  /** Element id of the hero cover; the navigators appear once it scrolls away. */
  coverId: string;
}

const noop = () => () => {};
/** True on the client after hydration (no setState-in-effect). */
function useIsClient() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/**
 * Fixed UI must not live under the page-transition wrapper: its transform
 * would turn `position: fixed` into "fixed to the wrapper". Portal to <body>.
 */
function ToBody({ children }: { children: React.ReactNode }) {
  const client = useIsClient();
  return client ? createPortal(children, document.body) : null;
}

/** Lucide icon per section type, matched on the heading text. */
const ICON_RULES: [RegExp, LucideIcon][] = [
  [/overview|context|about/i, Compass],
  [/problem|challenge/i, CircleAlert],
  [/role|my work|ownership|team/i, UserRound],
  [/what it does|the product|product/i, Package],
  [/how it decides|approach|process|architecture/i, Workflow],
  [/validation|result|impact|outcome/i, BadgeCheck],
  [/stack|technology|tools/i, Layers],
  [/shipped|feature/i, Sparkles],
  [/governance|security|compliance/i, ShieldCheck],
  [/lineage|model/i, GitBranch],
  [/delivery|uat|launch/i, Truck],
  [/dashboard|data|metric/i, ChartColumn],
  [/experiment|test/i, FlaskConical],
  [/event|calendar/i, CalendarDays],
];

export function sectionIcon(label: string) {
  return ICON_RULES.find(([pattern]) => pattern.test(label))?.[1] ?? Hash;
}

/**
 * Scroll-spy: the active section is the last heading whose top has passed the
 * fixed TOC's top line (about 170 px), with a bottom-of-page fallback.
 */
function useActiveSection(entries: Entry[]) {
  const [active, setActive] = useState(entries[0]?.id ?? "");
  useEffect(() => {
    const headings = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;
    let ticking = false;
    function compute() {
      ticking = false;
      const line = Math.min(window.innerHeight * 0.35, 200);
      let current = headings[0].id;
      for (const heading of headings)
        if (heading.getBoundingClientRect().top <= line) current = heading.id;
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4
      ) {
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
  return active;
}

/** True once the hero cover has scrolled fully out of view. */
function usePastCover(coverId: string) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const cover = document.getElementById(coverId);
    if (!cover) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setPast(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(cover);
    return () => observer.disconnect();
  }, [coverId]);
  return past;
}

/**
 * Desktop navigator, pinned in the empty left margin (xl and up only, so the
 * margin is at least 320 px). It fades in after the hero cover has scrolled
 * away. 24 px icon + 16 px label rows, an animated pill behind the active
 * entry, a 5 px nudge on hover, then "Get in touch" and "Top".
 */
export function CaseStudyToc({ entries, coverId }: TocProps) {
  const active = useActiveSection(entries);
  const past = usePastCover(coverId);
  const reduce = useReducedMotion();

  const rows = [
    ...entries.map((e) => ({
      ...e,
      href: `#${e.id}`,
      Icon: sectionIcon(e.label),
      section: true,
    })),
    {
      id: "contact",
      label: "Get in touch",
      href: "#contact",
      Icon: Mail,
      section: false,
    },
    { id: "top", label: "Top", href: "#top", Icon: ArrowUp, section: false },
  ];

  return (
    <ToBody>
      <nav
        aria-label="On this page"
        data-testid="toc"
        data-shown={past ? "true" : "false"}
        className={cn(
          "fixed top-[162px] left-[84px] z-30 hidden w-[228px] transition-opacity duration-300 ease-out xl:block",
          past ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ol className="flex flex-col">
          {rows.map((row) => {
            const isActive = row.section && row.id === active;
            return (
              <li key={row.id}>
                <a
                  href={row.href}
                  tabIndex={past ? undefined : -1}
                  aria-current={isActive ? "location" : undefined}
                  data-active={
                    row.section ? (isActive ? "true" : "false") : undefined
                  }
                  data-section={row.section ? "" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-full px-4 py-3.5 text-base transition-colors duration-200",
                    "focus-visible:outline-2 focus-visible:outline-accent",
                    isActive
                      ? "font-semibold text-ink-1"
                      : "text-ink-3 hover:text-ink-1",
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="toc-pill"
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-full bg-bg shadow-nav"
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 36 }
                      }
                    />
                  ) : null}
                  <span className="flex items-center gap-3 transition-transform duration-200 ease-out group-hover:translate-x-[5px] motion-reduce:transform-none">
                    <row.Icon
                      className="size-6 shrink-0"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                    <span className="truncate">{row.label}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </ToBody>
  );
}

/** Thin reading-progress bar along the very top of the screen. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  const spring = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });
  return (
    <ToBody>
      <motion.div
        aria-hidden="true"
        data-testid="reading-progress"
        className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-accent"
        style={{ scaleX: reduce ? scrollYProgress : spring }}
      />
    </ToBody>
  );
}

/**
 * Mobile/tablet navigator (below xl, where the reference shows nothing): a
 * "Sections" pill pinned to the bottom, which opens a sheet of chips.
 */
export function CaseStudySectionMenu({ entries, coverId }: TocProps) {
  const active = useActiveSection(entries);
  const past = usePastCover(coverId);
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const current = entries.find((e) => e.id === active);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <ToBody>
      <div className="xl:hidden" data-testid="section-menu">
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
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex flex-col items-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-[opacity,transform] duration-300 ease-out",
            past || open
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-6 opacity-0",
          )}
        >
          <AnimatePresence>
            {open ? (
              <motion.div
                key="sheet"
                id="section-sheet"
                role="dialog"
                aria-label="Sections"
                initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : 16 }}
                transition={{
                  duration: reduce ? 0 : 0.22,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mb-3 w-full max-w-md rounded-[26px] bg-bg p-3 shadow-nav"
              >
                <ol className="flex flex-col">
                  {entries.map((entry) => {
                    const Icon = sectionIcon(entry.label);
                    const isActive = entry.id === active;
                    return (
                      <li key={entry.id}>
                        <a
                          href={`#${entry.id}`}
                          onClick={() => setOpen(false)}
                          aria-current={isActive ? "location" : undefined}
                          className={cn(
                            "flex min-h-12 items-center gap-3 rounded-full px-4 text-base",
                            isActive
                              ? "bg-canvas font-semibold text-ink-1"
                              : "text-ink-2",
                          )}
                        >
                          <Icon
                            className="size-5 shrink-0"
                            strokeWidth={1.6}
                            aria-hidden="true"
                          />
                          {entry.label}
                        </a>
                      </li>
                    );
                  })}
                  <li>
                    <a
                      href="#top"
                      onClick={() => setOpen(false)}
                      className="flex min-h-12 items-center gap-3 rounded-full px-4 text-base text-ink-2"
                    >
                      <ArrowUp
                        className="size-5 shrink-0"
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
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
            tabIndex={past || open ? undefined : -1}
            data-testid="section-menu-button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-12 max-w-[min(100%,22rem)] items-center gap-2 rounded-full bg-navy px-5 text-sm font-medium text-white shadow-nav active:scale-95"
          >
            {open ? (
              <X className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <List className="size-4 shrink-0" aria-hidden="true" />
            )}
            <span className="truncate">
              {open ? "Close" : (current?.label ?? "Sections")}
            </span>
          </button>
        </div>
      </div>
    </ToBody>
  );
}
