"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SPRING } from "@/components/motion/springs";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { ROLE_IDS, type RoleId } from "./role-ids";
import { RoleCard } from "./role-card";
import { RoleTile } from "./role-tile";
import { PRIVACY_NOTE, ROLES } from "./roles";
import { useVisitor } from "./store";

// Codes that look valid but mean "unknown" (same list as src/lib/geo.ts, which a
// client component cannot import because it pulls in the server DB module).
const UNKNOWN_COUNTRIES = new Set(["XX", "T1", "ZZ", "EU", "UN", "QO", "AA", "QU"]);

/** Pure: "Hey {city}", else "Hey {country name}", else "Hey stranger". Never a raw code. */
export function greetingLine(geo: { country?: unknown; city?: unknown } | null | undefined) {
  const city = typeof geo?.city === "string" ? geo.city.trim() : "";
  if (city && city.length <= 64) return `Hey ${city}`;
  const country = typeof geo?.country === "string" && /^[A-Z]{2}$/.test(geo.country) && !UNKNOWN_COUNTRIES.has(geo.country) ? geo.country : null;
  if (country) {
    try {
      const name = new Intl.DisplayNames(["en"], { type: "region" }).of(country);
      if (name && name !== country) return `Hey ${name}`;
    } catch {
      /* no ICU table: fall through */
    }
  }
  return "Hey stranger";
}

// One fetch per page load; reopening the panel reuses it.
let greetingCache: string | null = null;

/** Greeting from GET /api/geo. Any failure (404, 429, 503, offline) quietly means "Hey stranger". */
function useGreeting() {
  const [greeting, setGreeting] = useState<string | null>(greetingCache);
  useEffect(() => {
    if (greetingCache) return;
    let live = true;
    (async () => {
      let line = "Hey stranger";
      try {
        const res = await fetch("/api/geo", { cache: "no-store" });
        if (res.ok) line = greetingLine(await res.json());
      } catch {
        /* silent */
      }
      greetingCache = line;
      if (live) setGreeting(line);
    })();
    return () => {
      live = false;
    };
  }, []);
  return greeting;
}

type Item = RoleId | null; // null = Skip
const ITEMS: readonly Item[] = [...ROLE_IDS, null];

/**
 * The role grid, shared by the top panel and the change-role modal: radiogroup of
 * 11 roles + Skip (arrows move focus, Enter/Space picks, Home/End), the privacy note,
 * and P5's slots. Used in the change-role modal.
 */
export function RolePicker({ onPick, onEscape, autoFocus, labelId }: { onPick: (id: Item) => void; onEscape?: () => void; autoFocus: boolean; labelId: string }) {
  const { role } = useVisitor();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusIdx, setFocusIdx] = useState(() => {
    const i = role ? ITEMS.indexOf(role) : 0;
    return i < 0 ? 0 : i;
  });

  useEffect(() => {
    // Only when the visitor opened the picker themselves. Keyed on the flag, not on
    // mount: reopening mid-collapse reuses this same instance.
    if (autoFocus) refs.current[focusIdx]?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  function move(to: number) {
    const next = (to + ITEMS.length) % ITEMS.length;
    setFocusIdx(next);
    refs.current[next]?.focus();
  }
  function onKey(event: React.KeyboardEvent<HTMLButtonElement>, i: number) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        return move(i + 1);
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        return move(i - 1);
      case "Home":
        event.preventDefault();
        return move(0);
      case "End":
        event.preventDefault();
        return move(ITEMS.length - 1);
      case "Escape":
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
    }
  }

  return (
    <>
      <p id={labelId} className="text-[20px] font-medium text-ink-1">
        Who are you?
      </p>
      <p className="text-[14px] text-ink-3">Pick one and I will show the work that fits you first. You can change it any time.</p>
      <div role="radiogroup" aria-labelledby={labelId} className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ITEMS.map((id, i) => (
          <RoleCard
            key={id ?? "skip"}
            id={id}
            label={id ? ROLES[id].label : "Skip"}
            blurb={id ? ROLES[id].blurb : "Show me everything"}
            index={i}
            selected={id !== null && id === role}
            tabbable={i === focusIdx}
            shareAvatar={false}
            buttonRef={(el) => {
              refs.current[i] = el;
            }}
            onKeyDown={(e) => onKey(e, i)}
            onSelect={() => {
              setFocusIdx(i);
              onPick(id);
            }}
          />
        ))}
      </div>
      {/* P5 SLOT (poll): P5 renders <VisitorPoll /> here, and only here. */}
      <p data-testid="visitor-privacy" className="mt-5 text-[13px] leading-snug text-ink-3">
        {PRIVACY_NOTE}
      </p>
      {/* P5 SLOT (stats): P5 renders <VisitorStats /> here, and only here. */}
    </>
  );
}

