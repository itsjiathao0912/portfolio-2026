"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SPRING } from "@/components/motion/springs";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { buildRailStops, railSummary, type RailStop } from "./ledger-data";
import { dragReleaseTarget, markerPercent, nearestCardIndex, stepScrollTarget } from "./career-rail-logic";

type Props = {
  stops?: RailStop[];
  heading?: string;
  className?: string;
  /** Number of products shown in the end-cap (passed by server pages). */
  products?: number;
};

/**
 * Light, calm career timeline. Desktop: a horizontally scrollable row of role
 * cards with scroll snap, arrow buttons and mouse drag with a little coasting;
 * a hairline track below carries a small marker that glides to the card in the
 * centre. Phones: the same cards as a vertical list with the track on the left.
 * Reduced motion: no marker animation, no smooth scrolling.
 */
export function CareerRail({ stops = buildRailStops(), heading = "The route so far", className = "", products }: Props) {
  const reduce = useReducedMotion() ?? false;
  const scroller = useRef<HTMLOListElement>(null);
  const drag = useRef<{ x: number; left: number; t: number; v: number; moved: boolean } | null>(null);
  const [active, setActive] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const summary = railSummary(products);
  const count = stops.length + 1; // role cards + end-cap

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el || el.scrollWidth <= el.clientWidth + 1) {
      // vertical (phone) layout: nothing scrolls sideways
      setCanPrev(false);
      setCanNext(false);
      return;
    }
    const rect = el.getBoundingClientRect();
    const centers = Array.from(el.children).map((c) => {
      const r = c.getBoundingClientRect();
      return r.left + r.width / 2;
    });
    setActive(nearestCardIndex(centers, rect.left + rect.width / 2));
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [measure]);

  const behavior: ScrollBehavior = reduce ? "auto" : "smooth";

  const step = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.children[0] as HTMLElement | undefined;
    const size = (card?.getBoundingClientRect().width ?? 280) + 20;
    el.scrollTo({ left: stepScrollTarget(el.scrollLeft, size, direction, el.scrollWidth - el.clientWidth), behavior });
  };

  // Mouse drag (touch and pen use native scrolling).
  const onPointerDown = (e: React.PointerEvent<HTMLOListElement>) => {
    const el = scroller.current;
    if (!el || e.pointerType !== "mouse" || e.button !== 0 || el.scrollWidth <= el.clientWidth) return;
    drag.current = { x: e.clientX, left: el.scrollLeft, t: e.timeStamp, v: 0, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLOListElement>) => {
    const d = drag.current;
    const el = scroller.current;
    if (!d || !el) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 4) return;
    if (!d.moved) {
      d.moved = true;
      el.setPointerCapture(e.pointerId);
      el.style.scrollSnapType = "none";
      el.style.scrollBehavior = "auto";
    }
    const dt = Math.max(e.timeStamp - d.t, 1);
    d.v = (e.movementX || 0) / dt + d.v * 0.6;
    d.t = e.timeStamp;
    el.scrollLeft = d.left - dx;
  };
  const endDrag = (e: React.PointerEvent<HTMLOListElement>) => {
    const d = drag.current;
    const el = scroller.current;
    drag.current = null;
    if (!d || !el || !d.moved) return;
    el.releasePointerCapture?.(e.pointerId);
    const rect = el.getBoundingClientRect();
    const snaps = Array.from(el.children).map((c) => {
      const r = c.getBoundingClientRect();
      return r.left - rect.left + el.scrollLeft + r.width / 2 - el.clientWidth / 2;
    });
    const target = dragReleaseTarget(el.scrollLeft, reduce ? 0 : d.v, el.scrollWidth - el.clientWidth, snaps);
    el.style.scrollSnapType = "";
    el.style.scrollBehavior = "";
    el.scrollTo({ left: target, behavior });
  };

  return (
    <section aria-label={heading} className={`bg-bg py-16 md:py-24 ${className}`} data-testid="career-rail">
      <div className="mx-auto flex max-w-[1100px] items-end justify-between gap-6 px-6 md:px-10">
        <div>
          <p className="text-sm text-ink-3">Career</p>
          <h2 className="mt-1 text-[32px] md:text-[46px]">{heading}</h2>
        </div>
        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            aria-label="Earlier roles"
            disabled={!canPrev}
            onClick={() => step(-1)}
            className="grid size-11 place-items-center rounded-full border border-hairline bg-bg text-ink-1 shadow-card transition-[opacity,background-color] hover:bg-canvas disabled:cursor-default disabled:opacity-40 disabled:hover:bg-bg"
            data-testid="rail-prev"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Later roles"
            disabled={!canNext}
            onClick={() => step(1)}
            className="grid size-11 place-items-center rounded-full border border-hairline bg-bg text-ink-1 shadow-card transition-[opacity,background-color] hover:bg-canvas disabled:cursor-default disabled:opacity-40 disabled:hover:bg-bg"
            data-testid="rail-next"
          >
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="relative mx-auto mt-8 max-w-[1100px] px-6 md:px-0">
        {/* phone: vertical track on the left */}
        <div aria-hidden className="absolute bottom-2 left-[calc(1.5rem+5px)] top-2 w-px bg-hairline md:hidden" />
        <ol
          ref={scroller}
          aria-label="Career chapters, oldest first"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="flex flex-col gap-4 pl-8 md:cursor-grab md:snap-x md:snap-mandatory md:flex-row md:gap-5 md:overflow-x-auto md:px-10 md:pb-6 md:pl-10 md:pt-2 md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden md:active:cursor-grabbing"
          style={{ scrollPaddingInline: "2.5rem", scrollBehavior: reduce ? "auto" : undefined }}
        >
          {stops.map((s) => (
            <li key={s.id} className="relative md:shrink-0 md:snap-center">
              <span aria-hidden className="absolute -left-8 top-6 size-[11px] rounded-full border-2 border-bg bg-ink-1 ring-1 ring-hairline md:hidden" />
              <article
                tabIndex={0}
                className="relative flex h-full flex-col overflow-hidden rounded-[var(--radius)] bg-bg p-6 shadow-card outline-none ring-1 ring-hairline transition-shadow focus-visible:ring-2 focus-visible:ring-accent md:w-[280px] [@media(hover:hover)]:hover:shadow-card-hover"
                data-testid="rail-card"
              >
                <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: s.ink }} />
                <p className="text-sm tabular-nums text-ink-3">{s.period}</p>
                <h3 className="mt-2 text-xl">{s.company}</h3>
                <p className="mt-1 text-[15px] text-ink-2">{s.role}</p>
                {s.domain ? (
                  <p className="mt-4 self-start rounded-full px-3 py-1 text-xs font-medium" style={{ background: s.wash, color: s.ink }}>
                    {s.domain}
                  </p>
                ) : null}
              </article>
            </li>
          ))}
          <li className="relative md:shrink-0 md:snap-center">
            <span aria-hidden className="absolute -left-8 top-6 size-[11px] rounded-full border-2 border-bg bg-accent ring-1 ring-hairline md:hidden" />
            <article
              tabIndex={0}
              className="flex h-full flex-col justify-center rounded-[var(--radius)] bg-canvas p-6 outline-none focus-visible:ring-2 focus-visible:ring-accent md:w-[280px]"
              data-testid="rail-total"
            >
              <p className="text-sm text-ink-3">So far</p>
              <p className="mt-2 text-lg leading-snug">{summary}</p>
            </article>
          </li>
        </ol>

        {/* desktop: hairline track + marker that glides to the centred card */}
        <div aria-hidden className="relative mx-10 mt-2 hidden h-[10px] md:block" data-testid="rail-track">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-hairline" />
          <motion.span
            className="absolute top-0 size-[10px] -translate-x-1/2 rounded-full bg-ink-1"
            initial={false}
            animate={{ left: `${markerPercent(active, count)}%` }}
            transition={reduce ? { duration: 0 } : SPRING.indicator}
            data-testid="rail-marker"
          />
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {stops[active] ? `${stops[active].company}, ${stops[active].period}` : ""}
      </p>
    </section>
  );
}
