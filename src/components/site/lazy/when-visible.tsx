"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { NEAR_MARGIN } from "./defer-style";

/**
 * Mounts children only once the slot is within ~600px of the viewport (idle-callback fallback when
 * IntersectionObserver is missing). Use only for content that renders nothing visible until it loads,
 * so the placeholder is visually identical.
 */
export function WhenVisible({ children, placeholderClassName = "min-h-px" }: { children: ReactNode; placeholderClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (show) return;
    if (typeof IntersectionObserver === "undefined") {
      const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
      const id = ric ? ric(() => setShow(true)) : window.setTimeout(() => setShow(true), 1);
      return () => (ric ? (window as unknown as { cancelIdleCallback?: (n: number) => void }).cancelIdleCallback?.(id) : clearTimeout(id));
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && setShow(true), { rootMargin: NEAR_MARGIN });
    io.observe(el);
    return () => io.disconnect();
  }, [show]);
  return show ? <>{children}</> : <div ref={ref} aria-hidden="true" className={placeholderClassName} />;
}
