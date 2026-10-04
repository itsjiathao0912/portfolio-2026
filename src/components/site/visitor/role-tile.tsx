"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { SPRING } from "@/components/motion/springs";
import { ClayAvatar } from "@/components/clay/clay-avatar";
import { useBlink } from "@/components/clay/use-blink";
import { LiftCard } from "@/components/ui/lift-card";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { tintFor } from "./role-card";
import type { RoleId } from "./role-ids";
import { RollingNumber } from "./stats/rolling-number";

type Props = {
  /** null = Skip. */
  id: RoleId | null;
  label: string;
  blurb: string;
  index: number;
  /** The picked tile becomes the big hero on the left. */
  selected: boolean;
  tabbable: boolean;
  /** Live count for this tile. Absent = nothing is drawn. */
  count?: number;
  /** True when the pick came from the keyboard (Enter / Space), false for a pointer or touch. */
  onSelect: (viaKeyboard: boolean) => void;
  /** Fills two grid columns, so the grid has no dead cell. */
  /** Phone, after a pick: a small avatar-only tile (the name stays as the accessible label). */
  mini?: boolean;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
};

const soft = (tint: string, pct: number) => `color-mix(in srgb, ${tint} ${pct}%, white)`;

/** Wave flutter: toggles the wave frame so the raised hand moves. Off under reduced motion. */
function useWaveFrame(on: boolean) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => setFrame((f) => f + 1), 420);
    return () => clearInterval(t);
  }, [on]);
  return frame;
}

/** A role's count is shown only once at least this many people picked it (never a lonely "0"). */
export const MIN_SHOWN_COUNT = 3;

function Count({ id, count, className }: { id: RoleId | null; count?: number; className?: string }) {
  const showCount = typeof count === "number" && count >= MIN_SHOWN_COUNT;
  return (
    <span data-testid={`tile-count-${id ?? "skip"}`} className={cn("relative min-h-5 rounded-full px-2 text-[12px] leading-5 tabular-nums text-ink-2", showCount && "bg-bg/80", className)}>
      {showCount ? <RollingNumber value={count} /> : ""}
    </span>
  );
}

/**
 * One radio in the picker. Unpicked: a soft rounded tile with the clay bust
 * in its own area at the top (head fully inside) and the label below it, never overlapping. Picked: the same element grows into the big hero
 * (full figure, waving, role name, one-line note). Every tile is a layout
 * element, so picking glides the grid into its new shape on a spring.
 */
export function RoleTile({ id, label, blurb, index, selected, tabbable, count, mini, onSelect, onKeyDown, buttonRef }: Props) {
  const reduce = useReducedMotion();
  const blinking = useBlink(!reduce);
  const frame = useWaveFrame(selected && !reduce);
  const tint = id ? tintFor(index) : "var(--tint-sky)";
  const transition = reduce ? { duration: 0 } : SPRING.sheet;

  return (
    <motion.div layout transition={transition} className={cn("min-w-0", selected && "order-first col-span-full sm:col-span-5 lg:col-span-1 lg:row-span-2")}>
      {selected ? (
        <button
          ref={buttonRef}
          type="button"
          role="radio"
          aria-checked
          tabIndex={tabbable ? 0 : -1}
          data-testid={`tile-${id ?? "skip"}`}
          onClick={(e) => onSelect(e.detail === 0)}
          onKeyDown={onKeyDown}
          style={{ background: `linear-gradient(160deg, ${soft(tint, 70)}, ${soft(tint, 28)})` }}
          className="relative flex h-full min-h-[124px] sm:min-h-[148px] lg:min-h-0 w-full flex-row items-center gap-4 rounded-[28px] border border-accent/30 p-4 text-left outline-none ring-2 ring-accent/70 focus-visible:ring-offset-2 lg:flex-col lg:justify-end lg:gap-2 lg:p-5 lg:text-center"
        >
          <motion.span
            initial={reduce ? false : { opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { ...SPRING.ui, delay: 0.08 }}
            className="relative block shrink-0 lg:flex-1 lg:self-stretch"
          >
            <span className="hidden h-full items-end justify-center lg:flex">
              <ClayAvatar role={id} view="full" size={132} pose="wave" frame={frame} blinking={blinking} decorative shadow={false} className={id ? undefined : "text-ink-3"} />
            </span>
            <span className="block lg:hidden">
              <ClayAvatar role={id} view="full" size={72} pose="wave" frame={frame} blinking={blinking} decorative shadow={false} className={id ? undefined : "text-ink-3"} />
            </span>
          </motion.span>
          <span className="relative flex min-w-0 flex-col gap-1 lg:items-center">
            <span className="label-mono text-[11px] text-ink-3">{id ? "That's you" : "Showing everything"}</span>
            <span className="font-display text-[28px] leading-[1.05] text-ink-1 lg:text-[28px]">{label}</span>
            <span className="text-[14px] leading-snug text-ink-2">{blurb}</span>
            <Count id={id} count={count} className="mt-1 self-start lg:self-center" />
          </span>
        </button>
      ) : (
        <LiftCard variant="card" radius="rounded-3xl" className="h-full" sheen={false}>
          <motion.button
            ref={buttonRef}
            type="button"
            role="radio"
            aria-checked={false}
            tabIndex={tabbable ? 0 : -1}
            data-testid={`tile-${id ?? "skip"}`}
            onClick={(e) => onSelect(e.detail === 0)}
            onKeyDown={onKeyDown}
            initial="rest"
            whileHover="hover"
            style={{ background: soft(tint, 46) }}
            className={cn("relative flex h-full w-full flex-col items-center justify-start gap-1 overflow-hidden rounded-3xl border border-hairline px-1 pt-3 pb-2.5 sm:gap-1.5 sm:px-1.5 sm:pt-4 sm:pb-3 text-center outline-none transition-colors duration-[120ms] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2", mini && "max-sm:rounded-2xl max-sm:pt-2 max-sm:pb-0")}
          >
            <motion.span
              variants={reduce ? undefined : { rest: { y: 0, scale: 1, rotate: 0 }, hover: { y: -2, scale: 1.04, rotate: -2 } }}
              transition={reduce ? { duration: 0 } : SPRING.ui}
              className="pointer-events-none block origin-bottom"
            >
              {/* The bust's torso draws below its svg box (overflow visible): reserve that space so the label never sits on it. */}
              <span className="block pb-5 sm:hidden">
                <ClayAvatar role={id} view="bust" size={52} decorative className={id ? undefined : "text-ink-3"} />
              </span>
              <span className="hidden pb-6 sm:block">
                <ClayAvatar role={id} view="bust" size={72} decorative className={id ? undefined : "text-ink-3"} />
              </span>
            </motion.span>
            <span className={cn("relative mt-auto text-[12px] leading-tight font-medium text-ink-1 sm:text-[13px]", mini && "max-sm:sr-only")}>{label}</span>
            <Count id={id} count={count} className={mini ? "max-sm:hidden" : undefined} />
          </motion.button>
        </LiftCard>
      )}
    </motion.div>
  );
}
