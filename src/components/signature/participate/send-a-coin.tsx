"use client";
import { useRef, useState } from "react";
import { isInside } from "./logic";
import { useReducedMotion, usePassport } from "./store";
import { SettleCoin, card, eyebrow, useDrag } from "./fx";

type Stage = "idle" | "pending" | "settled";

/** Drag "Settle" the coin into the wallet → pending → settled → contact options. */
export function SendACoin({ email, linkedin }: { email: string; linkedin: string }) {
  const [stage, setStage] = useState<Stage>("idle");
  const wallet = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { collect } = usePassport();
  const send = () => {
    if (stage !== "idle") return;
    collect("coin");
    if (reduced) return setStage("settled");
    setStage("pending");
    window.setTimeout(() => setStage("settled"), 1100);
  };
  const { off, dragging, handlers } = useDrag((p) => {
    const r = wallet.current?.getBoundingClientRect();
    if (r && isInside(p, r)) send();
  });

  return (
    <section className={card} aria-labelledby="sac-title">
      <p className={eyebrow}>Say hello</p>
      <h2 id="sac-title" className="mt-2 text-2xl font-semibold text-ink-1 sm:text-3xl">Send Thao a coin</h2>
      <p className="mt-1 text-ink-3">Drag Settle into the wallet to open a channel. No money moves, promise.</p>
      <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-canvas p-5 sm:p-8">
        <div className="relative h-16 w-16">
          {stage === "idle" && (
            <button type="button" {...handlers} onClick={() => { if (!dragging) send(); }} aria-label="Send the coin to Thao's wallet"
              style={{ transform: `translate(${off.x}px, ${off.y}px) rotate(${off.x / 6}deg)`, touchAction: "none" }}
              className={`cursor-grab rounded-full active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${dragging ? "" : "transition-transform duration-300 ease-[var(--ease-out)] animate-bounce [animation-duration:2s] motion-reduce:animate-none"}`}>
              <SettleCoin size={64} />
            </button>
          )}
        </div>
        <div aria-hidden className="h-px min-w-0 flex-1 border-t-2 border-dashed border-border-strong/60" />
        <div ref={wallet} className={`relative grid h-24 w-28 shrink-0 place-items-center sm:w-32 rounded-2xl text-white transition-colors duration-500 ${stage === "settled" ? "bg-success" : "bg-[#0a1f44]"}`}>
          <div aria-hidden className="absolute -top-2 left-3 right-3 h-4 rounded-t-lg bg-accent" />
          <span className="relative text-sm font-semibold">{stage === "settled" ? "✓ Settled" : stage === "pending" ? "Pending…" : "Thao's wallet"}</span>
          {stage !== "idle" && <span className="absolute -right-1 -top-4 animate-in zoom-in fade-in duration-300 motion-reduce:animate-none"><SettleCoin size={34} happy /></span>}
        </div>
      </div>
      <div aria-live="polite" className="mt-4 min-h-[2.75rem]">
        {stage === "pending" && <p className="text-sm text-ink-3"><span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" /> Routing through the rails…</p>}
        {stage === "settled" && (
          <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-500 motion-reduce:animate-none">
            <span className="text-sm text-ink-2">Payment settled. Now pick a channel:</span>
            <a href={`mailto:${email}`} className="rounded-full bg-ink-1 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-hover">Email</a>
            <a href={linkedin} target="_blank" rel="noreferrer" className="rounded-full border border-hairline px-4 py-2 text-sm font-semibold text-ink-1 hover:border-border-strong">LinkedIn</a>
            <button type="button" onClick={() => setStage("idle")} className="text-sm text-ink-3 underline underline-offset-4">Send another</button>
          </div>
        )}
      </div>
    </section>
  );
}
