import { ArrowUpRight } from "lucide-react";
import { headingAnchor, type ContentBlock } from "@content/schema.ts";
import { cn } from "@/lib/utils";
import { ZoomImage } from "./case-study-media";
import { MediaFrame } from "./media-frame";

/**
 * Width of an `image` block relative to the 800 px column: `wide` breaks out
 * to 1040 px, `bleed` to the full screen width (centred on the column).
 */
const IMAGE_SIZE = {
  column: "",
  wide: "relative left-1/2 w-[min(1040px,100vw)] -translate-x-1/2 px-5 md:px-0",
  bleed: "relative left-1/2 w-screen -translate-x-1/2",
} as const;

/**
 * Renders an ordered list of typed content blocks (server component) in a
 * centred 800 px column. Sections are separated by 150-200 px of space, not
 * rules; `steps` render as the numbered two-column story grid.
 */
export function CaseStudyBlocks({ blocks, title }: { blocks: readonly ContentBlock[]; title: string }) {
  return (
    <div className="flex flex-col gap-7" data-testid="case-study-body">
      {blocks.map((block, index) => (
        <Block key={index} block={block} title={title} first={index === 0} />
      ))}
    </div>
  );
}

function Block({ block, title, first }: { block: ContentBlock; title: string; first: boolean }) {
  switch (block.type) {
    case "heading": {
      if (block.level === 3) return <h3 className="mt-4 text-xl">{block.text}</h3>;
      const id = headingAnchor(block.text);
      return (
        <div className={cn("flex flex-col gap-3", !first && "mt-[110px] md:mt-[150px]")}>
          {block.eyebrow ? <p className="text-sm font-semibold text-ink-3 md:text-base">{block.eyebrow}</p> : null}
          <h2 id={id} data-toc-section="" className="scroll-mt-[150px] text-[1.75rem] leading-[1.15] md:text-[2rem] md:leading-[1.12]">
            {block.text}
          </h2>
        </div>
      );
    }
    case "paragraph":
      return <p className="text-[1.07rem] leading-[1.75] text-ink-1/85">{block.text}</p>;
    case "image":
      return (
        <figure className={cn("my-6 flex flex-col gap-3", IMAGE_SIZE[block.size])} data-size={block.size}>
          {block.src ? (
            <ZoomImage
              src={block.src}
              alt={block.alt}
              className={block.size === "bleed" ? "rounded-none" : undefined}
              sizes={block.size === "column" ? undefined : block.size === "wide" ? "(min-width: 1100px) 1040px, 100vw" : "100vw"}
            />
          ) : (
            <MediaFrame src={null} alt={block.alt} label={title} device={block.device} />
          )}
          {block.caption ? <figcaption className="text-sm text-ink-3">{block.caption}</figcaption> : null}
        </figure>
      );
    case "quote":
      return (
        <blockquote className="my-16 flex flex-col items-center text-center md:my-24" data-testid="quote">
          <span aria-hidden="true" className="font-display text-[4rem] leading-none text-ink-3">“</span>
          <p className="-mt-3 max-w-[40rem] font-display text-[1.7rem] leading-[1.3] text-balance text-ink-1 md:text-[2rem]">{block.text}</p>
          {block.attribution ? <footer className="mt-4 text-sm text-ink-3">{block.attribution}</footer> : null}
        </blockquote>
      );
    case "list": {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag className={cn("flex flex-col gap-3 pl-5 text-[1.07rem] leading-relaxed text-ink-2", block.ordered ? "list-decimal" : "list-disc marker:text-accent")}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ListTag>
      );
    }
    case "metrics":
      return (
        <dl
          className={cn(
            "my-6 grid gap-x-8 gap-y-8 border-t border-hairline pt-8",
            block.items.length === 4
              ? "grid-cols-2 md:grid-cols-4"
              : block.items.length === 3
                ? "grid-cols-1 sm:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2"
          )}
          data-testid="metrics"
        >
          {block.items.map((item) => (
            <div key={item.label} className="flex flex-col-reverse justify-end gap-2">
              <dt className="text-sm leading-snug text-ink-3">{item.label}</dt>
              <dd className="font-display text-[2.5rem] leading-none text-ink-1 md:text-[3rem]">{item.value}</dd>
            </div>
          ))}
        </dl>
      );
    case "steps":
    case "features":
      return (
        <ol className="my-6 grid gap-x-12 gap-y-12 sm:grid-cols-2" data-testid="steps">
          {block.items.map((item, i) => (
            <li key={item.title} className="flex flex-col">
              <span aria-hidden="true" className="font-display text-[2rem] leading-none text-ink-1 md:text-[2.5rem]">
                {i + 1}.
              </span>
              <p className="mt-4 text-xl font-semibold text-ink-1 md:text-2xl">{item.title}</p>
              <p className="mt-2 text-base leading-[1.6] text-ink-1/80">{item.text}</p>
            </li>
          ))}
        </ol>
      );
    case "gallery":
      return (
        <ul className="my-6 grid gap-10" data-testid="gallery">
          {block.images.map((image) => (
            <li key={image.src}>
              <figure className="flex flex-col gap-3">
                <ZoomImage src={image.src} alt={image.alt} />
                {image.caption ? <figcaption className="text-center text-sm text-ink-3">{image.caption}</figcaption> : null}
              </figure>
            </li>
          ))}
        </ul>
      );
    case "stack":
      return (
        <ul className="flex flex-wrap gap-2" aria-label="Technology">
          {block.items.map((item) => (
            <li key={item} className="rounded-full bg-canvas px-4 py-2 text-sm font-medium text-ink-1">
              {item}
            </li>
          ))}
        </ul>
      );
    case "links":
      return (
        <ul className="mt-2 flex flex-wrap gap-3">
          {block.items.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-accent underline-offset-4 hover:text-accent-hover hover:underline"
              >
                {link.label}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      );
    case "callout":
      return <p className="rounded-[var(--radius)] bg-accent-tint px-5 py-4 text-ink-1">{block.text}</p>;
  }
}

/** Quiet role / company / period / stack strip, shown at the top of the body. */
export function MetaStrip({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-hairline py-8 md:grid-cols-4" data-testid="meta-row">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-sm font-semibold text-ink-3">{item.label}</dt>
          <dd className="mt-1 text-[0.95rem] leading-snug text-ink-1">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
