"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useRef } from "react";

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => Promise<void>) => { finished: Promise<void> } };

/** Resolve once the new route's hero is in the DOM (or after a timeout). */
function waitForRoute(path: string, timeout = 2000) {
  return new Promise<void>((resolve) => {
    const start = performance.now();
    const tick = () => {
      const arrived = window.location.pathname === path && document.querySelector('[data-testid="case-hero"]');
      if (arrived || performance.now() - start > timeout) resolve();
      else requestAnimationFrame(tick);
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
    vt.finished.catch(() => undefined);
  }

  return (
    <Link ref={ref} href={href} onClick={onClick} className={className} data-testid={rest["data-testid"]}>
      {children}
    </Link>
  );
}
