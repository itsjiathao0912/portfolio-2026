"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useRef } from "react";

type ViewTransition = { finished: Promise<void>; ready: Promise<void>; updateCallbackDone: Promise<void> };
type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => Promise<void>) => ViewTransition };

/** The most the transition may hold the page waiting for the new route. */
export const ROUTE_WAIT_CAP_MS = 300;

/**
 * Resolve once the new route's hero is in the DOM, or after the cap.
 * Uses setTimeout, never requestAnimationFrame: the browser suppresses
 * rendering (and so rAF) until the transition's update callback settles, so an
 * rAF poll here deadlocks until the browser's own 4 s timeout aborts it.
 */
export function waitForRoute(path: string, cap = ROUTE_WAIT_CAP_MS) {
  return new Promise<void>((resolve) => {
    const start = performance.now();
    const tick = () => {
      const arrived = window.location.pathname === path && document.querySelector('[data-testid="case-hero"]');
      if (arrived || performance.now() - start >= cap) resolve();
      else setTimeout(tick, 16);
    };
    tick();
  });
}

/**
 * Link that morphs a named element (the card's visual) into the destination's
 * matching element using the View Transitions API. Unsupported browsers
 * (Firefox) and reduced motion: a normal navigation with the template fade.
 */
export function TransitionLink({
  href,
  morphSelector,
  children,
  className,
  ...rest
}: {
  href: string;
  /** CSS selector (inside the closest [data-morph-root]) of the element that morphs. */
  morphSelector: string;
  children: React.ReactNode;
  className?: string;
  "data-testid"?: string;
  "data-slug"?: string;
  "data-category"?: string;
  "data-tone"?: string;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);

  function onClick(event: React.MouseEvent<HTMLAnchorElement>) {
    const doc = document as ViewTransitionDoc;
    if (reduce || !doc.startViewTransition || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const el = ref.current?.closest("[data-morph-root]")?.querySelector<HTMLElement>(morphSelector);
    if (!el) return;
    event.preventDefault();
    el.style.viewTransitionName = "project-visual";
    const vt = doc.startViewTransition(async () => {
      el.style.viewTransitionName = "";
      router.push(href);
      await waitForRoute(href);
    });
    // A skipped or aborted transition rejects all three promises; none of it is an error for the visitor.
    vt.ready.catch(() => undefined);
    vt.updateCallbackDone.catch(() => undefined);
    vt.finished.catch(() => undefined);
  }

  return (
    <Link
      ref={ref}
      href={href}
      onClick={onClick}
      className={className}
      data-testid={rest["data-testid"]}
      data-slug={rest["data-slug"]}
      data-category={rest["data-category"]}
      data-tone={rest["data-tone"]}
    >
      {children}
    </Link>
  );
}
