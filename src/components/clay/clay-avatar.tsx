"use client";

// ClayAvatar: original parametric plasticine-style SVG character. Transform and
// opacity only, no internal animation: motion comes from the caller changing
// `pose` / `frame` / `blinking`, and CSS transitions in parts.tsx ease between
// them. Under reduced motion callers simply do not step frames.

import { useId } from "react";
import { ROLE_LABELS, type RoleId } from "../site/visitor/role-ids";
import { ROLE_AVATAR } from "./avatar-spec";
import { ACCENTS, HAIRS, ROLE_COLORS, SKINS } from "./palette";
import { Arm, BackGear, Defs, Head, HAIR_STYLES, Headgear, Leg, type Look, Neck, Prop, Shadow, Torso } from "./parts";
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
};

const FULL = { box: "0 -14 100 164", w: 100, h: 164 } as const;
const BUST = { box: "12 2 76 80", w: 76, h: 80 } as const;

const wrap = (n: number | undefined, len: number, fallback: number) => (((n ?? fallback) % len) + len) % len;

export function ClayAvatar({ role, skin, hair, hairStyle, accent, pose = "idle", frame = 0, view = "full", blinking = false, size, title, decorative, tint, className }: ClayAvatarProps) {
  const raw = useId();
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
  const look: Look = {
    uid,
    skin: SKINS[wrap(skin, SKINS.length, def.skin)]!,
    hair: HAIRS[wrap(hair, HAIRS.length, def.hair)]!,
    hairStyle: HAIR_STYLES[wrap(hairStyle, HAIR_STYLES.length, def.hairStyle)]!,
    top: colors.top,
    bottom: colors.bottom,
    accent: ACCENTS[wrap(accent, ACCENTS.length, def.accent)]!,
  };
  const p = poseFor(pose, frame);
  const rArm = pose === "wave" ? waveAngle(frame) : p.rArm;
  const glasses = role === "data";

  const head = (
    <Head look={look} pose={p} blinking={blinking} glasses={glasses}>
      <Headgear look={look} role={role} />
    </Head>
  );

  return (
    <svg width={size} height={height} viewBox={geo.box} className={className} focusable="false" style={{ overflow: "visible" }} {...a11y}>
      <Defs look={look} />
      {view === "bust" ? (
        <>
          {tint && <circle cx={50} cy={42} r={37} fill={tint} />}
          <Torso look={look} role={role} />
          <Neck look={look} />
          {head}
        </>
      ) : (
        <>
          <Shadow uid={uid} scale={p.shadow} />
          <g style={{ transform: `translateY(${p.bodyY}px) rotate(${p.lean}deg)`, transformOrigin: "50px 144px", transition: "transform 280ms cubic-bezier(.3,.7,.2,1)" }}>
            <BackGear look={look} role={role} />
            <Leg look={look} x={43} angle={p.lLeg} lift={p.lLift} />
            <Leg look={look} x={57} angle={p.rLeg} lift={p.rLift} />
            <Torso look={look} role={role} />
            <Neck look={look} />
            <Arm look={look} x={69} angle={rArm} />
            {head}
            <Arm look={look} x={31} angle={p.lArm}>
              <g style={{ transform: `rotate(${-p.lArm}deg)`, transformOrigin: "0px 29.6px", transition: "transform 280ms cubic-bezier(.3,.7,.2,1)" }}>
                <Prop look={look} role={role} />
              </g>
            </Arm>
          </g>
        </>
      )}
    </svg>
  );
}
