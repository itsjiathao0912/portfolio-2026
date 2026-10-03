"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

export { useReducedMotion } from "@/lib/use-reduced-motion";

const noop = () => () => {};
let webgl: boolean | null = null;
let canvas2d: boolean | null = null;

function probe(kind: "webgl" | "2d") {
  try {
    const c = document.createElement("canvas");
    return kind === "2d" ? !!c.getContext("2d") : !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function supportsWebGL() {
  return (webgl ??= probe("webgl"));
}

/** Client capability flags; false during SSR so the static fallback renders first. */
export function useCapabilities() {
  const gl = useSyncExternalStore(noop, supportsWebGL, () => false);
  const c2d = useSyncExternalStore(noop, () => (canvas2d ??= probe("2d")), () => false);
  return { webgl: gl, canvas2d: c2d } as const;
}

/** Becomes true once the element is near the viewport, and stays true. */
export function useNearViewport(ref: RefObject<Element | null>, rootMargin = "200px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setNear(true); }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, near]);
  return near;
}
