"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Character } from "@/components/signature/characters/character";
import { CAST, CHARACTER_NAMES, EXPRESSIONS, POSES, type Expression, type Pose } from "@/components/signature/characters/logic";

// Heavier pieces load only on the client, after first paint.
const CommunityCursors = dynamic(() => import("@/components/signature/characters/community-cursors").then((m) => m.CommunityCursors), { ssr: false });
const WomenInTechWall = dynamic(() => import("@/components/signature/characters/women-in-tech-wall").then((m) => m.WomenInTechWall), {
  ssr: false,
  loading: () => <div className="h-[248px]" />,
});

export function CharacterLab() {
  const [pose, setPose] = useState<Pose>("idle");
  const [expr, setExpr] = useState<Expression>("happy");
  return (
    <main className="mx-auto max-w-6xl px-4 pt-32 pb-24 md:px-8">
      <p className="label-mono text-accent">Lab · characters</p>
      <h1 className="mt-2 text-4xl md:text-6xl">Meet the cast</h1>
      <p className="mt-3 max-w-2xl text-ink-2">Original characters drawn in code. They blink, follow your cursor (or your last tap), hop when they scroll in, and wave when you press them.</p>

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Pose">
        {POSES.map((p) => (
          <button key={p} type="button" aria-pressed={pose === p} onClick={() => setPose(p)} className={`rounded-full border px-3 py-1 text-sm ${pose === p ? "border-ink-1 bg-ink-1 text-bg" : "border-hairline"}`}>{p}</button>
        ))}
        <span className="mx-2 w-px bg-hairline" />
        {EXPRESSIONS.map((e) => (
          <button key={e} type="button" aria-pressed={expr === e} onClick={() => setExpr(e)} className={`rounded-full border px-3 py-1 text-sm ${expr === e ? "border-accent bg-accent text-white" : "border-hairline"}`}>{e}</button>
        ))}
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
        {CHARACTER_NAMES.map((n) => (
          <li key={n} className="flex flex-col items-center gap-2 rounded-[var(--radius)] border border-hairline bg-canvas p-4">
            <Character name={n} pose={pose} expression={expr} interactive size={96} />
            <p className="text-sm font-medium text-ink-1">{CAST[n].label}</p>
            <p className="text-xs text-ink-3">{CAST[n].role}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-20 text-3xl">Community cursors</h2>
      <p className="mt-2 text-ink-2">Friendly fake cursors (desktop only, off with reduced motion).</p>
      <div className="relative mt-6 h-[360px] overflow-hidden rounded-[var(--radius)] border border-hairline bg-[var(--tint-sky)]">
        <div className="grid h-full place-items-center p-8 text-center text-ink-2">A section where builders hang out.</div>
        <CommunityCursors count={4} />
      </div>

      <h2 className="mt-20 text-3xl">Community wall</h2>
      <p className="mt-2 mb-6 text-ink-2">Hover, tap or press Enter to flip a tile.</p>
      <WomenInTechWall />
    </main>
  );
}
