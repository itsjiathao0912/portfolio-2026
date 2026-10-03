"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void) {
  const m = window.matchMedia(QUERY);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}

/**
 * Hydration-safe reduced-motion read. motion/react's `useReducedMotion` returns the
 * real preference on the first client render, which differs from the server
 * (always false) and causes hydration mismatches for components that branch
 * their markup on it. This hook renders the server value during hydration and
 * then switches to the real preference.
 */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
