"use client";

// The visitor store: the ONE source for who the visitor says they are.
// localStorage `thao:visitor:v1` = { v, role, collapsed, visitorId, ordinal, visitConfirmed }.
//
// - First render is `ready: false` (matches the server); state hydrates in a
//   microtask, so nothing flashes for a returning visitor.
// - The older `thao:participate:persona` value (a JSON-encoded string) is read
//   exactly once, only while no valid visitor store exists, and only when it is
//   recruiter / founder / engineer. The migrated state is written back, so the
//   legacy key is never consulted again.
// - POST /api/visit fires ONLY on the first choice or an actual role change,
//   trailing-edge debounced. 429 retries once after Retry-After; every other
//   failure is silent. The visitor id is never put in a URL or logged.
// - `visitConfirmed` records that the server has the current role. A returning
//   visitor with a role whose visit was never confirmed (a failed first
//   POST, a migrated legacy persona) retries once on load, silently.
// - Every role change also fires a same-tab `thao:visitor-change` CustomEvent
//   ({ detail: { role } }) so other widgets in this tab update at once.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LEGACY_PERSONA_KEY, VISITOR_STORE_KEY } from "@/lib/visitor-role-adapter";
import { isRoleId, type RoleId } from "./role-ids";

export type VisitorState = {
  v: 1;
  role: RoleId | null;
  collapsed: boolean;
  visitorId: string;
  ordinal: number | null;
  /** the server has this visitor's current role */
  visitConfirmed: boolean;
};

type Ctx = {
  role: RoleId | null;
  setRole: (role: RoleId | null) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  ready: boolean;
  ordinal: number | null;
  /** The change-role modal (not persisted). */
  pickerOpen: boolean;
  setPickerOpen: (open: boolean) => void;
  /** Needed by the poll (POST body only). Never put it in a URL or a log. */
  visitorId: string;
};

const ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;
/** Only these three came from the old "Show me first" control. */
const LEGACY_ROLES: readonly RoleId[] = ["recruiter", "founder", "engineer"];

