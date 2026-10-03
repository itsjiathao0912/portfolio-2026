"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { mixHex, sectionProgress } from "./math";
import { useReducedMotion } from "./use-reduced-motion";

export interface StoryChapterProps {
  /** Chapter number shown as "01". */
  index: number;
  title: string;
  kicker?: string;
  /** Background at chapter start / end (#rrggbb). */
  from?: string;
  to?: string;
  /** Text colour; pick for contrast against from/to. */
  ink?: string;
  /** Scroll length in viewport heights (≥1). The sticky stage pins this long. */
  length?: number;
  id?: string;
  className?: string;
  /** Stage content. Server callers: read progress from the CSS var
   * `--chapter-p` (0..1) set on the stage. Client callers may pass a
   * function that receives progress. */
  children?: React.ReactNode | ((progress: number) => React.ReactNode);
}

/**
 * Scroll-pinned chapter: a sticky full-height stage with a chapter title,
 * a progress bar, and a background that blends `from` → `to` as you scroll.
 * Reduced motion / no JS: normal (non-pinned) section, solid `from` colour,
 * content identical.
 */
export function StoryChapter({ index, title, kicker, from = "#ffffff", to = "#eaf1ff", ink = "#0b1533", length = 2, id, className, children }: StoryChapterProps) {
  const ref = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  const reduced = useReducedMotion();
  const pinned = !reduced && length > 1;

  useEffect(() => {
    if (!pinned) return;
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let visible = false;
    const tick = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      setP(sectionProgress(r.top, r.height, window.innerHeight));
    };
    const onScroll = () => {
      if (visible && !frame) frame = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) onScroll();
    });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pinned]);

  const bg = pinned ? mixHex(from, to, p) : from;
  const num = String(index).padStart(2, "0");
  const headingId = `${id ?? `chapter-${num}`}-title`;

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={headingId}
      className={cn("ink-inherit relative", className)}
      style={{ height: pinned ? `${length * 100}svh` : undefined, background: bg, color: ink }}
    >
      <div className={cn(pinned ? "sticky top-0 h-svh overflow-hidden" : "min-h-[60svh]", "flex flex-col px-4 py-16 md:px-10")}
        style={{ ["--chapter-p" as string]: pinned ? p : 1 }}
      >
        <div className="mx-auto w-full max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-70">
            Chapter {num}
            {kicker ? ` · ${kicker}` : ""}
          </p>
          <h2 id={headingId} className="mt-2 text-[34px] leading-[1.05] md:text-[56px]">
            {title}
          </h2>
          <div
            role="progressbar"
            aria-label={`Chapter ${num} progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round((pinned ? p : 1) * 100)}
            className="mt-4 h-[3px] w-full max-w-xs overflow-hidden rounded-full bg-current/15"
          >
            <span className="block h-full origin-left rounded-full bg-current" style={{ transform: `scaleX(${pinned ? p : 1})` }} />
          </div>
        </div>
        <div className="mx-auto mt-8 w-full max-w-6xl flex-1">{typeof children === "function" ? children(pinned ? p : 1) : children}</div>
      </div>
    </section>
  );
}
