// Clay figure parts. Original design brief (the originality guard):
//   - rounded bean bodies, dot eyes, mitten hands, no fingers, no logos;
//   - no licensed likeness: shapes are drawn from primitives here, nothing is
//     traced or copied from any mascot, stock render or third-party SVG;
//   - soft plasticine look from radial gradients, a specular highlight and a
//     gradient contact shadow. No SVG filters, no images, no external urls.
// Roles: recruiter (blazer + starred CV), founder (hoodie + rocket), engineer
// (headphones + code laptop), product designer (beret + frames tablet + pen),
// marketer (lapel jacket + megaphone), growth (arrow tee + rising bars), data
// (round glasses + big magnifier over a pie), investor (tie + briefcase), student
// (grad cap + backpack + books), fellow PM (lanyard + sticky board), just
// curious (question-mark balloon).

import type { CSSProperties, ReactNode } from "react";
import { INK, PAPER, SHOE, SOLE, mix, shade, type Shade } from "./palette";
import type { PoseSpec } from "./poses";

export const HAIR_STYLES = ["buzz", "short", "part", "bun", "long", "curly", "pony"] as const;
export type HairStyle = (typeof HAIR_STYLES)[number];

export type Look = {
  uid: string;
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  top: string;
  bottom: string;
  accent: string;
};

const url = (uid: string, k: string) => `url(#${uid}${k})`;
const ease = "transform 280ms cubic-bezier(.3,.7,.2,1)";

/** One radial gradient with light, mid and dark stops (objectBoundingBox units, reusable on any shape). */
function Grad({ id, c, cx = 0.36, cy = 0.28 }: { id: string; c: Shade; cx?: number; cy?: number }) {
  return (
    <radialGradient id={id} cx={cx} cy={cy} r={0.95}>
      <stop offset="0" stopColor={c.light} />
      <stop offset="0.45" stopColor={c.mid} />
      <stop offset="0.82" stopColor={mix(c.dark, "#c0503c", 0.12)} />
      <stop offset="1" stopColor={c.dark} />
    </radialGradient>
  );
}

