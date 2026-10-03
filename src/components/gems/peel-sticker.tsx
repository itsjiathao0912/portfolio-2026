"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { SPRING } from "@/components/motion/springs";
import { cn } from "@/lib/utils";
import { peelProgress } from "./logic";

/**
 * Hidden gem (about): a round sticker with a curled corner. Drag it away
 * (mouse or finger) far enough and it peels off to show a hidden note; a tap
 * or Enter/Space does the same, so keyboard, touch and reduced-motion
 * visitors all get there. The note is not in the tab order until revealed.
 */
export function PeelSticker({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [peeled, setPeeled] = useState(false);
  const dragged = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const lift = useTransform([x, y], ([dx, dy]: number[]) => peelProgress(dx, dy));
  const rotate = useTransform(lift, [0, 1], [-8, 18]);
  const scale = useTransform(lift, [0, 1], [1, 1.08]);
  const shadow = useTransform(lift, [0, 1], ["0 2px 4px rgba(0,0,0,0.12)", "0 18px 22px rgba(0,0,0,0.22)"]);

  return (
    <div className={cn("relative size-[118px]", className)} data-testid="peel-sticker" data-peeled={peeled ? "true" : "false"}>
      <div
        aria-hidden={!peeled}
        inert={!peeled}
        className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed border-border-strong bg-bg p-3 text-center text-[12px] leading-tight text-ink-2"
        data-testid="peel-note"
      >
        <span>You peeled it!</span>
        <Link href="/work/cortex-sentinel" className="font-medium text-ink-1 underline underline-offset-2">
          Start with Cortex Sentinel →
        </Link>
      </div>
      <AnimatePresence>
        {!peeled ? (
          <motion.button
            key="sticker"
            type="button"
            aria-label="Sticker: peel it off to find a hidden note"
            data-testid="peel-button"
            drag={!reduce}
            dragSnapToOrigin
            dragElastic={0.6}
            dragMomentum={false}
            onDragStart={() => (dragged.current = true)}
            onDragEnd={(_, info) => {
              if (peelProgress(info.offset.x, info.offset.y) >= 1) setPeeled(true);
              window.setTimeout(() => (dragged.current = false), 0);
            }}
            onClick={() => {
              if (!dragged.current) setPeeled(true);
            }}
            style={reduce ? undefined : { x, y, rotate, scale, boxShadow: shadow }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -40, rotate: 40, transition: SPRING.ui }}
            className="peel-sticker absolute inset-0 flex cursor-grab touch-none items-center justify-center rounded-full bg-[#fde68a] text-center font-display text-[18px] leading-none text-ink-1 ring-2 ring-ink-1 active:cursor-grabbing"
          >
            <span className="-rotate-6">
              hi,
              <br />
              peel me
            </span>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
