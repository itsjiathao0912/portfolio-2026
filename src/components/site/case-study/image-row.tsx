"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";
import type { BlockOf } from "@content/schema.ts";
import { cn } from "@/lib/utils";
import { ScreenFrame } from "./screen-frame";

/**
 * Horizontal row of screens that breaks out of the reading column. Native
 * swipe + scroll-snap on every device (no scroll-jacking); arrow buttons on
 * fine pointers; soft edge fades hint that there is more.
 */
export function ImageRow({ block }: { block: BlockOf<"imageRow"> }) {
  const scroller = useRef<HTMLUListElement>(null);
  function nudge(dir: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  const phones = block.images.every((img) => img.device === "phone");
  return (
    <figure className="relative left-1/2 my-12 w-screen -translate-x-1/2" data-testid="image-row" data-wide="">
      <ul
        ref={scroller}
        tabIndex={0}
        aria-label={block.caption ?? "Screens"}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-[max(1.25rem,calc((100vw-1040px)/2))] pb-6 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-accent [mask-image:linear-gradient(90deg,transparent,#000_1.25rem,#000_calc(100%-1.25rem),transparent)]"
      >
        {block.images.map((img) => (
          <li key={img.src} className={cn("shrink-0 snap-center", phones ? "w-[64%] sm:w-[260px]" : "w-[86%] sm:w-[560px]")}>
            <ScreenFrame device={img.device} screens={[img]} sizes={phones ? "260px" : "(min-width: 640px) 560px, 86vw"} />
            {img.caption ? <p className="mt-3 text-center text-sm text-ink-3">{img.caption}</p> : null}
          </li>
        ))}
      </ul>
      <div className="mx-auto flex max-w-[1040px] items-center justify-between gap-4 px-5">
        {block.caption ? <figcaption className="text-sm text-ink-3">{block.caption}</figcaption> : <span />}
        <div className="hidden gap-2 [@media(hover:hover)]:flex">
          <button type="button" onClick={() => nudge(-1)} aria-label="Previous screens" className="flex size-11 items-center justify-center rounded-full bg-canvas text-ink-1 transition hover:bg-hairline active:scale-95">
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => nudge(1)} aria-label="Next screens" className="flex size-11 items-center justify-center rounded-full bg-canvas text-ink-1 transition hover:bg-hairline active:scale-95">
            <ArrowRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </figure>
  );
}
