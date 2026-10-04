"use client";

// Live stats for the picker row. Polls GET /api/stats about every 15 s, but only
// while ALL of these hold: the stats element is on screen, the tab is visible,
// and the visitor touched the page in the last ~10 minutes. Every failure
// (429, 503, offline, bad JSON) is silent: the last good value stays.
// No visitor id is sent: the endpoint needs only the role (a query value from
// a fixed list) and the server reads the country itself.

import { useCallback, useEffect, useRef, useState } from "react";
import { ROLE_IDS, type RoleId } from "../role-ids";
import { moveOwnCount, type StatsView } from "./stats-copy";

export const POLL_MS = 15_000;
export const JITTER_MS = 2_000;
export const IDLE_STOP_MS = 10 * 60_000;
/** Wait for the debounced POST /api/visit before re-reading after a role change. */
export const AFTER_CHANGE_MS = 1_800;

const INTERACTION_EVENTS = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

/** Pure: should a poll be scheduled right now? (unit-tested) */
export function shouldPoll(s: { onScreen: boolean; tabVisible: boolean; lastInteractionAt: number; now: number; enabled: boolean }) {
  return s.enabled && s.onScreen && s.tabVisible && s.now - s.lastInteractionAt < IDLE_STOP_MS;
}

/** Pure: next delay with +- jitter; `rand` in [0,1). */
export function nextDelay(rand: number) {
  return Math.round(POLL_MS + (rand * 2 - 1) * JITTER_MS);
}

/** Pure: validate a /api/stats body into a StatsView, or null if it is not trustworthy. */
export function parseStats(body: unknown): StatsView | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.total !== "number" || !b.byRole || typeof b.byRole !== "object" || !b.you || typeof b.you !== "object") return null;
  const byRole: Partial<Record<RoleId, number>> = {};
  for (const id of ROLE_IDS) {
    const n = (b.byRole as Record<string, unknown>)[id];
    if (typeof n === "number" && Number.isFinite(n) && n >= 0) byRole[id] = n;
  }
  const y = b.you as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0);
  const topCountries: StatsView["topCountries"] = [];
  if (Array.isArray(b.topCountries)) {
    for (const t of b.topCountries as unknown[]) {
      const c = t as Record<string, unknown> | null;
      if (c && typeof c.country === "string" && /^[A-Z]{2}$/.test(c.country) && typeof c.count === "number" && Number.isFinite(c.count) && c.count > 0) topCountries.push({ country: c.country, count: c.count });
    }
  }
  return {
    total: b.total,
    topCountries,
    byRole,
    you: {
      country: typeof y.country === "string" ? y.country : null,
      countryCount: num(y.countryCount),
      countryRank: num(y.countryRank),
      roleCount: num(y.roleCount),
    },
  };
}

export function useLiveStats({ role, ready }: { role: RoleId | null; ready: boolean }) {
  const [data, setData] = useState<StatsView | null>(null);
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [idleTick, setIdleTick] = useState(0); // bumps when an interaction wakes an idle poller
  const lastInteraction = useRef(0);
  const idleRef = useRef(false);
  const roleRef = useRef(role);
  const prevRole = useRef<RoleId | null | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abort = useRef<AbortController | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  // Visibility of the element that carries the ref.
  const ref = useCallback((el: HTMLElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!el) return setOnScreen(false);
    if (typeof IntersectionObserver === "undefined") return setOnScreen(true);
    observer.current = new IntersectionObserver((entries) => setOnScreen(entries.some((e) => e.isIntersecting)), { rootMargin: "120px" });
    observer.current.observe(el);
  }, []);

  // Tab visibility + interaction (for the 10 minute idle stop).
  useEffect(() => {
    lastInteraction.current = Date.now();
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    onVis();
    let lastBump = 0;
    const onInteract = () => {
      const now = Date.now();
      lastInteraction.current = now;
      if (idleRef.current && now - lastBump > 1000) {
        lastBump = now;
        idleRef.current = false;
        setIdleTick((n) => n + 1);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    for (const e of INTERACTION_EVENTS) window.addEventListener(e, onInteract, { passive: true });
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      for (const e of INTERACTION_EVENTS) window.removeEventListener(e, onInteract);
    };
  }, []);

  const fetchOnce = useCallback(async () => {
    abort.current?.abort();
    const ctl = new AbortController();
    abort.current = ctl;
    try {
      const res = await fetch(`/api/stats?role=${roleRef.current ?? "none"}`, { signal: ctl.signal, cache: "no-store" });
      if (!res.ok) return; // 429 / 503 / 500: keep the last value, no noise
      const next = parseStats(await res.json());
      if (next && !ctl.signal.aborted) setData(next);
    } catch {
      /* silent */
    }
  }, []);

  // The poll loop.
  useEffect(() => {
    const clear = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };
    const tick = () => {
      clear();
      const ok = shouldPoll({ enabled: ready, onScreen, tabVisible, lastInteractionAt: lastInteraction.current, now: Date.now() });
      if (!ok) {
        idleRef.current = ready && onScreen && tabVisible; // only "idle" if everything else says go
        return;
      }
      void fetchOnce();
      timer.current = setTimeout(tick, nextDelay(Math.random()));
    };
    tick();
    return () => {
      clear();
      abort.current?.abort();
    };
  }, [ready, onScreen, tabVisible, idleTick, fetchOnce]);

  // After the visitor changes role: show the move at once, then re-read.
  useEffect(() => {
    if (!ready) return;
    const before = prevRole.current;
    prevRole.current = role;
    if (before === undefined || before === role) return; // first value, or no change
    setData((d) => (d ? { ...d, byRole: moveOwnCount(d.byRole, before, role), you: { ...d.you, roleCount: Math.max(1, d.you.roleCount) } } : d));
    const t = setTimeout(() => {
      if (document.visibilityState === "visible") void fetchOnce();
    }, AFTER_CHANGE_MS);
    return () => clearTimeout(t);
  }, [role, ready, fetchOnce]);

  return { data, ref };
}
