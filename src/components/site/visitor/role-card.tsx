"use client";

import { motion } from "motion/react";
import { SPRING } from "@/components/motion/springs";
import { ClayAvatar } from "@/components/clay/clay-avatar";
import { LiftCard } from "@/components/ui/lift-card";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { RoleId } from "./role-ids";

/** Soft pastel behind each character, from the design tokens (never raw colours). */
const TINTS = ["var(--tint-sky)", "var(--tint-lavender)", "var(--tint-peach)", "var(--tint-mint)", "var(--tint-rose)", "var(--tint-butter)", "var(--tint-aqua)", "var(--tint-periwinkle)"] as const;
export const tintFor = (index: number) => TINTS[index % TINTS.length]!;

type Props = {
  /** null = Skip. */
  id: RoleId | null;
  label: string;
  blurb: string;
  index: number;
  selected: boolean;
  /** Roving tabindex: exactly one card in the group is tabbable. */
  tabbable: boolean;
  /** The selected card hands its avatar to the chip through a shared layout id. */
  shareAvatar: boolean;
  onSelect: () => void;
  /** Spans two grid cells (the last card), so the grid has no empty cell. */
  wide?: boolean;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
};

/** One radio in the picker: a clay avatar, the label and a short blurb. 44 px+ target. */
export function RoleCard({ id, label, blurb, index, selected, tabbable, shareAvatar, wide, onSelect, onKeyDown, buttonRef }: Props) {
  const reduce = useReducedMotion();
  // Clipped to a round badge: the bust's torso would otherwise hang out of the card.
  const avatar = (
    <span className="block size-14 overflow-hidden rounded-full">
      <ClayAvatar role={id} view="bust" size={56} decorative tint={id ? tintFor(index) : undefined} className={id ? undefined : "text-ink-3"} />
    </span>
  );
  return (
    <LiftCard variant="row" radius="rounded-2xl" className={cn("h-full", wide && "col-span-2")}>
      <button
        ref={buttonRef}
        type="button"
        role="radio"
        aria-checked={selected}
        tabIndex={tabbable ? 0 : -1}
        data-testid={`role-${id ?? "skip"}`}
        onClick={onSelect}
        onKeyDown={onKeyDown}
        className={cn(
          "flex h-full min-h-[88px] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-3 text-center outline-none transition-colors duration-[120ms] sm:flex-row sm:justify-start sm:gap-3 sm:text-left",
          "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          selected ? "border-accent bg-accent-tint" : "border-hairline bg-bg hover:border-border-strong",
        )}
      >
        {shareAvatar ? (
          <motion.span layoutId="visitor-avatar" transition={reduce ? { duration: 0 } : SPRING.glide} className="shrink-0">
            {avatar}
          </motion.span>
        ) : (
          <span className="shrink-0">{avatar}</span>
        )}
        <span className="min-w-0">
          <span className="block text-[15px] font-medium leading-tight text-ink-1">{label}</span>
          <span className="mt-0.5 hidden text-[13px] leading-snug text-ink-3 sm:block">{blurb}</span>
        </span>
      </button>
    </LiftCard>
  );
}
