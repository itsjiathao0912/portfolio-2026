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
import { countryName, flagOf } from "./stats/stats-copy";
import { useVisitor } from "./store";

// Codes that look valid but mean "unknown" (same list as src/lib/geo.ts, which a
// client component cannot import because it pulls in the server DB module).
const UNKNOWN_COUNTRIES = new Set(["XX", "T1", "ZZ", "EU", "UN", "QO", "AA", "QU"]);

type Geo = { country: string | null; city: string | null };
const UNKNOWN_GEO: Geo = { country: null, city: null };

/** Pure: country code only when it is a real one. */
function realCountry(raw: unknown) {
  return typeof raw === "string" && /^[A-Z]{2}$/.test(raw) && !UNKNOWN_COUNTRIES.has(raw) && countryName(raw) ? raw : null;
}

/** Pure: the dynamic title. "Hello stranger from Vietnam 🇻🇳, who are you?" or, with no geo, "Hello stranger, who are you?". Never a raw code. */
export function titleLine(geo: { country?: unknown } | null | undefined) {
  const code = realCountry(geo?.country);
  if (!code) return "Hello stranger, who are you?";
  const flag = flagOf(code);
  return `Hello stranger from ${countryName(code)}${flag ? ` ${flag}` : ""}, who are you?`;
}

/** Pure: "You're visiting from Ho Chi Minh City, Vietnam 🇻🇳" (city, country, flag) with graceful fallbacks; null when nothing is known. */
export function locationLine(geo: { country?: unknown; city?: unknown } | null | undefined) {
  const code = realCountry(geo?.country);
  const city = typeof geo?.city === "string" && geo.city.trim() && geo.city.trim().length <= 64 ? geo.city.trim() : null;
  const name = code ? countryName(code) : null;
  if (!city && !name) return null;
  const flag = code ? flagOf(code) : "";
  const place = [city, name].filter(Boolean).join(", ");
  return `You're visiting from ${place}${flag ? ` ${flag}` : ""}`;
}

// One fetch per page load; reopening the panel reuses it.
let geoCache: Geo | null = null;

/** Geo from GET /api/geo (country and city only, no IP). Any failure quietly means "unknown". */
function useGeo() {
  const [geo, setGeo] = useState<Geo | null>(geoCache);
  useEffect(() => {
    if (geoCache) return;
    let live = true;
    (async () => {
      let got: Geo = UNKNOWN_GEO;
      try {
        const res = await fetch("/api/geo", { cache: "no-store" });
        if (res.ok) {
          const b = (await res.json()) as { country?: unknown; city?: unknown };
          got = { country: realCountry(b.country), city: typeof b.city === "string" ? b.city : null };
        }
      } catch {
        /* silent */
      }
      geoCache = got;
      if (live) setGeo(got);
    })();
    return () => {
      live = false;
    };
  }, []);
  return geo;
}

