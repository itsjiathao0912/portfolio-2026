"use client";

// The walking guide: the visitor's own clay character, standing on the top edge of
// the home sections and saying a short line about each one.
//
// How it stays calm and cheap:
// - Fixed `pointer-events-none` layer in a portal; the character moves with
//   `transform: translate3d` only. Position is written straight to the node, not
//   through React state; React only re-renders for pose / bubble changes.
// - Section rects are measured on events (scroll, resize, ResizeObserver), cached,
//   and the physics loop reads no layout at all.
// - The rAF loop runs only while the body is moving (or a key is held). At rest, when
//   the tab is hidden, when the picker is open or the guide is hidden, there is no
//   scheduled frame. Every frame goes through `frame()` which bumps
//   `data-guide-frames` (a test seam, E16).
// - Passive mode (default): after scrolling settles the character hops or drops to
//   the nearest standable section edge and says line 1 once per section (at most 6
//   in a visit). Player mode (engaged by click / "Walk with me") adds walking,
//   jumping and the longer story. Reduced motion: no physics, a fade-teleport.
//
// Original character and original code: the technique is plain transform + a pure
// body model (guide-physics.ts).

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ClayAvatar } from "@/components/clay/clay-avatar";
import { useBlink } from "@/components/clay/use-blink";
import type { ClayPoseName } from "@/components/clay/poses";
import { SPRING } from "@/components/motion/springs";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { GuideSectionId, RoleId } from "../role-ids";
import { useVisitor } from "../store";
import { GuideBubble, GuideControls, type EngagedHandlers, type PressKey, useEngagedListeners } from "./guide-controls";
import {
  type Anchor,
  anchorInView,
  bubbleSide,
  CHAR,
  chooseStandX,
  clampFeetY,
  collectSurfaces,
  maxFeetY,
  MIN_GUIDE_WIDTH,
  nearestAnchorInView,
  nextLine,
  pickSurface,
  sectionUnder,
  type Rect,
  stepAnchor,
  type Viewport,
} from "./guide-logic";
import { anchorById, type Body, isMoving, NO_INPUT, rideAnchor, standingBody, startFlight, stepBody, type Input } from "./guide-physics";
import { scriptFor } from "./guide-story";

/** The clay figure's feet sit a few px above its box bottom; this puts them on the edge. */
const FOOT_PAD = 4;
const PASSIVE_BUBBLE_MS = 9000;
const SETTLE_MS = 150;
const WALK_FRAME_S = 0.12;

const toRect = (r: DOMRect): Rect => ({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });

type BubbleState = { section: GuideSectionId; idx: number } | null;

type Controller = {
  toggle: () => void;
  engage: () => void;
  advance: () => void;
  press: (key: PressKey, down: boolean) => void;
};

/** Mount point: shows the guide only after first paint, on `/`, once a role is chosen and the picker is closed. */
export function VisitorGuide() {
  const { ready, role, collapsed, pickerOpen, guideHidden } = useVisitor();
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

  if (!painted || !wide || !ready || role === null || !collapsed || pickerOpen || guideHidden || pathname !== "/") return null;
  return createPortal(<GuideLayer key={`${role}:${reduce}`} role={role} reduce={reduce} />, document.body);
}

