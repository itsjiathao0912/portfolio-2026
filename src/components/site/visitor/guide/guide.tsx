"use client";

// The walking guide: the visitor's own clay character, a small platformer hero that
// stands on the real top edges of the home page's content (headings, paragraphs,
// cards, images, buttons) and says a short line about each section it reaches.
//
// How it stays calm and cheap:
// - One absolutely positioned layer in the DOCUMENT (not fixed), so a character
//   standing on a block scrolls with it natively: no JS, no lag. The character moves
//   with `transform: translate3d` only; position is written straight to the node,
//   React re-renders only for pose / bubble / hint changes.
// - Surfaces are collected rarely (load, resize, scroll settle, and every ~0.5 s of
//   a long scroll) and refreshed once per animation frame while scrolling.
// - The rAF loop runs only while it is moving, falling, squashing or the page is
//   scrolling. At rest, with the tab hidden or the guide hidden there is no scheduled
//   frame. Every frame bumps `data-guide-frames` (a test seam).
// - It is a physical object: no fades, no teleports. A surface that scrolls up under
//   the nav pins it at the top edge until it falls; it lands on the first top edge it
//   crosses (swept). Reduced motion: no physics and no rAF; it rests on the floor.
// - The speech bubble is pinned to the PAGE above where the character stood when it
//   spoke: it scrolls with the page but never follows a jump, a bob or a walk. It moves
//   (once, smoothly) only when it would leave the screen.
//
// Original character, original code: plain transforms plus a pure body model
// (guide-physics.ts).

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ClayAvatar } from "@/components/clay/clay-avatar";
import { useBlink } from "@/components/clay/use-blink";
import type { ClayPoseName } from "@/components/clay/poses";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { GuideSectionId, RoleId } from "../role-ids";
import { useVisitor } from "../store";
import { collectTracked, guideRoots, readAvoid, readInk, readNav, readSpans, refreshSurfaces, type Tracked } from "./guide-dom";
import { GuideBubble, GuideDot, GuideHint, GuideTouchPad, type KeyHandlers, type PressKey, useGuideKeys } from "./guide-controls";
import { bodyHits, boxHits, type BubblePlace, CHAR, chooseStandX, clampX, coverage, EDGE, hintRect, type Ink, inkAbove, maxFeetY, MIN_GUIDE_WIDTH, nextLine, pickSurface, placeBubble, type Rect, sectionUnder, type Span, type Surface, surfaceStandable, type View, visibleSurfaces } from "./guide-logic";
import { type Body, FLOOR_KEY, isMoving, launchTo, makeScene, NO_INPUT, type Input, type Scene, squashScale, standingBody, stepBody, surfaceY } from "./guide-physics";
import { scriptFor } from "./guide-story";

/**
 * The clay figure's lowest painted foot pixel sits this far above its box bottom (FULL
 * viewBox "0 -14 100 164" at 68 px: the shoe soles end ~7 px above the 112 px box;
 * measured by a pixel scan). Offsetting by it puts the soles exactly on the edge, and
 * the squash / small-scale origin is the same line so scaling never lifts the feet.
 */
const FOOT_PAD_DEFAULT = 7;

/**
 * Measure the gap between the painted sole bottom and the svg box bottom (CSS px), from the
 * drawing itself (getBBox, which includes the parts' transforms), so contact stays exact when
 * the clay drawing changes. Falls back to the default when the svg is not measurable.
 */
