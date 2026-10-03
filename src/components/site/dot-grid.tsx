"use client";

import { useEffect, useRef } from "react";
import { falloff, gridPoints, idleWave } from "@/lib/dot-grid-math";
import { cn } from "@/lib/utils";

const SPACING = 24;
const RADIUS = 150;
const BASE_R = 1.1;
const MAX_R = 3.2;

/** Resolve a CSS custom property to "r,g,b" so the canvas follows the tokens. */
function tokenRgb(name: string, fallback: [number, number, number]) {
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  document.body.appendChild(probe);
  const match = getComputedStyle(probe).color.match(/\d+/g);
  probe.remove();
  return match && match.length >= 3 ? (match.slice(0, 3).map(Number) as [number, number, number]) : fallback;
}

/**
 * Cursor-reactive dot grid. Dots near the pointer grow and turn blue. Without a
 * fine pointer it runs a slow idle wave instead. It only animates while on
 * screen and while the tab is visible, and draws one static frame under
 * reduced motion. `data-mode` exposes the current mode for tests.
 */
export function DotGrid({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const mode = reduce ? "static" : finePointer ? "pointer" : "idle";
    canvas.dataset.mode = mode;

    const base = tokenRgb("--border-strong", [133, 146, 171]);
    const hot = tokenRgb("--accent", [37, 99, 235]);

    let width = 0;
    let height = 0;
    let points: { x: number; y: number }[] = [];
    const strength: number[] = [];
    const pointer = { x: -9999, y: -9999, active: false };
    let frame = 0;
    let running = false;
    let inView = true;

    function resize() {
      const rect = host!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      points = gridPoints(width, height, SPACING);
      strength.length = points.length;
      strength.fill(0);
      draw(performance.now());
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, width, height);
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        let target = 0;
        if (mode === "pointer" && pointer.active) target = falloff(Math.hypot(p.x - pointer.x, p.y - pointer.y), RADIUS);
        else if (mode === "idle") target = idleWave(p.x, p.y, time) * 0.35;
        // Ease towards the target so dots settle back smoothly.
        strength[i] += (target - strength[i]) * 0.18;
        const s = strength[i];
        const r = BASE_R + (MAX_R - BASE_R) * s;
        const c = base.map((v, k) => Math.round(v + (hot[k] - v) * s));
        ctx!.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.35 + 0.6 * s})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function loop(time: number) {
      draw(time);
      frame = requestAnimationFrame(loop);
    }

    function setRunning(next: boolean) {
      if (mode === "static" || next === running) return;
      running = next;
      canvas!.dataset.running = String(next);
      if (next) frame = requestAnimationFrame(loop);
      else cancelAnimationFrame(frame);
    }

    function update() {
      setRunning(inView && document.visibilityState === "visible");
    }

    function onMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      const rect = canvas!.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
      canvas!.dataset.pointer = "active";
    }
    function onLeave() {
      pointer.active = false;
      canvas!.dataset.pointer = "idle";
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    io.observe(host);
    document.addEventListener("visibilitychange", update);
    if (mode === "pointer") {
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
    }
    resize();
    update();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="dot-grid"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}
