"use client";

// Poll state: reads once when the module first scrolls into view, then only
// when this visitor votes. All traffic is POST /api/poll with the visitor id in
// the BODY (never in a URL). Votes are optimistic and revert on any failure.

import { useCallback, useEffect, useRef, useState } from "react";
import { POLL_OPTION_IDS, isPollOptionId, isRoleId, type PollOptionId, type RoleId } from "../role-ids";

/** `roles`: the most common voter roles per option (aggregate, no PII), most frequent first. */
export type PollData = { counts: Partial<Record<PollOptionId, number>>; total: number; mine: PollOptionId | null; roles?: Partial<Record<PollOptionId, RoleId[]>> };

const MAX_FACES = 4;
export type PollNote = "pick-role" | "slow-down" | "failed" | null;

/** Pure: validate a /api/poll body. */
export function parsePoll(body: unknown): PollData | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.total !== "number" || !b.counts || typeof b.counts !== "object") return null;
  const counts: Partial<Record<PollOptionId, number>> = {};
  for (const id of POLL_OPTION_IDS) {
    const n = (b.counts as Record<string, unknown>)[id];
    counts[id] = typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : 0;
  }
  const roles: Partial<Record<PollOptionId, RoleId[]>> = {};
  const rawRoles = b.roles && typeof b.roles === "object" ? (b.roles as Record<string, unknown>) : {};
  for (const id of POLL_OPTION_IDS) {
    const list = rawRoles[id];
    roles[id] = Array.isArray(list) ? list.filter(isRoleId).slice(0, MAX_FACES) : [];
  }
  return { counts, total: b.total, mine: isPollOptionId(b.mine) ? b.mine : null, roles };
}

/** Pure: apply an optimistic vote. Re-voting the same option changes nothing. */
export function applyVote(data: PollData, option: PollOptionId, role: RoleId | null = null): PollData {
  if (data.mine === option) return data;
  const counts = { ...data.counts };
  if (data.mine) counts[data.mine] = Math.max(0, (counts[data.mine] ?? 0) - 1);
  counts[option] = (counts[option] ?? 0) + 1;
  const roles = { ...(data.roles ?? {}) };
  // Your own face joins the option you picked at once; the server reply settles the rest.
  if (role) roles[option] = [role, ...(roles[option] ?? []).filter((r) => r !== role)].slice(0, MAX_FACES);
  return { counts, total: data.mine ? data.total : data.total + 1, mine: option, roles };
}

/** The server only counts votes from visitors who picked a role: without one, a vote is never sent (the read still is). */
export function usePoll({ visitorId, ready, hasRole = true, role = null }: { visitorId: string; ready: boolean; hasRole?: boolean; role?: RoleId | null }) {
  const [data, setData] = useState<PollData | null>(null);
  const [note, setNote] = useState<PollNote>(null);
  const [onScreen, setOnScreen] = useState(false);
  const loaded = useRef(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const dataRef = useRef<PollData | null>(null);
  const inflight = useRef(0);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const ref = useCallback((el: HTMLElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return setOnScreen(true);
    observer.current = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setOnScreen(true);
    }, { rootMargin: "200px" });
    observer.current.observe(el);
  }, []);

  const post = useCallback(
    async (option: PollOptionId | null, signal?: AbortSignal) => {
      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ visitorId, option }),
        cache: "no-store",
        signal,
      });
      return { status: res.status, body: res.ok ? parsePoll(await res.json()) : null };
    },
    [visitorId],
  );

  // One read, the first time the module is on screen.
  useEffect(() => {
    if (!ready || !visitorId || !onScreen || loaded.current) return;
    loaded.current = true;
    const ctl = new AbortController();
    post(null, ctl.signal)
      .then((r) => {
        if (r.body && !ctl.signal.aborted) setData(r.body);
        else loaded.current = false; // allow a later retry (for example after a 503 clears)
      })
      .catch(() => {
        loaded.current = false;
      });
    return () => ctl.abort();
  }, [ready, visitorId, onScreen, post]);

  const vote = useCallback(
    async (option: PollOptionId) => {
      const before = dataRef.current;
      if (!hasRole) return setNote("pick-role");
      if (!before || before.mine === option) return;
      setNote(null);
      setData(applyVote(before, option, role));
      const ticket = ++inflight.current;
      try {
        const r = await post(option);
        if (ticket !== inflight.current) return; // a newer vote superseded this one
        if (r.body) return setData(r.body);
        setData(before);
        setNote(r.status === 403 ? "pick-role" : r.status === 429 ? "slow-down" : "failed");
      } catch {
        if (ticket !== inflight.current) return;
        setData(before);
        setNote("failed");
      }
    },
    [post, hasRole, role],
  );

  return { data, note, vote, ref };
}
