"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { DPR_CAP, lerp, phoneYaw, screenIndex } from "./math";
import { PALETTE } from "./shapes";

const W = 1.5;
const H = 3.1;

function Phone({
  srcs,
  progress,
}: {
  srcs: string[];
  progress: React.RefObject<number>;
}) {
  const textures = useTexture(srcs);
  textures.forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
  });
  const g = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const shown = useRef(-1);
  const fade = useRef(1);

  useFrame((state, dt) => {
    const p = progress.current ?? 0;
    const n = srcs.length;
    const i = screenIndex(p, n);
    if (i !== shown.current && mat.current) {
      shown.current = i;
      mat.current.map = textures[i];
      mat.current.needsUpdate = true;
      fade.current = 0;
    }
    fade.current = Math.min(1, fade.current + dt * 4);
    if (mat.current) mat.current.color.setScalar(0.55 + 0.45 * fade.current);
    if (g.current) {
      const k = Math.min(1, dt * 6);
      g.current.rotation.y = lerp(
        g.current.rotation.y,
        phoneYaw(p, n) + 0.12,
        k,
      );
      g.current.rotation.x = lerp(
        g.current.rotation.x,
        -0.08 + Math.sin(state.clock.elapsedTime * 0.6) * 0.02,
        k,
      );
      g.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.04;
    }
  });

  return (
    <group ref={g}>
      <RoundedBox
        args={[W + 0.14, H + 0.14, 0.16]}
        radius={0.16}
        smoothness={6}
      >
        <meshPhysicalMaterial
          color={PALETTE.navy}
          metalness={0.5}
          roughness={0.3}
          clearcoat={1}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.081]}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial ref={mat} map={textures[0]} toneMapped={false} />
      </mesh>
      {/* original camera-pill detail */}
      <mesh position={[0, H / 2 - 0.12, 0.083]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.035, 0.22, 4, 12]} />
        <meshBasicMaterial color="#000" />
      </mesh>
    </group>
  );
}

export default function ScrollPhoneScene({
  active,
  srcs,
  progress,
}: {
  active: boolean;
  srcs: string[];
  progress: React.RefObject<number>;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={DPR_CAP}
      camera={{ position: [0, 0, 6], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 3, 4]} intensity={2} />
      <pointLight position={[-3, 1, 2]} intensity={8} color={PALETTE.blue} />
      <Suspense fallback={null}>
        <Phone srcs={srcs} progress={progress} />
      </Suspense>
    </Canvas>
  );
}
