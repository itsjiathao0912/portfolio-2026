"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useCan3D, useTabVisible } from "./use-env";

/**
 * Fixed-size box that shows `fallback` until the box nears the viewport, then (if 3D is
 * allowed) mounts `children(active)`. `active` is false while offscreen or the tab is hidden,
 * so scenes can stop their render loop. No layout shift: the box owns its size.
 */
export function LazyStage({
  fallback,
  children,
  className,
  style,
  label,
}: {
  fallback: ReactNode;
  children: (active: boolean) => ReactNode;
  className?: string;
  style?: React.CSSProperties;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const allowed = useCan3D();
  const tabVisible = useTabVisible();
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const show3D = allowed && near;
  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      className={className}
      style={{ position: "relative", ...style }}
    >
      {show3D ? children(visible && tabVisible) : fallback}
    </div>
  );
}
