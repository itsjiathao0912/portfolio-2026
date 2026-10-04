// One place that answers "what role did this visitor pick?". It reads the new
// visitor store (thao:visitor:v1) first and falls back to the older persona key
// (thao:participate:persona), so callers do not care which store is live.
// Never throws: private mode, bad JSON or an unknown value all give null.

import { ROLE_IDS, isRoleId, type RoleId } from "@/components/site/visitor/role-ids";

export const VISITOR_STORE_KEY = "thao:visitor:v1";
export const LEGACY_PERSONA_KEY = "thao:participate:persona";

function parse(raw: string | null): unknown {
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Pure: pick a role out of the two raw stored strings. New store wins. */
export function parseVisitorRole(visitorRaw: string | null, personaRaw: string | null): RoleId | null {
  const store = parse(visitorRaw);
  if (store && typeof store === "object" && "role" in store) {
    const role = (store as { role?: unknown }).role;
    if (isRoleId(role)) return role;
  }
  const legacy = parse(personaRaw);
  return isRoleId(legacy) ? legacy : null;
}

/** Reads the current visitor's role from localStorage (client only; null on the server). */
export function getVisitorRole(): RoleId | null {
  try {
    if (typeof window === "undefined") return null;
    return parseVisitorRole(
      window.localStorage.getItem(VISITOR_STORE_KEY),
      window.localStorage.getItem(LEGACY_PERSONA_KEY),
    );
  } catch {
    return null;
  }
}

/** Same-tab change signal. The `storage` event only fires in OTHER tabs, so the visitor store should dispatch this. */
export const VISITOR_CHANGE_EVENT = "thao:visitor-change";

/**
 * Calls `onChange` whenever the visitor's role may have changed: another tab
 * (storage), the same tab (VISITOR_CHANGE_EVENT), or the tab regaining
 * focus/visibility (fallback until the store dispatches). Returns unsubscribe.
 */
export function subscribeVisitorRole(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (e: StorageEvent) => {
    if (isRoleStorageKey(e.key)) onChange();
  };
  const onVisible = () => {
    if (document.visibilityState === "visible") onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(VISITOR_CHANGE_EVENT, onChange);
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(VISITOR_CHANGE_EVENT, onChange);
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onVisible);
  };
}

/** True when a storage event touches either key the adapter reads. */
export function isRoleStorageKey(key: string | null) {
  return key === null || key === VISITOR_STORE_KEY || key === LEGACY_PERSONA_KEY;
}

export { ROLE_IDS };
export type { RoleId };
