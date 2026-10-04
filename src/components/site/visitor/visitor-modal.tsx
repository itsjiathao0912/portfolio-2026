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
  const { pickerOpen, setPickerOpen, setRole, role, guideHidden, setGuideHidden } = useVisitor();
  if (!pickerOpen) return null;
  return (
    <Sheet
      onClose={() => setPickerOpen(false)}
      onPick={(r) => { setRole(r); setPickerOpen(false); }}
      guide={role !== null ? { hidden: guideHidden, toggle: () => setGuideHidden(!guideHidden) } : null}
    />
  );
}

function Sheet({ onClose, onPick, guide }: { onClose: () => void; onPick: (role: RoleId | null) => void; guide: { hidden: boolean; toggle: () => void } | null }) {
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
        <div className="pr-10">
          <RolePicker onPick={(role) => { ref.current?.close(); onPick(role); }} autoFocus={false} labelId="visitor-modal-label" />
        </div>
        {guide ? (
          <button
            type="button"
            data-testid="guide-visibility-toggle"
            onClick={guide.toggle}
            className="mt-4 inline-flex min-h-11 items-center rounded-full border border-hairline bg-bg px-4 text-[13px] font-medium text-ink-2 outline-none hover:text-ink-1 focus-visible:ring-2 focus-visible:ring-accent"
          >
            {guide.hidden ? "Show the guide" : "Hide the guide"}
          </button>
        ) : null}
      </motion.div>
    </dialog>
  );
}
