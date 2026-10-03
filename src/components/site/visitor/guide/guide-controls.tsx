"use client";

// Walking guide: engage / release, the speech bubble and the on-screen controls.
//
// The guide is passive by default (scroll-follow only). Control is taken ONLY by
// clicking / tapping the character or pressing the visible "Walk with me" toggle,
// and given back by Esc, Tab, a pointer-down outside the guide or focus moving
// outside it. Key listeners exist only while engaged, and an engaged key is
// handled only when it landed on the page itself or inside the guide
// (`shouldHandleGuideKey`): a focused link, button, input or any other control
// keeps its own keyboard behaviour, and page scrolling is never hijacked while
// not engaged.

import { type RefObject, useEffect } from "react";
import { cn } from "@/lib/utils";
import { type KeyTarget, shouldHandleGuideKey } from "./guide-logic";

export type PressKey = "left" | "right" | "hop";

export type EngagedHandlers = {
  release: () => void;
  /** Called only for keys that passed `shouldHandleGuideKey`. */
  key: (e: KeyboardEvent, down: boolean) => void;
};

/**
 * Document listeners that exist ONLY while `engaged`. Esc and Tab release; a
 * pointer-down or focus outside `rootRef` releases; every other key goes to
 * `handlers.key` after the target filter.
 */
export function useEngagedListeners(engaged: boolean, rootRef: RefObject<HTMLElement | null>, handlers: RefObject<EngagedHandlers | null>) {
  useEffect(() => {
    if (!engaged) return;
    const root = () => rootRef.current;
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      const h = handlers.current;
      if (!h) return;
      if (down && (e.key === "Escape" || e.key === "Tab")) {
        h.release();
        return;
      }
      if (!shouldHandleGuideKey(e.target as KeyTarget | null, root(), e)) {
        // A key released after a handled press must still clear the held state.
        if (!down) h.key(e, false);
        return;
      }
      h.key(e, down);
    };
    const keydown = onKey(true);
    const keyup = onKey(false);
    const pointerdown = (e: PointerEvent) => {
      const r = root();
      if (r && e.target instanceof Node && !r.contains(e.target)) handlers.current?.release();
    };
    const focusin = (e: FocusEvent) => {
      const r = root();
      if (r && e.target instanceof Node && !r.contains(e.target)) handlers.current?.release();
    };
    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);
    document.addEventListener("pointerdown", pointerdown, true);
    document.addEventListener("focusin", focusin);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("keyup", keyup);
      document.removeEventListener("pointerdown", pointerdown, true);
      document.removeEventListener("focusin", focusin);
    };
  }, [engaged, rootRef, handlers]);
}

const PILL =
  "pointer-events-auto inline-flex min-h-11 items-center justify-center rounded-full border border-hairline bg-bg/92 px-3.5 text-[12.5px] font-medium whitespace-nowrap text-ink-1 shadow-1 backdrop-blur-md outline-none transition-colors duration-150 hover:bg-bg focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";
const MINI =
  "pointer-events-auto grid size-11 place-items-center rounded-full border border-hairline bg-bg/92 text-[17px] leading-none text-ink-1 shadow-1 backdrop-blur-md outline-none select-none touch-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:bg-accent-tint";

type ControlsProps = {
  engaged: boolean;
  /** coarse pointer: show the on-screen walk / jump buttons while engaged */
  coarse: boolean;
  reduce: boolean;
  side: "left" | "right";
  onToggle: () => void;
  onHide: () => void;
  onPress: (key: PressKey, down: boolean) => void;
};

/** The key hint, the touch mini-controls and the two always-visible pills: "Walk with me" and "Hide character". */
export function GuideControls({ engaged, coarse, reduce, side, onToggle, onHide, onPress }: ControlsProps) {
  const align = side === "left" ? "items-end" : "items-start";
  const hold = (key: PressKey) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      onPress(key, true);
    },
    onPointerUp: () => onPress(key, false),
    onPointerLeave: () => onPress(key, false),
    onPointerCancel: () => onPress(key, false),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!e.repeat) onPress(key, true);
      }
    },
    onKeyUp: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onPress(key, false);
      }
    },
  });
  return (
    <div className={cn("pointer-events-none flex flex-col gap-2", align)}>
      {engaged ? (
        <p
          data-testid="guide-key-hint"
          className="pointer-events-none max-w-[232px] rounded-2xl border border-hairline bg-bg/92 px-3 py-1.5 text-[11.5px] leading-snug text-ink-2 shadow-1 backdrop-blur-md"
        >
          {coarse ? "Tap the arrows to walk, the up arrow to jump." : reduce ? "Arrows step between sections, Enter next line, Esc to leave." : "Arrows walk, Up/Space jump, Enter next line, Esc to leave."}
        </p>
      ) : null}
      {engaged && coarse ? (
        <div className="pointer-events-none flex gap-2" data-testid="guide-touch-controls">
          <button type="button" data-guide-native="true" aria-label="Walk left" className={MINI} {...hold("left")}>
            ◀
          </button>
          <button type="button" data-guide-native="true" aria-label="Walk right" className={MINI} {...hold("right")}>
            ▶
          </button>
          <button type="button" data-guide-native="true" aria-label="Jump" className={MINI} {...hold("hop")}>
            ⤒
          </button>
        </div>
      ) : null}
      <div className="pointer-events-none flex gap-2">
        <button type="button" data-guide-native="true" data-testid="guide-walk-toggle" aria-pressed={engaged} onClick={onToggle} className={cn(PILL, engaged && "border-ink-1 bg-ink-1 text-bg hover:bg-ink-1")}>
          Walk with me
        </button>
        <button type="button" data-guide-native="true" data-testid="guide-hide" onClick={onHide} className={PILL}>
          Hide character
        </button>
      </div>
    </div>
  );
}

type BubbleProps = {
  text: string;
  index: number;
  total: number;
  side: "left" | "right";
  onNext: () => void;
};

/** The glass speech bubble. aria-hidden: the same facts are on the page; a tap or Enter reads the next line. */
export function GuideBubble({ text, index, total, side, onNext }: BubbleProps) {
  const more = index + 1 < total;
  return (
    <div
      aria-hidden="true"
      data-testid="guide-bubble"
      onClick={onNext}
      className={cn(
        "pointer-events-auto relative w-[228px] max-w-[min(228px,calc(100vw-120px))] cursor-default rounded-[18px] border border-hairline bg-bg/92 px-3.5 py-2.5 text-[13.5px] leading-[1.4] text-ink-1 shadow-2 backdrop-blur-md select-none",
      )}
    >
      <p>{text}</p>
      {total > 1 ? (
        <p className="label-mono mt-1.5 text-[10px] tracking-wide text-ink-3 uppercase">
          {index + 1} / {total}
          {more ? " · tap for more" : ""}
        </p>
      ) : null}
      <span
        aria-hidden="true"
        className={cn("absolute -bottom-[5px] size-2.5 rotate-45 border-r border-b border-hairline bg-bg", side === "left" ? "right-6" : "left-6")}
      />
    </div>
  );
}
