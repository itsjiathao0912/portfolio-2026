"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useRef, useState } from "react";
import { useFinePointer } from "@/components/motion/use-fine-pointer";
import { cn } from "@/lib/utils";

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

  function move(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--rx", `${e.clientX - r.left}px`);
    el.style.setProperty("--ry", `${e.clientY - r.top}px`);
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
        onPointerLeave={live ? (e) => e.currentTarget.setAttribute("data-active", "false") : undefined}
      >
        {children}
        {live ? (
          <div aria-hidden="true" data-testid="cursor-reveal-layer" className={cn("cursor-reveal-layer pointer-events-none absolute inset-0 flex items-center bg-bg", altClassName)}>
            <span className="w-full">{alt}</span>
          </div>
        ) : null}
      </div>
      {!live ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShown((v) => !v)}
            aria-expanded={shown}
            data-testid="cursor-reveal-toggle"
            className="label-mono text-[12px] text-ink-3 underline decoration-dotted underline-offset-4 hover:text-ink-1"
          >
            {shown ? "ok, back to the serious version" : "psst — the casual version"}
          </button>
          {shown ? <p className="mt-2 text-[18px] text-ink-2 italic" data-testid="cursor-reveal-alt">{alt}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
