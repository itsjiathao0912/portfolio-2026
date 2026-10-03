"use client";

import { useEffect, useRef } from "react";
import { ARCS, PLACES, placeById } from "./routes";
import { arcPoints, decay, distToSegment, fibonacciSphere, isLand, latLonToVec, project, rotate, vecToLatLon, type Vec3 } from "./geo";

export type GlobeCanvasProps = {
  activeId: string | null;
  onHover: (id: string | null, x: number, y: number) => void;
  onSelect: (id: string, x: number, y: number) => void;
  /** Initial yaw so the story starts over South-East Asia. */
  startLon?: number;
  /** "light" = white page style, no text labels (the list names the places). */
  tone?: "dark" | "light";
  /** Rotate to face this longitude (null = free spin). */
  focusLon?: number | null;
};

const TILT = -0.32;
const AUTO_SPIN = 0.00004; // rad per ms

const DOTS: Vec3[] = fibonacciSphere(5200).filter((v) => {
  const { lat, lon } = vecToLatLon(v);
  return isLand(lat, lon);
});

const ARC_GEOM = ARCS.map((c) => ({
  c,
  pts: arcPoints(latLonToVec(placeById(c.from).lat, placeById(c.from).lon), latLonToVec(placeById(c.to).lat, placeById(c.to).lon)),
}));

