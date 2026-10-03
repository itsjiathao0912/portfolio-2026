"use client";

import { LayoutGroup, motion } from "motion/react";
import { useRef } from "react";
import { SPRING } from "@/components/motion/springs";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { HOME_PERSONAS, type HomePersona } from "./persona-order";

const LABEL: Record<"all" | HomePersona, string> = { all: "Everything", recruiter: "Recruiter", founder: "Founder", engineer: "Engineer" };
const OPTIONS = ["all", ...HOME_PERSONAS] as const;

/** "Show me first:" segmented control (radiogroup, arrow keys, sliding thumb). */
export function PersonaControl({ value, onChange }: { value: HomePersona | null; onChange: (v: HomePersona | null) => void }) {
  const reduce = useReducedMotion();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = value ?? "all";
  const idx = OPTIONS.indexOf(current);

  function pick(i: number) {
    const next = OPTIONS[(i + OPTIONS.length) % OPTIONS.length];
    onChange(next === "all" ? null : next);
    refs.current[(i + OPTIONS.length) % OPTIONS.length]?.focus();
  }

  return (
    <div className="flex flex-wrap items-center gap-3" data-testid="persona-control">
      <span className="text-[14px] text-ink-3" id="persona-label">Show me first:</span>
      <LayoutGroup id="persona">
        <div role="radiogroup" aria-labelledby="persona-label" className="flex max-w-full overflow-x-auto rounded-full border border-hairline bg-canvas p-1 [scrollbar-width:none]">
          {OPTIONS.map((opt, i) => {
            const on = opt === current;
            return (
              <button
                key={opt}
                ref={(el) => { refs.current[i] = el; }}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                data-testid={`persona-${opt}`}
                onClick={() => onChange(opt === "all" ? null : opt)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); pick(idx + 1); }
                  if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); pick(idx - 1); }
                }}
                className={cn(
                  "relative min-h-11 shrink-0 rounded-full px-2.5 text-[14px] md:px-4 font-medium outline-none transition-colors duration-[120ms] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 md:min-h-9",
                  on ? "text-ink-1" : "text-ink-3 hover:text-ink-1"
                )}
              >
                {on ? (
                  <motion.span layoutId="persona-thumb" transition={reduce ? { duration: 0 } : SPRING.indicator} className="absolute inset-0 rounded-full bg-white shadow-2" />
                ) : null}
                <span className="relative">{LABEL[opt]}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
