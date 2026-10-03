import { describe, expect, test } from "bun:test";
import {
  canUse3D,
  lookAt,
  phoneYaw,
  screenIndex,
  sectionProgress,
  spawnChip,
  stepChip,
} from "../../src/components/signature/objects3d/math";

describe("objects3d math", () => {
  test("sectionProgress clamps 0..1", () => {
    expect(sectionProgress(100, 3000, 1000)).toBe(0);
    expect(sectionProgress(-1000, 3000, 1000)).toBe(0.5);
    expect(sectionProgress(-5000, 3000, 1000)).toBe(1);
  });
  test("screenIndex covers every screen and never overflows", () => {
    expect(screenIndex(0, 4)).toBe(0);
    expect(screenIndex(0.26, 4)).toBe(1);
    expect(screenIndex(1, 4)).toBe(3);
    expect(screenIndex(0.5, 0)).toBe(0);
  });
  test("phoneYaw faces forward mid-screen", () => {
    expect(Math.abs(phoneYaw(0.125, 4))).toBeLessThan(1e-9);
  });
  test("lookAt is bounded", () => {
    const t = lookAt(5, -5);
    expect(Math.abs(t.y)).toBeLessThanOrEqual(0.6);
  });
  test("a chip aimed at the shield bounces outward", () => {
    let c = spawnChip(0, 4, 3, 0);
    for (let i = 0; i < 200 && !c.bounced; i++) c = stepChip(c, 1 / 60, 1);
    expect(c.bounced).toBe(true);
    expect(c.vx).toBeGreaterThan(0); // reflected back toward +x where it came from
  });
  test("canUse3D falls back on reduced motion, saveData, no WebGL, low memory", () => {
    expect(canUse3D({ reducedMotion: false, webgl: true })).toBe(true);
    expect(canUse3D({ reducedMotion: true, webgl: true })).toBe(false);
    expect(canUse3D({ reducedMotion: false, webgl: true, saveData: true })).toBe(false);
    expect(canUse3D({ reducedMotion: false, webgl: false })).toBe(false);
    expect(canUse3D({ reducedMotion: false, webgl: true, deviceMemory: 1 })).toBe(false);
  });
});
