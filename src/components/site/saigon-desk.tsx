"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { SPRING } from "@/components/motion/springs";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { saigonTime } from "@/components/gems/logic";
import {
  deltaFromSaigon,
  formatMin,
  offsetLabel,
  overlapOnSaigonAxis,
  overlapSentence,
  visitorWorkOnSaigonAxis,
  WORK_END_MIN,
  WORK_START_MIN,
  type Span,
} from "./saigon-desk-logic";

function Band({ spans, className }: { spans: readonly Span[]; className: string }) {
  return (
    <>
      {spans.map(([s, e]) => (
        <span
          key={`${s}-${e}`}
          aria-hidden="true"
          className={cn("absolute inset-y-0 rounded-sm", className)}
          style={{ left: `${(s / 1440) * 100}%`, width: `${((e - s) / 1440) * 100}%` }}
        />
      ))}
    </>
  );
}

/** The card itself: two times, a 24 h mini timeline on the Saigon clock, and one sentence. */
export function SaigonDeskPanel({ now }: { now: Date }) {
  const east = -now.getTimezoneOffset();
  const delta = deltaFromSaigon(east);
  const local = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
  const zone = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, " ");
    } catch {
      return "";
    }
  })();
  const overlap = overlapOnSaigonAxis(delta);
  const nowPct = ((((now.getUTCHours() * 60 + now.getUTCMinutes() + 7 * 60) % 1440) / 1440) * 100).toFixed(2);
  return (
    <div className="flex flex-col gap-3 text-left" data-testid="saigon-desk-panel">
      <div className="flex items-baseline justify-between gap-6">
        <div>
          <p className="label-mono text-[11px] text-ink-3">Saigon</p>
          <p className="font-display text-[28px] leading-none tabular-nums text-ink-1" data-testid="desk-saigon">{saigonTime(now)}</p>
        </div>
        <div className="text-right">
          <p className="label-mono text-[11px] text-ink-3">You{zone ? ` · ${zone}` : ""}</p>
          <p className="font-display text-[28px] leading-none tabular-nums text-ink-1" data-testid="desk-local">{local}</p>
        </div>
      </div>
      <p className="text-[12px] text-ink-3">{offsetLabel(delta)}</p>
      <div
        role="img"
        aria-label={`Working hours 09:00 to 18:00 on each side. ${overlapSentence(delta)}`}
        className="flex flex-col gap-1.5"
        data-testid="desk-timeline"
      >
        <div className="relative h-3 rounded-sm bg-canvas">
          <Band spans={[[WORK_START_MIN, WORK_END_MIN]]} className="bg-ink-1/25" />
          <Band spans={overlap} className="bg-accent" />
        </div>
        <div className="relative h-3 rounded-sm bg-canvas">
          <Band spans={visitorWorkOnSaigonAxis(delta)} className="bg-ink-1/25" />
          <Band spans={overlap} className="bg-accent" />
          <span aria-hidden="true" className="absolute -inset-y-1 w-px bg-ink-1" style={{ left: `${nowPct}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-ink-3 tabular-nums" aria-hidden="true">
          <span>00</span><span>06</span><span>12</span><span>18</span><span>24 Saigon</span>
        </div>
      </div>
      <p className="text-[13px] leading-[1.45] text-ink-2" data-testid="desk-overlap">{overlapSentence(delta)}</p>
      <p className="text-[11px] text-ink-3">Office hours are {formatMin(WORK_START_MIN)}-{formatMin(WORK_END_MIN)} on both sides.</p>
    </div>
  );
}

/**
 * Wraps the nav clock. `inline` (mobile menu) expands the panel in place;
 * otherwise it is a glass popover under the clock, rendered in a portal so the
 * nav pill's own clipping can never cut it off. Opens on tap, click, Enter,
 * Space or mouse hover; Esc and outside tap close it.
 */
export function SaigonDesk({ children, inline = false, className }: { children: ReactNode; inline?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const reduce = useReducedMotion();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const lastPointer = useRef<string>("");

  useEffect(() => {
    if (!open) return;
    const t = window.setInterval(() => setNow(new Date()), 20_000);
    const place = () => {
      const r = btn.current?.getBoundingClientRect();
      if (r) setPos({ top: r.bottom + 10, right: Math.max(12, window.innerWidth - r.right) });
    };
    place();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (root.current?.contains(t) || pop.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, { passive: true });
    return () => {
      window.clearInterval(t);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place);
    };
  }, [open]);

  const show = () => {
    setNow(new Date());
    setOpen(true);
  };

  const trigger = (
    <button
      ref={btn}
      type="button"
      aria-expanded={open}
      aria-controls={id}
      aria-haspopup="dialog"
      data-testid="saigon-desk-trigger"
      onPointerDown={(e) => {
        lastPointer.current = e.pointerType;
      }}
      // A mouse click arrives after hover already opened it: keep it open. Touch and keyboard toggle.
      onClick={() => (open && lastPointer.current !== "mouse" ? setOpen(false) : show())}
      className="min-h-11 cursor-pointer rounded-md px-1 text-inherit underline-offset-4 decoration-dotted [@media(hover:hover)]:hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {children}
    </button>
  );

  const panel = open && now ? <SaigonDeskPanel now={now} /> : null;

  if (inline) {
    return (
      <div className={cn("flex flex-col items-center", className)} ref={root}>
        {trigger}
        <AnimatePresence initial={false}>
          {panel ? (
            <motion.div
              id={id}
              key="panel"
              role="group"
              aria-label="Saigon desk"
              className="mt-2 w-full overflow-hidden rounded-lg bg-canvas px-4 py-3"
              initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={reduce ? { duration: 0 } : SPRING.sheet}
            >
              {panel}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      ref={root}
      className={cn("relative inline-flex", className)}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") show();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse" && !pop.current?.matches(":hover")) setOpen(false);
      }}
    >
      {trigger}
      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {panel && pos ? (
                <motion.div
                  ref={pop}
                  id={id}
                  key="pop"
                  role="dialog"
                  aria-label="Saigon desk"
                  data-testid="saigon-desk-pop"
                  data-tint="light"
                  className="glass z-[60] w-[300px] rounded-xl p-4"
                  style={{ position: "fixed", background: "#fff", top: pos.top, right: pos.right }}
                  onPointerLeave={(e) => {
                    if (e.pointerType === "mouse" && !root.current?.matches(":hover")) setOpen(false);
                  }}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={reduce ? { duration: 0 } : SPRING.ui}
                >
                  {panel}
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
