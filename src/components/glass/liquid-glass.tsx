"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { displacementAt, mapSize, supportsSvgBackdrop } from "./displacement";

// Encoded maps, keyed by size/shape. A fixed-size element encodes once.
const cache = new Map<string, string>();

function encodeMap(w: number, h: number, radius: number, bezel: number) {
  const key = `${w}:${h}:${radius}:${bezel}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const size = mapSize(w, h);
  const canvas = document.createElement("canvas");
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const img = ctx.createImageData(size.w, size.h);
  const r = radius * size.scale;
  const b = bezel * size.scale;
  for (let y = 0; y < size.h; y++) {
    for (let x = 0; x < size.w; x++) {
      const [dr, dg] = displacementAt(x, y, size.w, size.h, r, b);
      const i = (y * size.w + x) * 4;
      img.data[i] = dr;
      img.data[i + 1] = dg;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = canvas.toDataURL("image/png");
  cache.set(key, url);
  return url;
}

export interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Corner radius in px (also used for the refraction rim). */
  radius: number;
  /** Width of the refracting rim, px. */
  bezel?: number;
  /** Displacement strength in px. */
  refraction?: number;
  blur?: number;
  saturation?: number;
  /** Tint under the content, keeps text readable over busy backdrops. */
  tint?: "light" | "dark";
}

/**
 * A surface that refracts what is behind it like a glass lens.
 *
 * Chromium: a canvas-generated displacement map drives an SVG
 * feDisplacementMap inside `backdrop-filter`. Safari/Firefox: frosted
 * blur + saturate. `prefers-reduced-transparency` / `prefers-contrast: more`:
 * an opaque surface (see `.glass` in globals.css).
 *
 * Never animate this element's SIZE: every new size re-encodes the map.
 * Animate transform instead.
 */
export const LiquidGlass = forwardRef<HTMLDivElement, LiquidGlassProps>(function LiquidGlass(
  { radius, bezel = 14, refraction = 22, blur = 2, saturation = 1.3, tint = "light", className, style, children, ...rest },
  forwarded
) {
  const ref = useRef<HTMLDivElement>(null);
  useImperativeHandle(forwarded, () => ref.current as HTMLDivElement);
  const filterId = `lg-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const [map, setMap] = useState<{ url: string; w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !supportsSvgBackdrop(navigator.userAgent)) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const w = Math.round(el.offsetWidth);
        const h = Math.round(el.offsetHeight);
        if (w < 4 || h < 4) return;
        const url = encodeMap(w, h, radius, bezel);
        if (url) setMap((m) => (m && m.url === url ? m : { url, w, h }));
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [radius, bezel]);

  const frosted = `blur(${Math.max(blur, 8)}px) saturate(${saturation})`;
  const filter = map ? `url(#${filterId}) blur(${blur}px) saturate(${saturation})` : frosted;

  return (
    <div
      ref={ref}
      data-glass={map ? "refract" : "frost"}
      data-tint={tint}
      className={cn("glass", className)}
      // The unprefixed property is set inline on purpose: the production CSS pipeline merges the
      // `.glass` rule's pair and keeps only -webkit-backdrop-filter, which Chromium ignores.
      style={{ ...style, borderRadius: radius, backdropFilter: filter, WebkitBackdropFilter: filter, ["--glass-filter" as string]: filter }}
      {...rest}
    >
      {map ? (
        <svg aria-hidden="true" width="0" height="0" className="pointer-events-none absolute">
          <filter id={filterId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feImage href={map.url} x="0" y="0" width={map.w} height={map.h} preserveAspectRatio="none" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={refraction} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      ) : null}
      {children}
    </div>
  );
});
