"use client";

// ClayAvatar: original parametric plasticine-style SVG character. Transform and
// opacity only, no internal animation: motion comes from the caller changing
// `pose` / `frame` / `blinking`, and CSS transitions in parts.tsx ease between
// them. Under reduced motion callers simply do not step frames.

import { memo, useEffect, useId, useRef } from "react";
import { gradIds, toFills, useSharedClayDefs } from "./clay-defs";
import { ROLE_LABELS, type RoleId } from "../site/visitor/role-ids";
import { ROLE_AVATAR } from "./avatar-spec";
import { ACCENTS, HAIRS, ROLE_COLORS, SKINS } from "./palette";
import { Arm, BackGear, lim, Defs, Head, HAIR_STYLES, Headgear, Leg, type Look, Neck, Prop, Shadow, Torso } from "./parts";
import { type ClayPoseName, poseFor, waveAngle } from "./poses";

export type ClayView = "bust" | "full";

export type ClayAvatarProps = {
  /** null = Skip: a neutral outline chip, no character. */
  role: RoleId | null;
  skin?: number;
  hair?: number;
  hairStyle?: number;
  accent?: number;
  pose?: ClayPoseName;
  /** walk frame (0-3) or wave flutter parity */
  frame?: number;
  view?: ClayView;
  /** eyes closed (drive from useBlink) */
  blinking?: boolean;
  /** width in px; height follows the view's aspect */
  size: number;
  title?: string;
  /** hide from assistive tech (use when a text label sits next to it) */
  decorative?: boolean;
  /** optional CSS colour for a soft circle behind a bust, e.g. "var(--tint-sky)" */
  tint?: string;
  className?: string;
  /** ground contact shadow under a full-body figure (default on; the walking guide turns it off) */
  shadow?: boolean;
  /** Blink on its own (2.4-5.6 s, no React render). Ignored when `blinking` is given. */
  autoBlink?: boolean;
  /** With pose "wave": the raised hand flutters on its own (no React render). Paused off screen and in a hidden tab. */
  flutter?: boolean;
};

const WAVE_MS = 420;
/** Imperative blink + wave flutter: toggles a data attribute / one arm transform, CSS transitions do the easing. */
function useClayLife(svg: React.RefObject<SVGSVGElement | null>, arm: React.RefObject<SVGGElement | null>, blink: boolean, flutter: boolean) {
  useEffect(() => {
    const node = svg.current;
    if (!node || (!blink && !flutter)) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let onScreen = true;
    const io = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver((e) => (onScreen = e.some((x) => x.isIntersecting))) : null;
    io?.observe(node);
    const awake = () => onScreen && !document.hidden;
    let bt: ReturnType<typeof setTimeout> | undefined;
    const nextBlink = () => {
      bt = setTimeout(() => {
        if (!awake()) return nextBlink();
        node.setAttribute("data-blink", "");
        bt = setTimeout(() => {
          node.removeAttribute("data-blink");
          nextBlink();
        }, 120);
      }, 2400 + Math.random() * 3200);
    };
    if (blink) {
      if (!document.getElementById("clay-blink-css")) {
        const st = document.createElement("style");
        st.id = "clay-blink-css";
        st.textContent = BLINK_CSS;
        document.head.appendChild(st);
      }
      nextBlink();
    }
    let f = 0;
    const wt = flutter
      ? setInterval(() => {
          if (!awake() || !arm.current) return;
          f++;
          arm.current.style.transform = lim(69, 68, waveAngle(f)).transform as string;
        }, WAVE_MS)
      : undefined;
    return () => {
      io?.disconnect();
      clearTimeout(bt);
      clearInterval(wt);
      node.removeAttribute("data-blink");
    };
  }, [svg, arm, blink, flutter]);
}

const BLINK_CSS = ".clay-eye{transform:scaleY(1)}[data-blink] .clay-eye{transform:scaleY(.1)}";

// Bottom edge = sole line at rest (feet 134 in leg space, scaled 0.84 about 144 -> 135.6): no padding below the soles.
const FULL = { box: "0 -14.4 100 150", w: 100, h: 150 } as const;
const SOLE_Y = 135.6;
const BUST = { box: "8 -4 84 86", w: 84, h: 86 } as const;
// Chibi proportions: head ~45% of figure height. The body shrinks about the feet
// and the head grows about its neck; both are static SVG transforms, so poses
// and CSS transitions inside each part are untouched.
const BODY_T = "translate(50 144) scale(0.84) translate(-50 -144)";
const HEAD_FULL = "translate(50 70.7) scale(1.34) translate(-50 -58)";
const HEAD_BUST = "translate(50 58) scale(1.2) translate(-50 -58)";

