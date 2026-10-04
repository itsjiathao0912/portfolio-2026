"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { liftTarget, parallaxOffset, type LiftMode, type LiftVariant } from "@/components/motion/lift";
import { SPRING } from "@/components/motion/springs";
import { useFinePointer } from "@/components/motion/use-fine-pointer";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

interface LiftCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  /** "card" lifts ~11.5px at the top edge and grows slightly; "row" (list rows) lifts 2px, no scale. */
  variant?: LiftVariant;
  /** Corner radius utility for the card and its sheen, e.g. "rounded-2xl". Default rounded-lg (16px). */
  radius?: string;
  /** Turn the sheen highlight off (e.g. on dark media). */
  sheen?: boolean;
}

/**
 * The one card hover for the whole site (iOS/iPadOS lift-and-pop).
 *
 * - Mouse hover: top edge rises ~11.5px (translate is computed from the card height so a 300px and a 900px card read the same), grows 1.4%, shadow deepens (spring `lift`),
 *   content drifts up to 4px against the pointer, a soft glass highlight
 *   follows the pointer.
 * - Press: gentle squish to 0.985, then springs back.
 * - Touch: press feedback only. Nothing stays "hovered" after the finger lifts.
 * - Keyboard focus-visible inside the card: same lift plus an accent ring.
 * - Reduced motion: no movement, shadow change only.
 *
 * Wrap a link or button inside it (the card itself is not interactive).
 */
export function LiftCard({ variant = "card", radius = "rounded-lg", sheen = true, className, children, onPointerEnter, onPointerLeave, onPointerDown, onPointerUp, onPointerCancel, onPointerMove, onFocusCapture, onBlurCapture, onClickCapture, ...rest }: LiftCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const [mode, setMode] = useState<LiftMode>("rest");
  const [hovered, setHovered] = useState(false);
  const [height, setHeight] = useState(0);
  // After a click on an internal link the card stays pressed and shimmers until the route changes (or 4 s).
  const [pending, setPending] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setPending(false);
  }
  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(() => setPending(false), 4000);
    return () => clearTimeout(t);
  }, [pending]);
  const px = useSpring(useMotionValue(0), SPRING.tilt);
  const py = useSpring(useMotionValue(0), SPRING.tilt);
  const sx = useSpring(useMotionValue(50), SPRING.glide);
  const sy = useSpring(useMotionValue(50), SPRING.glide);
  const highlight = useMotionTemplate`radial-gradient(240px circle at ${sx}% ${sy}%, rgba(255,255,255,0.35), transparent 60%)`;
  const showSheen = sheen && fine && !reduce;

  function track(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || reduce) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const o = parallaxOffset(event.clientX - (rect.left + rect.width / 2), event.clientY - (rect.top + rect.height / 2), rect.width / 2, rect.height / 2);
    px.set(o.x);
    py.set(o.y);
    sx.set(((event.clientX - rect.left) / rect.width) * 100);
    sy.set(((event.clientY - rect.top) / rect.height) * 100);
  }
  function settle() {
    px.set(0);
    py.set(0);
  }

  const target = liftTarget(pending ? "press" : mode, variant, reduce, height);
  const measure = () => setHeight(ref.current?.offsetHeight ?? 0);

  return (
    <motion.div
      ref={ref}
      data-lift-card=""
      data-lift={pending ? "press" : mode}
      data-pending={pending ? "true" : undefined}
      className={cn("relative has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-4 has-[:focus-visible]:ring-offset-bg", radius, className)}
      animate={target}
      transition={reduce ? { duration: 0.2 } : mode === "press" || pending ? SPRING.press : SPRING.lift}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        if (e.pointerType !== "mouse") return;
        measure();
        setHovered(true);
        setMode("hover");
      }}
      onPointerMove={(e) => {
        onPointerMove?.(e);
        track(e);
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        setHovered(false);
        setMode("rest");
        settle();
      }}
      onPointerDown={(e) => {
        onPointerDown?.(e);
        measure();
        setMode("press");
      }}
      onPointerUp={(e) => {
        onPointerUp?.(e);
        // Mouse stays hovered after release; a finger lifts away completely.
        setMode(e.pointerType === "mouse" ? "hover" : "rest");
      }}
      onPointerCancel={(e) => {
        onPointerCancel?.(e);
        setHovered(false);
        setMode("rest");
        settle();
      }}
      onClickCapture={(e) => {
        onClickCapture?.(e);
        const a = (e.target as HTMLElement).closest?.("a[href]") as HTMLAnchorElement | null;
        if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (a.origin === window.location.origin && a.pathname !== window.location.pathname) setPending(true);
      }}
      onFocusCapture={(e) => {
        onFocusCapture?.(e);
        if ((e.target as HTMLElement).matches(":focus-visible")) {
          measure();
          setMode("hover");
        }
      }}
      onBlurCapture={(e) => {
        onBlurCapture?.(e);
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setMode((m) => (m === "hover" && !hovered ? "rest" : m));
      }}
      {...(rest as object)}
    >
      <motion.div className={cn("h-full w-full", radius)} style={reduce ? undefined : { x: px, y: py }}>
        {children}
      </motion.div>
      {pending ? (
        <motion.span
          aria-hidden="true"
          data-testid="lift-pending"
          className={cn("pointer-events-none absolute inset-0 bg-white", radius)}
          initial={{ opacity: 0 }}
          animate={reduce ? { opacity: 0.25 } : { opacity: [0.08, 0.32, 0.08] }}
          transition={reduce ? { duration: 0.1 } : { duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
      {showSheen ? (
        <motion.span
          aria-hidden="true"
          data-testid="lift-sheen"
          className={cn("pointer-events-none absolute inset-0 mix-blend-soft-light transition-opacity duration-200", radius)}
          style={{ backgroundImage: highlight, opacity: hovered ? 1 : 0 }}
        />
      ) : null}
    </motion.div>
  );
}
