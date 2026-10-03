"use client";
import { useEffect, useRef, useState, type PointerEvent as RPE } from "react";

const COLORS = ["#2563eb", "#7c3aed", "#db2777", "#059669", "#ea580c", "#facc15", "#0a1f44"];

/** One-shot canvas confetti over its parent. Renders nothing when `fire` is 0 or motion is reduced. */
export function Confetti({ fire, reduced }: { fire: number; reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!fire || reduced || !c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.offsetWidth, h = c.offsetHeight;
    c.width = w * dpr; c.height = h * dpr;
    ctx.scale(dpr, dpr);
    const parts = Array.from({ length: 90 }, () => ({
      x: w / 2, y: h * 0.55, vx: (Math.random() - 0.5) * 9, vy: -Math.random() * 10 - 3,
      r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3, s: 4 + Math.random() * 5,
      c: COLORS[(Math.random() * COLORS.length) | 0], round: Math.random() < 0.3,
    }));
    let raf = 0, t = 0;
    const tick = () => {
      t++;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.vy += 0.28; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
        ctx.globalAlpha = Math.max(0, 1 - t / 110);
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, 7); ctx.fill(); } else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      }
      if (t < 110) raf = requestAnimationFrame(tick); else ctx.clearRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fire, reduced]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}

/**
 * Minimal pointer drag (mouse + touch + pen). Returns handlers for the draggable
 * and the current offset. `onDrop` gets the release point in client coords.
 */
export function useDrag(onDrop: (p: { x: number; y: number }) => void) {
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const handlers = {
    onPointerDown: (e: RPE<HTMLElement>) => {
      if (e.button !== 0) return;
      start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: RPE<HTMLElement>) => {
      const s = start.current;
      if (!s || s.id !== e.pointerId) return;
      const dx = e.clientX - s.x, dy = e.clientY - s.y;
      if (!dragging && Math.hypot(dx, dy) < 4) return;
      setDragging(true);
      setOff({ x: dx, y: dy });
    },
    onPointerUp: (e: RPE<HTMLElement>) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      if (dragging) onDrop({ x: e.clientX, y: e.clientY });
      setDragging(false);
      setOff({ x: 0, y: 0 });
    },
    onPointerCancel: () => { start.current = null; setDragging(false); setOff({ x: 0, y: 0 }); },
  };
  return { off, dragging, handlers };
}

/** "Settle" — an original coin character drawn in SVG. */
export function SettleCoin({ size = 56, happy = false }: { size?: number; happy?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="34" r="27" fill="#b45309" />
      <circle cx="32" cy="31" r="27" fill="#facc15" />
      <circle cx="32" cy="31" r="21" fill="none" stroke="#f59e0b" strokeWidth="3" />
      <ellipse cx="24" cy="29" rx="2.6" ry={happy ? 1.2 : 3.2} fill="#0a1f44" />
      <ellipse cx="40" cy="29" rx="2.6" ry={happy ? 1.2 : 3.2} fill="#0a1f44" />
      <path d={happy ? "M24 37 Q32 45 40 37" : "M26 38 Q32 42 38 38"} stroke="#0a1f44" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="19" cy="36" r="3" fill="#fb7185" opacity=".55" />
      <circle cx="45" cy="36" r="3" fill="#fb7185" opacity=".55" />
      <path d="M17 18 Q22 12 30 12" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

export const card = "relative overflow-hidden rounded-[var(--radius)] border border-hairline bg-bg p-5 sm:p-7 shadow-[var(--shadow-card)]";
export const eyebrow = "text-xs font-semibold uppercase tracking-[0.14em] text-accent";