type Item = RoleId;
const ITEMS: readonly Item[] = ROLE_IDS;

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
      <p id={labelId} className="pr-10 text-[20px] font-medium text-ink-1">
        Who are you?
      </p>
      <p className="pr-10 text-[14px] text-ink-3">Pick one and I will show the work that fits you first. You can change it any time.</p>
      {/* 11 same-size cards, 2 / 3 / 4 a row; the short last row is centred, nothing stretches. */}
      <div role="radiogroup" aria-labelledby={labelId} className="mt-5 flex w-full flex-wrap justify-center gap-3 [&>*]:w-[calc((100%-0.75rem)/2)] sm:[&>*]:w-[calc((100%-1.5rem)/3)] lg:[&>*]:w-[calc((100%-2.25rem)/4)]">
        {ITEMS.map((id, i) => (
          <RoleCard
            key={id}
            id={id}
            label={ROLES[id].label}
            blurb={ROLES[id].blurb}
            index={i}
            selected={id === role}
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

// Unpicked strip: a wrapping row of equal tiles (width = row minus gaps, divided by tiles per row), last row centred.
const UNPICKED_ROW =
  "flex flex-wrap justify-center [&>*]:w-[calc((100%-1.25rem)/3)] sm:[&>*]:w-[calc((100%-3.75rem)/6)] lg:[&>*]:w-[calc((100%-5rem)/6)]";

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
export function VisitorTop({ counts, summary, stats }: { counts?: Partial<Record<RoleId, number>>; summary?: React.ReactNode; stats?: React.ReactNode } = {}) {
  const { role, setRole, ready } = useVisitor();
  const reduce = useReducedMotion();
  const geo = useGeo();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusIdx, setFocusIdx] = useState(0);
  const chosen = role !== null;

  if (!ready) return <div aria-hidden="true" className="min-h-[420px]" data-testid="visitor-pending" />;

  const tabIdx = chosen ? ROW_ITEMS.indexOf(role) : focusIdx;

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
  // Unpicked: 11 same-size tiles, 3 a row on a phone and 6 wider, the short last row centred (nothing stretches).
  // Picked: the hero plus 10 tiles in two flush rows (phone: 5 small avatar-only tiles a row).
  // The title already says the country: the city line only helps before a pick, and goes once the hero takes over.
  const where = chosen ? null : locationLine(geo);

  return (
    <div data-testid="visitor-control">
      <header>
        <h2 data-testid="visitor-title" className="font-display text-[30px] leading-[1.08] text-balance text-ink-1 md:text-[40px]">
          {titleLine(geo)}
        </h2>
        {where ? (
          <p data-testid="visitor-location" className="mt-3 hidden sm:inline-block min-h-7 rounded-full border border-hairline bg-bg px-3 py-0.5 text-[14px] text-ink-1 shadow-1">
            {where}
          </p>
        ) : null}
        <AnimatePresence initial={false}>
          {!chosen ? (
            <motion.div
              key="intro"
              id="visitor-panel"
              data-testid="visitor-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0, marginTop: 0, transition: reduce ? { duration: 0 } : { ...SPRING.glide, opacity: { duration: 0.22 } } }}
              className="mt-3 overflow-hidden"
            >
              <p className="text-[16px] text-ink-2">
                <span className="sm:hidden">Pick one to see the work that fits you.</span>
                <span className="hidden sm:inline">Pick the one that is most like you and I will show the work that fits you first. You can change it any time.</span>
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
          className={cn("mt-5 grid grid-cols-3 gap-x-2.5 gap-y-4 pt-4 sm:gap-x-3 sm:gap-y-7 sm:pt-5 lg:gap-x-4", chosen ? "grid-cols-5 gap-x-2 sm:grid-cols-5 lg:grid-cols-[minmax(0,1.7fr)_repeat(5,minmax(0,1fr))]" : UNPICKED_ROW)}
        >
          {ROW_ITEMS.map((id, i) => (
            <RoleTile
              key={id}
              id={id}
              label={ROLES[id].label}
              blurb={ROLES[id].blurb}
              index={i}
              selected={id === role}
              tabbable={i === tabIdx}
              count={counts?.[id]}
              mini={chosen}
              buttonRef={(el) => {
                refs.current[i] = el;
              }}
              onKeyDown={(e) => onKey(e, i)}
              onSelect={(viaKeyboard) => {
                setFocusIdx(i);
                setRole(id);
                requestAnimationFrame(() =>
                  requestAnimationFrame(() => {
                    if (viaKeyboard) {
                      // The picked tile re-mounts as the big hero: hand focus to it so keyboard users keep their place.
                      refs.current[i]?.focus({ preventScroll: true });
                      return;
                    }
                    // A pointer pick leaves no focus on the tile: the arrow keys belong to the guide, not to the radio group.
                    const active = document.activeElement;
                    if (active instanceof HTMLElement && active.closest('[role="radiogroup"]')) active.blur();
                  }),
                );
              }}
            />
          ))}
        </motion.div>
      </LayoutGroup>

      {stats}
      {/* One quiet footer line: the playful lead (when there is one), then the privacy note. */}
      <div className="mt-3 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 text-center">
        <div className="text-[14px] text-ink-2 empty:hidden" aria-live="polite" data-testid="visitor-summary">
          {summary}
        </div>
        <p data-testid="visitor-privacy" className="text-[12px] leading-snug text-ink-3/80">
          {PRIVACY_NOTE}
        </p>
      </div>
    </div>
  );
}