function parseJSON(raw: string | null): unknown {
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** A fresh visitor id (crypto.randomUUID with a safe fallback). Letters, digits and "-" only. */
export function newVisitorId() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `v${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;
}

/**
 * Pure: turn the two raw stored strings into the initial state.
 * `chosen` is true when the visitor already made a choice (a role), so
 * a returning visitor never triggers a write.
 */
export function initialVisitor(storeRaw: string | null, legacyRaw: string | null, genId: () => string = newVisitorId) {
  const stored = parseJSON(storeRaw);
  if (stored && typeof stored === "object" && (stored as { v?: unknown }).v === 1) {
    const s = stored as Record<string, unknown>;
    const role = isRoleId(s.role) ? s.role : null;
    // A role is the only way to be "chosen": an old Skip (collapsed, no role) just shows the picker again. Any stored guideHidden is ignored.
    const collapsed = s.collapsed === true && role !== null;
    const state: VisitorState = {
      v: 1,
      role,
      collapsed,
      visitorId: typeof s.visitorId === "string" && ID_PATTERN.test(s.visitorId) ? s.visitorId : genId(),
      ordinal: typeof s.ordinal === "number" && Number.isInteger(s.ordinal) && s.ordinal > 0 ? s.ordinal : null,
      visitConfirmed: s.visitConfirmed === true,
    };
    return { state, chosen: role !== null, migrated: false } as const;
  }
  const legacy = parseJSON(legacyRaw);
  const migratedRole = isRoleId(legacy) && LEGACY_ROLES.includes(legacy) ? legacy : null;
  const state: VisitorState = {
    v: 1,
    role: migratedRole,
    collapsed: migratedRole !== null,
    visitorId: genId(),
    ordinal: null,
    visitConfirmed: false,
  };
  return { state, chosen: migratedRole !== null, migrated: migratedRole !== null } as const;
}

/** Pure: should this role be sent to the server? `lastSent` undefined = nothing sent yet. */
export function shouldSendVisit(lastSent: RoleId | null | undefined, next: RoleId | null) {
  return lastSent !== next;
}

/** Pure: seconds to wait after a 429 (Retry-After in seconds), clamped to 1..30, default 3. */
export function retryDelaySeconds(header: string | null) {
  const n = header == null ? NaN : Number(header);
  if (!Number.isFinite(n)) return 3;
  return Math.min(30, Math.max(1, Math.ceil(n)));
}

function writeStore(state: VisitorState) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(VISITOR_STORE_KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota: the UI still works for this visit */
  }
}

const DEFAULT_STATE: VisitorState = { v: 1, role: null, collapsed: false, visitorId: "", ordinal: null, visitConfirmed: false };
const NOOP: Ctx = {
  role: null,
  setRole: () => {},
  collapsed: false,
  setCollapsed: () => {},
  ready: false,
  ordinal: null,
  pickerOpen: false,
  setPickerOpen: () => {},
  visitorId: "",
};

/** Fired just before a role change so the project stack can note where its cards sit (for the glide). */
export const BEFORE_ROLE_EVENT = "visitor:before-role";

const VisitorContext = createContext<Ctx | null>(null);

const DEBOUNCE_MS = 350;

/** Wrap the app once. State lives only in this visitor's localStorage. */
export function VisitorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VisitorState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const stateRef = useRef<VisitorState>(DEFAULT_STATE);
  /** undefined = nothing sent yet; otherwise the last role the server has (null = skip). */
  const lastSent = useRef<RoleId | null | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retry = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);

  const commit = useCallback((next: VisitorState) => {
    stateRef.current = next;
    setState(next);
    writeStore(next);
  }, []);

  /** One POST attempt. Returns the seconds to wait before retrying (a 429), else null. */
  const attempt = useCallback(async () => {
    const role = stateRef.current.role;
    if (!shouldSendVisit(lastSent.current, role) || !stateRef.current.visitorId) return null;
    try {
      const res = await fetch("/api/visit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ visitorId: stateRef.current.visitorId, role }),
      });
      if (!alive.current) return null;
      if (res.status === 429) return retryDelaySeconds(res.headers.get("retry-after"));
      if (!res.ok) return null; // 403 / 413 / 503 and the rest: silent, UI unchanged
      const body = (await res.json()) as { ordinal?: unknown };
      lastSent.current = role;
      if (stateRef.current.role === role && !stateRef.current.visitConfirmed) commit({ ...stateRef.current, visitConfirmed: true });
      if (typeof body.ordinal === "number" && Number.isInteger(body.ordinal) && body.ordinal > 0 && body.ordinal !== stateRef.current.ordinal) {
        commit({ ...stateRef.current, ordinal: body.ordinal });
      }
    } catch {
      /* offline or blocked: silent */
    }
    return null;
  }, [commit]);

  const send = useCallback(async () => {
    const wait = await attempt();
    if (wait === null || !alive.current) return;
    // One retry after Retry-After; a second 429 is dropped silently.
    retry.current = setTimeout(() => void attempt(), wait * 1000);
  }, [attempt]);

  useEffect(() => {
    alive.current = true;
    // Deferred one tick: hydrate from localStorage after the server-matching first paint.
    queueMicrotask(() => {
      if (!alive.current) return;
      let storeRaw: string | null = null;
      let legacyRaw: string | null = null;
      try {
        storeRaw = window.localStorage.getItem(VISITOR_STORE_KEY);
        legacyRaw = window.localStorage.getItem(LEGACY_PERSONA_KEY);
      } catch {
        /* private mode */
      }
      const init = initialVisitor(storeRaw, legacyRaw);
      stateRef.current = init.state;
      setState(init.state);
      // Chosen but never confirmed with the server (failed first POST, migrated persona): send once more.
      const unconfirmed = init.chosen && !init.state.visitConfirmed;
      lastSent.current = init.chosen && !unconfirmed ? init.state.role : undefined;
      if (init.migrated) writeStore(init.state);
      setReady(true);
      if (unconfirmed) void send();
    });
    return () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
      if (retry.current) clearTimeout(retry.current);
    };
  }, [send]);

  const setRole = useCallback(
    (role: RoleId | null) => {
      window.dispatchEvent(new Event(BEFORE_ROLE_EVENT));
      const changed = stateRef.current.role !== role;
      commit({ ...stateRef.current, role, collapsed: true, visitConfirmed: changed ? false : stateRef.current.visitConfirmed });
      if (changed) window.dispatchEvent(new CustomEvent("thao:visitor-change", { detail: { role } }));
      if (!shouldSendVisit(lastSent.current, role)) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void send(), DEBOUNCE_MS);
    },
    [commit, send],
  );
  const setCollapsed = useCallback((collapsed: boolean) => commit({ ...stateRef.current, collapsed }), [commit]);

  const value = useMemo<Ctx>(
    () => ({
      role: state.role,
      setRole,
      collapsed: state.collapsed,
      setCollapsed,
      ready,
      ordinal: state.ordinal,
      pickerOpen,
      setPickerOpen,
      visitorId: state.visitorId,
    }),
    [state, ready, pickerOpen, setRole, setCollapsed],
  );
  return <VisitorContext.Provider value={value}>{children}</VisitorContext.Provider>;
}

/** Safe outside a provider (returns a no-op), so any section can call it. */
export function useVisitor() {
  return useContext(VisitorContext) ?? NOOP;
}
