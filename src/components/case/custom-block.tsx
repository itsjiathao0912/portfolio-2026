"use client";

import { Component, lazy, Suspense, type ReactNode } from "react";
import { resolveCustomBlock } from "./registry";
import type { CaseBlockComponent } from "./types";

const DEV = process.env.NODE_ENV !== "production";

function Nothing() {
  return null;
}

const lazyCache = new Map<string, ReturnType<typeof lazy<CaseBlockComponent>>>();

function lazyFor(key: string) {
  let entry = lazyCache.get(key);
  if (!entry) {
    entry = lazy(async () => {
      const found = await resolveCustomBlock(key);
      if (!found && DEV) console.warn(`[case] unknown custom block "${key}"`);
      return { default: found ?? (Nothing as CaseBlockComponent) };
    });
    lazyCache.set(key, entry);
  }
  return entry;
}

class Boundary extends Component<{ id: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    if (DEV) console.warn(`[case] custom block "${this.props.id}" crashed`, error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Renders a `custom` content block: lazy-loaded, skeleton while loading, nothing on failure. */
export function CustomBlock({ component, props, source }: { component: string; props?: Record<string, unknown>; source?: string }) {
  const Loaded = lazyFor(component);
  return (
    <Boundary id={component}>
      <Suspense fallback={<div className="my-6 h-64 animate-pulse rounded-[20px] bg-ink-1/5" data-testid="custom-block-skeleton" aria-hidden />}>
        <div data-testid="custom-block" data-component={component}>
          {/* eslint-disable-next-line react-hooks/static-components -- lazyFor caches one component per key (module-level Map), so identity is stable across renders */}
          <Loaded {...(props ?? {})} source={source} />
        </div>
      </Suspense>
    </Boundary>
  );
}
