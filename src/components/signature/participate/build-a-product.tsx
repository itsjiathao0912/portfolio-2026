"use client";
import { useRef, useState } from "react";
import { BLOCKS, BLOCK_META, canLaunch, isInside, matchBuild, toggleBlock, type BlockId } from "./logic";
import { useReducedMotion, usePassport } from "./store";
import { Confetti, card, eyebrow, useDrag } from "./fx";

function Block({ id, onDrop, onToggle, placed }: { id: BlockId; onDrop: (p: { x: number; y: number }) => void; onToggle: () => void; placed: boolean }) {
  const { off, dragging, handlers } = useDrag(onDrop);
  const m = BLOCK_META[id];
  return (
    <button
      type="button"
      {...handlers}
      onClick={() => { if (!dragging) onToggle(); }}
      aria-pressed={placed}
      aria-label={`${m.label}: ${placed ? "remove from" : "add to"} the phone`}
      style={{ transform: `translate(${off.x}px, ${off.y}px) ${dragging ? "scale(1.06) rotate(-3deg)" : ""}`, touchAction: "none", zIndex: dragging ? 20 : undefined }}
      className={`relative flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold select-none cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${dragging ? "" : "transition-[transform,opacity] duration-300 ease-[var(--ease-out)]"} ${placed ? "opacity-40" : "bg-bg shadow-[var(--shadow-card)]"}`}
    >
      <span aria-hidden className="grid h-6 w-6 place-items-center rounded-md text-xs text-white" style={{ background: m.color }}>{m.glyph}</span>
      <span style={{ color: m.color }}>{m.label}</span>
    </button>
  );
}

/** Drag building blocks into a phone; launch reveals which of Thao's builds used similar blocks. */
export function BuildAProduct() {
  const [blocks, setBlocks] = useState<BlockId[]>([]);
  const [launched, setLaunched] = useState(0);
  const phone = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { collect } = usePassport();
  const match = launched ? matchBuild(blocks) : null;

  const add = (id: BlockId) => (p: { x: number; y: number }) => {
    const r = phone.current?.getBoundingClientRect();
    if (r && isInside(p, r) && !blocks.includes(id)) { setBlocks([...blocks, id]); setLaunched(0); }
  };
  const launch = () => { setLaunched((n) => n + 1); collect("builder"); };

  return (
    <section className={card} aria-labelledby="bap-title">
      <Confetti fire={launched} reduced={reduced} />
      <p className={eyebrow}>Build a product</p>
      <h2 id="bap-title" className="mt-2 text-2xl font-semibold text-ink-1 sm:text-3xl">Assemble a fintech app</h2>
      <p className="mt-1 text-ink-3">Drag blocks into the phone (or tap them), then launch.</p>
      <div className="mt-6 grid items-center gap-6 sm:grid-cols-[1fr_auto]">
        <div className="flex flex-wrap gap-2.5">
          {BLOCKS.map((id) => (
            <Block key={id} id={id} placed={blocks.includes(id)} onDrop={add(id)} onToggle={() => { setBlocks(toggleBlock(blocks, id)); setLaunched(0); }} />
          ))}
        </div>
        <div ref={phone} className="mx-auto w-[200px] rounded-[34px] border-[6px] border-[#0a1f44] bg-canvas p-3 shadow-[var(--shadow-card-hover)]" aria-label="Phone">
          <div className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-[#0a1f44]/80" />
          <div className={`flex h-[250px] flex-col gap-1.5 rounded-2xl p-2 ${launched ? "bg-gradient-to-b from-accent-tint to-bg" : "border-2 border-dashed border-border-strong/60"}`}>
            {blocks.length === 0 && <p className="m-auto px-2 text-center text-xs text-ink-3">Drop blocks here</p>}
            {blocks.map((id) => (
              <div key={id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-white animate-in zoom-in-90 fade-in duration-300 motion-reduce:animate-none" style={{ background: BLOCK_META[id].color }}>
                <span aria-hidden>{BLOCK_META[id].glyph}</span>{BLOCK_META[id].label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={launch} disabled={!canLaunch(blocks)} className="rounded-full bg-ink-1 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          🚀 Launch
        </button>
        {blocks.length > 0 && <button type="button" onClick={() => { setBlocks([]); setLaunched(0); }} className="text-sm text-ink-3 underline underline-offset-4 hover:text-ink-1">Reset</button>}
        {!canLaunch(blocks) && <span className="text-sm text-ink-3">Add at least 2 blocks.</span>}
      </div>
      <p aria-live="polite" className="mt-4 min-h-[3rem] text-ink-2">
        {match && (
          <>You&apos;ve built something close to <a href={`/work/${match.slug}`} className="font-semibold text-accent underline underline-offset-4">{match.project}</a> — {match.why}.</>
        )}
      </p>
    </section>
  );
}
