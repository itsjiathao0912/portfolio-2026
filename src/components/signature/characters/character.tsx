"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { SPRING } from "@/components/motion/springs";
import { CAST, blinkDelay, pupilOffset, type CharacterName, type Expression, type Pose } from "./logic";

/**
 * The cast: original characters drawn for this site, same family as Noto
 * (thick black outline, flat fill, dot eyes, rosy cheeks). Not based on any
 * brand mascot or existing character.
 *
 * Every character shares a 100x110 frame: body art + a shared face rig, so
 * blinking, look-at and expressions behave the same across the cast.
 */
const OUT = { stroke: "#000", strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

type Art = { body: ReactNode; eyes: [number, number][]; mouth: [number, number]; cheeks?: boolean; arms: { l: [number, number]; r: [number, number] }; armColor: string };

function builder(skin: string, hair: ReactNode, top: string): Art {
  return {
    body: (
      <>
        <path d="M24 106c0-20 11-30 26-30s26 10 26 30z" fill={top} {...OUT} />
        <circle cx="50" cy="46" r="24" fill={skin} {...OUT} />
        {hair}
      </>
    ),
    eyes: [[41, 48], [59, 48]],
    mouth: [50, 58],
    cheeks: true,
    arms: { l: [33, 90], r: [67, 90] },
    armColor: top,
  };
}

const ART: Record<CharacterName, Art> = {
  // Audit: a round-shouldered shield with a tick badge.
  audit: {
    body: (
      <>
        <path d="M50 12l32 11v28c0 26-17 41-32 51C35 92 18 77 18 51V23z" fill="#bfdbfe" {...OUT} />
        <path d="M50 20l24 8v22c0 19-12 31-24 39" fill="#93c5fd" stroke="none" />
        <circle cx="50" cy="80" r="8" fill="#22c55e" {...OUT} strokeWidth={2.5} />
        <path d="M46 80l3 3 5-6" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    eyes: [[41, 46], [59, 46]],
    mouth: [50, 58],
    cheeks: true,
    arms: { l: [20, 58], r: [80, 58] },
    armColor: "#bfdbfe",
  },
  // Sprout: a seedling in a pot, two leaves that double as hair.
  sprout: {
    body: (
      <>
        <path d="M50 30c-2-10-10-18-22-16 0 12 9 18 22 16z" fill="#4ade80" {...OUT} />
        <path d="M50 30c2-12 12-20 26-17-1 13-12 20-26 17z" fill="#86efac" {...OUT} />
        <path d="M50 30v10" {...OUT} fill="none" />
        <path d="M26 68h48l-6 38H32z" fill="#fdba74" {...OUT} />
        <rect x="22" y="40" width="56" height="30" rx="14" fill="#bbf7d0" {...OUT} />
      </>
    ),
    eyes: [[41, 53], [59, 53]],
    mouth: [50, 61],
    cheeks: true,
    arms: { l: [24, 58], r: [76, 58] },
    armColor: "#bbf7d0",
  },
  // Settle: a coin with a ridged rim and a little "S-bar" mark on its cheek.
  settle: {
    body: (
      <>
        <circle cx="50" cy="56" r="38" fill="#fcd34d" {...OUT} />
        <circle cx="50" cy="56" r="30" fill="none" stroke="#d97706" strokeWidth={2} strokeDasharray="3 5" />
        <path d="M76 70h8M80 66v8" stroke="#d97706" strokeWidth={2.5} strokeLinecap="round" />
      </>
    ),
    eyes: [[41, 52], [59, 52]],
    mouth: [50, 63],
    cheeks: true,
    arms: { l: [13, 60], r: [87, 60] },
    armColor: "#fcd34d",
  },
  linh: builder("#f2c7a5", <path d="M26 44c0-18 12-26 24-26s24 8 24 26c-6-8-14-12-24-12s-18 4-24 12z" fill="#1f2937" {...OUT} />, "#2563eb"),
  mai: builder(
    "#c98e6a",
    <>
      <circle cx="50" cy="16" r="9" fill="#3f1d0b" {...OUT} />
      <path d="M26 46c0-16 10-25 24-25s24 9 24 25c-5-6-13-10-24-10s-19 4-24 10z" fill="#3f1d0b" {...OUT} />
    </>,
    "#db2777",
  ),
  an: builder(
    "#8d5a3b",
    <path d="M24 50c-2-20 10-32 26-32s28 12 26 32l-6-4c0-10-8-16-20-16s-20 6-20 16z" fill="#7c3aed" {...OUT} />,
    "#059669",
  ),
};

const ARM_POSE: Record<Pose, { l: number; r: number }> = {
  idle: { l: 20, r: -20 },
  wave: { l: 20, r: -150 },
  jump: { l: 60, r: -60 },
  cheer: { l: 150, r: -150 },
};

function Face({ art, expression, blink, look }: { art: Art; expression: Expression; blink: boolean; look: { x: number; y: number } }) {
  const [mx, my] = art.mouth;
  return (
    <g>
      {art.eyes.map(([x, y], i) => {
        const closed = blink || (expression === "wink" && i === 1);
        return closed ? (
          <path key={i} d={`M${x - 3.5} ${y}q3.5 3 7 0`} fill="none" stroke="#000" strokeWidth={2.5} strokeLinecap="round" />
        ) : (
          <g key={i}>
            <circle cx={x} cy={y} r={expression === "wow" ? 4.6 : 3.8} fill="#fff" stroke="#000" strokeWidth={1.5} />
            <circle cx={x + look.x} cy={y + look.y} r={expression === "focus" ? 1.8 : 2.4} fill="#000" />
          </g>
        );
      })}
      {expression === "wow" ? (
        <ellipse cx={mx} cy={my + 1} rx={3.2} ry={4} fill="#7f1d1d" stroke="#000" strokeWidth={2} />
      ) : expression === "focus" ? (
        <path d={`M${mx - 4} ${my}h8`} stroke="#000" strokeWidth={2.5} strokeLinecap="round" />
      ) : (
        <path d={`M${mx - 6} ${my - 1}q6 6 12 0`} fill="none" stroke="#000" strokeWidth={2.5} strokeLinecap="round" />
      )}
      {art.cheeks ? (
        <>
          <circle cx={art.eyes[0][0] - 6} cy={art.eyes[0][1] + 7} r={2.8} fill="#fda4af" opacity={0.85} />
          <circle cx={art.eyes[1][0] + 6} cy={art.eyes[1][1] + 7} r={2.8} fill="#fda4af" opacity={0.85} />
        </>
      ) : null}
    </g>
  );
}

export type CharacterProps = {
  name: CharacterName;
  pose?: Pose;
  expression?: Expression;
  /** Pixel size of the square-ish frame (height = size * 1.1). */
  size?: number;
  /** Eyes follow the mouse / last touch. Default true. */
  lookAt?: boolean;
  /** Hop once when the character scrolls into view. Default true. */
  reactOnScroll?: boolean;
  /** Make it a button: click / tap / Enter / Space plays `activePose`. */
  interactive?: boolean;
  activePose?: Pose;
  /** Accessible name. Decorative (aria-hidden) when omitted and not interactive. */
  label?: string;
  className?: string;
};

/** <Character name pose expression />: one of the cast, alive (blinks, looks, reacts). */
export function Character({
  name, pose = "idle", expression = "happy", size = 96, lookAt = true, reactOnScroll = true,
  interactive = false, activePose = "wave", label, className,
}: CharacterProps) {
  const reduce = useReducedMotion();
  const art = ART[name];
  const ref = useRef<HTMLDivElement>(null);
  const [blink, setBlink] = useState(false);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [played, setPlayed] = useState<Pose | null>(null);
  const clip = useId();

  // Blink on a jittered timer (never in reduced motion).
  useEffect(() => {
    if (reduce) return;
    let t: number;
    const loop = () => {
      t = window.setTimeout(() => {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 130);
        loop();
      }, blinkDelay(Math.random()));
    };
    loop();
    return () => window.clearTimeout(t);
  }, [reduce]);

  // Look at the pointer (mouse move, or the last touch point).
  useEffect(() => {
    if (reduce || !lookAt) return;
    let raf = 0;
    const on = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        setLook(pupilOffset(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)));
      });
    };
    window.addEventListener("pointermove", on, { passive: true });
    window.addEventListener("pointerdown", on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", on);
      window.removeEventListener("pointerdown", on);
    };
  }, [reduce, lookAt]);

  useEffect(() => {
    if (!played) return;
    const id = window.setTimeout(() => setPlayed(null), 1100);
    return () => window.clearTimeout(id);
  }, [played]);

  const current: Pose = reduce ? "idle" : (played ?? pose);
  const arm = ARM_POSE[current];
  const bodyAnim = reduce
    ? {}
    : current === "jump"
      ? { y: [0, -14, 0, -6, 0], transition: { duration: 0.9 } }
      : current === "cheer"
        ? { rotate: [0, -4, 4, -2, 0], transition: { duration: 0.8 } }
        : { y: [0, -1.5, 0], transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const } };
  const shownExpr: Expression = played === "jump" || played === "cheer" ? "wow" : played === "wave" && expression === "focus" ? "happy" : expression;

  const meta = CAST[name];
  const svg = (
    <motion.svg
      viewBox="0 0 100 110"
      width={size}
      height={size * 1.1}
      overflow="visible"
      aria-hidden="true"
      focusable="false"
      initial={false}
      animate={bodyAnim}
      whileInView={reduce || !reactOnScroll ? undefined : { y: [0, -10, 0], transition: { duration: 0.6 } }}
      viewport={{ once: true, amount: 0.6 }}
    >
      <clipPath id={clip}><rect x="-20" y="-20" width="140" height="150" /></clipPath>
      {(["l", "r"] as const).map((side) => {
        const [x, y] = art.arms[side];
        const dir = side === "l" ? -1 : 1;
        return (
          <motion.g
            key={side}
            style={{ transformBox: "view-box", transformOrigin: `${x}px ${y}px` }}
            initial={false}
            animate={
              reduce
                ? { rotate: 0 }
                : current === "wave" && side === "r"
                  ? { rotate: [arm.r, arm.r + 25, arm.r, arm.r + 25, arm.r] }
                  : { rotate: side === "l" ? arm.l : arm.r }
            }
            transition={current === "wave" ? { duration: 0.9 } : SPRING.ui}
          >
            <path d={`M${x} ${y}l${dir * 0} 14`} fill="none" stroke="#000" strokeWidth={9} strokeLinecap="round" />
            <path d={`M${x} ${y}l${dir * 0} 14`} fill="none" stroke={art.armColor} strokeWidth={4.5} strokeLinecap="round" />
          </motion.g>
        );
      })}
      <g clipPath={`url(#${clip})`}>{art.body}</g>
      <Face art={art} expression={shownExpr} blink={blink} look={look} />
    </motion.svg>
  );

  if (interactive) {
    return (
      <div ref={ref} className={className}>
        <button
          type="button"
          aria-label={label ?? `${meta.label}, ${meta.role}. Say hi`}
          onClick={() => setPlayed(activePose)}
          className="cursor-pointer touch-manipulation rounded-2xl outline-offset-4 [-webkit-tap-highlight-color:transparent]"
          data-testid={`character-${name}`}
        >
          {svg}
        </button>
      </div>
    );
  }
  return (
    <div ref={ref} className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} data-testid={`character-${name}`}>
      {svg}
    </div>
  );
}
