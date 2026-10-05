"use client";

// If a client-side navigation has not arrived after a few seconds (e.g. the
// RSC request was killed at the edge), fall back to a full page load so a nav
// click never leaves the site frozen. Logic: src/lib/nav-watchdog.ts.
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { guardedTarget, NAV_WATCHDOG_MS, navStalled } from "@/lib/nav-watchdog";

export function NavWatchdog() {
  const pathname = usePathname();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Any completed navigation (incl. back/forward) disarms the watchdog.
  useEffect(() => clearTimeout(timer.current), [pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      const target = guardedTarget(
        e,
        a ? { href: a.href, target: a.target, hasDownload: a.hasAttribute("download") } : null,
        window.location.href,
      );
      if (!target) return;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (navStalled(target, window.location.href)) window.location.assign(target);
      }, NAV_WATCHDOG_MS);
    };
    // Capture phase, passive: runs alongside next/link, never changes its behaviour.
    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      clearTimeout(timer.current);
    };
  }, []);
  return null;
}
