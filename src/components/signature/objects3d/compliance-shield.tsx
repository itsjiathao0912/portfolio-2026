"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { LazyStage } from "./lazy-stage";
import { PALETTE } from "./shapes";

const Scene = dynamic(() => import("./compliance-shield-scene"), {
  ssr: false,
  loading: () => null,
});

export type ComplianceShieldProps = {
  /** Threat chips that bounce off the shield. */
  threats?: string[];
  /** Accessible summary of what the shield stands for. */
  label?: string;
  className?: string;
  /** Box height in px (width is 100%). */
  height?: number;
};

const DEFAULT_THREATS = ["fraud", "data leak", "AML flag"];

/** Static, same-content fallback (reduced motion, no WebGL, before load). */
export function ShieldFallback({
  threats = DEFAULT_THREATS,
}: {
  threats?: string[];
}) {
  const spots = [
    { left: "8%", top: "18%" },
    { right: "6%", top: "30%" },
    { left: "14%", bottom: "16%" },
    { right: "12%", bottom: "12%" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
      }}
    >
      <svg
        viewBox="0 0 160 190"
        width="44%"
        style={{ maxWidth: 220 }}
        aria-hidden
      >
        <defs>
          <linearGradient id="o3d-shield" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={PALETTE.sky} stopOpacity="0.9" />
            <stop offset="1" stopColor={PALETTE.blue} stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <path
          d="M80 6 C108 6 130 14 150 18 L150 82 C150 130 112 166 80 184 C48 166 10 130 10 82 L10 18 C30 14 52 6 80 6Z"
          fill="url(#o3d-shield)"
          stroke={PALETTE.navy}
          strokeOpacity="0.25"
          strokeWidth="3"
        />
        <path
          d="M48 96 L70 118 L114 70"
          fill="none"
          stroke="#fff"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {threats.slice(0, 4).map((t, i) => (
        <span
          key={t}
          aria-hidden
          style={{
            position: "absolute",
            ...spots[i],
            font: "600 12px/1 var(--font-sans, system-ui)",
            padding: "6px 10px",
            borderRadius: 999,
            background: "#fff",
            border: `1.5px solid ${[PALETTE.rose, PALETTE.gold, PALETTE.lavender, PALETTE.mint][i]}`,
            color: PALETTE.navy,
            textDecoration: "line-through",
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

/**
 * Glassy 3D shield that turns to face the pointer (or touch); threat chips bounce off it.
 * Keyboard: the "Send a threat" button launches a chip; the hit count is announced politely.
 */
export function ComplianceShield({
  threats = DEFAULT_THREATS,
  label = "A glass shield deflecting compliance threats: " +
    DEFAULT_THREATS.join(", "),
  className,
  height = 420,
}: ComplianceShieldProps) {
  const pointer = useRef({ x: 0, y: 0 });
  const spawn = useRef(0);
  const hits = useRef(0);
  const [blocked, setBlocked] = useState(0);

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    pointer.current = {
      x: ((e.clientX - r.left) / r.width) * 2 - 1,
      y: ((e.clientY - r.top) / r.height) * 2 - 1,
    };
  }, []);
  const onHit = useCallback(() => {
    hits.current += 1;
    setBlocked((b) => b + 1);
  }, []);

  return (
    <div className={className}>
      <div
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => (pointer.current = { x: 0, y: 0 })}
        style={{ touchAction: "pan-y" }}
      >
        <LazyStage
          label={label}
          fallback={<ShieldFallback threats={threats} />}
          style={{
            height,
            borderRadius: 24,
            overflow: "hidden",
            background: `radial-gradient(circle at 50% 45%, #eaf1ff 0%, #ffffff 70%)`,
          }}
        >
          {(active) => (
            <Scene
              active={active}
              labels={threats}
              pointer={pointer}
              spawn={spawn}
              hits={hits}
              onHit={onHit}
            />
          )}
        </LazyStage>
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <button
          type="button"
          onClick={() => (spawn.current += 1)}
          style={{
            font: "600 14px/1 var(--font-sans, system-ui)",
            padding: "10px 16px",
            borderRadius: 999,
            border: `1.5px solid ${PALETTE.navy}`,
            background: "#fff",
            color: PALETTE.navy,
            cursor: "pointer",
          }}
        >
          Send a threat
        </button>
        <span
          style={{
            font: "500 14px/1.2 var(--font-sans, system-ui)",
            color: "#6b6c72",
          }}
        >
          {blocked > 0
            ? `${blocked} blocked`
            : "Move your cursor or tap to steer the shield"}
        </span>
      </div>
    </div>
  );
}
