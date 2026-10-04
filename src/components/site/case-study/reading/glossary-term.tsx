"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { SPRING } from "@/components/motion/springs";
import { glossaryEntry } from "@/lib/glossary";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const WIDTH = 280;
const MARGIN = 12;

interface Place {
  left: number;
  top?: number;
  bottom?: number;
}

/**
 * A glossary term: dotted underline, opens a small glass card on hover, focus or tap.
 * The card is portalled and fixed-positioned, so it never shifts the text around it and
 * flips above/below and clamps to the viewport (no clipping at 390 px). Esc closes it.
 */
export function GlossaryTerm({ id, children }: { id: string; children: ReactNode }) {
  const entry = glossaryEntry(id);
  const reduce = useReducedMotion();
  const tipId = useId();
  const button = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const pointer = useRef<string>("mouse");
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<Place | null>(null);

  const measure = useCallback(() => {
    const el = button.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(WIDTH, window.innerWidth - MARGIN * 2);
    const left = Math.min(Math.max(rect.left + rect.width / 2 - width / 2, MARGIN), window.innerWidth - width - MARGIN);
    setPlace(rect.top > 170 ? { left, bottom: window.innerHeight - rect.top + 8 } : { left, top: rect.bottom + 8 });
  }, []);

  const show = useCallback(
    (delay: number) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        measure();
        setOpen(true);
      }, delay);
    },
    [measure],
  );
  const hide = useCallback((delay = 120) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), delay);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onAway = (event: PointerEvent) => {
      if (event.target instanceof Node && !button.current?.contains(event.target) && !(event.target as Element).closest?.("[data-glossary-card]")) setOpen(false);
    };
    const close = () => setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onAway);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onAway);
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  if (!entry) return <>{children}</>;

  return (
    <>
      <button
        ref={button}
        type="button"
        data-testid="glossary-term"
        data-term={id}
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        onPointerDown={(e) => {
          pointer.current = e.pointerType;
        }}
        onPointerEnter={(e) => e.pointerType === "mouse" && show(120)}
        onPointerLeave={(e) => e.pointerType === "mouse" && hide()}
        onFocus={() => show(0)}
        onBlur={() => hide(0)}
        onClick={() => {
          window.clearTimeout(timer.current);
          if (pointer.current === "mouse") {
            measure();
            setOpen(true);
          } else if (open) setOpen(false);
          else {
            measure();
            setOpen(true);
          }
        }}
        className="-my-2 inline-block cursor-help rounded-sm bg-transparent px-0 py-2 text-inherit underline decoration-ink-3 decoration-dotted decoration-2 underline-offset-4 hover:decoration-ink-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {children}
      </button>
      {open && place
        ? createPortal(
            <motion.div
              id={tipId}
              role="tooltip"
              data-glossary-card=""
              data-testid="glossary-card"
              data-tint="light"
              onPointerEnter={() => window.clearTimeout(timer.current)}
              onPointerLeave={() => hide()}
              initial={{ opacity: 0, y: reduce ? 0 : place.bottom !== undefined ? 6 : -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduce ? { duration: 0 } : SPRING.ui}
              style={{ position: "fixed", left: place.left, top: place.top, bottom: place.bottom, width: Math.min(WIDTH, window.innerWidth - MARGIN * 2) }}
              className="glass z-[70] rounded-xl px-4 py-3 text-left text-sm leading-snug font-normal text-ink-1 shadow-2"
            >
              <span className="block font-semibold">{entry.label}</span>
              <span className="mt-1 block text-ink-2">{entry.def}</span>
            </motion.div>,
            document.body,
          )
        : null}
    </>
  );
}
