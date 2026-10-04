import { describe, expect, test } from "bun:test";
import { CHAR, floorY, minFeetY, type Surface, type View } from "../../src/components/site/visitor/guide/guide-logic";
import {
  type Body,
  FLOOR_KEY,
  isMoving,
  JUMP_V,
  launchTo,
  makeScene,
  MAX_DT,
  NO_INPUT,
  rescueTarget,
  type Scene,
  squashScale,
  standingBody,
  stepBody,
  surfaceY,
  WALK_SPEED,
} from "../../src/components/site/visitor/guide/guide-physics";

const view = (scrollY = 1000): View => ({ w: 1000, h: 800, scrollY, docH: 6000, nav: 72 });
const S = (key: string, top: number, left = 0, right = 1000): Surface => ({ key, id: null, left, right, top });
// viewport feet band (scrollY 1000): 192 .. 788 -> page 1192 .. 1788
const A = S("A", 1300);
const B = S("B", 1500);
const C = S("C", 1700);

function run(b: Body, scene: Scene, seconds: number, input = NO_INPUT, dt = 1 / 60) {
  let body = b;
  let first = true;
  for (let t = 0; t < seconds; t += dt) {
    body = stepBody(body, first ? input : { ...input, hop: false }, dt, scene);
    first = false;
  }
  return body;
}

describe("standing: feet sit exactly on the surface and follow it", () => {
  test("standingBody puts the feet on the top edge, page px", () => {
    const sc = makeScene([A, B], view());
    const b = standingBody(500, A, sc);
    expect([b.y, b.surface, b.mode]).toEqual([1300, "A", "ground"]);
  });
  test("when the surface re-measures (page moved under it) the feet follow with no lag", () => {
    const moving = { ...A };
    const sc = makeScene([moving, B], view());
    let b = standingBody(500, moving, sc);
    moving.top = 1337.4; // e.g. a card that grew above, or a sticky block
    b = stepBody(b, NO_INPUT, 1 / 60, sc);
    expect(b.y).toBe(1337.4);
    expect(b.mode).toBe("ground");
  });
  test("scrolling alone never moves it in page space (the layer scrolls natively)", () => {
    const b0 = standingBody(500, B, makeScene([A, B], view(1000)));
    const b = run(b0, makeScene([A, B], view(1100)), 0.5);
    expect([b.y, b.x, b.mode]).toEqual([1500, 500, "ground"]);
  });
  test("on the floor it rides the viewport bottom", () => {
    const sc = makeScene([], view(1000));
    const b0 = standingBody(500, null, sc);
    expect(b0.surface).toBe(FLOOR_KEY);
    const b = stepBody(b0, NO_INPUT, 1 / 60, makeScene([], view(1200)));
    expect(b.y).toBe(floorY(view(1200)));
  });
});

