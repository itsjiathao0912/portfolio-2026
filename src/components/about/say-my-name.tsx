"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { SPRING } from "@/components/motion/springs";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export const NAME_HINT = {
  name: "Gia Thảo",
  phonetic: "zah tow",
  // DRAFT for Thao to rewrite in her own words.
  tones: "The hỏi mark on ả makes the voice dip, then lift, like a quiet question.",
} as const;

/**
 * "Say it" chip beside the name. Tap, click, Enter or hover opens a small
 * popover; Esc, outside tap or blur closes it. No audio.
 */
export function SayMyName() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const id = useId();
  const root = useRef<HTMLSpanElement>(null);
  const lastPointer = useRef<string>("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <span
      ref={root}
      className="relative inline-flex align-middle"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setOpen(false);
      }}
    >
      <button
        type="button"
        data-testid="say-my-name"
        aria-expanded={open}
        aria-controls={id}
        onPointerDown={(e) => {
          lastPointer.current = e.pointerType;
        }}
        // A mouse click arrives after hover already opened it: keep it open. Touch and keyboard toggle.
        onClick={() => setOpen((v) => (lastPointer.current === "mouse" ? true : !v))}
        className="inline-flex min-h-11 items-center rounded-full border border-hairline px-3 text-[13px] text-ink-2 transition-colors [@media(hover:hover)]:hover:text-ink-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Say it
      </button>
      <AnimatePresence>
        {open ? (
          <motion.span
            id={id}
            role="status"
            data-testid="say-my-name-pop"
            className="glass top-full left-0 z-30 mt-2 flex w-[240px] flex-col gap-1 rounded-lg p-4 text-left"
            data-tint="light"
            style={{ position: "absolute", background: "#fff" }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={reduce ? { duration: 0 } : SPRING.ui}
          >
            <span lang="vi" className="font-display text-[28px] leading-[1.1] text-ink-1">{NAME_HINT.name}</span>
            <span className="label-mono text-[13px] text-ink-1">{NAME_HINT.phonetic}</span>
            <span className="text-[13px] leading-[1.45] text-ink-2">{NAME_HINT.tones}</span>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}