export function Defs({ look }: { look: Look }) {
  const { uid } = look;
  return (
    <defs>
      <Grad id={`${uid}s`} c={shade(look.skin)} />
      <Grad id={`${uid}h`} c={shade(look.hair)} />
      <Grad id={`${uid}t`} c={shade(look.top)} />
      <Grad id={`${uid}b`} c={shade(look.bottom)} />
      <Grad id={`${uid}a`} c={shade(look.accent)} />
      <radialGradient id={`${uid}g`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#1b1410" stopOpacity="0.24" />
        <stop offset="1" stopColor="#1b1410" stopOpacity="0" />
      </radialGradient>
      {/* rim light: transparent core, bright fresnel edge biased to the lower right */}
      <radialGradient id={`${uid}r`} cx="0.4" cy="0.36" r="0.7">
        <stop offset="0.8" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#fff" stopOpacity="0.42" />
      </radialGradient>
      {/* ambient occlusion: soft warm dark for contact creases */}
      <radialGradient id={`${uid}o`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#4a2418" stopOpacity="0.32" />
        <stop offset="1" stopColor="#4a2418" stopOpacity="0" />
      </radialGradient>
      {/* iris: deep top, hair-tinted glow at the bottom (anime eye) */}
      <linearGradient id={`${uid}i`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.1" stopColor="#1d1714" />
        <stop offset="1" stopColor={mix(look.hair, "#8fb8e8", 0.35)} />
      </linearGradient>
      <radialGradient id={`${uid}c`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#e07a7a" stopOpacity="0.42" />
        <stop offset="1" stopColor="#e07a7a" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/** Soft white highlight blob that sells the glossy clay surface. */
const Spec = ({ cx, cy, rx, ry, o = 0.34, r = -25 }: { cx: number; cy: number; rx: number; ry: number; o?: number; r?: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" opacity={o} transform={`rotate(${r} ${cx} ${cy})`} />
);

export function Shadow({ uid, scale, y = 144 }: { uid: string; scale: number; y?: number }) {
  return <ellipse cx={50} cy={y} rx={26 * scale} ry={5 * scale} fill={url(uid, "g")} style={{ transition: ease, transformBox: "fill-box", transformOrigin: "center" }} />;
}

// ---------------------------------------------------------------- limbs

const lim = (x: number, y: number, a: number, extra = ""): CSSProperties => ({
  transform: `translate(${x}px, ${y}px) rotate(${a}deg)${extra}`,
  transition: ease,
});

export function Leg({ look, x, angle, lift }: { look: Look; x: number; angle: number; lift: number }) {
  const { uid } = look;
  return (
    <g style={lim(x, 100 + lift, angle)}>
      <rect x={-6.4} y={-3} width={12.8} height={33} rx={6.4} fill={url(uid, "b")} />
      {/* shoe: rounded toe cap over the leg end, flat sole at y=34 (no gap, no float) */}
      <path d="M-7 34 V30.4 C-7 25.6 -3 24.6 1.4 24.6 C7 24.6 10 27.4 10 31.4 V34 Z" fill={SHOE} />
      <rect x={-7} y={32.4} width={17} height={1.6} rx={0.6} fill={SOLE} />
      <Spec cx={0} cy={27.4} rx={3.2} ry={1} o={0.35} r={-6} />
    </g>
  );
}

export function Arm({ look, x, angle, children }: { look: Look; x: number; angle: number; children?: ReactNode }) {
  const { uid } = look;
  return (
    <g style={lim(x, 68, angle)}>
      <rect x={-4.6} y={-2} width={9.2} height={31} rx={4.6} fill={url(uid, "s")} />
      <rect x={-5.2} y={-3.4} width={10.4} height={19} rx={5.2} fill={url(uid, "t")} />
      {children}
      <circle cx={0} cy={29.6} r={5.4} fill={url(uid, "s")} />
    </g>
  );
}

// ---------------------------------------------------------------- head

function Eyes({ uid, blinking, glasses }: { uid: string; blinking: boolean; glasses: boolean }) {
  const eye = (cx: number) => (
    <g style={{ transformBox: "fill-box", transformOrigin: "center", transform: blinking ? "scaleY(0.1)" : "scaleY(1)", transition: "transform 90ms ease-out" }}>
      <ellipse cx={cx} cy={41} rx={3.9} ry={4.9} fill={url(uid, "i")} />
      <ellipse cx={cx} cy={41.6} rx={1.6} ry={2.1} fill="#0f0b0a" />
      <path d={`M${cx - 4.4} 37.4 Q${cx} 34.6 ${cx + 4.4} 37.2`} fill="none" stroke={INK} strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={cx - 1.3} cy={39.3} r={1.25} fill="#fff" />
      <circle cx={cx + 1.4} cy={43.4} r={0.6} fill="#fff" opacity={0.85} />
    </g>
  );
  return (
    <>
      {eye(42)}
      {eye(58)}
      {glasses && (
        <g fill="none" stroke={INK} strokeWidth={1.3} opacity={0.88}>
          <circle cx={42} cy={40.6} r={6.6} />
          <circle cx={58} cy={40.6} r={6.6} />
          <path d="M48.4 39 Q50 37.6 51.6 39" />
        </g>
      )}
    </>
  );
}

function Mouth({ kind }: { kind: PoseSpec["mouth"] }) {
  if (kind === "open")
    return (
      <>
        <ellipse cx={50} cy={48.6} rx={3.4} ry={2.8} fill="#6f2b2b" />
        <ellipse cx={50} cy={50} rx={2}  ry={1.1} fill="#d9777a" />
      </>
    );
  if (kind === "grin") return <path d="M45 47.2 Q50 53 55 47.2 Q50 49.2 45 47.2Z" fill="#6f2b2b" stroke={INK} strokeWidth={1} strokeLinejoin="round" />;
  return <path d="M46.4 48 Q50 50.8 53.6 48" fill="none" stroke={INK} strokeWidth={1.7} strokeLinecap="round" />;
}

/** Back hair (drawn before the head) and front hair (after) per style. */
function HairBack({ look }: { look: Look }) {
  const f = url(look.uid, "h");
  switch (look.hairStyle) {
    case "long":
      return <path d="M27.4 38 C23 66 28 79 38 78 L62 78 C72 79 77 66 72.6 38 Z" fill={f} />;
    case "pony":
      return <path d="M66 34 C82 30 90 46 80 64 C78 56 74 48 68 44 Z" fill={f} />;
    case "curly":
      return (
        <g fill={f}>
          {[[29, 40, 7.5], [32, 27, 8], [41, 18, 8.5], [50, 15, 8.5], [59, 18, 8.5], [68, 27, 8], [71, 40, 7.5]].map(([x, y, r]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r={r} />
          ))}
        </g>
      );
    case "bun":
      return <circle cx={50} cy={12.6} r={8.6} fill={f} />;
    default:
      return null;
  }
}

function HairFront({ look }: { look: Look }) {
  const f = url(look.uid, "h");
  switch (look.hairStyle) {
    case "buzz":
      return <path d="M29.2 35 C29 14.6 71 14.6 70.8 35 C66 27 34 27 29.2 35Z" fill={f} opacity={0.92} />;
    case "short":
      return <path d="M28 38 C25.6 12 74.4 12 72 38 C68 29 61 25 50 25 C39 25 32 29 28 38Z" fill={f} />;
    case "part":
      return <path d="M28 38 C24.5 11 76 9 72 38 C70 27 59 21.6 46 24 C37 26 31 30 28 38Z M46 24 C52 22 62 24 72 38 C66 33 56 28 46 24Z" fill={f} />;
    case "bun":
      return <path d="M28 37 C26 14 74 14 72 37 C67 28 60 24.6 50 24.6 C40 24.6 33 28 28 37Z" fill={f} />;
    case "long":
      return <path d="M28 40 C25 11 75 11 72 40 C70 29 62 24 50 24 C38 24 30 29 28 40Z" fill={f} />;
    case "pony":
      return <path d="M28 38 C25.6 13 74.4 13 72 38 C68 29 60 25 50 25 C40 25 32 29 28 38Z" fill={f} />;
    case "curly":
      return (
        <g fill={f}>
          <circle cx={40} cy={24} r={6} />
          <circle cx={50} cy={22} r={6.2} />
          <circle cx={60} cy={24} r={6} />
        </g>
      );
  }
}

export function Head({ look, pose, blinking, glasses, children }: { look: Look; pose: PoseSpec; blinking: boolean; glasses?: boolean; children?: ReactNode }) {
  const { uid } = look;
  return (
    <g style={{ transform: `rotate(${pose.tilt}deg)`, transformOrigin: "50px 58px", transition: ease }}>
      <HairBack look={look} />
      <circle cx={29.4} cy={40.6} r={4.2} fill={url(uid, "s")} />
      <circle cx={70.6} cy={40.6} r={4.2} fill={url(uid, "s")} />
      <ellipse cx={50} cy={38} rx={21.4} ry={20.4} fill={url(uid, "s")} />
      <ellipse cx={50} cy={38} rx={21.4} ry={20.4} fill={url(uid, "r")} />
      <Spec cx={39} cy={24.6} rx={6.4} ry={2.6} o={0.5} />
      <ellipse cx={36.4} cy={47} rx={4.6} ry={2.8} fill={url(uid, "c")} />
      <ellipse cx={63.6} cy={47} rx={4.6} ry={2.8} fill={url(uid, "c")} />
      <g stroke={mix(look.hair, INK, 0.3)} strokeWidth={1.2} strokeLinecap="round" fill="none" opacity={0.7}>
        <path d="M38.6 32.6 Q42 31 45.2 32.2" />
        <path d="M54.8 32.2 Q58 31 61.4 32.6" />
      </g>
      <Eyes uid={uid} blinking={blinking} glasses={!!glasses} />
      <ellipse cx={50} cy={45.6} rx={0.9} ry={0.6} fill={mix(look.skin, "#9a4a38", 0.45)} />
      <Mouth kind={pose.mouth} />
      <HairFront look={look} />
      <Spec cx={44} cy={17.6} rx={7} ry={1.8} o={0.28} r={-12} />
      {children}
    </g>
  );
}

// ---------------------------------------------------------------- torso + outfits

export function Neck({ look }: { look: Look }) {
  return <ellipse cx={50} cy={58} rx={7.4} ry={4.6} fill={mix(look.skin, "#5a2c20", 0.22)} />;
}

const TORSO = "M30 67 C30 58.6 36 56.6 50 56.6 C64 56.6 70 58.6 70 67 L72 100 C72 108 66 112.4 50 112.4 C34 112.4 28 108 28 100Z";

export function Torso({ look, role }: { look: Look; role: string }) {
  const { uid } = look;
  const t = url(uid, "t");
  const dark = shade(look.top).dark;
  const light = shade(look.top).light;
  return (
    <g>
      {role === "founder" && <ellipse cx={50} cy={60} rx={15.6} ry={8} fill={dark} />}
      <path d={TORSO} fill={t} />
      <path d={TORSO} fill={url(uid, "r")} />
      <ellipse cx={50} cy={60} rx={14} ry={5} fill={url(uid, "o")} />
      <Spec cx={38} cy={71} rx={6} ry={2.4} o={0.32} r={-30} />
      {role === "recruiter" && (
        <g>
          <path d="M43.4 56.8 L50 76 L56.6 56.8Z" fill={PAPER} />
          <path d="M43.4 56.8 L50 76 L45 80 L38 60Z M56.6 56.8 L50 76 L55 80 L62 60Z" fill={dark} opacity={0.55} />
          <path d="M50 96 v3" stroke={dark} strokeWidth={1.4} strokeLinecap="round" />
        </g>
      )}
      {role === "founder" && (
        <g>
          <rect x={37} y={91} width={26} height={13} rx={6} fill={dark} opacity={0.5} />
          <path d="M46 62 v13 M54 62 v13" stroke={light} strokeWidth={1.4} strokeLinecap="round" opacity={0.85} />
        </g>
      )}
      {role === "designer" && <ellipse cx={50} cy={60.4} rx={11} ry={3.8} fill="none" stroke={light} strokeWidth={2.4} opacity={0.9} />}
      {role === "growth" && (
        <g>
          <path d="M40 84 L46 78 L50 81 L59 71" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
          <path d="M55 71 h4 v4" fill="none" stroke="#fff" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {role === "data" && (
        <g>
          <path d="M50 58 V111" stroke={dark} strokeWidth={1.3} opacity={0.7} />
          <circle cx={46} cy={80} r={1.4} fill={light} /><circle cx={46} cy={92} r={1.4} fill={light} />
        </g>
      )}
      {role === "investor" && (
        <g>
          <path d="M44 57 L50 78 L56 57Z" fill={PAPER} />
          <path d="M48 60 h4 l1 4 l2.4 14 l-3.4 6 l-3.4 -6 l2.4 -14z" fill={url(uid, "a")} />
          <path d="M31 70 L43 58 L48 84 L30 96Z M69 70 L57 58 L52 84 L70 96Z" fill={dark} opacity={0.18} />
        </g>
      )}
      {role === "student" && <path d="M38 60 L36 100 M62 60 L64 100" stroke={shade(look.bottom).mid} strokeWidth={4.4} strokeLinecap="round" opacity={0.9} />}
      {role === "pm" && (
        <g>
          <path d="M42 58 L50 80 L58 58" fill="none" stroke={url(uid, "a")} strokeWidth={2} />
          <rect x={45} y={79} width={10} height={12} rx={1.6} fill={PAPER} stroke="#d9d4ca" strokeWidth={0.6} />
          <rect x={47} y={82} width={6} height={2} rx={1} fill={url(uid, "a")} />
        </g>
      )}
      {role === "marketer" && <path d="M44 57.6 L50 72 L56 57.6 M44 57.6 L40 66 L46 66 Z M56 57.6 L60 66 L54 66 Z" fill={dark} opacity={0.5} />}
      {role === "engineer" && <path d="M44 60 Q50 65.4 56 60" fill="none" stroke={light} strokeWidth={2} strokeLinecap="round" />}
      {role === "curious" && <path d="M44 60 Q50 66 56 60" fill="none" stroke={light} strokeWidth={2} strokeLinecap="round" />}
    </g>
  );
}

/** Items drawn behind the torso (student backpack). */
export function BackGear({ look, role }: { look: Look; role: string }) {
  if (role !== "student") return null;
  return (
    <g>
      <rect x={22} y={62} width={56} height={44} rx={13} fill={url(look.uid, "a")} />
    </g>
  );
}

/** Headwear and face gear drawn over the hair. */
export function Headgear({ look, role }: { look: Look; role: string }) {
  const a = url(look.uid, "a");
  if (role === "designer")
    return (
      <g>
        <ellipse cx={46} cy={17.6} rx={20} ry={7.6} fill={a} transform="rotate(-10 46 17.6)" />
        <circle cx={47} cy={9.6} r={1.8} fill={shade(look.accent).dark} />
        <Spec cx={39} cy={14.6} rx={6} ry={1.6} o={0.4} r={-12} />
      </g>
    );
  if (role === "student")
    return (
      <g>
        <path d="M33 19 Q50 13 67 19 V24 Q50 19 33 24Z" fill="#2b2e38" />
        <path d="M50 4 L76 13 L50 22 L24 13Z" fill="#363a46" />
        <path d="M50 13 L70 16 V25" fill="none" stroke={a} strokeWidth={1.4} strokeLinecap="round" />
        <circle cx={70} cy={26} r={1.8} fill={a} />
      </g>
    );
  if (role !== "engineer") return null;
  return (
    <g>
      <path d="M29 39 C27.4 8 72.6 8 71 39" fill="none" stroke="#2f343f" strokeWidth={3.4} strokeLinecap="round" />
      <rect x={24.6} y={34} width={7} height={14} rx={3.5} fill={a} />
      <rect x={68.4} y={34} width={7} height={14} rx={3.5} fill={a} />
      <ellipse cx={27.4} cy={37.4} rx={1.4} ry={2.4} fill="#fff" opacity={0.5} />
    </g>
  );
}

// ---------------------------------------------------------------- props (held in the viewer-left hand)

const OUT = "#3b3530"; // shared prop outline: dark, so props read at ~72px
const card = () => <rect x={-11} y={17} width={22} height={17} rx={2.6} fill={PAPER} stroke={OUT} strokeWidth={1.3} />;

/** Prop art in the hand's local frame (hand at 0,29.6; box about 24 x 22). */
export function Prop({ look, role }: { look: Look; role: string }) {
  const { uid } = look;
  const a = url(uid, "a");
  const dark = shade(look.accent).dark;
  switch (role) {
    case "recruiter":
      return (
        <g>
          <rect x={-8.6} y={13} width={17.2} height={22} rx={2} fill={PAPER} stroke={OUT} strokeWidth={1.3} />
          <path d="M-2.2 15.6 l1.3 2.7 l3 .4 l-2.2 2.1 l.5 3 l-2.6 -1.4 l-2.6 1.4 l.5 -3 l-2.2 -2.1 l3 -.4z" fill={a} />
          <path d="M-5.4 26 h10.8 M-5.4 29.2 h10.8 M-5.4 32 h7" stroke="#bdb6a8" strokeWidth={1.1} strokeLinecap="round" />
        </g>
      );
    case "founder":
      return (
        <g transform="rotate(-20 0 22)">
          <path d="M0 6 C6 11 6 24 4 30 H-4 C-6 24 -6 11 0 6Z" fill="#f4f1ea" stroke={OUT} strokeWidth={1.2} />
          <circle cx={0} cy={17} r={2.6} fill="#8fb8e8" stroke="#4a4f5c" strokeWidth={0.8} />
          <path d="M-4 24 L-8.4 31 H-4Z M4 24 L8.4 31 H4Z" fill={a} />
          <path d="M-3 30 Q0 37 3 30Z" fill="#f2a65a" />
        </g>
      );
    case "engineer":
      return (
        <g>
          <rect x={-11} y={16.6} width={22} height={15} rx={2.6} fill="#2f343f" stroke="#1d2027" strokeWidth={0.8} />
          <path d="M-3 21 l-3.4 3.2 l3.4 3.2 M3 21 l3.4 3.2 l-3.4 3.2 M1 20.4 l-2 7.6" fill="none" stroke="#8ee0c9" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
          <rect x={-12.4} y={31.6} width={24.8} height={2.4} rx={1.2} fill="#444a57" />
        </g>
      );
    case "designer":
      return (
        <g>
          <rect x={-11} y={15} width={22} height={17} rx={2.6} fill="#2f343f" />
          <rect x={-8.6} y={17.4} width={7.4} height={5.4} rx={0.8} fill="none" stroke="#a99be0" strokeWidth={1.1} />
          <rect x={1} y={17.4} width={7.4} height={5.4} rx={0.8} fill="#f08fa8" />
          <rect x={-8.6} y={24.6} width={17} height={5} rx={0.8} fill="none" stroke="#7cc4a8" strokeWidth={1.1} />
          <path d="M9 34 L15 22" stroke={a} strokeWidth={2} strokeLinecap="round" />
        </g>
      );
    case "marketer":
      return (
        <g transform="rotate(-18 0 24)">
          <path d="M-4 20 L10 12 V36 L-4 28Z" fill={a} />
          <ellipse cx={10} cy={24} rx={2.6} ry={12} fill={dark} />
          <rect x={-9} y={19.6} width={6} height={8.8} rx={2} fill="#2f343f" />
          <path d="M15 17 l3 -2 M16 24 h4 M15 31 l3 2" stroke={dark} strokeWidth={1.3} strokeLinecap="round" />
        </g>
      );
    case "growth":
      return (
        <g>
          {card()}
          <rect x={-8} y={26} width={4.4} height={6} rx={0.8} fill={a} opacity={0.55} stroke={OUT} strokeWidth={0.8} />
          <rect x={-2.2} y={23} width={4.4} height={9} rx={0.8} fill={a} opacity={0.8} stroke={OUT} strokeWidth={0.8} />
          <rect x={3.6} y={19.6} width={4.4} height={12.4} rx={0.8} fill={a} stroke={OUT} strokeWidth={0.8} />
        </g>
      );
    case "data":
      return (
        <g>
          {/* big magnifier over a pie: one bold silhouette */}
          <path d="M5.6 25 L13 33.4" stroke={OUT} strokeWidth={4.4} strokeLinecap="round" />
          <circle cx={-1} cy={18} r={10} fill="#e4f1fb" stroke={OUT} strokeWidth={2.6} />
          <circle cx={-1} cy={18} r={6} fill="#8fb8e8" />
          <path d="M-1 18 V12 A6 6 0 0 1 5 18Z" fill={a} />
          <Spec cx={-5} cy={12.6} rx={3} ry={1.3} o={0.7} r={-35} />
        </g>
      );
    case "investor":
      return (
        <g>
          <path d="M-5 17 V12.6 Q-5 10.4 -2.8 10.4 H2.8 Q5 10.4 5 12.6 V17" fill="none" stroke={OUT} strokeWidth={2.6} />
          <rect x={-13} y={16} width={26} height={18} rx={3} fill="#a0693f" stroke={OUT} strokeWidth={1.6} />
          <rect x={-13} y={23} width={26} height={2} fill={OUT} />
          <rect x={-3} y={21.2} width={6} height={5.6} rx={1} fill="#f2c25a" stroke={OUT} strokeWidth={1} />
          <Spec cx={-7} cy={19} rx={3.4} ry={1} o={0.45} r={-6} />
        </g>
      );
    case "student":
      return (
        <g>
          <rect x={-9.6} y={22} width={19.2} height={5.6} rx={1.4} fill="#8fb8e8" />
          <rect x={-8.6} y={16.6} width={17.2} height={5.6} rx={1.4} fill={a} />
          <rect x={-10} y={27.6} width={20} height={6} rx={1.4} fill="#f08fa8" />
          <path d="M-7 19.4 h14 M-7 30.6 h14" stroke="#fff" strokeWidth={0.8} opacity={0.7} />
        </g>
      );
    case "pm":
      return (
        <g>
          <rect x={-12} y={14.6} width={24} height={20} rx={2.4} fill={PAPER} stroke={OUT} strokeWidth={1.3} />
          <rect x={-9.4} y={17.4} width={8} height={7} rx={1} fill="#f2c25a" transform="rotate(-4 -5 21)" />
          <rect x={0.6} y={17.4} width={8} height={7} rx={1} fill="#f08fa8" transform="rotate(3 4 21)" />
          <rect x={-9.4} y={26} width={8} height={7} rx={1} fill="#7cc4a8" transform="rotate(3 -5 29)" />
          <rect x={0.6} y={26} width={8} height={7} rx={1} fill="#8fb8e8" transform="rotate(-3 4 29)" />
        </g>
      );
    case "curious":
      return (
        <g>
          <path d="M0 30 C-1.4 24 2 20 0 14" fill="none" stroke={OUT} strokeWidth={1.4} />
          <circle cx={0} cy={1} r={13} fill={a} stroke={dark} strokeWidth={1.6} />
          <Spec cx={-5} cy={-5} rx={4} ry={2} o={0.55} r={-35} />
          <path d="M-4.4 -2.6 Q-4.4 -7.6 0 -7.6 Q4.6 -7.6 4.6 -3.2 Q4.6 0 0 2 V4.4" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={0} cy={9} r={2} fill="#fff" />
          <path d="M-2 13.8 h4 l-2 2.8z" fill={dark} />
        </g>
      );
    default:
      return null;
  }
}