function measureFootPad(box: HTMLElement): number {
  const svg = box.querySelector<SVGSVGElement>("[data-testid='guide-character'] svg");
  if (!svg) return FOOT_PAD_DEFAULT;
  try {
    // The lowest PAINTED shape (defs / clip paths excluded), as a fraction of the svg's own drawn
    // height: ratios cancel the squash, the small-screen scale and any transform on the parts.
    const r = svg.getBoundingClientRect();
    if (r.height <= 0) return FOOT_PAD_DEFAULT;
    let low = -Infinity;
    for (const n of svg.querySelectorAll("path,rect,ellipse,circle,polygon,polyline,line,use,image")) {
      if (n.closest("defs,clipPath,mask,pattern,symbol")) continue;
      const q = n.getBoundingClientRect();
      if (q.width > 0 && q.height > 0 && q.bottom > low) low = q.bottom;
    }
    if (!Number.isFinite(low)) return FOOT_PAD_DEFAULT;
    const pad = ((r.bottom - low) / r.height) * (svg.clientHeight || CHAR.h);
    return Math.max(-CHAR.h / 3, Math.min(CHAR.h / 3, pad));
  } catch {
    return FOOT_PAD_DEFAULT;
  }
}
const PASSIVE_BUBBLE_MS = 9000;
const SETTLE_MS = 160;
const SCROLL_FRAMES_MS = 170;
const RECOLLECT_MS = 450;
/** How long surfaces are re-read per frame after a hover or transition finishes on the block being stood on. */
const LIVE_MS = 650;
const WALK_FRAME_S = 0.12;
const HINT_KEY = "thao:guide-hint:v1";
/** Below this width the character is smaller and its line waits behind a tap-to-open dot. */
const SMALL_W = 1024;
const SMALL_SCALE = 0.72;

type BubbleState = { section: GuideSectionId; idx: number } | null;

type Controller = {
  hop: () => void;
  press: (key: PressKey, down: boolean) => void;
};

