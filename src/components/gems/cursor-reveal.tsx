"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useEffect, useRef, useState } from "react";
import { useFinePointer } from "@/components/motion/use-fine-pointer";
import { cn } from "@/lib/utils";

// Same condition as `live` (useFinePointer && !useReducedMotion), expressed in CSS so
// the server HTML already matches every device and hydration never resizes the hero.
const LIVE_MQ = "[@media(hover:hover)_and_(pointer:fine)_and_(prefers-reduced-motion:no-preference)]";
export const MASK_ON = `${LIVE_MQ}:flex`;
export const TOGGLE_OFF = `${LIVE_MQ}:hidden`;

interface CursorRevealProps {
  children: React.ReactNode;
  /** The casual "real me" line hidden under the headline. */
  alt: string;
  /** Typography for the hidden line (match the headline). */
  altClassName?: string;
  className?: string;
}

/**
 * Hidden gem (home hero): on a real mouse, a soft circle follows the cursor
 * over the headline and reveals a casual rewrite underneath. Pure CSS mask
 * driven by two CSS variables, so pointer moves never re-render React.
 * Touch or reduced motion: no mask at all — a quiet text button shows the
 * casual line below instead (tap again to hide).
 */
export function CursorReveal({ children, alt, altClassName, className }: CursorRevealProps) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const live = fine && !reduce;

  // The mask eases toward the pointer (about SPRING.glide) instead of being glued to it.
  const target = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0, seeded: false });
  const raf = useRef<number | null>(null);

  function step() {
    raf.current = null;
    const el = ref.current;
    if (!el) return;
    const c = cur.current;
    const t = target.current;
    c.x += (t.x - c.x) * 0.16;
    c.y += (t.y - c.y) * 0.16;
    const settled = Math.abs(t.x - c.x) < 0.5 && Math.abs(t.y - c.y) < 0.5;
    if (settled) {
      c.x = t.x;
      c.y = t.y;
    }
    el.style.setProperty("--rx", `${c.x}px`);
    el.style.setProperty("--ry", `${c.y}px`);
    if (!settled) raf.current = requestAnimationFrame(step);
  }
  function stop() {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
  }
  useEffect(() => stop, []);
  useEffect(() => {
    if (!live) stop();
  }, [live]);

  function move(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    target.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    // First contact starts at the pointer (the circle grows there); later moves ease.
    if (!cur.current.seeded) {
      cur.current = { ...target.current, seeded: true };
      el.style.setProperty("--rx", `${cur.current.x}px`);
      el.style.setProperty("--ry", `${cur.current.y}px`);
    }
    if (raf.current === null) raf.current = requestAnimationFrame(step);
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div
        ref={ref}
        className="cursor-reveal-host relative"
        data-testid="cursor-reveal"
        data-mode={live ? "mask" : "toggle"}
        onPointerMove={live ? move : undefined}
        onPointerEnter={live ? (e) => (move(e), e.currentTarget.setAttribute("data-active", "true")) : undefined}
        onPointerLeave={live ? (e) => (e.currentTarget.setAttribute("data-active", "false"), (cur.current.seeded = false), stop()) : undefined}
      >
        {children}
        {/* Always rendered (server == client, no layout shift); CSS decides which shows. */}
        <div aria-hidden="true" data-testid="cursor-reveal-layer" className={cn("cursor-reveal-layer pointer-events-none absolute inset-0 hidden items-center bg-bg", MASK_ON, altClassName)}>
          <span className="w-full">{alt}</span>
        </div>
      </div>
      <div className={cn("mt-3", TOGGLE_OFF)}>
          <button
            type="button"
            onClick={() => setShown((v) => !v)}
            aria-expanded={shown}
            data-testid="cursor-reveal-toggle"
            className="label-mono inline-flex min-h-11 items-center text-[12px] text-ink-3 underline decoration-dotted underline-offset-4 hover:text-ink-1"
          >
            {shown ? "ok, back to the serious version" : "psst — the casual version"}
          </button>
          {shown ? <p className="mt-2 text-[18px] text-ink-2 italic" data-testid="cursor-reveal-alt">{alt}</p> : null}
      </div>
    </div>
  );
}
