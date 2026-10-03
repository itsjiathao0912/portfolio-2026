"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { GlobeStatic } from "./globe-static";
import { ARCS, PLACES, placeById, projectsAt } from "./routes";
import { useCapabilities, useNearViewport, useReducedMotion } from "./use-globe-env";

const GlobeCanvas = dynamic(() => import("./globe-canvas"), { ssr: false });

export type SettlementGlobeProps = {
  /** Section heading shown above the globe. */
  title?: string;
  /** Short intro line. */
  intro?: string;
  /** Longitude the globe faces first. Default 100 (South-East Asia). */
  startLon?: number;
  className?: string;
};

type Tip = { id: string; x: number; y: number; pinned: boolean };

export function SettlementGlobe({
  title = "Where the money moves",
  intro = "Each arc is a corridor one of my projects was built for. Drag to spin, hover or tap an arc.",
  startLon = 100,
  className = "",
}: SettlementGlobeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const near = useNearViewport(wrapRef);
  const reduced = useReducedMotion();
  const { canvas2d: canvasOk } = useCapabilities();
  const [tip, setTip] = useState<Tip | null>(null);

  const onHover = useCallback((id: string | null, x: number, y: number) => {
    setTip((t) => (t?.pinned ? t : id ? { id, x, y, pinned: false } : null));
  }, []);
  const onSelect = useCallback((id: string, x: number, y: number) => setTip({ id, x, y, pinned: true }), []);

  useEffect(() => {
    if (!tip?.pinned) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setTip(null); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [tip?.pinned]);

  const live = near && !reduced && canvasOk;
  const active = tip ? ARCS.find((a) => a.id === tip.id) ?? null : null;

  return (
    <section className={`relative overflow-hidden rounded-[24px] bg-[#050d2b] px-4 py-10 text-white sm:px-10 ${className}`}>
      <div className="mx-auto max-w-5xl">
        <h2 style={{ color: "#fff" }} className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-xl text-sm text-blue-100/80 sm:text-base">{intro}</p>

        <div className="mt-6 grid items-center gap-6 lg:grid-cols-[1fr_280px]">
          <div ref={wrapRef} className="relative mx-auto aspect-square w-full max-w-[560px]" role="img" aria-label={`Globe with corridors: ${ARCS.map((a) => `${placeById(a.from).name} to ${placeById(a.to).name} (${a.title})`).join("; ")}`}>
            {live ? <GlobeCanvas activeId={tip?.id ?? null} onHover={onHover} onSelect={onSelect} startLon={startLon} /> : <GlobeStatic activeId={tip?.id ?? null} />}
            {active && tip && (
              <div
                className="pointer-events-auto absolute z-10 w-60 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm shadow-xl backdrop-blur-md"
                style={{ left: Math.min(Math.max(8, tip.x + 12), 9999), top: tip.y + 12, maxWidth: "calc(100% - 16px)" }}
                role="dialog"
                aria-label={active.title}
              >
                <TipCard id={active.id} />
                {tip.pinned && (
                  <button type="button" onClick={() => setTip(null)} className="mt-2 text-xs text-blue-100/70 underline">Close</button>
                )}
              </div>
            )}
          </div>

          <ul className="flex flex-wrap gap-2 lg:flex-col" aria-label="Corridors">
            {ARCS.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  aria-pressed={tip?.id === a.id}
                  onClick={() => setTip((t) => (t?.id === a.id && t.pinned ? null : { id: a.id, x: 24, y: 24, pinned: true }))}
                  onFocus={() => setTip((t) => (t?.pinned ? t : { id: a.id, x: 24, y: 24, pinned: false }))}
                  onBlur={() => setTip((t) => (t?.pinned ? t : null))}
                  className="flex w-full items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-left text-sm hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white aria-pressed:bg-white/15"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: a.color }} />
                  <span>{placeById(a.from).name} → {placeById(a.to).name}</span>
                  <span className="text-blue-100/60">· {a.title}</span>
                </button>
              </li>
            ))}
            <li className="pt-2 text-xs text-blue-100/60">
              Home base: {PLACES[0].name} · {projectsAt(PLACES[0].id).join(", ")}
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function TipCard({ id }: { id: string }) {
  const a = ARCS.find((x) => x.id === id);
  if (!a) return null;
  return (
    <>
      <p className="text-xs uppercase tracking-wide text-blue-100/70">{placeById(a.from).name} → {placeById(a.to).name}</p>
      <p className="mt-1 font-semibold" style={{ color: a.color }}>{a.title}</p>
      {a.stat && <p className="mt-1"><span className="font-semibold">{a.stat.value}</span> <span className="text-blue-100/80">{a.stat.label}</span></p>}
      <Link href={a.href} className="mt-2 inline-block font-medium underline underline-offset-2">Read the case study →</Link>
    </>
  );
}
