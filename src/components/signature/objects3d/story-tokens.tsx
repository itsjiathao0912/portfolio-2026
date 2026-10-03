"use client";

import dynamic from "next/dynamic";
import { LazyStage } from "./lazy-stage";
import { PALETTE } from "./shapes";
import type { TokenKind } from "./story-tokens-scene";

const Scene = dynamic(() => import("./story-tokens-scene"), {
  ssr: false,
  loading: () => null,
});

export type { TokenKind };

export type StoryTokensProps = {
  kinds?: TokenKind[];
  height?: number;
  className?: string;
  /** Decorative by default; pass a label if the props carry meaning in context. */
  label?: string;
};

const DEFAULT_KINDS: TokenKind[] = [
  "coin",
  "card",
  "receipt",
  "shield",
  "chat",
];

const ICONS: Record<TokenKind, React.JSX.Element> = {
  coin: (
    <>
      <circle cx="24" cy="24" r="18" fill={PALETTE.gold} />
      <circle
        cx="24"
        cy="24"
        r="12"
        fill="none"
        stroke="#fff2c4"
        strokeWidth="3"
      />
    </>
  ),
  card: (
    <>
      <rect x="4" y="12" width="40" height="26" rx="4" fill={PALETTE.blue} />
      <rect x="9" y="19" width="8" height="6" fill={PALETTE.gold} />
    </>
  ),
  receipt: (
    <>
      <rect
        x="12"
        y="6"
        width="24"
        height="36"
        fill="#fff"
        stroke={PALETTE.navy}
        strokeOpacity=".2"
      />
      <rect x="16" y="14" width="16" height="2" fill={PALETTE.navy} />
      <rect x="16" y="20" width="12" height="2" fill={PALETTE.navy} />
      <rect x="16" y="32" width="16" height="4" fill={PALETTE.mint} />
    </>
  ),
  shield: (
    <>
      <path
        d="M24 5 C32 5 38 7 42 8 L42 24 C42 34 33 41 24 44 C15 41 6 34 6 24 L6 8 C10 7 16 5 24 5Z"
        fill={PALETTE.lavender}
      />
      <path
        d="M16 25 L22 31 L33 18"
        fill="none"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </>
  ),
  chat: (
    <>
      <path
        d="M8 10 H40 A4 4 0 0 1 44 14 V30 A4 4 0 0 1 40 34 H22 L14 42 L15 34 H8 A4 4 0 0 1 4 30 V14 A4 4 0 0 1 8 10Z"
        fill={PALETTE.rose}
      />
      {[16, 24, 32].map((x) => (
        <circle key={x} cx={x} cy="22" r="2.5" fill="#fff" />
      ))}
    </>
  ),
};

export function TokensFallback({
  kinds = DEFAULT_KINDS,
}: {
  kinds?: TokenKind[];
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "0 4%",
      }}
    >
      {kinds.map((k, i) => (
        <svg
          key={k + i}
          viewBox="0 0 48 48"
          width="14%"
          style={{
            maxWidth: 96,
            transform: `translateY(${i % 2 ? 12 : -12}px)`,
          }}
          aria-hidden
        >
          {ICONS[k]}
        </svg>
      ))}
    </div>
  );
}

/** Floating 3D story props (coin, card, receipt, shield, chat bubble). Hover or tap one to spin it. */
export function StoryTokens({
  kinds = DEFAULT_KINDS,
  height = 240,
  className,
  label = "Floating payment and community icons: coin, card, receipt, shield, chat bubble",
}: StoryTokensProps) {
  return (
    <LazyStage
      className={className}
      label={label}
      style={{ height }}
      fallback={<TokensFallback kinds={kinds} />}
    >
      {(active) => <Scene active={active} kinds={kinds} />}
    </LazyStage>
  );
}
