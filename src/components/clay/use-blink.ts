"use client";

import { useEffect, useState } from "react";

/** Random calm blink: closed for ~120 ms every 2.4 to 5.6 s. No-op under reduced motion. */
export function useBlink(enabled = true) {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let t: ReturnType<typeof setTimeout>;
    const open = () => {
      t = setTimeout(() => {
        setClosed(true);
        t = setTimeout(() => {
          setClosed(false);
          open();
        }, 120);
      }, 2400 + Math.random() * 3200);
    };
    open();
    return () => clearTimeout(t);
  }, [enabled]);
  return closed;
}
