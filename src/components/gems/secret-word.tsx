"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { isTypingTarget, pushSecretKey } from "./logic";

const EVENT = "thao:sketch-toggle";

/** Ask the global listener to flip sketch mode (used by the footer's tap target on phones). */
export function requestSketchToggle() {
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Hidden gem: typing "thao" anywhere (outside form fields) flips the whole
 * site into "sketch mode" — pencil outlines, paper background — until it is
 * typed again or the page reloads. Phones: tap the footer name five times.
 * State lives on <html data-sketch>; a small toast confirms the change.
 */
export function SecretWord() {
  const buffer = useRef("");
  const [on, setOn] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const flip = () =>
      setOn((v) => {
        const next = !v;
        document.documentElement.dataset.sketch = next ? "on" : "off";
        setToast(next ? "Sketch mode on — type thao again to leave" : "Sketch mode off");
        return next;
      });
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (isTypingTarget(el?.tagName, !!el?.isContentEditable)) return;
      const r = pushSecretKey(buffer.current, e.key);
      buffer.current = r.buffer;
      if (r.hit) flip();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(EVENT, flip);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(EVENT, flip);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[55] flex justify-center px-4" data-sketch-state={on ? "on" : "off"} data-testid="sketch-toast-region">
      <AnimatePresence>
        {toast ? (
          <motion.p
            key={toast}
            data-testid="sketch-toast"
            className="rounded-full bg-ink-1 px-5 py-2.5 text-[14px] font-medium text-bg shadow-card-hover"
            initial={{ opacity: 0, y: reduce ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
          >
            {toast}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
