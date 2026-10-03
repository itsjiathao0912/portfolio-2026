"use client";

import { motion } from "motion/react";
import { SPRING } from "@/components/motion/springs";
import { ClayAvatar } from "@/components/clay/clay-avatar";
import { LiftCard } from "@/components/ui/lift-card";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { tintFor } from "./role-card";
import type { RoleId } from "./role-ids";

type Props = {
  /** null = Skip. */
  id: RoleId | null;
  label: string;
  index: number;
  selected: boolean;
  tabbable: boolean;
  /** Live count for this tile (P5 fills it from the stats). Absent = nothing is drawn. */
  count?: number;
  onSelect: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
};

/**
 * One square tile in the always-visible role strip: clay avatar, label and a
 * slot for a live count. The selection highlight is one shared `layoutId` element
 * that slides from tile to tile; under reduced motion it jumps.
 */
export function RoleTile({ id, label, index, selected, tabbable, count, onSelect, onKeyDown, buttonRef }: Props) {
  const reduce = useReducedMotion();
  return (
    <LiftCard variant="row" radius="rounded-2xl" className="h-full snap-start">
      <button
        ref={buttonRef}
        type="button"
        role="radio"
        aria-checked={selected}
        tabIndex={tabbable ? 0 : -1}
        data-testid={`tile-${id ?? "skip"}`}
        onClick={onSelect}
        onKeyDown={onKeyDown}
        className={cn(
          "relative flex h-full min-h-[112px] w-full min-w-[88px] flex-col items-center justify-start gap-1 rounded-2xl border bg-bg px-1.5 pb-2 pt-3 text-center outline-none transition-colors duration-[120ms]",
          "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          selected ? "border-transparent" : "border-hairline hover:border-border-strong",
        )}
      >
        {selected ? (
          <motion.span
            layoutId="visitor-tile-selection"
            transition={reduce ? { duration: 0 } : SPRING.indicator}
            className="absolute inset-0 rounded-2xl border-2 border-accent bg-accent-tint"
          />
        ) : null}
        <span className="relative block size-12 shrink-0 overflow-hidden rounded-full">
          <ClayAvatar role={id} view="bust" size={48} decorative tint={id ? tintFor(index) : undefined} className={id ? undefined : "text-ink-3"} />
        </span>
        <span className="relative text-[13px] font-medium leading-tight text-ink-1">{label}</span>
        {/* P5 SLOT (tile count): P5 passes `counts` to VisitorTop; the line is reserved so nothing shifts. */}
        <span data-testid={`tile-count-${id ?? "skip"}`} className="relative min-h-4 text-[12px] leading-4 tabular-nums text-ink-3">
          {typeof count === "number" ? count : ""}
        </span>
      </button>
    </LiftCard>
  );
}
