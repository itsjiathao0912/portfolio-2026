"use client";

import { useSyncExternalStore } from "react";
import { canUse3D } from "./math";

const RM = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(RM).matches,
    () => false,
  );
}

let webgl2: boolean | null = null;
function hasWebGL2() {
  if (webgl2 === null) {
    try {
      webgl2 = !!document.createElement("canvas").getContext("webgl2");
    } catch {
      webgl2 = false;
    }
  }
  return webgl2;
}

function snapshot() {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  return canUse3D({
    reducedMotion: window.matchMedia(RM).matches,
    saveData: nav.connection?.saveData,
    webgl: hasWebGL2(),
    deviceMemory: nav.deviceMemory,
  });
}

/** True when real 3D is allowed. Server and first paint: false (static fallback). */
export function useCan3D() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

function subscribeVis(cb: () => void) {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
}

export function useTabVisible() {
  return useSyncExternalStore(
    subscribeVis,
    () => document.visibilityState === "visible",
    () => true,
  );
}
