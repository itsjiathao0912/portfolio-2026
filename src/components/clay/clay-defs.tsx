"use client";

// Shared clay gradients. Every gradient is a pure function of ONE palette colour
// (or a constant), so the whole set is finite: it is drawn once, in one hidden
// 0x0 svg, and every figure points at it by a colour-keyed id. Without the host
// (tests, a page outside the provider) each figure falls back to its own <defs>.

import { createContext, useContext, type ReactNode } from "react";
import { ACCENTS, HAIRS, ROLE_COLORS, SKINS, mix, shade, type Shade } from "./palette";

export type GradKey = "s" | "h" | "t" | "b" | "a" | "g" | "r" | "o" | "i" | "c";
export type Fills = Record<GradKey, string>;
type Colors = { skin: string; hair: string; top: string; bottom: string; accent: string };

const hex = (c: string) => c.replace("#", "").toLowerCase();
const shared = (c: Colors): Record<GradKey, string> => ({
  s: `clay-${hex(c.skin)}`,
  h: `clay-${hex(c.hair)}`,
  t: `clay-${hex(c.top)}`,
  b: `clay-${hex(c.bottom)}`,
  a: `clay-${hex(c.accent)}`,
  i: `clay-i-${hex(c.hair)}`,
  g: "clay-k-g",
  r: "clay-k-r",
  o: "clay-k-o",
  c: "clay-k-c",
});
const local = (uid: string): Record<GradKey, string> => Object.fromEntries((["s", "h", "t", "b", "a", "g", "r", "o", "i", "c"] as const).map((k) => [k, `${uid}${k}`])) as Record<GradKey, string>;

/** Gradient ids for one figure: shared (colour-keyed) when the host is mounted, else per instance. */
export function gradIds(c: Colors, uid: string, useShared: boolean) {
  return useShared ? shared(c) : local(uid);
}
export const toFills = (ids: Record<GradKey, string>): Fills => Object.fromEntries(Object.entries(ids).map(([k, v]) => [k, `url(#${v})`])) as Fills;

/** One radial gradient with light, mid and dark stops (objectBoundingBox units, reusable on any shape). */
export function Grad({ id, c, cx = 0.36, cy = 0.28 }: { id: string; c: Shade; cx?: number; cy?: number }) {
  return (
    <radialGradient id={id} cx={cx} cy={cy} r={0.95}>
      <stop offset="0" stopColor={c.light} />
      <stop offset="0.45" stopColor={c.mid} />
      <stop offset="0.82" stopColor={mix(c.dark, "#c0503c", 0.12)} />
      <stop offset="1" stopColor={c.dark} />
    </radialGradient>
  );
}
export const Iris = ({ id, hair }: { id: string; hair: string }) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0.1" stopColor="#1d1714" />
    <stop offset="1" stopColor={mix(hair, "#8fb8e8", 0.35)} />
  </linearGradient>
);
/** The four colour-independent gradients: ground shadow, rim light, ambient occlusion, cheek blush. */
export function ConstGrads({ ids }: { ids: Pick<Record<GradKey, string>, "g" | "r" | "o" | "c"> }) {
  return (
    <>
      <radialGradient id={ids.g} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#1b1410" stopOpacity="0.24" />
        <stop offset="1" stopColor="#1b1410" stopOpacity="0" />
      </radialGradient>
      {/* rim light: transparent core, bright fresnel edge biased to the lower right */}
      <radialGradient id={ids.r} cx="0.4" cy="0.36" r="0.7">
        <stop offset="0.8" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#fff" stopOpacity="0.42" />
      </radialGradient>
      {/* ambient occlusion: soft warm dark for contact creases */}
      <radialGradient id={ids.o} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#4a2418" stopOpacity="0.32" />
        <stop offset="1" stopColor="#4a2418" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={ids.c} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#e07a7a" stopOpacity="0.42" />
        <stop offset="1" stopColor="#e07a7a" stopOpacity="0" />
      </radialGradient>
    </>
  );
}

const ALL_COLORS = [...new Set<string>([...SKINS, ...HAIRS, ...ACCENTS, ...Object.values(ROLE_COLORS).flatMap((r) => [r.top, r.bottom, r.accent])].map((c) => c.toLowerCase()))];

const SharedDefs = createContext(false);
export const useSharedClayDefs = () => useContext(SharedDefs);

/** Mount once near the root: draws every clay gradient once and lets figures share them. */
export function ClayDefsProvider({ children }: { children: ReactNode }) {
  return (
    <SharedDefs.Provider value>
      <svg aria-hidden="true" focusable="false" width="0" height="0" data-clay-defs="" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}>
        <defs>
          {ALL_COLORS.map((c) => (
            <Grad key={c} id={`clay-${hex(c)}`} c={shade(c)} />
          ))}
          {HAIRS.map((h) => (
            <Iris key={h} id={`clay-i-${hex(h)}`} hair={h} />
          ))}
          <ConstGrads ids={{ g: "clay-k-g", r: "clay-k-r", o: "clay-k-o", c: "clay-k-c" }} />
        </defs>
      </svg>
      {children}
    </SharedDefs.Provider>
  );
}
