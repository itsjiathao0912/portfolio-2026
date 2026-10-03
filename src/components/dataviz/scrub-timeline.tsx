"use client";

import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { nearestStop } from "./scale";
import { VizFigure, type VizFrameProps } from "./viz-figure";

interface Track {
  name: string;
  stops: { when: string; label: string; detail: string }[];
}
interface ScrubTimelineProps extends VizFrameProps {
  tracks: Track[];
}

/**
 * Scrubbable timeline: drag the playhead (a range input, so keys work too) or
 * tap a stop; the card under it swaps to that stop. With 2+ tracks a toggle
 * switches between them.
 */
export function ScrubTimeline({ tracks, ...frame }: ScrubTimelineProps) {
  const reduce = useReducedMotion();
  const [trackIndex, setTrackIndex] = useState(0);
  const [pos, setPos] = useState(0);
  const id = useId();
  const track = tracks[trackIndex];
  const n = track.stops.length;
  const current = nearestStop(pos, n);
  const stop = track.stops[current];
  const at = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);

  return (
    <VizFigure kind="scrub-timeline" {...frame}>
      <div className="flex flex-col gap-6">
        {tracks.length > 1 ? (
          <div role="tablist" aria-label="Timeline" className="flex gap-1 self-start rounded-full bg-bg p-1">
            {tracks.map((t, i) => (
              <button
                key={t.name}
                type="button"
                role="tab"
                aria-selected={i === trackIndex}
                onClick={() => {
                  setTrackIndex(i);
                  setPos(0);
                }}
                className={cn("min-h-11 rounded-full px-4 text-sm font-semibold transition-colors", i === trackIndex ? "bg-ink-1 text-white" : "text-ink-2 hover:text-ink-1")}
                data-testid="track-tab"
              >
                {t.name}
              </button>
            ))}
          </div>
        ) : null}

        <div className="relative px-3 pt-2">
          <div className="relative h-1.5 rounded-full bg-hairline">
            <span className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-150" style={{ width: `${pos * 100}%` }} />
          </div>
          <ol className="relative -mt-[11px] h-4">
            {track.stops.map((s, i) => (
              <li key={`${track.name}-${s.label}`} className="absolute -translate-x-1/2" style={{ left: `${at(i)}%` }}>
                <button
                  type="button"
                  onClick={() => setPos(n === 1 ? 0 : i / (n - 1))}
                  aria-label={`${s.when}: ${s.label}`}
                  className={cn("relative block size-4 rounded-full border-[3px] border-canvas transition-colors after:absolute after:-inset-3.5 after:content-['']", i <= current ? "bg-accent" : "bg-ink-3/50")}
                  data-testid="timeline-stop"
                />
              </li>
            ))}
          </ol>
          <label htmlFor={id} className="sr-only">
            Scrub the {track.name} timeline
          </label>
          <input
            id={id}
            type="range"
            min={0}
            max={1000}
            value={Math.round(pos * 1000)}
            onChange={(e) => setPos(Number(e.target.value) / 1000)}
            onPointerUp={() => setPos(n === 1 ? 0 : current / (n - 1))}
            aria-valuetext={`${stop.when}: ${stop.label}`}
            className="absolute inset-x-0 -top-3 h-11 w-full cursor-grab opacity-0"
            data-testid="timeline-range"
          />
          <div className="mt-3 hidden justify-between text-xs text-ink-3 sm:flex" aria-hidden="true">
            {track.stops.map((s, i) => (
              <span key={s.label} className={cn("w-0 text-center whitespace-nowrap", i === 0 && "w-auto text-left", i === n - 1 && "w-auto text-right", i === current && "font-semibold text-ink-1")}>
                {i === 0 || i === n - 1 || i === current ? s.when : ""}
              </span>
            ))}
          </div>
        </div>

        <div className="relative min-h-[8.5rem]" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${track.name}-${current}`}
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
              className="flex flex-col gap-1.5 rounded-2xl bg-bg p-5"
              data-testid="timeline-card"
            >
              <span className="text-xs font-semibold tracking-wide text-accent uppercase">
                {current + 1} / {n} · {stop.when}
              </span>
              <span className="text-lg font-semibold text-ink-1">{stop.label}</span>
              <span className="text-[0.95rem] leading-relaxed text-ink-2">{stop.detail}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </VizFigure>
  );
}