function GuideLayer({ role, reduce }: { role: RoleId; reduce: boolean }) {
  const { setGuideHidden } = useVisitor();
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyEl = useRef<HTMLDivElement>(null);
  const ctl = useRef<Controller | null>(null);
  const handlers = useRef<EngagedHandlers | null>(null);
  const [engaged, setEngaged] = useState(false);
  const [bubble, setBubble] = useState<BubbleState>(null);
  const [pose, setPose] = useState<{ name: ClayPoseName; frame: number }>({ name: "idle", frame: 0 });
  const [facing, setFacing] = useState<1 | -1>(1);
  const [side, setSide] = useState<"left" | "right">("left");
  const [placed, setPlaced] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const blinking = useBlink(!reduce);

  useEngagedListeners(engaged, rootRef, handlers);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mq.matches);
    queueMicrotask(update);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const rootNode = rootRef.current;
    const bodyNode = bodyEl.current;
    if (!rootNode || !bodyNode) return;
    const root: HTMLDivElement = rootNode;
    const el: HTMLDivElement = bodyNode;

    let alive = true;
    let anchors: Anchor[] = [];
    let vp: Viewport = { w: window.innerWidth, h: window.innerHeight, keepOut: null };
    let body: Body = standingBody(0, null, vp);
    const input: Input = { ...NO_INPUT };
    let raf = 0;
    let last = 0;
    let walkClock = 0;
    let frames = 0;
    let engagedNow = false;
    let bubbleNow: BubbleState = null;
    let waveUntil = 0;
    let poseKey = "";
    let facingNow: 1 | -1 = 1;
    let sideNow: "left" | "right" = "left";
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

    // ---- measuring (events only, never inside the frame loop) -------------
    const measure = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const header = document.querySelector("header[data-compact]");
      const hr = header?.getBoundingClientRect();
      const entries: { id: string; rect: Rect }[] = [];
      document.querySelectorAll<HTMLElement>("[data-guide-walkable]").forEach((n) => {
        const id = n.dataset.guideId;
        if (id) entries.push({ id, rect: toRect(n.getBoundingClientRect()) });
      });
      // The footer contact block is rendered by the layout; use it until it carries the tag.
      if (!entries.some((e) => e.id === "contact")) {
        const f = document.getElementById("get-in-touch");
        if (f) entries.push({ id: "contact", rect: toRect(f.getBoundingClientRect()) });
      }
      anchors = collectSurfaces(entries);
      vp = { w, h, keepOut: hr ? { left: 0, top: 0, right: w, bottom: hr.bottom } : null };
    };

    const avoidRects = () => {
      const out: Rect[] = [];
      document.querySelectorAll<HTMLElement>("a[href], button, [role='button'], input, textarea, select, summary").forEach((n) => {
        if (root.contains(n)) return;
        const r = n.getBoundingClientRect();
        if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > vp.h) return;
        out.push(toRect(r));
      });
      return out;
    };

    // ---- painting -----------------------------------------------------------
    const syncPose = () => {
      let name: ClayPoseName = "idle";
      let frame = 0;
      if (!reduce) {
        if (body.mode !== "ground") name = "jump";
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
      const s = bubbleSide(body.x, vp);
      if (s !== sideNow) {
        sideNow = s;
        setSide(s);
      }
    };

    const paint = () => {
      el.style.transform = `translate3d(${Math.round((body.x - CHAR.w / 2) * 10) / 10}px, ${Math.round((body.y - CHAR.h + FOOT_PAD) * 10) / 10}px, 0)`;
      const at = body.anchorId ?? "";
      if (el.dataset.guideAt !== at) el.dataset.guideAt = at;
      syncPose();
    };

    // ---- bubble --------------------------------------------------------------
    const hideBubble = () => {
      if (bubbleT) clearTimeout(bubbleT);
      bubbleNow = null;
      setBubble(null);
      syncPose();
    };
    const showLine = (section: GuideSectionId, idx: number) => {
      if (bubbleT) clearTimeout(bubbleT);
      bubbleNow = { section, idx };
      setBubble(bubbleNow);
      if (!engagedNow) bubbleT = later(hideBubble, PASSIVE_BUBBLE_MS);
      syncPose();
    };
    // What the character talks about: the section it stands on, else the one the visitor is reading.
    const currentSection = () => body.anchorId ?? sectionUnder(anchors, vp.h * 0.5);
    let lastArrived: GuideSectionId | null = null;
    const arrive = () => {
      const id = currentSection();
      lastArrived = id;
      if (!id) {
        hideBubble();
        return;
      }
      if (engagedNow) {
        showLine(id, 0);
        return;
      }
      if (nextLine(role, id, visited) !== null) {
        visited.add(id);
        showLine(id, 0);
      } else hideBubble();
    };
    const advance = () => {
      const id = currentSection();
      if (!id) return;
      const script = scriptFor(role, id);
      if (script.length === 0) return;
      if (!bubbleNow || bubbleNow.section !== id) showLine(id, 0);
      else if (bubbleNow.idx + 1 < script.length) showLine(id, bubbleNow.idx + 1);
    };

    // ---- the frame loop (no layout reads) ------------------------------------
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
      const prev = body;
      body = stepBody(body, input, dt, anchors, vp);
      input.hop = false;
      input.down = false;
      if (Math.abs(body.vx) > 12 && body.mode === "ground") walkClock += dt;
      paint();
      if (prev.mode !== "ground" && body.mode === "ground") arrive();
      if (isMoving(body, input) && !document.hidden) schedule();
      else last = 0;
    }

    // ---- reduced motion: fade-teleport -----------------------------------------
    const teleport = (anchor: Anchor | null, x: number) => {
      el.style.opacity = "0";
      later(() => {
        body = standingBody(x, anchor, vp);
        paint();
        el.style.opacity = "1";
        arrive();
      }, 180);
    };
    const stepSection = (dir: 1 | -1) => {
      measure();
      const list = anchors.filter((a) => anchorInView(a, vp));
      const t = stepAnchor(list, body.anchorId, dir);
      if (t && t.id !== body.anchorId) teleport(t, chooseStandX(vp, clampFeetY(t.top, vp), avoidRects(), body.x));
    };

    // ---- following the page (passive) -------------------------------------------
    const goTo = (target: Anchor | null) => {
      if (target) {
        const x = chooseStandX(vp, clampFeetY(target.top, vp), avoidRects(), body.x);
        if (reduce) teleport(target, x);
        else {
          body = startFlight(body, target, vp, x);
          schedule();
        }
      } else if (reduce) teleport(null, body.x);
      else {
        body = startFlight(body, null, vp, body.x, true);
        schedule();
      }
    };
    const follow = () => {
      if (body.mode !== "ground") return;
      const here = anchorById(anchors, body.anchorId);
      if (here && anchorInView(here, vp)) return;
      const target = nearestAnchorInView(anchors, vp, body.y);
      if (target) goTo(target);
      else if (body.anchorId !== null) goTo(null);
    };
    const release = () => {
      if (!engagedNow) return;
      engagedNow = false;
      input.left = input.right = input.hop = input.down = false;
      setEngaged(false);
      if (bubbleNow) {
        if (bubbleT) clearTimeout(bubbleT);
        bubbleT = later(hideBubble, PASSIVE_BUBBLE_MS);
      }
      measure();
      follow();
      syncPose();
    };
    const settle = () => {
      measure();
      body = rideAnchor(body, anchors, vp);
      paint();
      if (engagedNow) {
        // Engaged anchor scrolled out of view entirely: give control back and follow the page again.
        const here = anchorById(anchors, body.anchorId);
        if (here && !anchorInView(here, vp)) release();
        return;
      }
      follow();
      if (body.mode === "ground" && currentSection() !== lastArrived) arrive();
    };
    const onScroll = () => {
      measure();
      body = rideAnchor(body, anchors, vp);
      paint();
      if (settleT) clearTimeout(settleT);
      settleT = later(settle, SETTLE_MS);
    };
    const onResize = () => {
      if (roT) clearTimeout(roT);
      roT = later(() => {
        measure();
        body = rideAnchor(body, anchors, vp);
        paint();
      }, 80);
    };
    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
        input.left = input.right = false;
      } else if (isMoving(body, input)) schedule();
    };

    // ---- engage / release ----------------------------------------------------------
    const engage = () => {
      if (engagedNow) return;
      engagedNow = true;
      setEngaged(true);
      if (bubbleT) clearTimeout(bubbleT);
      const cur = currentSection();
      if (!bubbleNow && cur) showLine(cur, 0);
    };
    const toggle = () => (engagedNow ? release() : engage());
    const press = (key: PressKey, down: boolean) => {
      if (!engagedNow) return;
      if (reduce) {
        if (down) stepSection(key === "right" ? 1 : key === "left" ? -1 : -1);
        return;
      }
      if (key === "hop") {
        if (down) input.hop = true;
      } else input[key] = down;
      if (down) schedule();
    };
    ctl.current = { toggle, engage, advance, press };

    handlers.current = {
      release,
      key: (e, down) => {
        const k = e.key;
        const own = e.target instanceof Node && root.contains(e.target);
        if (k === "ArrowLeft" || k === "ArrowRight") {
          if (down) {
            e.preventDefault();
            if (!e.repeat || !reduce) press(k === "ArrowRight" ? "right" : "left", true);
          } else press(k === "ArrowRight" ? "right" : "left", false);
          return;
        }
        if (k === "ArrowUp" || k === " " || k === "Spacebar") {
          // Space also fires click on keyup for a focused guide button, so a handled Space is prevented on both phases.
          if (down || own) e.preventDefault();
          if (down && !e.repeat) {
            if (reduce) stepSection(-1);
            else press("hop", true);
          }
          return;
        }
        if (k === "ArrowDown") {
          if (!down) return;
          e.preventDefault();
          if (e.repeat) return;
          if (reduce) stepSection(1);
          else {
            input.down = true;
            schedule();
          }
          return;
        }
        if (k === "Enter" && down) {
          e.preventDefault();
          if (!e.repeat) advance();
        }
      },
    };

    // ---- start ----------------------------------------------------------------------
    measure();
    const first = pickSurface(anchors, vp) ?? nearestAnchorInView(anchors, vp, vp.h * 0.45);
    const feet = first ? clampFeetY(first.top, vp) : maxFeetY(vp);
    body = standingBody(chooseStandX(vp, feet, avoidRects()), first, vp);
    if (reduce) el.style.transition = "opacity 160ms linear";
    paint();
    waveUntil = performance.now() + 1300;
    syncPose();
    queueMicrotask(() => alive && setPlaced(true));
    later(syncPose, 1350);
    later(() => {
      if (!engagedNow && !bubbleNow) arrive();
    }, 750);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    document.querySelectorAll("[data-guide-walkable]").forEach((n) => ro?.observe(n));
    ro?.observe(document.body);

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      ro?.disconnect();
      ctl.current = null;
      handlers.current = null;
    };
  }, [role, reduce]);

  const script = bubble ? scriptFor(role, bubble.section) : [];
  const line = bubble ? script[bubble.idx] : undefined;

  return (
    <div ref={rootRef} data-testid="visitor-guide-layer" className="pointer-events-none fixed inset-0 z-40">
      <div
        ref={bodyEl}
        data-testid="visitor-guide"
        data-guide-engaged={engaged ? "true" : "false"}
        className="absolute top-0 left-0 will-change-transform"
        style={{ width: CHAR.w, height: CHAR.h }}
      >
        <motion.div
          className="relative size-full"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -40, scale: 0.9 }}
          animate={placed ? { opacity: 1, y: 0, scale: 1 } : undefined}
          transition={reduce ? { duration: 0.16 } : SPRING.ui}
        >
          <button
            type="button"
            data-testid="guide-character"
            aria-label="Guide character: press to walk it around"
            onClick={() => (engaged ? ctl.current?.advance() : ctl.current?.engage())}
            className="pointer-events-auto absolute inset-0 grid cursor-pointer place-items-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            style={{ transform: facing === -1 ? "scaleX(-1)" : undefined }}
          >
            <ClayAvatar role={role} view="full" size={CHAR.w} pose={pose.name} frame={pose.frame} blinking={blinking} decorative />
          </button>
          <div className={cn("absolute bottom-0 flex flex-col gap-2", side === "left" ? "right-full mr-3 items-end" : "left-full ml-3 items-start")}>
            {line && bubble ? <GuideBubble text={line} index={bubble.idx} total={script.length} side={side} onNext={() => ctl.current?.advance()} /> : null}
            <GuideControls
              engaged={engaged}
              coarse={coarse}
              reduce={reduce}
              side={side}
              onToggle={() => ctl.current?.toggle()}
              onHide={() => setGuideHidden(true)}
              onPress={(k, d) => ctl.current?.press(k, d)}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
