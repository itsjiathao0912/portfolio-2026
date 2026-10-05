import Image from "next/image";
import { cn } from "@/lib/utils";

interface PortraitProps {
  /** Colour cut-out. If named `*-color.*`, a sibling `*-bw.*` file is used as the resting state. */
  src: string | null;
  name: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/** `/x/thao-color.webp` -> `/x/thao-bw.webp`; null when there is no matching pair. */
export function bwVariant(src: string) {
  return /-color\.\w+$/.test(src) ? src.replace(/-color(\.\w+)$/, "-bw$1") : null;
}

/**
 * Background-removed headshot, black-and-white at rest, crossfading to colour
 * on hover (hover-capable devices only; touch stays monochrome). Without a
 * B/W sibling file it falls back to a CSS grayscale filter. With no photo it
 * renders a quiet silhouette instead of a broken image.
 */
export function Portrait({ src, name, className, priority, sizes = "(min-width: 768px) 560px, 90vw" }: PortraitProps) {
  const bw = src ? bwVariant(src) : null;
  const img = "object-contain object-bottom";
  return (
    <figure data-testid="portrait" className={cn("group relative mx-auto aspect-[643/736] w-full", className)}>
      {src ? (
        <>
          <Image
            src={bw ?? src}
            alt={`Portrait of ${name}`}
            fill
            unoptimized
            // Next 16: `preload` replaces `priority`, and neither sets fetchpriority —
            // pass it explicitly so the hero LCP image is fetched first and never lazy.
            preload={priority}
            loading={priority ? "eager" : undefined}
            fetchPriority={priority ? "high" : undefined}
            sizes={sizes}
            className={cn(img, !bw && "grayscale contrast-[1.1]")}
          />
          <Image
            src={src}
            alt=""
            aria-hidden="true"
            fill
            unoptimized
            sizes={sizes}
            className={cn(img, "opacity-0 transition-opacity duration-300 ease-out [@media(hover:hover)]:group-hover:opacity-100")}
          />
        </>
      ) : (
        <svg viewBox="0 0 200 230" aria-label={`${name} (photo coming soon)`} role="img" className="absolute inset-0 h-full w-full text-ink-1/10">
          {/* TODO(content): set content/site.ts `portrait` to a background-removed headshot. */}
          <circle cx="100" cy="80" r="42" fill="currentColor" />
          <path d="M20 230c0-55 36-90 80-90s80 35 80 90z" fill="currentColor" />
        </svg>
      )}
    </figure>
  );
}
