"use client";

import { useRef } from "react";
import { LiquidGlass, type LiquidGlassProps } from "@/components/glass/liquid-glass";
import { cn } from "@/lib/utils";
import { pointerPercent } from "./math";
import { useReducedMotion } from "./use-reduced-motion";

export interface GlassCardProps extends Omit<LiquidGlassProps, "radius"> {
  radius?: number;
  /** Highlight colour (any CSS colour). */
  glint?: string;
  /** Turn the card into a focusable link. */
  href?: string;
}

/**
 * Liquid-glass card with a specular highlight that follows the pointer
 * (mouse, pen or touch). Reduced motion: highlight stays fixed top-left.
 * The highlight is written to CSS vars, so no React re-render per move.
 */
export function GlassCard({ radius = 24, glint = "rgba(255,255,255,0.75)", href, className, children, ...rest }: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const move = (e: React.PointerEvent) => {
    if (reduced || !ref.current) return;
    const { px, py } = pointerPercent(e.clientX, e.clientY, ref.current.getBoundingClientRect());
    ref.current.style.setProperty("--gx", `${px}%`);
    ref.current.style.setProperty("--gy", `${py}%`);
    ref.current.style.setProperty("--go", "1");
  };
  const leave = () => ref.current?.style.setProperty("--go", reduced ? "0.6" : "0.35");

  const body = (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          borderRadius: radius,
          opacity: "var(--go, 0.35)",
          background: `radial-gradient(240px circle at var(--gx, 20%) var(--gy, 15%), ${glint}, transparent 60%)`,
          mixBlendMode: "soft-light",
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ borderRadius: radius, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(10,20,60,0.08)" }}
      />
      <div className="relative">{children}</div>
    </>
  );

  return (
    <LiquidGlass
      ref={ref}
      radius={radius}
      onPointerMove={move}
      onPointerDown={move}
      onPointerLeave={leave}
      className={cn("relative overflow-hidden", href && "focus-within:ring-2 focus-within:ring-accent", className)}
      {...rest}
    >
      {href ? (
        <a href={href} className="block outline-none">
          {body}
        </a>
      ) : (
        body
      )}
    </LiquidGlass>
  );
}
