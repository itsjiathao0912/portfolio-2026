"use client";

import { Eraser } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { DOODLE_KEY, parseDoodle, serializeDoodle, type Point, type Stroke } from "./logic";

const W = 320;
const H = 140;

function draw(canvas: HTMLCanvasElement, strokes: readonly Stroke[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = "#000";
  for (const s of strokes) {
    ctx.beginPath();
    s.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x * W, y * H) : ctx.lineTo(x * W, y * H)));
    if (s.length === 1) ctx.lineTo(s[0][0] * W + 0.1, s[0][1] * H);
    ctx.stroke();
  }
}

/**
 * "Leave a mark": a small doodle pad in the footer. Mouse, pen and finger all
 * draw (touch-action: none on the pad only). The doodle is saved to THIS
 * browser's localStorage and nowhere else — nothing is uploaded. "Clear"
 * wipes it from the pad and from storage. No animation, so reduced motion
 * needs no special case.
 */
export function DoodlePad() {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Point[] | null>(null);
  const [hasInk, setHasInk] = useState(false);

  const redraw = useCallback(() => canvas.current && draw(canvas.current, current.current ? [...strokes.current, current.current] : strokes.current), []);

  // Load the saved doodle once the canvas mounts (callback ref, client only).
  const attach = useCallback(
    (el: HTMLCanvasElement | null) => {
      canvas.current = el;
      if (!el) return;
      let saved: Stroke[] = [];
      try {
        saved = parseDoodle(localStorage.getItem(DOODLE_KEY));
      } catch {
        saved = [];
      }
      strokes.current = saved;
      setHasInk(saved.length > 0);
      draw(el, saved);
    },
    []
  );

  function point(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const r = e.currentTarget.getBoundingClientRect();
    return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))];
  }

  function save() {
    try {
      localStorage.setItem(DOODLE_KEY, serializeDoodle(strokes.current));
    } catch {
      // storage full or blocked (private mode): the doodle just won't persist
    }
  }

  return (
    <div className="flex flex-col items-center gap-3" data-testid="doodle">
      <p className="label-mono text-[12px] text-ink-3">Leave a mark — it stays in your browser only</p>
      <canvas
        ref={attach}
        width={W}
        height={H}
        data-testid="doodle-pad"
        aria-label="Doodle pad. Draw with a mouse, pen or finger. Saved only in this browser."
        role="img"
        className="h-[140px] w-[320px] max-w-full cursor-crosshair touch-none rounded-[20px] bg-canvas ring-1 ring-hairline"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          current.current = [point(e)];
          redraw();
        }}
        onPointerMove={(e) => {
          if (!current.current) return;
          current.current.push(point(e));
          redraw();
        }}
        onPointerUp={() => {
          if (!current.current) return;
          strokes.current = [...strokes.current, current.current];
          current.current = null;
          setHasInk(true);
          save();
          redraw();
        }}
        onPointerCancel={() => {
          current.current = null;
          redraw();
        }}
      />
      <button
        type="button"
        data-testid="doodle-clear"
        disabled={!hasInk}
        onClick={() => {
          strokes.current = [];
          setHasInk(false);
          try {
            localStorage.removeItem(DOODLE_KEY);
          } catch {
            // ignore
          }
          redraw();
        }}
        className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3.5 py-1.5 text-[13px] text-ink-2 hover:text-ink-1 disabled:opacity-40"
      >
        <Eraser className="size-3.5" aria-hidden="true" /> Clear my doodle
      </button>
    </div>
  );
}
