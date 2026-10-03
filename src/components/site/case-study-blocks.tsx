import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { headingAnchor, type ContentBlock } from "@content/schema.ts";
import { cn } from "@/lib/utils";
import { MediaFrame } from "./media-frame";

/** Renders an ordered list of typed content blocks (server component). */
export function CaseStudyBlocks({ blocks, title }: { blocks: readonly ContentBlock[]; title: string }) {
  return (
    <div className="flex flex-col gap-6" data-testid="case-study-body">
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
        <div className={cn("flex flex-col gap-2", !first && "mt-12 border-t border-hairline pt-12")}>
          {block.eyebrow ? <p className="label-mono text-accent">{block.eyebrow}</p> : null}
          <h2 id={id} data-toc-section="" className="scroll-mt-28 text-3xl md:text-4xl">
            {block.text}
          </h2>
        </div>
      );
    }
    case "paragraph":
      return <p className="text-[1.07rem] leading-[1.75] text-ink-2">{block.text}</p>;
    case "image":
      return (
        <figure className="my-4 flex flex-col gap-3">
          <MediaFrame src={block.src} alt={block.alt} label={title} device={block.device} />
          {block.caption ? <figcaption className="text-sm text-ink-3">{block.caption}</figcaption> : null}
        </figure>
      );
    case "quote":
      return (
        <blockquote className="my-4 border-l-4 border-accent pl-6">
          <p className="font-display text-2xl text-ink-1">“{block.text}”</p>
          {block.attribution ? <footer className="mt-2 text-sm text-ink-3">— {block.attribution}</footer> : null}
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
            "my-2 grid gap-3",
            block.items.length >= 3 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"
          )}
          data-testid="metrics"
        >
          {block.items.map((item) => (
            <div key={item.label} className="flex flex-col-reverse justify-end gap-1 rounded-[var(--radius)] bg-canvas p-5">
              <dt className="text-sm leading-snug text-ink-3">{item.label}</dt>
              <dd className="font-display text-3xl text-ink-1 md:text-4xl">{item.value}</dd>
            </div>
          ))}
        </dl>
      );
    case "features":
      return (
        <ul className="grid gap-3 sm:grid-cols-2">
          {block.items.map((item) => (
            <li key={item.title} className="rounded-[var(--radius)] border border-hairline p-5">
              <p className="font-display text-lg text-ink-1">{item.title}</p>
              <p className="mt-1 text-[0.97rem] leading-relaxed text-ink-2">{item.text}</p>
            </li>
          ))}
        </ul>
      );
    case "gallery":
      return (
        <ul className="my-4 grid gap-4 sm:grid-cols-2" data-testid="gallery">
          {block.images.map((image) => (
            <li key={image.src}>
              <figure className="flex flex-col gap-2">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[14px] border border-hairline bg-canvas">
                  <Image src={image.src} alt={image.alt} fill unoptimized sizes="(min-width: 768px) 380px, 100vw" className="object-cover object-top" />
                </div>
                {image.caption ? <figcaption className="text-sm text-ink-3">{image.caption}</figcaption> : null}
              </figure>
            </li>
          ))}
        </ul>
      );
    case "stack":
      return (
        <ul className="flex flex-wrap gap-2" aria-label="Technology">
          {block.items.map((item) => (
            <li key={item} className="rounded-full bg-accent-tint px-3.5 py-1.5 text-sm font-medium text-accent-hover">
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
                target="_blank"
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
