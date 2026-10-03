"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { SPRING } from "@/components/motion/springs";
import { Character } from "./character";
import { buildWallTiles } from "./logic";

const TILES = buildWallTiles();

/**
 * Community wall: tiles built ONLY from content/site.ts facts. Hover (mouse),
 * tap (touch) or Enter/Space (keyboard) flips a tile to its full sourced line.
 * Both faces are always in the DOM, so screen readers get all the text.
 * Reduced motion: crossfade instead of a 3D flip.
 */
export function WomenInTechWall({ title = "Community, in her own numbers" }: { title?: string }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  return (
    <section aria-label={title} data-testid="wit-wall">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TILES.map((t) => {
          const flipped = open === t.id || hover === t.id;
          return (
            <li key={t.id} className="[perspective:1000px]">
              <button
                type="button"
                aria-expanded={flipped}
                onClick={() => setOpen((o) => (o === t.id ? null : t.id))}
                onPointerEnter={(e) => e.pointerType === "mouse" && setHover(t.id)}
                onPointerLeave={() => setHover(null)}
                className="relative block h-[248px] w-full cursor-pointer touch-manipulation rounded-[var(--radius)] text-left outline-offset-4 [-webkit-tap-highlight-color:transparent]"
                data-testid={`wit-tile-${t.id}`}
              >
                <motion.div
                  className="relative size-full [transform-style:preserve-3d]"
                  initial={false}
                  animate={reduce ? {} : { rotateY: flipped ? 180 : 0 }}
                  transition={SPRING.tilt}
                >
                  <div
                    className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[var(--radius)] border border-hairline p-5 [backface-visibility:hidden] transition-opacity"
                    style={{ background: t.tint, opacity: reduce && flipped ? 0 : 1 }}
                  >
                    <p className="label-mono text-[12px] text-ink-2">{t.kicker}</p>
                    <div className="flex items-end justify-between gap-2">
                      <p className="text-2xl leading-tight font-semibold text-ink-1">{t.front}</p>
                      <Character name={t.character} size={64} />
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 flex flex-col justify-between rounded-[var(--radius)] bg-ink-1 p-5 text-bg [backface-visibility:hidden] transition-opacity"
                    style={{ transform: reduce ? undefined : "rotateY(180deg)", opacity: reduce ? (flipped ? 1 : 0) : 1 }}
                  >
                    <p className="text-[15px] leading-snug">{t.back}</p>
                    <p className="label-mono text-[11px] opacity-70">{t.source}</p>
                  </div>
                </motion.div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
