"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { SPRING } from "@/components/motion/springs";
import { isOnBoard } from "./logic";

/**
 * Hidden gem (404): a tiny game — this page's sticky note fell off the board;
 * drag it back on. Works with mouse and finger; a "put it back for me" button
 * does it for keyboard users. The real way out (Go home / See the work) is
 * always visible beside it, so the game never blocks navigation.
 * Reduced motion: the note still drags (the visitor moves it), but snaps
 * without spring animation.
 */
export function LostNoteGame() {
  const reduce = useReducedMotion();
  const board = useRef<HTMLDivElement>(null);
  const note = useRef<HTMLDivElement>(null);
  const [found, setFound] = useState(false);

  function check() {
    const b = board.current?.getBoundingClientRect();
    const n = note.current?.getBoundingClientRect();
    if (b && n && isOnBoard(n, b)) setFound(true);
  }

  return (
    <div className="flex w-full flex-col items-start gap-4" data-testid="lost-note-game" data-found={found ? "true" : "false"}>
      <div className="relative flex w-full max-w-[520px] items-center gap-6">
        <div
          ref={board}
          data-testid="lost-note-board"
          className="relative grid h-[150px] flex-1 grid-cols-3 gap-2 rounded-[20px] bg-canvas p-3 ring-1 ring-hairline"
          aria-hidden="true"
        >
          <span className="rounded-md bg-[#d9f1f7]" />
          <span className="rounded-md bg-[#ffe6ee]" />
          <span className="rounded-md bg-[#e7e8ff]" />
          <span className="rounded-md bg-[#daf5e8]" />
          <span className={found ? "rounded-md bg-[#fde68a] ring-2 ring-ink-1" : "rounded-md border-2 border-dashed border-border-strong"} />
          <span className="rounded-md bg-[#ffeadb]" />
        </div>
        {!found ? (
          <motion.div
            ref={note}
            drag
            dragMomentum={false}
            dragSnapToOrigin
            dragTransition={reduce ? { bounceStiffness: 10000, bounceDamping: 100 } : undefined}
            whileDrag={reduce ? undefined : { scale: 1.08, rotate: 4 }}
            transition={reduce ? { duration: 0 } : SPRING.ui}
            onDragEnd={check}
            data-testid="lost-note"
            aria-hidden="true"
            className="flex size-[92px] shrink-0 -rotate-6 cursor-grab touch-none items-center justify-center rounded-md bg-[#fde68a] p-2 text-center text-[13px] leading-tight font-medium text-ink-1 shadow-card-hover active:cursor-grabbing"
          >
            this page
          </motion.div>
        ) : null}
      </div>
      <p aria-live="polite" className="text-ink-2" data-testid="lost-note-status">
        {found ? "Found it. Thanks for tidying up — now pick a way out below." : "While you're here: drag the lost note back onto the board."}
      </p>
      {!found ? (
        <button type="button" onClick={() => setFound(true)} className="label-mono text-[12px] text-ink-3 underline decoration-dotted underline-offset-4 hover:text-ink-1" data-testid="lost-note-auto">
          put it back for me
        </button>
      ) : null}
    </div>
  );
}
