"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { clamp, kineticAxes } from "./math";
import { useReducedMotion } from "./use-reduced-motion";

export interface KineticHeadlineProps {
  text: string;
  as?: "h1" | "h2" | "p";
  className?: string;
  /** Accent colour for letters nearest the pointer. */
  accent?: string;
}

/**
 * Big Archivo type whose variable axes react to scroll (heavier + wider as
 * it scrolls up the viewport) and to the pointer (letters near it bulge
 * and pick up the accent). Letters are aria-hidden spans; the accessible
 * name is the plain text. A hidden sizer reserves the heaviest/widest
 * rendering, so axis changes never shift layout.
 * Reduced motion: static weight 700, no per-letter effects.
 */
export function KineticHeadline({ text, as: Tag = "h2", className, accent = "#2563eb" }: KineticHeadlineProps) {
  const wrap = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = wrap.current;
    if (!el || reduced) return;
    const letters = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-k]"));
    let scroll = 0;
    let px: number | null = null;
    let py: number | null = null;
    let frame = 0;
    let visible = false;
    const paint = () => {
      frame = 0;
      for (const l of letters) {
        let prox = 0;
        if (px !== null && py !== null) {
          const r = l.getBoundingClientRect();
          const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
          prox = clamp(1 - d / 160, 0, 1);
        }
        const { wght, wdth } = kineticAxes(scroll, prox);
        l.style.fontVariationSettings = `"wght" ${wght}, "wdth" ${wdth}`;
        l.style.color = prox > 0.15 ? `color-mix(in srgb, ${accent} ${Math.round(prox * 100)}%, currentColor)` : "";
      }
    };
    const req = () => {
      if (visible && !frame) frame = requestAnimationFrame(paint);
    };
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      scroll = clamp(1 - (r.top + r.height / 2) / window.innerHeight, 0, 1);
      req();
    };
    const onPointer = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      req();
    };
    const onLeave = () => {
      px = py = null;
      req();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) onScroll();
    });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointermove", onPointer);
    el.addEventListener("pointerdown", onPointer);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointermove", onPointer);
      el.removeEventListener("pointerdown", onPointer);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [reduced, accent, text]);

  const words = text.split(" ");
  return (
    <Tag
      ref={wrap as React.Ref<HTMLHeadingElement>}
      aria-label={text}
      className={cn("relative font-display leading-[0.95] tracking-tight", className)}
      style={{ fontVariationSettings: reduced ? `"wght" 700, "wdth" 100` : `"wght" 400, "wdth" 100` }}
    >
      {/* Sizer: reserves the widest/heaviest line so axis changes never reflow neighbours. */}
      <span aria-hidden="true" className="invisible block" style={{ fontVariationSettings: `"wght" 900, "wdth" 125` }}>
        {text}
      </span>
      <span aria-hidden="true" className="absolute inset-0 block">
        {words.map((w, wi) => (
          <span key={wi}>
            <span className="inline-block whitespace-nowrap">
              {Array.from(w).map((ch, ci) => (
                <span key={ci} data-k="" className="inline-block transition-[color] duration-200">
                  {ch}
                </span>
              ))}
            </span>
            {wi < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}
