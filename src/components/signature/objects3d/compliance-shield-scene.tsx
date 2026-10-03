"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { DPR_CAP, lerp, lookAt, spawnChip, stepChip, type Chip } from "./math";
import { PALETTE, checkShape, shieldShape } from "./shapes";

const R = 1.15; // collision radius of the shield (scene units)

type Live = Chip & { label: string; age: number; color: string };

function Shield({
  pointer,
  hits,
}: {
  pointer: React.RefObject<{ x: number; y: number }>;
  hits: React.RefObject<number>;
}) {
  const lastHits = useRef(0);
  const g = useRef<THREE.Group>(null);
  const flash = useRef(0);
  const glass = useRef<THREE.MeshPhysicalMaterial>(null);
  const geo = useMemo(
    () =>
      new THREE.ExtrudeGeometry(shieldShape(), {
        depth: 0.18,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.06,
        bevelSegments: 6,
        curveSegments: 32,
      }).center(),
    [],
  );
  const check = useMemo(
    () =>
      new THREE.ExtrudeGeometry(checkShape(), {
        depth: 0.08,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelSegments: 3,
      }).center(),
    [],
  );
  useFrame((_, dt) => {
    const t = lookAt(pointer.current?.x ?? 0, pointer.current?.y ?? 0);
    if (g.current) {
      g.current.rotation.x = lerp(
        g.current.rotation.x,
        t.x,
        Math.min(1, dt * 5),
      );
      g.current.rotation.y = lerp(
        g.current.rotation.y,
        t.y,
        Math.min(1, dt * 5),
      );
    }
    if ((hits.current ?? 0) !== lastHits.current) {
      lastHits.current = hits.current ?? 0;
      flash.current = 0.9;
    }
    flash.current = Math.max(0, flash.current - dt * 2);
    if (glass.current) glass.current.emissiveIntensity = 0.15 + flash.current;
  });
  return (
    <group ref={g}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial
          ref={glass}
          color={PALETTE.sky}
          emissive={PALETTE.blue}
          emissiveIntensity={0.15}
          transmission={0.85}
          thickness={0.6}
          roughness={0.12}
          ior={1.35}
          clearcoat={1}
          transparent
          opacity={0.95}
        />
      </mesh>
      <mesh geometry={check} position={[0, 0.05, 0.2]}>
        <meshStandardMaterial
          color={PALETTE.white}
          emissive={PALETTE.blue}
          emissiveIntensity={0.25}
        />
      </mesh>
    </group>
  );
}

/** Writes a chip's DOM state (kept outside components so the render loop can mutate the DOM). */
function paintChip(el: HTMLSpanElement, c: Live | null, ndcX: number, ndcY: number) {
  if (!c) {
    el.style.opacity = "0";
    return;
  }
  el.style.left = `${(ndcX * 0.5 + 0.5) * 100}%`;
  el.style.top = `${(-ndcY * 0.5 + 0.5) * 100}%`;
  if (el.textContent !== c.label) el.textContent = c.label;
  el.style.borderColor = c.color;
  el.style.opacity = String(Math.max(0, 1 - Math.max(0, c.age - 3)));
  el.style.textDecoration = c.bounced ? "line-through" : "none";
}

function Chips({
  labels,
  spawn,
  onHit,
  spansRef,
}: {
  labels: string[];
  spawn: React.RefObject<number>;
  onHit: () => void;
  spansRef: React.RefObject<(HTMLSpanElement | null)[]>;
}) {
  const colors = [PALETTE.rose, PALETTE.gold, PALETTE.lavender];
  const live = useRef<Live[]>([]);
  const v = useRef(new THREE.Vector3());
  const timer = useRef(0.4);
  const seen = useRef(0);
  const k = useRef(0);
  const slots = labels.length * 2;

  useFrame(({ camera }, raw) => {
    const dt = Math.min(raw, 1 / 30);
    timer.current -= dt;
    const manual = (spawn.current ?? 0) !== seen.current;
    if ((timer.current <= 0 || manual) && live.current.length < slots) {
      seen.current = spawn.current ?? 0;
      timer.current = 1.6;
      const i = k.current++ % labels.length;
      const angle = Math.random() * Math.PI * 2;
      live.current.push({
        ...spawnChip(angle, 4.2, 2.6, (Math.random() - 0.5) * 0.5),
        label: labels[i],
        age: 0,
        color: colors[i % colors.length],
      });
    }
    live.current = live.current
      .map((c) => {
        const n = stepChip(c, dt, R);
        if (n.bounced && !c.bounced) onHit();
        return { ...c, ...n, age: c.age + dt };
      })
      .filter((c) => c.age < 4 && Math.hypot(c.x, c.y) < 6);
    for (let s = 0; s < slots; s++) {
      const el = spansRef.current?.[s];
      const c = live.current[s];
      if (!el) continue;
      if (!c) {
        paintChip(el, null, 0, 0);
        continue;
      }
      const p = v.current.set(c.x, c.y, 0.4).project(camera);
      paintChip(el, c, p.x, p.y);
    }
  });

  return null;
}

const CHIP_STYLE: React.CSSProperties = {
  display: "inline-block",
  whiteSpace: "nowrap",
  font: "600 12px/1 var(--font-sans, system-ui)",
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.92)",
  border: "1.5px solid",
  color: PALETTE.navy,
  boxShadow: "0 4px 12px rgba(11,31,77,0.12)",
  position: "absolute",
  transform: "translate(-50%, -50%)",
  opacity: 0,
  pointerEvents: "none",
};

export default function ComplianceShieldScene({
  active,
  labels,
  pointer,
  spawn,
  hits,
  onHit,
}: {
  active: boolean;
  labels: string[];
  pointer: React.RefObject<{ x: number; y: number }>;
  spawn: React.RefObject<number>;
  hits: React.RefObject<number>;
  onHit: () => void;
}) {
  const spans = useRef<(HTMLSpanElement | null)[]>([]);
  const slots = labels.length * 2;
  return (
    <>
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={DPR_CAP}
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        style={{ position: "absolute", inset: 0 }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        <pointLight
          position={[-3, -2, 3]}
          intensity={6}
          color={PALETTE.lavender}
        />
        <Shield pointer={pointer} hits={hits} />
        <Chips labels={labels} spawn={spawn} onHit={onHit} spansRef={spans} />
      </Canvas>
      {Array.from({ length: slots }, (_, i) => (
        <span
          key={i}
          aria-hidden
          ref={(el) => void (spans.current[i] = el)}
          style={CHIP_STYLE}
        />
      ))}
    </>
  );
}