/** Mount point: shows the guide only after first paint, on `/`, once a role is chosen and the picker is closed. */
export function VisitorGuide() {
  const { ready, role, collapsed, pickerOpen } = useVisitor();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [painted, setPainted] = useState(false);
  const [wide, setWide] = useState(true);

  useEffect(() => {
    // Safari has no requestIdleCallback: fall back to a short timeout.
    const idle = "requestIdleCallback" in window;
    const id = idle ? window.requestIdleCallback(() => setPainted(true), { timeout: 1500 }) : window.setTimeout(() => setPainted(true), 500);
    return () => {
      if (idle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    const update = () => setWide(window.innerWidth >= MIN_GUIDE_WIDTH);
    queueMicrotask(update);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!painted || !wide || !ready || role === null || !collapsed || pickerOpen || pathname !== "/") return null;
  return createPortal(<GuideLayer key={`${role}:${reduce}`} role={role} reduce={reduce} />, document.body);
}

const seenHint = () => {
  try {
    return localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return true;
  }
};

function GuideLayer({ role, reduce }: { role: RoleId; reduce: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyEl = useRef<HTMLDivElement>(null);
  const squashEl = useRef<HTMLDivElement>(null);
  const ctl = useRef<Controller | null>(null);
  const handlers = useRef<KeyHandlers | null>(null);
  const lastTap = useRef(0);
  const hopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [bubble, setBubble] = useState<BubbleState>(null);
  const [pose, setPose] = useState<{ name: ClayPoseName; frame: number }>({ name: "idle", frame: 0 });
  const [facing, setFacing] = useState<1 | -1>(1);
  const [lay, setLay] = useState<{ place: BubblePlace; w: number; left: number; bottom: number }>({ place: "right", w: 188, left: 0, bottom: 0 });
  const [small, setSmall] = useState(false);
  const [dotOpen, setDotOpen] = useState(false);
  const [rightHalf, setRightHalf] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const [hint, setHint] = useState(false);
  const [hintClear, setHintClear] = useState(true);
  const [pad, setPad] = useState(0); // 0 = closed; otherwise a stamp that restarts the auto-hide timer
  const blinking = useBlink(!reduce);
  const footRef = useRef(FOOT_PAD_DEFAULT);
  const footSync = useRef<((pad: number) => void) | null>(null);
  const footMin = useRef(Infinity);
  // A new figure size (small screens) or a new character: start the contact line afresh.
  useLayoutEffect(() => {
    footMin.current = Infinity;
  }, [small, role]);
  useLayoutEffect(() => {
    const node = bodyEl.current;
    if (!node) return;
    // The clay parts ease between poses with CSS transitions: measure now, again as each
    // transition ends, and once more after the longest one, so the final sole line wins.
    // Only a standing pose defines the contact line (the jump pose tucks the feet up).
    if (pose.name === "jump") return;
    const measure = () => {
      // The real sole is the LOWEST one ever seen standing: a reading taken mid-transition (feet still tucked) is higher, never lower.
      footRef.current = Math.min(footMin.current, measureFootPad(node));
      footMin.current = footRef.current;
      footSync.current?.(footRef.current);
    };
    measure();
    const t = setTimeout(measure, 450);
    node.addEventListener("transitionend", measure);
    return () => {
      clearTimeout(t);
      node.removeEventListener("transitionend", measure);
    };
  }, [pose, small, role]);

  useGuideKeys(rootRef, handlers);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mq.matches);
    queueMicrotask(update);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () => setSmall(window.innerWidth < SMALL_W);
    queueMicrotask(update);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!pad) return;
    const t = setTimeout(() => setPad(0), 10000);
    return () => clearTimeout(t);
  }, [pad]);

  useEffect(() => {
    const rootNode = rootRef.current;
    const bodyNode = bodyEl.current;
    const squashNode = squashEl.current;
    if (!rootNode || !bodyNode || !squashNode) return;
    const root: HTMLDivElement = rootNode;
    const el: HTMLDivElement = bodyNode;
    const sq: HTMLDivElement = squashNode;

    let alive = true;
    let footPad = footRef.current;
    const applyFootOrigin = () => {
      sq.style.transformOrigin = `50% calc(100% - ${footPad.toFixed(2)}px)`;
      el.dataset.guideFootPad = footPad.toFixed(2);
    };
    applyFootOrigin();
    // The sole line depends on the pose (a walk frame lifts a foot): re-measured after each pose render.
    footSync.current = (pad: number) => {
      if (Math.abs(pad - footPad) < 0.05) return;
      footPad = pad;
      applyFootOrigin();
      paint();
    };
    let tracked: Tracked[] = [];
    let surfaces: Surface[] = [];
    let spans: Span[] = [];
    let avoid: Rect[] = [];
    let ink: Ink<Element>[] = [];
    const isSmall = () => window.innerWidth < SMALL_W;
    const view: View = { w: window.innerWidth, h: window.innerHeight, scrollY: window.scrollY, docH: document.documentElement.scrollHeight, nav: 0 };
    let scene: Scene = makeScene([], view);
    let body: Body = standingBody(view.w / 2, null, scene);
    const input: Input = { ...NO_INPUT };
    let raf = 0;
    let last = 0;
    let walkClock = 0;
    let frames = 0;
    let scrollUntil = 0;
    let liveUntil = 0;
    let lastCollect = 0;
    let dirty = false;
    let bubbleNow: BubbleState = null;
    let waveUntil = 0;
    let poseKey = "";
    let facingNow: 1 | -1 = 1;
    let layKey = "";
    let rightHalfNow = false;
    let seq = 0;
    let lastSection: GuideSectionId | null = null;
    let standing: Element | null = null;
    let atKey = "";
    let modeNow = "";
    let hinted = false;
    let hintClearNow = true;
    let hopAways = 0;
    let shuffles = 0; // shuffles along the same block since the last scroll: at most one, so it never hops on and on
    let floorHops = 0; // floor-to-block hops since the last scroll: capped, so a block that will not hold it cannot start a loop // "hop to another clear block" moves since the last scroll: at most one, so it can never ping-pong
    const visited = new Set<GuideSectionId>();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let settleT: ReturnType<typeof setTimeout> | undefined;
    let bubbleT: ReturnType<typeof setTimeout> | undefined;
    let roT: ReturnType<typeof setTimeout> | undefined;

    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        timers.delete(t);
        if (alive) fn();
      }, ms);
      timers.add(t);
      return t;
    };

    // ---- measuring (events and slow ticks only, never the physics sub-steps) -----
    const syncView = () => {
      view.scrollY = window.scrollY;
    };
    const collect = () => {
      view.w = window.innerWidth;
      view.h = window.innerHeight;
      syncView();
      view.docH = document.documentElement.scrollHeight;
      view.nav = readNav();
      avoid = readAvoid(root, view.scrollY, view.h);
      const roots = guideRoots();
      ink = readInk(roots, root, view.scrollY);
      // Every visible block is a platform. Text avoidance only steers where it chooses to walk, never what holds it up.
      tracked = collectTracked(roots, root, view.scrollY, view.w);
      surfaces = tracked.map((t) => t.surface);
      spans = readSpans(view.scrollY);
      scene = makeScene(surfaces, view);
      el.dataset.guideSurfaces = String(surfaces.length);
      el.dataset.guideInView = String(visibleSurfaces(surfaces, view).length);
      lastCollect = performance.now();
    };
    // What the body must not stand in front of when its feet are at `top` on `own`: tap targets and the text just above that edge.
    const within = (a: Element, b: Element) => b.contains(a);
    function standBlockers(top: number, own: Element | null, taps: readonly Rect[] = avoid) {
      return taps.concat(inkAbove(ink, top, own, within));
    }
    function blocked(x: number, top: number, own: Element | null) {
      return coverage(x, top, avoid) > 0 || bodyHits(x, top, inkAbove(ink, top, own, within));
    }
    // Reading text anywhere the bubble could go (beside the body or above the head).
    const inkNear = (y: number) => {
      const out: Rect[] = [];
      for (const i of ink) if (i.rect.bottom > y - CHAR.h - 80 && i.rect.top < y) out.push(i.rect);
      return out;
    };
    const nearHint = (x: number) => x - CHAR.w / 2 + 170 > view.w - EDGE;
    // The one-time hint sits above the head: it must not cover reading text or a tap target either.
    const hintFree = (x: number, y: number) => !boxHits(hintRect(x, y, nearHint(x)), avoid) && !boxHits(hintRect(x, y, nearHint(x)), inkAbove(ink, y - CHAR.h, null));
    const elOf = (key: string | null) => (key ? (tracked.find((t) => t.surface.key === key)?.el ?? null) : null);
    const surfaceOf = (key: string | null) => (key && key !== FLOOR_KEY ? (scene.byKey.get(key) ?? null) : null);
    const currentSection = () => surfaceOf(body.surface)?.id ?? sectionUnder(spans, body.y - 8);

    // ---- painting -----------------------------------------------------------
    const syncPose = () => {
      let name: ClayPoseName = "idle";
      let frame = 0;
      if (!reduce) {
        if (body.mode === "air") name = "jump";
        else if (Math.abs(body.vx) > 12) {
          name = "walk";
          frame = Math.floor(walkClock / WALK_FRAME_S) % 4;
        } else if (performance.now() < waveUntil) name = "wave";
        else if (bubbleNow) name = "talk";
      }
      const key = `${name}:${frame}`;
      if (key !== poseKey) {
        poseKey = key;
        setPose({ name, frame });
      }
      if (body.facing !== facingNow) {
        facingNow = body.facing;
        setFacing(facingNow);
      }
      const rh = nearHint(body.x); // the hint / pad would run off the right edge
      if (rh !== rightHalfNow) {
        rightHalfNow = rh;
        setRightHalf(rh);
      }
      if (!hinted && body.mode === "ground") {
        const hc = hintFree(body.x, body.y);
        if (hc !== hintClearNow) {
          hintClearNow = hc;
          setHintClear(hc);
        }
      }
    };
    // The bubble is pinned to the SCREEN where it first appears (viewport px) and never follows the
    // body's jump / bob / walk. It is placed where it covers no link, button or reading text.
    let bubLeft = 0;
    let bubBottom = 0;
    let bubW = 0;
    const placeBubbleNow = () => {
      const scale = isSmall() ? SMALL_SCALE : 1;
      // Small: the figure is scaled about its feet, so the head is lower; aim the "above" spot at the real head.
      const y = body.mode === "ground" ? body.y : Math.min(body.y, view.scrollY + maxFeetY(view));
      const p = placeBubble(body.x, y + CHAR.h * (1 - scale), view, avoid.concat(inkNear(y)), true);
      const w = Math.round(p.w / 4) * 4;
      bubLeft = Math.round(p.rect.left);
      bubBottom = Math.round(p.rect.bottom); // page px: it rides the page, not the body
      bubW = w;
      const k = `${p.place}:${w}:${bubLeft}:${bubBottom}`;
      if (k !== layKey) {
        layKey = k;
        setLay({ place: p.place, w, left: bubLeft, bottom: bubBottom });
      }
    };
    // After a scroll or resize settles: move the bubble (one smooth move) only if it left the screen.
    const keepBubbleOnScreen = () => {
      if (!bubbleNow) return;
      const b = bubBottom - view.scrollY;
      if (b - 80 < view.nav + 4 || b > view.h - 4 || bubLeft < 0 || bubLeft + bubW > view.w) placeBubbleNow();
    };
    const markStanding = () => {
      const t = body.surface ? tracked.find((x) => x.surface.key === body.surface) : undefined;
      const next = t?.el ?? null;
      if (next === standing) return;
      standing?.removeAttribute("data-guide-standing");
      next?.setAttribute("data-guide-standing", "true");
      standing = next;
    };
    const paint = () => {
      // A fast scroll up carries the surface (and the feet) below the screen before physics reacts: never draw it past the floor line.
      const drawY = Math.min(body.y, view.scrollY + maxFeetY(view));
      el.style.transform = `translate3d(${Math.round((body.x - CHAR.w / 2) * 10) / 10}px, ${Math.round((drawY - CHAR.h + footPad) * 10) / 10}px, 0)`;
      if (!reduce) {
        const { sx, sy } = squashScale(body);
        sq.style.transform = `scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
      }
      const at = surfaceOf(body.surface)?.id ?? "";
      if (at !== atKey) {
        atKey = at;
        el.dataset.guideAt = at;
      }
      if (body.mode !== modeNow) {
        modeNow = body.mode;
        el.dataset.guideMode = body.mode;
      }
      const sk = body.surface ?? "";
      if (el.dataset.guideSurfaceKey !== sk) el.dataset.guideSurfaceKey = sk;
      el.dataset.guideFeet = `${Math.round(body.x)},${Math.round(body.y * 10) / 10}`;
      markStanding();
      syncPose();
    };

    // ---- bubble --------------------------------------------------------------
    const hideBubble = () => {
      if (bubbleT) clearTimeout(bubbleT);
      bubbleNow = null;
      setBubble(null);
      syncPose();
    };
    const showLine = (section: GuideSectionId, idx: number, ms = PASSIVE_BUBBLE_MS) => {
      setDotOpen(false);
      if (bubbleT) clearTimeout(bubbleT);
      bubbleNow = { section, idx };
      placeBubbleNow();
      setBubble(bubbleNow);
      bubbleT = later(hideBubble, ms);
      syncPose();
    };
    // Arriving somewhere new: say line 1 of that section once (at most 6 in a visit).
    const arrive = () => {
      const id = currentSection();
      if (id === lastSection) return;
      lastSection = id;
      waveUntil = performance.now() + 1100;
      later(syncPose, 1150);
      // An untagged block: keep whatever line is showing (it times out on its own); no flicker on a hop.
      if (!id) return;
      if (nextLine(role, id, visited) !== null) {
        visited.add(id);
        showLine(id, 0);
      } else if (bubbleNow && bubbleNow.section !== id) hideBubble();
    };
    // ---- hint: one time, gone after first use ----------------------------------
    const dismissHint = () => {
      if (hinted) return;
      hinted = true;
      setHint(false);
      try {
        localStorage.setItem(HINT_KEY, "1");
      } catch {
        /* private mode: the hint just may show again */
      }
    };

    // ---- the frame loop (no layout reads except the scroll refresh) ----------
    const schedule = () => {
      if (reduce || raf || document.hidden || !alive) return;
      raf = requestAnimationFrame(frame);
    };
    function frame(ts: number) {
      raf = 0;
      if (!alive) return;
      frames++;
      el.dataset.guideFrames = String(frames);
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 1 / 60;
      last = ts;
      syncView();
      if (dirty) {
        dirty = false;
        if (ts - lastCollect > RECOLLECT_MS) collect();
        else refreshSurfaces(tracked, view.scrollY, view.w, view.h);
      } else if (ts < liveUntil) refreshSurfaces(tracked, view.scrollY, view.w, view.h);
      body = stepBody(body, input, dt, scene);
      input.hop = false;
      if (Math.abs(body.vx) > 12 && body.mode === "ground") walkClock += dt;
      paint();
      if (body.landSeq !== seq) {
        seq = body.landSeq;
        later(recheck, 500);
        arrive();
        // The bubble stays where it was said; it only moves (once, smoothly) if it has left the screen.
        keepBubbleOnScreen();
        if (body.surface === FLOOR_KEY) later(() => followFloor() || nudgeClear(), 260);
        else nudgeClear();
      }
      if ((isMoving(body, input) || performance.now() < scrollUntil || performance.now() < liveUntil) && !document.hidden) schedule();
      else last = 0;
    }

    // ---- reduced motion: no physics, it rests on the viewport floor; arrows step it along ----
    const REDUCED_STEP = 96;
    const stepSpot = (dir: 1 | -1) => {
      syncView();
      body = standingBody(body.x + dir * REDUCED_STEP, null, scene);
      paint();
    };

    // ---- following the page ------------------------------------------------------
    // After a re-measure: re-seat a standing body on its (possibly moved) surface, and wake the loop if physics must act.
    const reseat = () => {
      if (body.mode !== "ground") return;
      if (reduce) {
        body = standingBody(body.x, null, scene);
        paint();
        return;
      }
      const sy = surfaceY(scene, body.surface);
      const s = surfaceOf(body.surface);
      if (sy === undefined || (body.surface !== FLOOR_KEY && s && !surfaceStandable(s, view))) schedule();
      else if (sy !== body.y) {
        body = { ...body, y: sy };
        paint();
      }
    };
    // Landed on a tap target (link, button): shuffle along the block to a clear spot so it never covers one.
    const nudgeClear = () => {
      const s = body.surface === FLOOR_KEY ? ({ key: FLOOR_KEY, id: null, left: 0, right: view.w, top: body.y } as Surface) : surfaceOf(body.surface);
      if (!s || body.mode !== "ground" || input.left || input.right) return;
      const own = body.surface === FLOOR_KEY ? null : standing;
      if (!blocked(body.x, body.y, own)) return;
      const spots = standBlockers(body.y, own);
      const cur = coverage(body.x, body.y, spots);
      const x = chooseStandX(s, view, spots, body.x);
      const floor = body.surface === FLOOR_KEY;
      // On a block, a less-covering spot is still better. On the floor, move only to a spot that is fully clear: otherwise it would hop back and forth over the text.
      const clear = !blocked(x, body.y, own);
      if (shuffles < 1 && Math.abs(x - body.x) > 8 && (clear || (!floor && coverage(x, body.y, spots) < cur - 1))) {
        shuffles++;
        body = launchTo(body, s, scene, x);
        schedule();
        return;
      }
      // Nothing clear left on this block (it moved under text after a layout change): hop to another clear block in view.
      if (!floor && !clear && hopAways < 1) {
        hopAways++;
        const t = pickSurface(surfaces.filter((q) => q.key !== body.surface), view, 0.55);
        if (t) {
          body = launchTo(body, t, scene, chooseStandX(t, view, standBlockers(t.top, elOf(t.key))));
          schedule();
          return;
        }
      }
      // Nowhere clear: it stays where it is, standing and visible.
    };
    // Left on the viewport floor (nothing under it on the way down): hop onto the nearest block in view.
    const followFloor = () => {
      if (reduce || body.mode !== "ground" || body.surface !== FLOOR_KEY || input.left || input.right || floorHops >= 2) return false;
      syncView();
      // Not a block hugging the floor line (it would slide out of the band on landing and drop it straight back).
      const t = pickSurface(surfaces.filter((q) => q.top < view.scrollY + maxFeetY(view) - 40), view, 0.62);
      if (!t) return false;
      floorHops++;
      body = launchTo(body, t, scene, chooseStandX(t, view, standBlockers(t.top, elOf(t.key)), body.x));
      schedule();
      return true;
    };
    // Blocks shift a pixel or two after a scroll stops (images decode, fonts swap, hover lifts end):
    // re-read the one being stood on a little later so the feet stay exactly on its edge.
    const recheck = () => {
      syncView();
      refreshSurfaces(tracked, view.scrollY, view.w, view.h);
      reseat();
    };
    const settle = () => {
      later(recheck, 500);
      later(recheck, 1200);
      collect();
      if (!followFloor()) {
        reseat();
        nudgeClear();
      }
      keepBubbleOnScreen();
      if (body.mode === "ground") arrive();
    };
    const onScroll = () => {
      dirty = true;
      hopAways = 0;
      floorHops = 0;
      shuffles = 0;
      scrollUntil = performance.now() + SCROLL_FRAMES_MS;
      if (reduce) {
        syncView();
        body = standingBody(body.x, null, scene);
        paint();
      } else schedule();
      if (settleT) clearTimeout(settleT);
      settleT = later(settle, SETTLE_MS);
    };
    // A hover lift or a finished transition moves the block being stood on without a scroll: keep re-reading it until it settles.
    const onLive = (e: Event) => {
      const t = e.target as Node | null;
      if (!standing || !t || !(standing.contains(t) || t.contains(standing))) return;
      liveUntil = performance.now() + LIVE_MS;
      schedule();
    };
    const onResize = () => {
      if (roT) clearTimeout(roT);
      roT = later(() => {
        collect();
        body = { ...body, x: clampX(body.x, view) };
        reseat();
        paint();
        nudgeClear();
        keepBubbleOnScreen();
        footSync.current?.(measureFootPad(el));
      }, 80);
    };
    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
        input.left = input.right = input.up = false;
      } else if (isMoving(body, input)) schedule();
    };

    // ---- input ------------------------------------------------------------------
    const hop = () => {
      dismissHint();
      if (reduce) {
        stepSpot(-1);
        return;
      }
      input.hop = true;
      schedule();
    };
    const press = (key: PressKey, down: boolean) => {
      dismissHint();
      if (reduce) {
        if (down) stepSpot(key === "right" ? 1 : -1);
        return;
      }
      if (key === "hop") {
        input.up = down;
        if (down) input.hop = true;
      } else input[key] = down;
      if (down) schedule();
    };
    ctl.current = { hop, press };
    handlers.current = {
      key: (action, down, repeat) => {
        if (down) dismissHint();
        if (reduce) {
          if (down && !repeat) stepSpot(action === "right" ? 1 : -1);
          return;
        }
        if (action === "up") {
          input.up = down;
          if (down && !repeat) input.hop = true;
        } else input[action] = down;
        if (down) schedule();
      },
      clear: () => {
        input.left = input.right = input.up = false;
      },
    };

    // ---- start: drop in from above onto the block nearest the middle of the screen ----
    collect();
    // First visit: prefer a spot where the key hint above the head also covers nothing.
    const hintOk = (s: Surface) => hintFree(chooseStandX(s, view, standBlockers(s.top, elOf(s.key))), s.top);
    const first = (!seenHint() ? pickSurface(surfaces.filter(hintOk), view, 0.55) : null) ?? pickSurface(surfaces, view, 0.55);
    const x0 = first ? chooseStandX(first, view, standBlockers(first.top, elOf(first.key), readAvoid(root, view.scrollY, view.h))) : view.w - EDGE - CHAR.w / 2;
    body = standingBody(x0, reduce ? null : first, scene);
    if (!reduce) {
      const ceil = view.scrollY + (view.nav > 0 ? view.nav + 8 : EDGE) + CHAR.h;
      body = { ...body, mode: "air", surface: null, y: Math.max(ceil, body.y - 190), vy: 0 };
    }
    paint();
    queueMicrotask(() => alive && setPlaced(true));
    if (reduce) later(arrive, 400);
    else schedule();
    // The picker's layout springs and the stats fade-in move blocks with transforms (no resize event): re-read once they have settled.
    for (const ms of [700, 1600]) {
      later(() => {
        footSync.current?.(measureFootPad(el));
        collect();
        reseat();
        nudgeClear();
      }, ms);
    }
    if (!seenHint()) {
      later(() => !hinted && setHint(true), 1400);
      later(() => {
        if (!hinted) dismissHint();
      }, 16000);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    for (const ev of ["pointerover", "pointerout", "transitionrun", "transitionend"]) document.addEventListener(ev, onLive, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    ro?.observe(document.body);
    const home = document.querySelector('[data-testid="home"]');
    if (home) ro?.observe(home);

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      for (const ev of ["pointerover", "pointerout", "transitionrun", "transitionend"]) document.removeEventListener(ev, onLive);
      ro?.disconnect();
      standing?.removeAttribute("data-guide-standing");
      ctl.current = null;
      footSync.current = null;
      handlers.current = null;
    };
  }, [role, reduce]);

  const script = bubble ? scriptFor(role, bubble.section) : [];
  const line = bubble ? script[bubble.idx] : undefined;
  const showBubble = !!line && !!bubble && (!small || dotOpen);
  const place = small ? "above" : lay.place;

  return (
    <div ref={rootRef} data-testid="visitor-guide-layer" className="pointer-events-none absolute top-0 left-0 z-40 h-0 w-full overflow-x-clip">
      <div ref={bodyEl} data-testid="visitor-guide" className="group absolute top-0 left-0 will-change-transform" style={{ width: CHAR.w, height: CHAR.h }}>
        <div className="relative size-full" style={{ visibility: placed ? "visible" : "hidden" }}>
          <div ref={squashEl} className="size-full will-change-transform" style={small ? { scale: SMALL_SCALE } : undefined}>
            <button
              type="button"
              data-testid="guide-character"
              aria-label="Guide character: arrow keys walk it, up jumps; tap to hop"
              onClick={(e) => {
                const now = performance.now();
                const twice = now - lastTap.current < 450;
                lastTap.current = twice ? 0 : now;
                if (hopTimer.current) clearTimeout(hopTimer.current);
                if (twice) {
                  // Two quick taps: the tiny pad, and no hop (the first tap's hop is cancelled).
                  setPad((p) => (p ? 0 : now));
                  return;
                }
                // A finger waits a beat to see whether a second tap follows; a mouse or key hops at once.
                if ((e.nativeEvent as PointerEvent).pointerType === "touch") hopTimer.current = setTimeout(() => ctl.current?.hop(), 230);
                else ctl.current?.hop();
              }}
              className="pointer-events-auto absolute inset-0 flex cursor-pointer items-end justify-center rounded-2xl [&>svg]:block outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              style={{ transform: facing === -1 ? "scaleX(-1)" : undefined }}
            >
              <ClayAvatar role={role} view="full" size={CHAR.w} pose={pose.name} frame={pose.frame} blinking={blinking} decorative shadow={false} />
            </button>
          </div>
          <div className={cn("pointer-events-none absolute bottom-full mb-1 flex flex-col gap-1", rightHalf ? "items-end right-0" : "items-start left-0")}>
            {pad ? (
              <GuideTouchPad
                onPress={(k, d) => {
                  setPad(performance.now());
                  ctl.current?.press(k, d);
                }}
              />
            ) : small && line && !dotOpen ? (
              <GuideDot onOpen={() => setDotOpen(true)} />
            ) : (
              <GuideHint visible={hint && hintClear && !showBubble} coarse={coarse} reduce={reduce} />
            )}
          </div>
        </div>
      </div>
      {showBubble && !pad ? (
        // Pinned to the page: a sibling of the moving body, so its jump / bob / walk never moves the bubble.
        <div
          data-testid="guide-bubble-anchor"
          className={cn("pointer-events-none absolute top-0 left-0 z-40 flex items-end", place === "left" && "justify-end")}
          style={{ width: lay.w, transform: `translate3d(${lay.left}px, ${lay.bottom}px, 0) translateY(-100%)`, transition: reduce ? undefined : "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
          <GuideBubble text={line!} index={bubble!.idx} total={script.length} place={place} />
        </div>
      ) : null}
    </div>
  );
}