export default function GlobeCanvas({ activeId, onHover, onSelect, startLon = 100, tone = "dark", focusLon = null }: GlobeCanvasProps) {
  const light = tone === "light";
  const focusRef = useRef<number | null>(focusLon);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(activeId);
  const cbRef = useRef({ onHover, onSelect });
  useEffect(() => {
    activeRef.current = activeId;
    focusRef.current = focusLon;
    cbRef.current = { onHover, onSelect };
  }, [activeId, focusLon, onHover, onSelect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let yaw = (-startLon * Math.PI) / 180;
    let vel = 0;
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let downX = 0, downY = 0;
    let scrollYaw = 0;
    let raf = 0;
    let prev = performance.now();
    let visible = true;
    let w = 0, h = 0, dpr = 1;
    let projected: { id: string; pts: { x: number; y: number; z: number }[] }[] = [];

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onScroll = () => {
      const rect = canvas.getBoundingClientRect();
      const progress = 1 - (rect.top + rect.height / 2) / (window.innerHeight + rect.height / 2);
      scrollYaw = (Math.min(1, Math.max(0, progress)) - 0.5) * 0.7;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) { prev = performance.now(); raf = requestAnimationFrame(frame); }
    });
    io.observe(canvas);

    const hit = (px: number, py: number) => {
      let best: string | null = null;
      let bestD = 14;
      for (const a of projected) {
        for (let i = 1; i < a.pts.length; i++) {
          const p = a.pts[i - 1], q = a.pts[i];
          if (p.z < 0 || q.z < 0) continue;
          const d = distToSegment(px, py, p.x, p.y, q.x, q.y);
          if (d < bestD) { bestD = d; best = a.id; }
        }
      }
      return best;
    };

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const down = (e: PointerEvent) => {
      dragging = true;
      canvas.setPointerCapture(e.pointerId);
      lastX = e.clientX; lastT = e.timeStamp; vel = 0;
      downX = e.clientX; downY = e.clientY;
    };
    const move = (e: PointerEvent) => {
      if (dragging) {
        const dx = e.clientX - lastX;
        const dt = Math.max(1, e.timeStamp - lastT);
        const d = (dx / Math.max(200, w)) * Math.PI;
        yaw += d;
        vel = d / dt;
        lastX = e.clientX; lastT = e.timeStamp;
        return;
      }
      if (e.pointerType === "mouse") {
        const p = local(e);
        cbRef.current.onHover(hit(p.x, p.y), p.x, p.y);
      }
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (Math.hypot(e.clientX - downX, e.clientY - downY) < 6) {
        const p = local(e);
        const id = hit(p.x, p.y);
        if (id) cbRef.current.onSelect(id, p.x, p.y);
        else cbRef.current.onHover(null, p.x, p.y);
      }
    };
    const leave = () => { if (!dragging) cbRef.current.onHover(null, 0, 0); };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("pointerleave", leave);

    function frame(now: number) {
      raf = 0;
      if (!visible || !ctx) return;
      const dt = Math.min(64, now - prev);
      prev = now;
      if (!dragging) {
        if (vel !== 0) { yaw += vel * dt; vel = decay(vel, dt); }
        else if (focusRef.current != null) {
          const target = (-focusRef.current * Math.PI) / 180;
          let diff = (target - yaw) % (Math.PI * 2);
          if (diff > Math.PI) diff -= Math.PI * 2;
          if (diff < -Math.PI) diff += Math.PI * 2;
          yaw += diff * Math.min(1, dt * 0.006);
        } else if (!activeRef.current) yaw += AUTO_SPIN * dt;
      }
      draw(now);
      raf = requestAnimationFrame(frame);
    }

    function draw(now: number) {
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const r = Math.min(w, h) * 0.42;
      const cx = w / 2, cy = h / 2;
      const Y = yaw + scrollYaw;

      // Halo + ocean disc.
      if (light) {
        ctx.fillStyle = "#f7f7f7";
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(11,21,51,0.10)";
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
      const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r * 1.15);
      g.addColorStop(0, "#1e3a8a");
      g.addColorStop(0.75, "#0b1b4a");
      g.addColorStop(1, "rgba(11,27,74,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0b1b4a";
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      }

      // Land dots, shaded by depth.
      for (const v of DOTS) {
        const p = project(rotate(v, Y, TILT), cx, cy, r);
        if (p.z <= 0) continue;
        ctx.fillStyle = light ? `rgba(107,108,114,${0.18 + p.z * 0.4})` : `rgba(191,219,254,${0.25 + p.z * 0.65})`;
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
      }

      // Arcs with travelling "money" pulses.
      projected = [];
      const active = activeRef.current;
      for (const { c, pts } of ARC_GEOM) {
        const sp = pts.map((v) => project(rotate(v, Y, TILT), cx, cy, r));
        projected.push({ id: c.id, pts: sp });
        const on = active === c.id;
        ctx.lineWidth = on ? 3 : 1.5;
        if (light) ctx.strokeStyle = "#2563eb";
        ctx.strokeStyle = light ? "#2563eb" : c.color;
        ctx.globalAlpha = active && !on ? 0.35 : 0.9;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = light ? 0 : on ? 14 : 6;
        ctx.beginPath();
        let pen = false;
        for (const p of sp) {
          if (p.z < -0.05) { pen = false; continue; }
          if (!pen) { ctx.moveTo(p.x, p.y); pen = true; } else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        const t = ((now / 2200) + c.id.length * 0.13) % 1;
        const p = sp[Math.floor(t * (sp.length - 1))];
        if (p.z > -0.05) {
          ctx.fillStyle = light ? "#0b1533" : "#ffffff";
          ctx.beginPath(); ctx.arc(p.x, p.y, on ? 3.5 : 2.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // Pins + labels.
      ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
      for (const pl of PLACES) {
        const p = project(rotate(latLonToVec(pl.lat, pl.lon), Y, TILT), cx, cy, r);
        if (p.z <= 0.05) continue;
        const pulse = 4 + 3 * ((now / 1200) % 1);
        if (light) {
          ctx.fillStyle = "#0b1533";
          ctx.beginPath(); ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5; ctx.stroke();
          continue;
        }
        ctx.strokeStyle = `rgba(255,255,255,${0.6 * (1 - ((now / 1200) % 1))})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, pulse, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
        const label = pl.name;
        ctx.globalAlpha = Math.min(1, p.z * 2);
        ctx.fillStyle = "rgba(10,10,10,0.55)";
        const tw = ctx.measureText(label).width;
        const left = pl.lon < 105; // west-side cities label to the left, avoiding HCMC/Singapore overlap
        const lx = left ? p.x - tw - 18 : p.x + 8;
        ctx.fillRect(lx, p.y - 9, tw + 10, 18);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, lx + 5, p.y + 4);
        ctx.globalAlpha = 1;
      }
    }

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, [startLon, light]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
    />
  );
}
