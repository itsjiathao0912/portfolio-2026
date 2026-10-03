"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GlobeStatic } from "@/components/signature/globe/globe-static";
import { ARCS, placeById } from "@/components/signature/globe/routes";
import { useCapabilities, useReducedMotion } from "@/components/signature/globe/use-globe-env";
import { LiftCard } from "@/components/ui/lift-card";
import { cn } from "@/lib/utils";

const GlobeCanvas = dynamic(() => import("@/components/signature/globe/globe-canvas"), { ssr: false });

/** True only while the element is within one viewport of the screen, so the canvas is destroyed once scrolled away. */
function useNearScreen(ref: React.RefObject<Element | null>) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: `${window.innerHeight}px 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return near;
}

/** "Where I've shipped": a light globe card, labels live only in the corridor list. The only canvas on the page. */
export function GlobeCard() {
  const wrap = useRef<HTMLDivElement>(null);
  const near = useNearScreen(wrap);
  const reduced = useReducedMotion();
  const { canvas2d } = useCapabilities();
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = ARCS.find((a) => a.id === activeId) ?? null;
  const focusLon = active ? placeById(active.to).lon : null;
  const live = near && !reduced && canvas2d;

  return (
    <section aria-labelledby="globe-title" data-testid="globe-card" className="rounded-[24px] bg-bg p-6 shadow-1 md:p-10">
      <div className="grid items-center gap-8 md:grid-cols-[minmax(0,420px)_1fr] md:gap-12">
        <div ref={wrap} className="relative mx-auto aspect-square w-full max-w-[300px] md:max-w-[420px]" role="img" aria-label="Globe showing the corridors listed beside it" data-testid="globe-stage">
          {live ? <GlobeCanvas tone="light" activeId={activeId} focusLon={focusLon} onHover={() => {}} onSelect={() => {}} startLon={100} /> : <GlobeStatic tone="light" activeId={activeId} />}
        </div>
        <div>
          <p className="label-mono text-accent">Where I&apos;ve shipped</p>
          <h3 id="globe-title" className="mt-2 text-[28px] leading-[1.1] md:text-[36px]">Money corridors I built for</h3>
          <ul className="mt-6 flex flex-col gap-2" aria-label="Corridors">
            {ARCS.map((a) => (
              <li key={a.id}>
                <LiftCard variant="row" radius="rounded-xl">
                  <Link
                    href={a.href}
                    data-testid="globe-row"
                    onPointerEnter={() => setActiveId(a.id)}
                    onPointerLeave={() => setActiveId(null)}
                    onFocus={() => setActiveId(a.id)}
                    onBlur={() => setActiveId(null)}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-xl px-4 py-2 text-[15px] outline-none transition-colors duration-[120ms] focus-visible:ring-2 focus-visible:ring-accent",
                      activeId === a.id ? "bg-accent-tint" : "hover:bg-accent-tint"
                    )}
                  >
                    <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-accent" />
                    <span className="font-medium text-ink-1">{placeById(a.from).name} → {placeById(a.to).name}</span>
                    <span className="text-ink-3">· {a.title}</span>
                  </Link>
                </LiftCard>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
