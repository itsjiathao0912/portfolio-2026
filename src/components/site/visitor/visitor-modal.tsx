"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { RoleId } from "./role-ids";
import { RolePicker } from "./visitor-panel";
import { useVisitor } from "./store";

/**
 * The change-role dialog: a glass sheet over the page with the same role grid as
 * the top panel. Built on the native <dialog> (showModal), which traps focus,
 * makes the page inert, closes on Escape and returns focus to the button that
 * opened it. Mounted once, in the layout.
 */
export function VisitorModal() {
  const { pickerOpen, setPickerOpen, setRole } = useVisitor();
  if (!pickerOpen) return null;
  return (
    <Sheet
      onClose={() => setPickerOpen(false)}
      onPick={(r) => { setRole(r); setPickerOpen(false); }}
    />
  );
}

// The radiogroup becomes a wrapping flex row: every card one width (2 / 3 / 4 per row), the short last row centred.
const MODAL_GRID = [
  "[&_[role=radiogroup]]:flex [&_[role=radiogroup]]:flex-wrap [&_[role=radiogroup]]:justify-center",
  "[&_[role=radiogroup]>*]:!col-span-1 [&_[role=radiogroup]>*]:w-[calc((100%-0.75rem)/2)]",
  "sm:[&_[role=radiogroup]>*]:w-[calc((100%-1.5rem)/3)] lg:[&_[role=radiogroup]>*]:w-[calc((100%-2.25rem)/4)]",
].join(" ");

function Sheet({ onClose, onPick }: { onClose: () => void; onPick: (role: RoleId) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  // Dev StrictMode runs the effect twice: the cleanup's close() fires a (late) close event that must not be taken for a user close, or the sheet unmounts at once.
  const ignoreClose = useRef(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
    // After showModal (which would otherwise focus the Close button): the current role, else the first.
    el?.querySelector<HTMLElement>('[role="radio"][tabindex="0"]')?.focus({ preventScroll: true });
    return () => {
      if (el?.open) {
        ignoreClose.current += 1;
        el.close();
      }
    };
  }, []);
  return (
    <dialog
      ref={ref}
      data-testid="visitor-modal"
      aria-labelledby="visitor-modal-label"
      onClose={() => {
        if (ignoreClose.current > 0) ignoreClose.current -= 1;
        else onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close(); // click on the backdrop
      }}
      className="m-auto max-h-[92dvh] w-[min(960px,calc(100vw-24px))] overflow-visible bg-transparent p-0 backdrop:bg-ink-1/30 backdrop:backdrop-blur-sm"
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-h-[92dvh] overflow-y-auto rounded-[24px] border border-white/60 bg-bg/80 p-5 shadow-3 backdrop-blur-xl md:p-7"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => ref.current?.close()}
          className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-[22px] text-ink-3 outline-none hover:text-ink-1 focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span aria-hidden="true">×</span>
        </button>
        {/* Same-size cards, last row centred: the shared grid would stretch the 11th card across two cells. */}
        <div className={MODAL_GRID}>
          <RolePicker onPick={(role) => { ref.current?.close(); onPick(role); }} autoFocus={false} labelId="visitor-modal-label" />
        </div>
      </motion.div>
    </dialog>
  );
}
