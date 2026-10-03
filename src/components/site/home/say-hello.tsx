"use client";

import { animate, motion, useMotionValue } from "motion/react";
import { useRef, useState } from "react";
import { SPRING } from "@/components/motion/springs";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type Stage = "idle" | "settled";

/** Pointer travel (px) below which a press counts as a tap. */
const DRAG_SLOP = 6;

/** The coin drops into the wallet with one small bounce. */
const SETTLE = { type: "spring", stiffness: 300, damping: 15, mass: 0.9 } as const;

/**
 * "Say hello": drag the coin into Thao's wallet, or tap / press Enter. A brushed
 * metal coin with a T monogram (no face, no idle bounce). Horizontal drag only so
 * the page still scrolls vertically on touch.
 */
export function SayHello({ email, linkedin }: { email: string; linkedin: string }) {
  const [stage, setStage] = useState<Stage>("idle");
  const reduce = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const wallet = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const drag = useRef({ on: false, startX: 0, from: 0, moved: 0 });
  const [progress, setProgress] = useState(0);

  function targetX() {
    const t = track.current?.getBoundingClientRect();
    const w = wallet.current?.getBoundingClientRect();
    if (!t || !w) return 0;
    return Math.max(0, w.left - t.left + w.width / 2 - 28 - 4);
  }
  function send() {
    if (stage !== "idle") return;
    setStage("settled");
    setProgress(1);
    if (reduce) x.set(targetX());
    else animate(x, targetX(), SETTLE);
  }
  /** Release: past 85% of the track sends the coin, anything shorter springs back to the start. */
  function endDrag() {
    if (!drag.current.on) return;
    drag.current.on = false;
    if (drag.current.moved <= DRAG_SLOP) return;
    if (targetX() && x.get() >= targetX() * 0.85) send();
    else {
      setProgress(0);
      if (reduce) x.set(0);
      else animate(x, 0, SPRING.sheet);
    }
  }
  function reset() {
    setStage("idle");
    setProgress(0);
    if (reduce) x.set(0);
    else animate(x, 0, SPRING.sheet);
  }

  return (
    <section aria-labelledby="hello-title" className="bg-bg px-4 py-14 md:py-[64px]" data-testid="section-say-hello" id="say-hello">
      <div className="mx-auto max-w-[720px] rounded-[24px] bg-bg p-6 text-center shadow-1 ring-1 ring-black/5 md:p-10">
        <h2 id="hello-title" className="text-[32px] md:text-[46px]">Say hello</h2>
        <p className="mt-3 text-[16px] text-ink-3">Drag the coin to Thao&apos;s wallet, or just tap it.</p>

        <div ref={track} className="relative mt-8 flex items-center justify-between rounded-[16px] bg-canvas p-4 md:p-6" style={{ touchAction: "pan-y" }}>
          <svg aria-hidden="true" className="pointer-events-none absolute inset-x-[88px] top-1/2 h-1 -translate-y-1/2 md:inset-x-[104px]" preserveAspectRatio="none" viewBox="0 0 100 2" width="100%" height="4">
            <line x1="0" y1="1" x2="100" y2="1" stroke="var(--border-strong, #d4d4d8)" strokeWidth="2" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="1" x2={progress * 100} y2="1" stroke="var(--accent)" strokeWidth="2" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
          </svg>
          <motion.button
            type="button"
            data-testid="hello-coin"
            aria-label="Send the coin to Thao's wallet"
            style={{ x, touchAction: "pan-y" }}
            onPointerDown={(e) => {
              if (stage !== "idle") return;
              // Keyboard presses are synthesised as pointer events with no real pointer: skip those.
              if (e.pointerType) {
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  /* no active pointer: dragging simply does not start */
                }
              }
              drag.current = { on: Boolean(e.pointerType), startX: e.clientX, from: x.get(), moved: 0 };
            }}
            onPointerMove={(e) => {
              if (!drag.current.on) return;
              // Total distance from the press point, not the biggest single step: a slow finger sends 2-3 px per event.
              const dx = e.clientX - drag.current.startX;
              drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
              const nx = Math.max(0, Math.min(targetX(), drag.current.from + dx));
              x.set(nx);
              setProgress(targetX() ? nx / targetX() : 0);
            }}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClick={() => {
              // A click that ends a drag is handled by endDrag; only a real tap / Enter / Space sends.
              if (drag.current.moved <= DRAG_SLOP) send();
              drag.current.moved = 0;
            }}
            whileTap={reduce ? undefined : { scale: 1.06 }}
            className="relative z-[1] grid size-14 shrink-0 cursor-grab place-items-center rounded-full font-display text-[22px] font-bold text-[#3b3d44] shadow-2 outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
            disabled={stage !== "idle"}
          >
            <span aria-hidden="true" className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 30deg, #c9ccd3, #ffffff, #b7bbc4, #f4f5f7, #c9ccd3)" }} />
            <span aria-hidden="true" className="absolute inset-[5px] rounded-full ring-1 ring-black/10" style={{ background: "conic-gradient(from 200deg, #eceef2, #ffffff, #d5d8df, #f7f8fa, #eceef2)" }} />
            <span className="relative">T</span>
          </motion.button>

          <motion.div
            ref={wallet}
            animate={stage === "settled" && !reduce ? { scale: [1, 1.1, 0.97, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, delay: stage === "settled" ? 0.16 : 0, ease: "easeOut" }}
            className="relative z-[1] grid h-16 w-24 shrink-0 place-items-center rounded-xl bg-white/70 text-[13px] font-semibold backdrop-blur-md ring-1 ring-black/10"
            data-testid="hello-wallet"
            data-stage={stage}
          >
            <span className={stage === "settled" ? "text-success" : "text-ink-2"}>{stage === "settled" ? "✓ Settled" : "Thao's wallet"}</span>
          </motion.div>
        </div>

        <div aria-live="polite" className="mt-5 min-h-12">
          {stage === "settled" ? (
            <motion.div initial={{ opacity: 0, y: reduce ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.32 }} className="flex flex-wrap items-center justify-center gap-3">
              <a href={`mailto:${email}`} data-testid="hello-email" className="inline-flex min-h-11 items-center rounded-full bg-ink-1 px-6 text-[15px] font-semibold text-bg hover:bg-ink-hover">Email</a>
              <a href={linkedin} target="_blank" rel="noreferrer" data-testid="hello-linkedin" className="inline-flex min-h-11 items-center rounded-full border border-ink-1 px-6 text-[15px] font-semibold text-ink-1 hover:bg-canvas">LinkedIn</a>
              <button type="button" onClick={reset} className="min-h-11 px-3 text-[14px] text-ink-3 underline underline-offset-4">Send another</button>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
