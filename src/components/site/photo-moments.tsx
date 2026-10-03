import Image from "next/image";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export interface Moment {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
}

/**
 * Real photos of Thao at events. Desktop: one row (portrait shots narrower);
 * phone: a horizontal snap scroller. Images are pre-optimised WebP in
 * /public/photos, lazy-loaded, with fixed aspect ratios so nothing jumps.
 */
export function PhotoMoments({ moments, title = "Off the screen", className }: { moments: readonly Moment[]; title?: string; className?: string }) {
  if (moments.length === 0) return null;
  return (
    <section aria-labelledby="moments-title" className={cn("bg-bg py-20 md:py-[130px]", className)} data-testid="section-moments">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10 lg:px-[60px]">
        <h2 id="moments-title" className="text-[32px] md:text-[46px]">
          {title}
        </h2>
      </div>
      <ul className="mx-auto mt-10 flex max-w-[1320px] snap-x snap-mandatory items-end gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] md:gap-6 md:px-10 lg:px-[60px]">
        {moments.map((m, i) => {
          const portrait = m.height > m.width;
          return (
            <Reveal
              as="li"
              index={i}
              key={m.id}
              className={cn("shrink-0 snap-center", portrait ? "w-[62vw] max-w-[300px] md:w-[300px]" : "w-[82vw] max-w-[560px] md:w-[46%] lg:w-[520px]")}
            >
              <figure data-testid="moment">
                <div className="overflow-hidden rounded-[20px] bg-canvas ring-1 ring-black/5" style={{ aspectRatio: `${m.width} / ${m.height}` }}>
                  <Image src={m.src} alt={m.alt} width={m.width} height={m.height} unoptimized loading="lazy" className="h-full w-full object-cover" />
                </div>
                <figcaption className="mt-3 px-1 text-[14px] text-ink-3">{m.caption}</figcaption>
              </figure>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
