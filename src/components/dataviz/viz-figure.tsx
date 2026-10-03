"use client";


import { useId } from "react";
import { cn } from "@/lib/utils";
import { SERIES_BG } from "./scale";

export interface VizFrameProps {
  title: string;
  caption?: string;
  source?: string;
  badge?: string;
  className?: string;
}

interface VizFigureProps extends VizFrameProps {
  kind: string;
  /** Legend entries, coloured by index. */
  legend?: string[];
  children: React.ReactNode;
}

/**
 * Shared frame for every chart: title + honesty chip on top, the chart, a
 * legend, then one figcaption holding the caption and the source line.
 */
export function VizFigure({ kind, title, caption, source, badge, legend, className, children }: VizFigureProps) {
  const id = useId();
  return (
    <figure
      aria-labelledby={`${id}-title`}
      data-testid="dataviz"
      data-viz={kind}
      data-wide={className?.includes("left-1/2") ? "" : undefined}
      className={cn("my-10 flex flex-col gap-6 rounded-[26px] bg-canvas p-5 sm:p-8", className)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p id={`${id}-title`} className="max-w-[34rem] text-lg leading-snug font-semibold text-ink-1 md:text-xl">
          {title}
        </p>
        {badge ? (
          <span className="rounded-full border border-hairline bg-bg px-3 py-1 text-xs font-semibold tracking-wide text-ink-2 uppercase" data-testid="viz-badge">
            {badge}
          </span>
        ) : null}
      </div>
      {children}
      {legend && legend.length > 1 ? (
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-2" aria-label="Legend">
          {legend.map((name, i) => (
            <li key={name} className="flex items-center gap-2">
              <span aria-hidden="true" className={cn("size-3 rounded-sm", SERIES_BG[i % SERIES_BG.length])} />
              {name}
            </li>
          ))}
        </ul>
      ) : null}
      {caption || source ? (
        <figcaption className="flex flex-col gap-1.5 border-t border-hairline pt-4">
          {caption ? <span className="text-[0.95rem] leading-relaxed text-ink-2">{caption}</span> : null}
          {source ? (
            <span className="text-xs leading-relaxed text-ink-3" data-testid="viz-source">
              Source: {source}
            </span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
