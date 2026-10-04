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
// - Reduced motion: no physics and no rAF; a fade-teleport between visible blocks.
//
// Original character, original code: plain transforms plus a pure body model
// (guide-physics.ts).

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
import { type BubblePlace, CHAR, chooseStandX, clampX, coverage, EDGE, type Ink, inkAbove, INK_TOLERANCE, maxFeetY, MIN_GUIDE_WIDTH, nextLine, pickSurface, placeBubble, type Rect, sectionUnder, type Span, stepSurface, type Surface, surfaceStandable, type View, visibleSurfaces } from "./guide-logic";
import { type Body, FLOOR_KEY, isMoving, launchTo, makeScene, NO_INPUT, type Input, type Scene, squashScale, standingBody, stepBody, surfaceY } from "./guide-physics";
import { scriptFor } from "./guide-story";

/** The clay figure's feet sit a few px above its box bottom; this puts them exactly on the edge. */
const FOOT_PAD = 4;
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
  const [lay, setLay] = useState<{ place: BubblePlace; w: number; dx: number }>({ place: "right", w: 188, dx: 0 });
  const [small, setSmall] = useState(false);
  const [dotOpen, setDotOpen] = useState(false);
  const [rightHalf, setRightHalf] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const [hint, setHint] = useState(false);
  const [pad, setPad] = useState(0); // 0 = closed; otherwise a stamp that restarts the auto-hide timer
  const blinking = useBlink(!reduce);

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
      // Only blocks with a spot where the body covers no link, button or reading text are worth standing on.
      tracked = collectTracked(roots, root, view.scrollY, view.w).filter((t) => !blocked(chooseStandX(t.surface, view, standBlockers(t.surface.top, t.el)), t.surface.top, t.el));
      surfaces = tracked.map((t) => t.surface);
      spans = readSpans(view.scrollY);
      scene = makeScene(surfaces, view);
      el.dataset.guideSurfaces = String(surfaces.length);
      lastCollect = performance.now();
    };
    // What the body must not stand in front of when its feet are at `top` on `own`: tap targets and the text just above that edge.
    function standBlockers(top: number, own: Element | null, taps: readonly Rect[] = avoid) {
      return taps.concat(inkAbove(ink, top, own));
    }
    function blocked(x: number, top: number, own: Element | null) {
      return coverage(x, top, avoid) > 0 || coverage(x, top, inkAbove(ink, top, own)) > INK_TOLERANCE;
    }
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
      const rh = body.x - CHAR.w / 2 + 170 > view.w - EDGE; // the hint / pad would run off the right edge
      if (rh !== rightHalfNow) {
        rightHalfNow = rh;
        setRightHalf(rh);
      }
      // The bubble goes where it covers no link or button: beside on the roomier side, else the other side, else above.
      if (bubbleNow) {
        const p = placeBubble(body.x, body.y, view, avoid, isSmall());
        const w = Math.round(p.w / 4) * 4;
        const dx = Math.round(p.dx);
        const k = `${p.place}:${w}:${dx}`;
        if (k !== layKey) {
          layKey = k;
          setLay({ place: p.place, w, dx });
        }
      }
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
      el.style.transform = `translate3d(${Math.round((body.x - CHAR.w / 2) * 10) / 10}px, ${Math.round((drawY - CHAR.h + FOOT_PAD) * 10) / 10}px, 0)`;
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
      if (!id) {
        hideBubble();
        return;
      }
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
        arrive();
        if (body.surface === FLOOR_KEY) later(() => followFloor() || nudgeClear(), 260);
        else nudgeClear();
      }
      if ((isMoving(body, input) || performance.now() < scrollUntil || performance.now() < liveUntil) && !document.hidden) schedule();
      else last = 0;
    }

    // ---- reduced motion: fade-teleport between visible blocks ------------------
    const teleport = (s: Surface | null) => {
      el.style.opacity = "0";
      later(() => {
        syncView();
        const x = s ? chooseStandX(s, view, standBlockers(s.top, elOf(s.key), readAvoid(root, view.scrollY, view.h)), body.x) : body.x;
        body = standingBody(x, s, scene);
        paint();
        el.style.opacity = "1";
        arrive();
      }, 180);
    };
    const stepSpot = (dir: 1 | -1) => {
      collect();
      const t = stepSurface(visibleSurfaces(surfaces, view), body.surface, dir);
      if (t && t.key !== body.surface) teleport(t);
    };

    // ---- following the page ------------------------------------------------------
    // After a re-measure: re-seat a standing body on its (possibly moved) surface, and wake the loop if physics must act.
    const reseat = () => {
      if (body.mode !== "ground") return;
      const sy = surfaceY(scene, body.surface);
      if (reduce) {
        const s = surfaceOf(body.surface);
        if (!s || !surfaceStandable(s, view)) teleport(pickSurface(surfaces, view, 0.55));
        else if (sy !== undefined && sy !== body.y) {
          body = { ...body, y: sy };
          paint();
        }
        return;
      }
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
      if (Math.abs(x - body.x) > 8 && coverage(x, body.y, spots) < cur - 1) {
        body = launchTo(body, s, scene, x);
        schedule();
      }
    };
    // Left on the viewport floor (nothing under it on the way down): hop onto the nearest block in view.
    const followFloor = () => {
      if (reduce || body.mode !== "ground" || body.surface !== FLOOR_KEY || input.left || input.right) return false;
      syncView();
      const t = pickSurface(surfaces, view, 0.62);
      if (!t) return false;
      body = launchTo(body, t, scene);
      schedule();
      return true;
    };
    const settle = () => {
      collect();
      if (!followFloor()) {
        reseat();
        nudgeClear();
      }
      if (body.mode === "ground") arrive();
    };
    const onScroll = () => {
      dirty = true;
      scrollUntil = performance.now() + SCROLL_FRAMES_MS;
      if (reduce) {
        syncView();
        refreshSurfaces(tracked, view.scrollY, view.w, view.h);
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
    const first = pickSurface(surfaces, view, 0.55);
    const x0 = first ? chooseStandX(first, view, standBlockers(first.top, elOf(first.key), readAvoid(root, view.scrollY, view.h))) : view.w - EDGE - CHAR.w / 2;
    body = standingBody(x0, first, scene);
    if (!reduce) {
      const ceil = view.scrollY + (view.nav > 0 ? view.nav + 8 : EDGE) + CHAR.h;
      body = { ...body, mode: "air", surface: null, y: Math.max(ceil, body.y - 190), vy: 0 };
    }
    if (reduce) el.style.transition = "opacity 160ms linear";
    paint();
    queueMicrotask(() => alive && setPlaced(true));
    if (reduce) later(arrive, 400);
    else schedule();
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
        <motion.div className="relative size-full" initial={{ opacity: 0 }} animate={placed ? { opacity: 1 } : undefined} transition={{ duration: reduce ? 0.16 : 0.2 }}>
          <div ref={squashEl} className="size-full origin-[50%_calc(100%-4px)] will-change-transform" style={small ? { scale: SMALL_SCALE } : undefined}>
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
              className="pointer-events-auto absolute inset-0 grid cursor-pointer place-items-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
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
              <GuideHint visible={hint && !showBubble} coarse={coarse} reduce={reduce} />
            )}
          </div>
          {showBubble && !pad ? (
            <div
              className={cn("pointer-events-none absolute flex", place === "right" ? "bottom-1 left-full ml-2" : place === "left" ? "bottom-1 right-full mr-2 justify-end" : "bottom-full mb-3")}
              style={{ width: lay.w, left: place === "above" ? lay.dx : undefined }}
            >
              <GuideBubble text={line!} index={bubble!.idx} total={script.length} place={place} />
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
