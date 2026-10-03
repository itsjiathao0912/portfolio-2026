import { describe, expect, test } from "bun:test";
import { type Anchor, CHAR, maxFeetY, minFeetY, type Viewport } from "../../src/components/site/visitor/guide/guide-logic";
import {
  anchorAbove,
  anchorBelow,
  type Body,
  isMoving,
  landingAnchor,
  MAX_DT,
  NO_INPUT,
  nextAnchorInDirection,
  rideAnchor,
  standingBody,
  startFall,
  startHop,
  stepBody,
} from "../../src/components/site/visitor/guide/guide-physics";

const vp: Viewport = { w: 1000, h: 800, keepOut: { left: 0, top: 0, right: 1000, bottom: 72 } };
// feet band: 192 .. 788
const A: Anchor = { id: "statement", left: 0, right: 1000, top: 300 };
const B: Anchor = { id: "highlights", left: 0, right: 1000, top: 520 };
const C: Anchor = { id: "stack", left: 0, right: 1000, top: 700 };
const OFF: Anchor = { id: "people", left: 0, right: 1000, top: 100 }; // under the nav band: not standable
const FAR: Anchor = { id: "linkedin", left: 0, right: 1000, top: 1600 }; // below the viewport
const all = [OFF, A, B, C, FAR];

function run(body: Body, input = NO_INPUT, anchors: readonly Anchor[] = all, viewport = vp, seconds = 3, dt = 1 / 60) {
  let b = body;
  let first = true;
  for (let t = 0; t < seconds; t += dt) {
    b = stepBody(b, first ? input : { ...input, hop: false, down: false }, dt, anchors, viewport);
    first = false;
  }
  return b;
}

describe("anchor lookups", () => {
  const on = (anchor: Anchor) => standingBody(500, anchor, vp);
  test("anchorAbove: nearest in-viewport edge above the feet", () => {
    expect(anchorAbove(on(C), all, vp)?.id).toBe("highlights");
    expect(anchorAbove(on(B), all, vp)?.id).toBe("statement");
  });
  test("anchorAbove ignores edges under the nav band", () => expect(anchorAbove(on(A), all, vp)).toBeNull());
  test("anchorBelow: nearest in-viewport edge below the feet", () => {
    expect(anchorBelow(on(A), all, vp)?.id).toBe("highlights");
    expect(anchorBelow(on(B), all, vp)?.id).toBe("stack");
  });
  test("anchorBelow ignores edges below the viewport and returns null at the bottom", () => expect(anchorBelow(on(C), all, vp)).toBeNull());
});

describe("hop and fall (vertical traversal)", () => {
  test("hop from C lands on the nearest anchor above (B)", () => {
    const b = run(startHop(standingBody(500, C, vp), all, vp), NO_INPUT);
    expect(b.mode).toBe("ground");
    expect(b.anchorId).toBe("highlights");
    expect(b.y).toBe(520);
  });
  test("hop with nothing reachable above is an in-place hop: same anchor, same height", () => {
    const start = startHop(standingBody(500, A, vp), all, vp);
    expect(start.mode).toBe("flight");
    const b = run(start, NO_INPUT);
    expect(b.anchorId).toBe("statement");
    expect(b.y).toBe(300);
    expect(b.mode).toBe("ground");
  });
  test("a hop actually leaves the ground (the arc rises above the take-off line)", () => {
    let b = startHop(standingBody(500, A, vp), all, vp);
    let minY = b.y;
    for (let i = 0; i < 40; i++) {
      b = stepBody(b, NO_INPUT, 1 / 60, all, vp);
      minY = Math.min(minY, b.y);
    }
    expect(minY).toBeLessThan(300 - 20);
  });
  test("ArrowDown falls to the nearest anchor below, with gravity", () => {
    const start = startFall(standingBody(500, A, vp), all, vp);
    expect(start.mode).toBe("air");
    const b = run(start, NO_INPUT);
    expect(b.anchorId).toBe("highlights");
    expect(b.y).toBe(520);
  });
  test("ArrowDown with nothing below stays put", () => {
    const s = standingBody(500, C, vp);
    expect(startFall(s, all, vp)).toBe(s);
    expect(run(startFall(s, all, vp), NO_INPUT).anchorId).toBe("stack");
  });
  test("input pulses via stepBody: hop and down", () => {
    const hopped = run(standingBody(500, C, vp), { ...NO_INPUT, hop: true });
    expect(hopped.anchorId).toBe("highlights");
    const fell = run(standingBody(500, A, vp), { ...NO_INPUT, down: true });
    expect(fell.anchorId).toBe("highlights");
  });
});

