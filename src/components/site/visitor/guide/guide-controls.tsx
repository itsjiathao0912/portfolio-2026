"use client";

// Walking guide: keys, the speech bubble and the tiny controls.
//
// There are no big buttons. The character is driven directly: ArrowLeft / ArrowRight
// walk, ArrowUp or W jump, whenever it is on screen and focus is not in a field or on
// a link / button (`shouldHandleGuideKey`). ArrowDown, Space and PageDown are never
// claimed, so the page still scrolls. On touch, a tap hops; two quick taps reveal a
// small pad (left, right, jump).

import { type RefObject, useEffect } from "react";
import { cn } from "@/lib/utils";
import { guideAction, type KeyTarget, shouldHandleGuideKey } from "./guide-logic";

export type PressKey = "left" | "right" | "hop";
export type KeyAction = "left" | "right" | "up";

export type KeyHandlers = {
  /** `down` true on press, false on release. `repeat` is the OS auto-repeat flag. */
  key: (action: KeyAction, down: boolean, repeat: boolean) => void;
  /** Clear every held key (window blur, tab hidden). */
  clear: () => void;
};

/**
 * Document key listeners, always on while the guide is mounted. Only the claimed
 * keys reach `handlers.key`, and only when the key landed on the page itself or on
 * the guide. A key released after a handled press always clears the held state,
 * even if focus moved to a field in between.
 */
export function useGuideKeys(rootRef: RefObject<HTMLElement | null>, handlers: RefObject<KeyHandlers | null>) {
  useEffect(() => {
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      const h = handlers.current;
      if (!h) return;
      const action = guideAction(e.key);
      if (!action) return;
      if (!down) {
        h.key(action, false, false);
        return;
      }
      if (e.defaultPrevented || !shouldHandleGuideKey(e.target as KeyTarget | null, rootRef.current, e, window.innerHeight)) return;
      e.preventDefault();
      h.key(action, true, e.repeat);
    };
    const keydown = onKey(true);
    const keyup = onKey(false);
    const clear = () => handlers.current?.clear();
    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);
    window.addEventListener("blur", clear);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", clear);
    };
  }, [rootRef, handlers]);
}

const MINI =
  "pointer-events-auto grid size-11 place-items-center rounded-full border border-hairline bg-bg/92 text-[15px] leading-none text-ink-1 shadow-1 backdrop-blur-md outline-none select-none touch-none focus-visible:ring-2 focus-visible:ring-accent active:bg-accent-tint";

/** The small touch pad: left, right, jump. Hold to walk. Shown only after two quick taps on the character. */
export function GuideTouchPad({ onPress }: { onPress: (key: PressKey, down: boolean) => void }) {
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
    <div className="pointer-events-none flex gap-1.5" data-testid="guide-touch-controls">
      <button type="button" aria-label="Walk left" className={MINI} {...hold("left")}>
        ◀
      </button>
      <button type="button" aria-label="Walk right" className={MINI} {...hold("right")}>
        ▶
      </button>
      <button type="button" aria-label="Jump" className={MINI} {...hold("hop")}>
        ⤒
      </button>
    </div>
  );
}

/** The one-time hint above the head. Fades out on first use. */
export function GuideHint({ visible, coarse, reduce }: { visible: boolean; coarse: boolean; reduce: boolean }) {
  return (
    <p
      data-testid="guide-hint"
      aria-hidden="true"
      className={cn(
        "pointer-events-none block w-max rounded-full border border-hairline bg-bg/92 px-2.5 py-1 text-[11px] leading-none whitespace-nowrap text-ink-2 shadow-1 backdrop-blur-md transition-opacity duration-500",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      {coarse ? "tap to hop · tap twice for arrows" : reduce ? "← → to hop between spots" : "← → to walk · ↑ to jump"}
    </p>
  );
}

type BubbleProps = {
  text: string;
  index: number;
  total: number;
  place: "left" | "right" | "above";
};

/** The compact glass speech bubble. Never interactive (taps fall through to the page) and aria-hidden: the same facts are on the page. */
export function GuideBubble({ text, place }: BubbleProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="guide-bubble"
      data-place={place}
      className="pointer-events-none relative w-full rounded-[16px] border border-hairline bg-bg/92 px-3 py-2 text-[12.5px] leading-[1.38] text-ink-1 shadow-2 backdrop-blur-md select-none"
    >
      <p>{text}</p>
      <span
        aria-hidden="true"
        className={cn(
          "absolute size-2.5 rotate-45 bg-bg",
          place === "above" ? "-bottom-[5px] left-1/2 -translate-x-1/2 border-r border-b border-hairline" : place === "right" ? "bottom-3 -left-[5px] border-b border-l border-hairline" : "bottom-3 -right-[5px] border-t border-r border-hairline",
        )}
      />
    </div>
  );
}

/** Small screens: the line waits behind a tiny dot; tapping it opens the bubble. */
export function GuideDot({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      data-testid="guide-dot"
      aria-label="Read what the guide says"
      onClick={onOpen}
      className="group pointer-events-auto grid size-11 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span aria-hidden="true" className="grid size-7 place-items-center rounded-full border border-hairline bg-bg/95 text-[12px] leading-none text-ink-2 shadow-1">
        …
      </span>
    </button>
  );
}
