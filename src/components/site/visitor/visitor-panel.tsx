"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SPRING } from "@/components/motion/springs";
import { useReducedMotion } from "@/lib/use-reduced-motion";
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
 * The always-visible role strip right after the logo band: one row of square
 * tiles (clay avatar, label, count slot) with a sliding selection. Before a
 * choice, the geo greeting and "Who are you?" sit on top of the same row and
 * collapse away after the first pick. Tap any tile to switch instantly.
 *
 * P5 props: `counts` (live count per tile, keyed by role id or "skip") and
 * `summary` (the one-line stats node, e.g. "You're visitor #213 · 48 from Vietnam").
 * Both are optional; when absent nothing is drawn and nothing breaks.
 */
export function VisitorTop({ counts, summary }: { counts?: Partial<Record<RoleId | "skip", number>>; summary?: React.ReactNode } = {}) {
  const { role, collapsed, setRole, ready } = useVisitor();
  const reduce = useReducedMotion();
  const greeting = useGreeting();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusIdx, setFocusIdx] = useState(0);
  const selectedId: Item | undefined = role ?? (collapsed ? null : undefined);

  if (!ready) return <div aria-hidden="true" className="min-h-[148px]" data-testid="visitor-pending" />;

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

  return (
    <div data-testid="visitor-control">
      <AnimatePresence initial={false}>
        {!collapsed ? (
          <motion.div
            key="intro"
            id="visitor-panel"
            data-testid="visitor-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0, transition: reduce ? { duration: 0 } : { ...SPRING.glide, opacity: { duration: 0.22 } } }}
            className="mb-5 overflow-hidden"
          >
            <p className="font-display min-h-[38px] text-[28px] leading-[1.1] text-ink-1 md:min-h-[42px] md:text-[34px]" aria-live="polite" data-testid="visitor-greeting">
              {greeting ? (
                <motion.span initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : 0.32 }}>
                  {greeting}
                </motion.span>
              ) : null}
            </p>
            <p className="mt-1 text-[16px] text-ink-2">Who are you?</p>
            <p className="text-[14px] text-ink-3">Pick one and I will show the work that fits you first. You can change it any time.</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <LayoutGroup id="visitor-strip">
        <div
          role="radiogroup"
          aria-label="Your role"
          data-testid="visitor-strip"
          className="-mx-1 -my-2 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 py-2 [scrollbar-width:none] lg:grid lg:grid-cols-12 lg:overflow-visible"
        >
          {ROW_ITEMS.map((id, i) => (
            <RoleTile
              key={id ?? "skip"}
              id={id}
              label={id ? ROLES[id].label : "Skip"}
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
              }}
            />
          ))}
        </div>
      </LayoutGroup>

      {/* P5 SLOT (stats summary): P5 passes `summary` to VisitorTop, e.g. "You're visitor #213 · 48 from Vietnam". */}
      <div className="mt-3 min-h-5 text-[14px] text-ink-2" aria-live="polite" data-testid="visitor-summary">
        {summary}
      </div>
      <p data-testid="visitor-privacy" className="mt-1 text-[13px] leading-snug text-ink-3">
        {PRIVACY_NOTE}
      </p>
    </div>
  );
}