describe("swept landing (no tunnelling)", () => {
  test("landingAnchor returns the FIRST top crossed, however far the body moved", () => {
    expect(landingAnchor(250, 900, 500, all, vp)?.id).toBe("statement");
    expect(landingAnchor(310, 900, 500, all, vp)?.id).toBe("highlights");
    expect(landingAnchor(250, 290, 500, all, vp)).toBeNull();
  });
  test("an anchor the body stands on is not re-landed on", () => expect(landingAnchor(300, 310, 500, [A], vp)).toBeNull());
  test("a falling body at a huge speed and a huge dt still lands on the first edge", () => {
    const b: Body = { x: 500, y: 250, vx: 0, vy: 6000, facing: 1, anchorId: null, mode: "air", flight: null };
    let cur = b;
    for (let i = 0; i < 40 && cur.mode === "air"; i++) cur = stepBody(cur, NO_INPUT, 10, all, vp);
    expect(cur.mode).toBe("ground");
    expect(cur.anchorId).toBe("statement");
  });
  test("with no anchor beneath, a fall ends on the viewport floor", () => {
    let cur: Body = { x: 500, y: 650, vx: 0, vy: 0, facing: 1, anchorId: null, mode: "air", flight: null };
    for (let i = 0; i < 400 && cur.mode === "air"; i++) cur = stepBody(cur, NO_INPUT, 1 / 60, [], vp);
    expect(cur.mode).toBe("ground");
    expect(cur.y).toBe(maxFeetY(vp));
    expect(cur.anchorId).toBeNull();
  });
});

describe("walking", () => {
  test("holding right moves right and stops at the viewport edge", () => {
    let b = standingBody(500, A, vp);
    b = run(b, { ...NO_INPUT, right: true }, all, vp, 10);
    expect(b.x).toBe(vp.w - 12 - CHAR.w / 2);
    expect(b.facing).toBe(1);
    b = run(b, { ...NO_INPUT, left: true }, all, vp, 10);
    expect(b.x).toBe(12 + CHAR.w / 2);
    expect(b.facing).toBe(-1);
  });
  test("walking off the end of a narrower anchor reaches the next anchor in that direction", () => {
    const left: Anchor = { id: "statement", left: 100, right: 300, top: 300 };
    const right: Anchor = { id: "highlights", left: 400, right: 700, top: 520 };
    const list = [left, right];
    let b = standingBody(280, left, vp);
    b = run(b, { ...NO_INPUT, right: true }, list, vp, 4);
    expect(b.anchorId).toBe("highlights");
    expect(b.mode).toBe("ground");
    expect(b.y).toBe(520);
    // and back: left goes to the previous one
    b = run({ ...b, x: 410 }, { ...NO_INPUT, left: true }, list, vp, 4);
    expect(b.anchorId).toBe("statement");
  });
  test("nextAnchorInDirection: right = next below, left = previous above, null at the ends", () => {
    expect(nextAnchorInDirection(all, B, 1, vp)?.id).toBe("stack");
    expect(nextAnchorInDirection(all, B, -1, vp)?.id).toBe("statement");
    expect(nextAnchorInDirection(all, C, 1, vp)).toBeNull();
    expect(nextAnchorInDirection(all, A, -1, vp)).toBeNull();
  });
  test("the keep-out holds: the feet never go above the nav-clear limit, whatever happens", () => {
    let b = standingBody(500, B, vp);
    for (let i = 0; i < 600; i++) {
      b = stepBody(b, { left: i % 120 < 60, right: i % 120 >= 60, hop: i % 50 === 0, down: i % 70 === 0 }, 1 / 60, all, vp);
      expect(b.y).toBeGreaterThanOrEqual(minFeetY(vp) - 1e-6);
      expect(b.y).toBeLessThanOrEqual(maxFeetY(vp) + 1e-6);
      expect(b.x).toBeGreaterThanOrEqual(12 + CHAR.w / 2 - 1e-6);
      expect(b.x).toBeLessThanOrEqual(vp.w - 12 - CHAR.w / 2 + 1e-6);
    }
  });
  test("an oversized dt is clamped", () => {
    const b = stepBody({ ...standingBody(500, A, vp), vx: 0 }, { ...NO_INPUT, right: true }, 5, all, vp);
    expect(b.x - 500).toBeLessThan(210 * MAX_DT + 1);
  });
});

describe("riding a scrolled anchor", () => {
  test("the feet follow the surface and are clamped under the nav band", () => {
    const b = standingBody(500, B, vp);
    expect(rideAnchor(b, [{ ...B, top: 450 }], vp).y).toBe(450);
    expect(rideAnchor(b, [{ ...B, top: -900 }], vp).y).toBe(minFeetY(vp));
    expect(rideAnchor(b, [{ ...B, top: 9000 }], vp).y).toBe(maxFeetY(vp));
  });
});

describe("isMoving (rAF sleeps at rest)", () => {
  test("false at rest and after a walk ends", () => {
    const b = standingBody(500, A, vp);
    expect(isMoving(b)).toBe(false);
    let w = run(b, { ...NO_INPUT, right: true }, all, vp, 0.5);
    expect(isMoving(w, { ...NO_INPUT, right: true })).toBe(true);
    w = run(w, NO_INPUT, all, vp, 1);
    expect(isMoving(w)).toBe(false);
  });
  test("true while still sliding to a stop on the ground", () => {
    expect(isMoving({ ...standingBody(500, A, vp), vx: 5 })).toBe(true);
  });
  test("true in flight and in the air", () => {
    expect(isMoving(startHop(standingBody(500, C, vp), all, vp))).toBe(true);
    expect(isMoving(startFall(standingBody(500, A, vp), all, vp))).toBe(true);
  });
  test("true while a pulse is pending", () => {
    expect(isMoving(standingBody(500, A, vp), { ...NO_INPUT, hop: true })).toBe(true);
  });
});
