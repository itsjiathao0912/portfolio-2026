"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { DPR_CAP } from "./math";
import { PALETTE, bubbleShape, checkShape, shieldShape } from "./shapes";

export type TokenKind = "coin" | "card" | "receipt" | "shield" | "chat";

function Coin() {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 0.12, 48]} />
        <meshStandardMaterial
          color={PALETTE.gold}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0, 0.065, 0]}>
        <torusGeometry args={[0.36, 0.03, 12, 48]} />
        <meshStandardMaterial color="#fff2c4" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Card() {
  return (
    <group>
      <RoundedBox args={[1.2, 0.76, 0.05]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial
          color={PALETTE.blue}
          clearcoat={1}
          roughness={0.3}
        />
      </RoundedBox>
      <mesh position={[-0.34, 0.08, 0.03]}>
        <boxGeometry args={[0.2, 0.15, 0.02]} />
        <meshStandardMaterial
          color={PALETTE.gold}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0.1, -0.2, 0.03]}>
        <boxGeometry args={[0.8, 0.05, 0.01]} />
        <meshStandardMaterial color={PALETTE.sky} />
      </mesh>
    </group>
  );
}

function Receipt() {
  const lines = [0.22, 0.1, -0.02, -0.14];
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.62, 0.9, 0.02]} />
        <meshStandardMaterial color={PALETTE.white} roughness={0.9} />
      </mesh>
      {lines.map((y, i) => (
        <mesh key={y} position={[i % 2 ? 0.04 : -0.04, y, 0.012]}>
          <boxGeometry args={[i % 2 ? 0.36 : 0.44, 0.035, 0.005]} />
          <meshBasicMaterial color={PALETTE.navy} />
        </mesh>
      ))}
      <mesh position={[0, -0.32, 0.012]}>
        <boxGeometry args={[0.44, 0.08, 0.005]} />
        <meshBasicMaterial color={PALETTE.mint} />
      </mesh>
    </group>
  );
}

function MiniShield() {
  const geo = useMemo(
    () =>
      new THREE.ExtrudeGeometry(shieldShape(0.8, 0.95), {
        depth: 0.1,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.03,
        bevelSegments: 3,
      }).center(),
    [],
  );
  const check = useMemo(
    () =>
      new THREE.ExtrudeGeometry(checkShape(), {
        depth: 0.04,
        bevelEnabled: false,
      }).center(),
    [],
  );
  return (
    <group>
      <mesh geometry={geo}>
        <meshPhysicalMaterial
          color={PALETTE.lavender}
          clearcoat={1}
          roughness={0.2}
        />
      </mesh>
      <mesh geometry={check} position={[0, 0, 0.1]} scale={0.45}>
        <meshStandardMaterial color={PALETTE.white} />
      </mesh>
    </group>
  );
}

function Chat() {
  const geo = useMemo(
    () =>
      new THREE.ExtrudeGeometry(bubbleShape(), {
        depth: 0.12,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.03,
        bevelSegments: 3,
      }).center(),
    [],
  );
  return (
    <group>
      <mesh geometry={geo}>
        <meshPhysicalMaterial
          color={PALETTE.rose}
          clearcoat={1}
          roughness={0.25}
        />
      </mesh>
      {[-0.2, 0, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.08, 0.12]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color={PALETTE.white} />
        </mesh>
      ))}
    </group>
  );
}

const MODELS: Record<TokenKind, () => React.JSX.Element> = {
  coin: Coin,
  card: Card,
  receipt: Receipt,
  shield: MiniShield,
  chat: Chat,
};

/** One token: floats; on hover/tap it gets a spin impulse and a pop, then springs back. */
function Token({
  kind,
  position,
  seed,
}: {
  kind: TokenKind;
  position: [number, number, number];
  seed: number;
}) {
  const g = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const scale = useRef(1);
  const target = useRef(1);
  const Model = MODELS[kind];

  const poke = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    spin.current += 9;
    target.current = 1.25;
  };

  useFrame((_, raw) => {
    const dt = Math.min(raw, 1 / 30);
    if (!g.current) return;
    spin.current *= Math.exp(-dt * 2.2); // angular damping
    g.current.rotation.y += (0.25 + spin.current) * dt;
    // critically-damped-ish spring for scale
    scale.current += (target.current - scale.current) * Math.min(1, dt * 10);
    target.current += (1 - target.current) * Math.min(1, dt * 3);
    g.current.scale.setScalar(scale.current);
  });

  return (
    <Float
      speed={1.2 + (seed % 3) * 0.3}
      rotationIntensity={0.4}
      floatIntensity={0.8}
      floatingRange={[-0.08, 0.08]}
    >
      <group
        ref={g}
        position={position}
        onPointerOver={poke}
        onPointerDown={poke}
      >
        <Model />
      </group>
    </Float>
  );
}

export default function StoryTokensScene({
  active,
  kinds,
}: {
  active: boolean;
  kinds: TokenKind[];
}) {
  const n = kinds.length;
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={DPR_CAP}
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 4, 5]} intensity={1.8} />
      <pointLight position={[-3, -1, 3]} intensity={6} color={PALETTE.sky} />
      {kinds.map((k, i) => {
        const x = n > 1 ? -2.8 + (5.6 * i) / (n - 1) : 0;
        const y = i % 2 ? -0.35 : 0.35;
        return <Token key={k + i} kind={k} seed={i} position={[x, y, 0]} />;
      })}
    </Canvas>
  );
}
