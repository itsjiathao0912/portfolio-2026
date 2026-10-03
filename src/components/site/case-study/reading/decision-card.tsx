"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { SPRING } from "@/components/motion/springs";
import { LiftCard } from "@/components/ui/lift-card";
import type { BlockGloss } from "@/lib/glossary-blocks";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { GlossText } from "./gloss-text";
import type { BlockOf } from "./types";

/**
 * One real trade-off. The chosen option is always on show; the rejected one is a button that flips to
 * say why it lost (Enter / Space / tap, aria-pressed). Both texts stay in the DOM. With reduced motion
 * there is no flip: the reason sits under the rejected option.
 */
export function DecisionCard({ block, gloss }: { block: BlockOf<"decision">; gloss?: BlockGloss }) {
  const [flipped, setFlipped] = useState(false);
  const reduce = useReducedMotion();
  const f = gloss?.fields ?? {};
  return (
    <LiftCard radius="rounded-lg" className="border border-hairline bg-bg shadow-1" data-testid="decision-card">
      <div className="flex flex-col gap-5 p-5 md:p-7">
        <div>
          <p className="text-sm font-semibold text-ink-3">The decision</p>
          <h3 className="mt-1 text-xl leading-snug md:text-2xl">{block.title}</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {reduce ? (
            <div className="flex min-h-[8.5rem] flex-col gap-2 rounded-lg bg-canvas p-4" data-testid="decision-rejected" data-flipped="n/a">
              <span className="text-sm font-semibold text-ink-3">Not chosen: {block.rejected.label}</span>
              <span className="text-base leading-snug text-ink-2">
                <GlossText segments={f.rejected} fallback={block.rejected.text} />
              </span>
              <span className="text-sm font-semibold text-ink-3">Why it lost</span>
              <span className="text-base leading-snug text-ink-1">
                <GlossText segments={f.because} fallback={block.because} />
              </span>
            </div>
          ) : (
            <button
              type="button"
              aria-pressed={flipped}
              data-testid="decision-rejected"
              data-flipped={flipped ? "true" : "false"}
              onClick={() => setFlipped((v) => !v)}
              className="relative min-h-[8.5rem] rounded-lg bg-canvas text-left [perspective:900px] focus-visible:outline-2 focus-visible:outline-accent"
            >
              <motion.span className="grid h-full [transform-style:preserve-3d]" initial={false} animate={{ rotateX: flipped ? 180 : 0 }} transition={SPRING.ui}>
                <span className="col-start-1 row-start-1 flex flex-col gap-2 p-4 [backface-visibility:hidden]">
                  <span className="text-sm font-semibold text-ink-3">Not chosen: {block.rejected.label}</span>
                  <span className="text-base leading-snug text-ink-2">
                    <GlossText segments={f.rejected} fallback={block.rejected.text} />
                  </span>
                  <span className="mt-auto pt-1 text-xs font-semibold text-accent">Tap to see why it lost</span>
                </span>
                <span className="col-start-1 row-start-1 flex flex-col gap-2 p-4 [transform:rotateX(180deg)] [backface-visibility:hidden]">
                  <span className="text-sm font-semibold text-ink-3">Why it lost</span>
                  <span className="text-base leading-snug text-ink-1">
                    <GlossText segments={f.because} fallback={block.because} />
                  </span>
                </span>
              </motion.span>
            </button>
          )}
          <div className="flex min-h-[8.5rem] flex-col gap-2 rounded-lg border border-hairline bg-bg p-4">
            <span className="inline-flex h-[22px] items-center gap-1 self-start rounded-lg bg-[color-mix(in_srgb,var(--success)_10%,white)] px-2 text-[12px] leading-none font-semibold text-success">
              <span aria-hidden="true">✓</span>Chosen: {block.chosen.label}
            </span>
            <p className="text-base leading-snug text-ink-1">
              <GlossText segments={f.chosen} fallback={block.chosen.text} />
            </p>
          </div>
        </div>
        {block.cost ? (
          <p className="text-sm leading-snug text-ink-2" data-testid="decision-cost">
            <span className="font-semibold text-ink-1">Cost I accepted: </span>
            <GlossText segments={f.cost} fallback={block.cost} />
          </p>
        ) : null}
        <p className="text-xs text-ink-3">Source: {block.source}</p>
      </div>
    </LiftCard>
  );
}
