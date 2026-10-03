// Clay figure parts. Original design brief (the originality guard):
//   - rounded bean bodies, dot eyes, mitten hands, no fingers, no logos;
//   - no licensed likeness: shapes are drawn from primitives here, nothing is
//     traced or copied from any mascot, stock render or third-party SVG;
//   - soft plasticine look from radial gradients, a specular highlight and a
//     gradient contact shadow. No SVG filters, no images, no external urls.
// Roles: recruiter (blazer + CV sheet), founder (hoodie + laptop with sticker),
// engineer (headphones + laptop), product designer (paint-chip card),
// marketer (speech-bubble sign), growth (rising bars), data (round glasses +
// chart card), investor (vest + coin stack), student (backpack + book),
// fellow PM (sticky-note board), just curious (magnifier).

import type { CSSProperties, ReactNode } from "react";
import { INK, PAPER, SHOE, mix, shade, type Shade } from "./palette";
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

export function Shadow({ uid, scale }: { uid: string; scale: number }) {
  return <ellipse cx={50} cy={144} rx={26 * scale} ry={5 * scale} fill={url(uid, "g")} style={{ transition: ease, transformBox: "fill-box", transformOrigin: "center" }} />;
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
      <ellipse cx={1.2} cy={34.2} rx={8.4} ry={4.8} fill={SHOE} />
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

function Eyes({ blinking, glasses }: { blinking: boolean; glasses: boolean }) {
  const eye = (cx: number) => (
    <g style={{ transformBox: "fill-box", transformOrigin: "center", transform: blinking ? "scaleY(0.12)" : "scaleY(1)", transition: "transform 90ms ease-out" }}>
      <ellipse cx={cx} cy={39.4} rx={2.3} ry={2.7} fill={INK} />
      <circle cx={cx - 0.7} cy={38.4} r={0.75} fill="#fff" opacity={0.9} />
    </g>
  );
  return (
    <>
      {eye(42)}
      {eye(58)}
      {glasses && (
        <g fill="none" stroke={INK} strokeWidth={1.3} opacity={0.88}>
          <circle cx={42} cy={39.4} r={6.4} />
          <circle cx={58} cy={39.4} r={6.4} />
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
        <ellipse cx={50} cy={47.8} rx={3.4} ry={2.8} fill="#6f2b2b" />
        <ellipse cx={50} cy={49.2} rx={2}  ry={1.1} fill="#d9777a" />
      </>
    );
  if (kind === "grin") return <path d="M43.6 45.6 Q50 52.4 56.4 45.6 Q50 48 43.6 45.6Z" fill="#6f2b2b" stroke={INK} strokeWidth={1} strokeLinejoin="round" />;
  return <path d="M44.6 46.4 Q50 50.6 55.4 46.4" fill="none" stroke={INK} strokeWidth={1.7} strokeLinecap="round" />;
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
      <Spec cx={41} cy={25.6} rx={7.4} ry={3.4} o={0.38} />
      <ellipse cx={37.6} cy={45.4} rx={5} ry={3.4} fill={url(uid, "c")} />
      <ellipse cx={62.4} cy={45.4} rx={5} ry={3.4} fill={url(uid, "c")} />
      <g stroke={look.hair} strokeWidth={1.7} strokeLinecap="round" fill="none" opacity={0.78}>
        <path d="M37.6 33 Q42 31.2 46.2 33" />
        <path d="M53.8 33 Q58 31.2 62.4 33" />
      </g>
      <Eyes blinking={blinking} glasses={!!glasses} />
      <Mouth kind={pose.mouth} />
      {/* faint clay speckle: a hand-worked texture without any filter */}
      <g fill={mix(look.skin, "#5a2c20", 0.5)} opacity={0.1}>
        <circle cx={34} cy={34} r={0.55} /><circle cx={63} cy={29} r={0.5} /><circle cx={55} cy={51} r={0.5} />
      </g>
      <HairFront look={look} />
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
      <Spec cx={39} cy={72} rx={7} ry={3} o={0.3} r={-30} />
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
          <circle cx={60} cy={73} r={4.6} fill={url(uid, "a")} />
          <path d="M57.6 74.6 l2.4 -3 l2.4 3" fill="none" stroke="#fff" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
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
          <path d="M50 66 l3 10 l-3 8 l-3 -8Z" fill={url(uid, "a")} />
          <path d="M31 70 L43 58 L48 84 L30 96Z M69 70 L57 58 L52 84 L70 96Z" fill={dark} opacity={0.18} />
        </g>
      )}
      {role === "student" && <path d="M38 60 L36 100 M62 60 L64 100" stroke={shade(look.bottom).mid} strokeWidth={4.4} strokeLinecap="round" opacity={0.9} />}
      {role === "pm" && <rect x={54} y={72} width={8} height={8} rx={1.4} fill={url(uid, "a")} transform="rotate(8 58 76)" />}
      {role === "marketer" && <path d="M44 60 Q50 66 56 60" fill="none" stroke={light} strokeWidth={2} strokeLinecap="round" />}
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
  if (role !== "engineer") return null;
  const a = url(look.uid, "a");
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

const card = () => <rect x={-10} y={19} width={20} height={14} rx={2.6} fill={PAPER} stroke="#d9d4ca" strokeWidth={0.8} />;

/** Prop art in the hand's local frame (hand at 0,29.6; box about 24 x 22). */
export function Prop({ look, role }: { look: Look; role: string }) {
  const { uid } = look;
  const a = url(uid, "a");
  const dark = shade(look.accent).dark;
  switch (role) {
    case "recruiter":
      return (
        <g>
          <rect x={-8.6} y={13} width={17.2} height={22} rx={2} fill={PAPER} stroke="#d9d4ca" strokeWidth={0.8} />
          <rect x={-5.4} y={16.4} width={6.4} height={6.4} rx={3.2} fill={a} />
          <path d="M-5.4 26 h10.8 M-5.4 29.2 h10.8 M-5.4 32 h7" stroke="#bdb6a8" strokeWidth={1.1} strokeLinecap="round" />
        </g>
      );
    case "founder":
      return (
        <g>
          <rect x={-11} y={16.6} width={22} height={15} rx={2.6} fill="#c9ced6" stroke="#9ba2ae" strokeWidth={0.8} />
          <circle cx={3} cy={24} r={3.8} fill={a} />
          <path d="M3 21.8 l.8 1.6 l1.7 .2 l-1.3 1.2 l.4 1.7 l-1.6 -.9 l-1.6 .9 l.4 -1.7 l-1.3 -1.2 l1.7 -.2z" fill="#fff" />
          <rect x={-12.4} y={31.6} width={24.8} height={2.4} rx={1.2} fill="#9ba2ae" />
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
          {card()}
          <g>
            <rect x={-8} y={21} width={3.6} height={7} rx={0.8} fill="#f08fa8" /><rect x={-4} y={21} width={3.6} height={7} rx={0.8} fill="#f2c25a" />
            <rect x={0} y={21} width={3.6} height={7} rx={0.8} fill="#7cc4a8" /><rect x={4} y={21} width={3.6} height={7} rx={0.8} fill="#8fb8e8" />
          </g>
          <rect x={-6} y={28.8} width={12} height={2} rx={1} fill="#e4dfd4" />
        </g>
      );
    case "marketer":
      return (
        <g>
          <rect x={-1} y={20} width={2.4} height={14} rx={1.2} fill="#c9a97a" />
          <path d="M-12 -2 h22 a4 4 0 0 1 4 4 v9 a4 4 0 0 1 -4 4 h-9 l-5 5 v-5 h-4 a4 4 0 0 1 -4 -4 v-9 a4 4 0 0 1 4 -4z" fill={a} transform="translate(-1 2)" />
          <g fill="#fff"><circle cx={-6} cy={8} r={1.5} /><circle cx={-1} cy={8} r={1.5} /><circle cx={4} cy={8} r={1.5} /></g>
        </g>
      );
    case "growth":
      return (
        <g>
          {card()}
          <rect x={-7} y={27} width={3.4} height={4.6} rx={0.8} fill={a} opacity={0.5} />
          <rect x={-2.4} y={24} width={3.4} height={7.6} rx={0.8} fill={a} opacity={0.75} />
          <rect x={2.2} y={20.6} width={3.4} height={11} rx={0.8} fill={a} />
        </g>
      );
    case "data":
      return (
        <g>
          {card()}
          <path d="M-7.6 29.6 L-3.4 25.2 L0.6 27.6 L7 21.4" fill="none" stroke={dark} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={7} cy={21.4} r={1.4} fill={a} />
        </g>
      );
    case "investor":
      return (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <ellipse cx={0} cy={31 - i * 4.2} rx={9} ry={3.4} fill={dark} />
              <ellipse cx={0} cy={30 - i * 4.2} rx={9} ry={3.4} fill={a} />
            </g>
          ))}
        </g>
      );
    case "student":
      return (
        <g>
          <rect x={-8.6} y={14.6} width={17.2} height={20} rx={2.2} fill={a} />
          <rect x={-8.6} y={14.6} width={3.2} height={20} rx={1.4} fill={dark} opacity={0.5} />
          <rect x={-2.6} y={19} width={8.6} height={2.2} rx={1.1} fill="#fff" opacity={0.85} />
        </g>
      );
    case "pm":
      return (
        <g>
          <rect x={-12} y={14.6} width={24} height={20} rx={2.4} fill={PAPER} stroke="#d9d4ca" strokeWidth={0.8} />
          <rect x={-9.4} y={17.4} width={8} height={7} rx={1} fill="#f2c25a" transform="rotate(-4 -5 21)" />
          <rect x={0.6} y={17.4} width={8} height={7} rx={1} fill="#f08fa8" transform="rotate(3 4 21)" />
          <rect x={-9.4} y={26} width={8} height={7} rx={1} fill="#7cc4a8" transform="rotate(3 -5 29)" />
          <rect x={0.6} y={26} width={8} height={7} rx={1} fill="#8fb8e8" transform="rotate(-3 4 29)" />
        </g>
      );
    case "curious":
      return (
        <g>
          <rect x={4.6} y={30} width={3.6} height={11} rx={1.8} fill="#7a5a3c" transform="rotate(-38 6.4 30)" />
          <circle cx={-1} cy={22} r={9} fill="#cfe6f6" fillOpacity={0.55} stroke="#4a4f5c" strokeWidth={2.2} />
          <ellipse cx={-4} cy={18.6} rx={3} ry={1.5} fill="#fff" opacity={0.7} transform="rotate(-35 -4 18.6)" />
        </g>
      );
    default:
      return null;
  }
}