describe("falling", () => {
  test("the surface scrolls up into the nav band: it falls onto the next surface below and bounces", () => {
    const surfaces = [A, B, C];
    let b = standingBody(500, A, makeScene(surfaces, view(1000))); // feet at viewport 300
    const sc = makeScene(surfaces, view(1130)); // A is now at viewport 170 < 192
    b = stepBody(b, NO_INPUT, 1 / 60, sc);
    expect(b.mode).toBe("air");
    const seen = new Set<string>();
    let rebounded = false;
    for (let i = 0; i < 240; i++) {
      b = stepBody(b, NO_INPUT, 1 / 60, sc);
      if (b.rebounds > 0) rebounded = true;
      if (b.mode === "ground") break;
      seen.add(String(b.surface));
    }
    expect(b.mode).toBe("ground");
    expect(b.surface).toBe("B");
    expect(b.y).toBe(1500);
    expect(rebounded).toBe(true);
    expect(b.landSeq).toBe(1);
  });
  test("walking off the edge of a block drops it onto the one below", () => {
    const narrow = S("N", 1300, 400, 600);
    const wide = S("W", 1500);
    const sc = makeScene([narrow, wide], view());
    const b = run(standingBody(560, narrow, sc), sc, 2, { ...NO_INPUT, right: true });
    expect(b.surface).toBe("W");
    expect(b.y).toBe(1500);
    expect(b.x).toBeGreaterThan(600);
  });
  test("with nothing below it lands on the viewport floor", () => {
    const narrow = S("N", 1300, 400, 600);
    const sc = makeScene([narrow], view());
    const b = run(standingBody(560, narrow, sc), sc, 2.5, { ...NO_INPUT, right: true });
    expect([b.surface, b.y]).toEqual([FLOOR_KEY, floorY(view())]);
  });
  test("a removed surface drops the body", () => {
    const b0 = standingBody(500, A, makeScene([A, B], view()));
    const b = run(b0, makeScene([B], view()), 2);
    expect(b.surface).toBe("B");
  });
  test("never tunnels, however large the step", () => {
    const sc = makeScene([A, B, C], view());
    let b: Body = { ...standingBody(500, A, sc), mode: "air", surface: null, y: 1250, vy: 2300 };
    b = stepBody(b, NO_INPUT, 10, sc); // clamped to MAX_DT, sub-stepped
    expect(MAX_DT).toBeLessThan(0.1);
    expect(b.y).toBeLessThanOrEqual(1500 + 1);
  });
  test("a hard landing squashes then settles; the rebound is small and happens once", () => {
    const sc = makeScene([B], view());
    let b: Body = { ...standingBody(500, B, sc), mode: "air", surface: null, y: 1300, vy: 0 };
    let maxSquash = 0;
    let rebounds = 0;
    for (let i = 0; i < 300; i++) {
      b = stepBody(b, NO_INPUT, 1 / 60, sc);
      maxSquash = Math.max(maxSquash, b.squash);
      rebounds = Math.max(rebounds, b.rebounds);
    }
    expect(maxSquash).toBeGreaterThan(0.08);
    expect(squashScale({ squash: 0.2, mode: "ground", vy: 0 }).sy).toBeLessThan(1);
    expect(squashScale({ squash: 0.2, mode: "ground", vy: 0 }).sx).toBeGreaterThan(1);
    expect(rebounds).toBe(1);
    expect(Math.abs(b.squash)).toBeLessThan(0.004);
    expect(isMoving(b)).toBe(false);
    expect(b.y).toBe(1500);
  });
  test("a soft step-down does not rebound", () => {
    const sc = makeScene([A, S("near", 1312)], view());
    let b = standingBody(500, A, sc);
    b = { ...b, mode: "air", surface: null, vy: 0 };
    b = run(b, sc, 1);
    expect(b.rebounds).toBe(0);
    expect(b.surface).toBe("near");
  });
});

describe("walking", () => {
  test("reaches walking speed and stays within the viewport sides", () => {
    const sc = makeScene([A], view());
    const b = run(standingBody(500, A, sc), sc, 0.6, { ...NO_INPUT, left: true });
    expect(b.x).toBeLessThan(500);
    expect(b.facing).toBe(-1);
    expect(Math.abs(b.vx)).toBeLessThanOrEqual(WALK_SPEED + 1);
    const w = run(standingBody(500, A, sc), sc, 8, { ...NO_INPUT, right: true });
    expect(w.x).toBeLessThanOrEqual(1000 - 12 - CHAR.w / 2);
    expect(w.surface).toBe("A");
  });
});

