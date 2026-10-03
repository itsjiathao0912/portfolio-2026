"use client";

import { useEffect, useRef } from "react";
import { useCapabilities, useReducedMotion } from "./use-globe-env";

export type BrandGradientProps = {
  /** Up to 4 accent hex colours mixed over the navy base. */
  accents?: readonly string[];
  /** Animation speed multiplier. Default 1. */
  speed?: number;
  className?: string;
  children?: React.ReactNode;
};

const DEFAULT_ACCENTS = ["#2563eb", "#14b8a6", "#5b6cff", "#8b5cf6"] as const;

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full.slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FRAG = `precision mediump float;
uniform vec2 res;uniform float t;uniform vec3 c0;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;
float blob(vec2 uv, vec2 c, float r){return exp(-dot(uv-c,uv-c)/(r*r));}
void main(){
  vec2 uv=gl_FragCoord.xy/res; uv.x*=res.x/res.y;
  float a=res.x/res.y;
  vec3 col=vec3(0.02,0.05,0.17);
  col=mix(col,c0,0.85*blob(uv,vec2(a*(0.25+0.15*sin(t*0.31)),0.30+0.12*cos(t*0.27)),0.45));
  col=mix(col,c1,0.70*blob(uv,vec2(a*(0.75+0.12*cos(t*0.23)),0.70+0.10*sin(t*0.35)),0.38));
  col=mix(col,c2,0.65*blob(uv,vec2(a*(0.55+0.18*sin(t*0.19+1.)),0.15+0.10*sin(t*0.29)),0.35));
  col=mix(col,c3,0.55*blob(uv,vec2(a*(0.15+0.10*cos(t*0.21+2.)),0.85+0.08*cos(t*0.33)),0.30));
  float g=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
  gl_FragColor=vec4(col+(g-0.5)*0.02,1.);
}`;

function staticBackground(accents: readonly string[]) {
  const a = [...accents, ...DEFAULT_ACCENTS];
  return `radial-gradient(40% 50% at 25% 70%, ${a[0]}d9, transparent 70%), radial-gradient(35% 45% at 75% 30%, ${a[1]}b3, transparent 70%), radial-gradient(30% 40% at 55% 85%, ${a[2]}a6, transparent 70%), radial-gradient(25% 35% at 15% 15%, ${a[3]}8c, transparent 70%), #050d2b`;
}

/** Animated navy mesh gradient. Pauses offscreen; CSS gradient fallback. */
export function BrandGradient({ accents = DEFAULT_ACCENTS, speed = 1, className = "", children }: BrandGradientProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const { webgl: gl } = useCapabilities();
  const key = accents.join(",");

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced || !gl) return;
    const ctx = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!ctx) return;
    const sh = (type: number, src: string) => { const s = ctx.createShader(type)!; ctx.shaderSource(s, src); ctx.compileShader(s); return s; };
    const prog = ctx.createProgram()!;
    ctx.attachShader(prog, sh(ctx.VERTEX_SHADER, VERT));
    ctx.attachShader(prog, sh(ctx.FRAGMENT_SHADER, FRAG));
    ctx.linkProgram(prog);
    if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) return;
    ctx.useProgram(prog);
    const buf = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buf);
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW);
    const loc = ctx.getAttribLocation(prog, "p");
    ctx.enableVertexAttribArray(loc);
    ctx.vertexAttribPointer(loc, 2, ctx.FLOAT, false, 0, 0);
    const u = (n: string) => ctx.getUniformLocation(prog, n);
    const cols = [...key.split(","), ...DEFAULT_ACCENTS].slice(0, 4);
    cols.forEach((c, i) => ctx.uniform3fv(u(`c${i}`), hexToRgb(c)));

    let raf = 0, visible = true;
    const start = performance.now();
    const resize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr * 0.5));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr * 0.5));
      ctx.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const frame = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      ctx.uniform2f(u("res"), canvas.width, canvas.height);
      ctx.uniform1f(u("t"), ((now - start) / 1000) * speed);
      ctx.drawArrays(ctx.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); });
    io.observe(canvas);
    const vis = () => { if (!document.hidden && visible && !raf) raf = requestAnimationFrame(frame); };
    document.addEventListener("visibilitychange", vis);
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", vis); };
  }, [reduced, gl, key, speed]);

  return (
    <div className={`relative isolate overflow-hidden ${className}`} style={{ background: staticBackground(accents) }}>
      {gl && !reduced && <canvas ref={ref} aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full" />}
      {children}
    </div>
  );
}
