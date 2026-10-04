"use client";

import { LayoutGroup, motion } from "motion/react";
import { SPRING } from "@/components/motion/springs";
import { PERSONA_META, isPersona } from "@/components/signature/participate/logic";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { useReadingDepth } from "./depth-context";
import { DEPTH_LABEL, DEPTH_ORDER, nextDepthIndex } from "./logic";


/**
 * Skim / Read / Deep control under the hero. Inline, not sticky: a second bar
 * pinned under the nav covered content (Cortex "Next step", Results). On
 * desktop the margin TOC carries a compact copy once this scrolls away.
 */
export function DepthPill() {
  const { depth, setDepth, persona, ready } = useReadingDepth();
  const reduce = useReducedMotion();
  const meta = persona && isPersona(persona) ? PERSONA_META[persona] : null;
  return (
    <div className="-mt-4 mb-10 flex flex-col items-stretch gap-2 md:items-center" data-testid="depth-bar">
      <div
        role="radiogroup"
        aria-label="Reading depth"
        data-testid="depth-pill"
        data-depth={depth}
        data-ready={ready ? "true" : "false"}
        className="glass relative flex h-11 w-full items-center rounded-full px-1 py-0 md:w-auto"
        data-tint="light"
      >
        <LayoutGroup id="depth-pill">
          {DEPTH_ORDER.map((d, i) => {
            const active = d === depth;
            return (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={active}
                data-testid={`depth-${d}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setDepth(d)}
                onKeyDown={(e) => {
                  const next = nextDepthIndex(e.key, i, DEPTH_ORDER.length);
                  if (next === null) return;
                  e.preventDefault();
                  setDepth(DEPTH_ORDER[next]);
                  const group = e.currentTarget.parentElement;
                  requestAnimationFrame(() => group?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus());
                }}
                className={cn(
                  "relative flex h-full flex-1 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent md:flex-none md:px-5",
                  active ? "text-white" : "text-ink-2 hover:text-ink-1",
                )}
              >
                {active ? (
                  <motion.span layoutId="depth-thumb" aria-hidden="true" className="absolute inset-0 -z-10 rounded-full bg-navy" transition={reduce ? { duration: 0 } : SPRING.indicator} />
                ) : null}
                <span>{DEPTH_LABEL[d].name}</span>
                <span className={cn("hidden text-xs font-medium sm:inline", active ? "text-white/70" : "text-ink-3")}>{DEPTH_LABEL[d].hint}</span>
              </button>
            );
          })}
        </LayoutGroup>
      </div>
      {meta ? (
        <p className="text-center text-sm text-ink-3" data-testid="depth-persona">
          Reading as {meta.label}. Pick another depth any time.
        </p>
      ) : null}
    </div>
  );
}