const ROW_ITEMS = ITEMS;

/**
 * The standalone "Pick your character" section, right after the logo band.
 * Before a choice: two rows of clay tiles under a heading and the geo greeting.
 * After it: the picked character grows into the big left slot (waving, name, one
 * line) while the other tiles regroup into a compact grid on the right, on shared
 * layout springs. Picking another character swaps it into the big slot.
 *
 * Optional props: `counts` (live count per tile, keyed by role id or "skip"),
 * `stats` (the big live numbers) and `summary` (the one-sentence stats line).
 * When absent nothing is drawn and nothing breaks.
 */
export function VisitorTop({ counts, summary, stats }: { counts?: Partial<Record<RoleId | "skip", number>>; summary?: React.ReactNode; stats?: React.ReactNode } = {}) {
  const { role, collapsed, setRole, ready } = useVisitor();
  const reduce = useReducedMotion();
  const greeting = useGreeting();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusIdx, setFocusIdx] = useState(0);
  const selectedId: Item | undefined = role ?? (collapsed ? null : undefined);

  if (!ready) return <div aria-hidden="true" className="min-h-[420px]" data-testid="visitor-pending" />;

  const tabIdx = selectedId !== undefined ? ROW_ITEMS.indexOf(selectedId) : focusIdx;

  function move(to: number) {
    const next = (to + ROW_ITEMS.length) % ROW_ITEMS.length;
    setFocusIdx(next);
    refs.current[next]?.focus();
  }
  function onKey(event: React.KeyboardEvent<HTMLButtonElement>, i: number) {
    const keys: Record<string, number> = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: ROW_ITEMS.length - 1 };
    if (event.key in keys) {
      event.preventDefault();
      move(keys[event.key]!);
    }
  }
  const chosen = selectedId !== undefined;

  return (
    <div data-testid="visitor-control">
      <header className="max-w-[620px]">
        <p className="label-mono text-[12px] text-accent">Who&apos;s visiting?</p>
        <h2 className="font-display mt-2 text-[34px] leading-[1.05] text-ink-1 md:text-[48px]">Pick your character</h2>
        <AnimatePresence initial={false}>
          {!collapsed ? (
            <motion.div
              key="intro"
              id="visitor-panel"
              data-testid="visitor-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0, marginTop: 0, transition: reduce ? { duration: 0 } : { ...SPRING.glide, opacity: { duration: 0.22 } } }}
              className="mt-3 overflow-hidden"
            >
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[16px] text-ink-2">
                <span className="min-h-7 rounded-full border border-hairline bg-bg px-3 py-0.5 text-[14px] text-ink-1 shadow-1" aria-live="polite" data-testid="visitor-greeting">
                  {greeting ? (
                    <motion.span initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : 0.32 }}>
                      {greeting}
                    </motion.span>
                  ) : null}
                </span>
                <span>Pick the one that is most like you and I will show the work that fits you first. You can change it any time.</span>
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <LayoutGroup id="visitor-strip">
        <motion.div
          layout
          transition={reduce ? { duration: 0 } : SPRING.sheet}
          role="radiogroup"
          aria-label="Your role"
          data-testid="visitor-strip"
          className={cn("mt-8 grid grid-cols-3 gap-x-3 gap-y-9 pt-5 sm:grid-cols-4 lg:gap-x-4", chosen ? "lg:grid-cols-7 lg:gap-y-7" : "lg:grid-cols-6")}
        >
          {ROW_ITEMS.map((id, i) => (
            <RoleTile
              key={id ?? "skip"}
              id={id}
              label={id ? ROLES[id].label : "Skip"}
              blurb={id ? ROLES[id].blurb : "Show me everything"}
              index={i}
              selected={selectedId !== undefined && id === selectedId}
              tabbable={i === tabIdx}
              count={counts?.[id ?? "skip"]}
              buttonRef={(el) => {
                refs.current[i] = el;
              }}
              onKeyDown={(e) => onKey(e, i)}
              onSelect={() => {
                setFocusIdx(i);
                setRole(id);
                // The picked tile re-mounts as the big hero: hand focus to it so keyboard users keep their place.
                requestAnimationFrame(() => requestAnimationFrame(() => refs.current[i]?.focus({ preventScroll: true })));
              }}
            />
          ))}
        </motion.div>
      </LayoutGroup>

      {stats}
      <div className="mt-6 min-h-6 text-[14px] text-ink-2" aria-live="polite" data-testid="visitor-summary">
        {summary}
      </div>
      <p data-testid="visitor-privacy" className="mt-1 text-[12px] leading-snug text-ink-3/80">
        {PRIVACY_NOTE}
      </p>
    </div>
  );
}