const wrap = (n: number | undefined, len: number, fallback: number) => (((n ?? fallback) % len) + len) % len;

function ClayAvatarImpl({ role, skin, hair, hairStyle, accent, pose = "idle", frame = 0, view = "full", blinking, size, title, decorative, tint, className, shadow = true, autoBlink = false, flutter = false }: ClayAvatarProps) {
  const raw = useId();
  const sharedDefs = useSharedClayDefs();
  const svgRef = useRef<SVGSVGElement>(null);
  const armRef = useRef<SVGGElement>(null);
  const auto = blinking === undefined && autoBlink;
  useClayLife(svgRef, armRef, auto, flutter && pose === "wave" && view === "full");
  const uid = `c${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const geo = view === "bust" ? BUST : FULL;
  const height = Math.round((size * geo.h) / geo.w);
  const a11y = decorative ? { "aria-hidden": true as const } : { role: "img" as const, "aria-label": title ?? (role ? `${ROLE_LABELS[role]} character` : "No role chosen") };

  if (role === null) {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" className={className} focusable="false" {...a11y}>
        <circle cx={20} cy={20} r={17} fill="none" stroke="currentColor" strokeWidth={1.4} opacity={0.55} />
        <path d="M13 20 h14" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" opacity={0.55} />
      </svg>
    );
  }

  const def = ROLE_AVATAR[role];
  const colors = ROLE_COLORS[role];
  const cols = {
    skin: SKINS[wrap(skin, SKINS.length, def.skin)]!,
    hair: HAIRS[wrap(hair, HAIRS.length, def.hair)]!,
    top: colors.top,
    bottom: colors.bottom,
    accent: ACCENTS[wrap(accent, ACCENTS.length, def.accent)]!,
  };
  const ids = gradIds(cols, uid, sharedDefs);
  const look: Look = { ...cols, f: toFills(ids), hairStyle: HAIR_STYLES[wrap(hairStyle, HAIR_STYLES.length, def.hairStyle)]! };
  const p = poseFor(pose, frame);
  const rArm = pose === "wave" ? waveAngle(frame) : p.rArm;
  const glasses = role === "data";

  const head = (
    <g transform={view === "bust" ? HEAD_BUST : HEAD_FULL}>
      <Head look={look} pose={p} blinking={auto ? undefined : (blinking ?? false)} glasses={glasses}>
        <Headgear look={look} role={role} />
      </Head>
    </g>
  );

  return (
    <svg ref={svgRef} width={size} height={height} viewBox={geo.box} className={className} focusable="false" style={{ overflow: "visible" }} {...a11y}>
      {sharedDefs ? null : <Defs look={look} ids={ids} />}
      {view === "bust" ? (
        <>
          {tint && <circle cx={50} cy={39} r={42} fill={tint} />}
          <Torso look={look} role={role} />
          <Neck look={look} />
          {head}
        </>
      ) : (
        <>
          {shadow ? <Shadow fill={look.f.g} scale={p.shadow} y={SOLE_Y} /> : null}
          <g style={{ transform: `translateY(${p.bodyY}px) rotate(${p.lean}deg)`, transformOrigin: `50px ${SOLE_Y}px`, transition: "transform 280ms cubic-bezier(.3,.7,.2,1)" }}>
            <g transform={BODY_T}>
              <BackGear look={look} role={role} />
              <Leg look={look} x={43} angle={p.lLeg} lift={p.lLift} />
              <Leg look={look} x={57} angle={p.rLeg} lift={p.rLift} />
              <Torso look={look} role={role} />
              <Neck look={look} />
              <Arm look={look} x={69} angle={rArm} gRef={armRef} />
            </g>
            {head}
            <g transform={BODY_T}>
            <Arm look={look} x={31} angle={p.lArm}>
              <g style={{ transform: `rotate(${-p.lArm}deg) scale(1.32)`, transformOrigin: "0px 29.6px", transition: "transform 280ms cubic-bezier(.3,.7,.2,1)" }}>
                <Prop look={look} role={role} />
              </g>
            </Arm>
            </g>
          </g>
        </>
      )}
    </svg>
  );
}

/** Memoised: props are plain values, so a parent commit never re-draws the ~80-110 node figure. */
export const ClayAvatar = memo(ClayAvatarImpl);
