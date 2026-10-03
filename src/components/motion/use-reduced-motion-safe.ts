"use client";

// SSR-safe reduced-motion hook: false on the server AND on the first client render,
// then the real preference after mount (useSyncExternalStore server snapshot).
// motion/react's own useReducedMotion returns the real value on the first client
// render, which is the root cause of hydration mismatches. Use this one everywhere.
export { useReducedMotion, useReducedMotion as useReducedMotionSafe } from "@/lib/use-reduced-motion";