describe("jumping", () => {
  test("a jump is an arc: up to about v^2/2g, then back to the same surface", () => {
    const sc = makeScene([A], view());
    let b = stepBody(standingBody(500, A, sc), { ...NO_INPUT, hop: true }, 1 / 60, sc);
    expect(b.mode).toBe("air");
    expect(b.vy).toBeLessThan(0);
    let top = b.y;
    for (let i = 0; i < 120 && b.mode === "air"; i++) {
      b = stepBody(b, NO_INPUT, 1 / 60, sc);
      top = Math.min(top, b.y);
    }
    expect(1300 - top).toBeGreaterThan(90);
    expect(1300 - top).toBeLessThan((JUMP_V * JUMP_V) / (2 * 2600) + 6);
    expect(b.surface).toBe("A");
  });
  test("a jump up lands on the platform above (one-way: it passes through going up)", () => {
    const above = S("above", 1300 - 80, 300, 700);
    const sc = makeScene([A, above], view());
    const b = run(stepBody(standingBody(500, A, sc), { ...NO_INPUT, hop: true }, 1 / 60, sc), sc, 1.5);
    expect(b.surface).toBe("above");
    expect(b.y).toBe(1220);
  });
  test("a jump that is too short for the platform comes back down", () => {
    const high = S("high", 1300 - 300, 300, 700);
    const sc = makeScene([A, high], view());
    const b = run(stepBody(standingBody(500, A, sc), { ...NO_INPUT, hop: true }, 1 / 60, sc), sc, 2);
    expect(b.surface).toBe("A");
  });
  test("air control steers the arc", () => {
    const sc = makeScene([A], view());
    const b = run(stepBody(standingBody(500, A, sc), { ...NO_INPUT, hop: true, right: true }, 1 / 60, sc), sc, 0.4, { ...NO_INPUT, right: true });
    expect(b.x).toBeGreaterThan(540);
  });
  test("holding up keeps hopping", () => {
    const sc = makeScene([A], view());
    let b = standingBody(500, A, sc);
    let takeoffs = 0;
    let prev = b.mode;
    for (let i = 0; i < 240; i++) {
      b = stepBody(b, { ...NO_INPUT, up: true }, 1 / 60, sc);
      if (prev === "ground" && b.mode === "air") takeoffs++;
      prev = b.mode;
    }
    expect(takeoffs).toBeGreaterThan(2);
  });
  test("launchTo lands exactly on the target", () => {
    const sc = makeScene([A, B, C], view());
    const b = run(launchTo(standingBody(300, C, sc), A, sc), sc, 3);
    expect(b.surface).toBe("A");
    expect(b.y).toBe(1300);
  });
});

describe("the camera", () => {
  test("a surface below the screen: hop up to the lowest reachable one", () => {
    const surfaces = [A, B, C];
    const b0 = standingBody(500, C, makeScene(surfaces, view(1000)));
    const sc = makeScene(surfaces, view(850)); // C at viewport 850 > floor 788
    expect(rescueTarget(b0, sc)).not.toBeNull();
    const b = run(b0, sc, 3);
    expect(["A", "B", "C"]).toContain(b.surface!);
    expect(b.y - sc.view.scrollY).toBeLessThanOrEqual(788 + 0.01);
  });
  test("no surface to hop to: it rides the floor", () => {
    const sc0 = makeScene([C], view(1000));
    const b = stepBody(standingBody(500, C, sc0), NO_INPUT, 1 / 60, makeScene([C], view(900)));
    expect(b.surface).toBe(FLOOR_KEY);
  });
  test("the head is shoved by the nav, never above the band", () => {
    const sc = makeScene([], view(1000));
    let b: Body = { ...standingBody(500, null, sc), mode: "air", surface: null, y: 1100, vy: -900 };
    b = stepBody(b, NO_INPUT, 1 / 60, sc);
    expect(b.y - 1000).toBeGreaterThanOrEqual(minFeetY(view()) - 0.01);
  });
});

describe("rest", () => {
  test("isMoving is false only when nothing needs a frame", () => {
    const sc = makeScene([A], view());
    const b = standingBody(500, A, sc);
    expect(isMoving(b)).toBe(false);
    expect(isMoving(b, { ...NO_INPUT, left: true })).toBe(true);
    expect(isMoving({ ...b, mode: "air" })).toBe(true);
    expect(isMoving({ ...b, squash: 0.1 })).toBe(true);
  });
  test("surfaceY of an unknown key is undefined", () => expect(surfaceY(makeScene([A], view()), "nope")).toBeUndefined());
});
