"use client";

import { useRef, useState } from "react";
import { requestSketchToggle } from "./secret-word";

const TAPS = 5;

/**
 * The footer name, doubling as the hidden hint for sketch mode. Hover/focus
 * (desktop) shows a tiny "psst: type thao" note; on phones, where there is no
 * keyboard, tapping the name five times toggles sketch mode instead.
 */
export function SketchHint({ name }: { name: string }) {
  const taps = useRef<number[]>([]);
  const [hint, setHint] = useState(false);
  return (
    <span className="group relative inline-block">
      <button
        type="button"
        data-testid="sketch-hint"
        onClick={() => {
          const now = Date.now();
          taps.current = [...taps.current.filter((t) => now - t < 2000), now];
          if (taps.current.length >= TAPS) {
            taps.current = [];
            requestSketchToggle();
          }
        }}
        onFocus={() => setHint(true)}
        onBlur={() => setHint(false)}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHint(true)}
        onPointerLeave={() => setHint(false)}
        className="font-medium text-ink-1"
        aria-describedby="sketch-hint-note"
      >
        {name}
      </button>
      <span
        id="sketch-hint-note"
        role="note"
        data-shown={hint ? "true" : "false"}
        className="label-mono pointer-events-none absolute bottom-full left-0 mb-1 whitespace-nowrap text-[11px] text-ink-3 opacity-0 transition-opacity duration-200 data-[shown=true]:opacity-100"
      >
        psst: type &quot;thao&quot; anywhere
      </span>
    </span>
  );
}
