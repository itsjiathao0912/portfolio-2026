import { ArrowUpRight } from "lucide-react";
import { headingAnchor, type CaseLayout, type ContentBlock } from "@content/schema.ts";
import { BarChart, BeforeAfter, CompareSlider, Explorable, FlowDiagram, Funnel, LineChart, ModuleMap, ScoreLadder, ScrubTimeline, StackedBar, Timeline, VideoLoop } from "@/components/dataviz";
import { cn } from "@/lib/utils";
import { ZoomImage } from "../case-study-media";
import { MediaFrame } from "../media-frame";
import { ImageRow } from "./image-row";
import { StoryScroller } from "./story-scroller";

const IMAGE_SIZE = {
  column: "",
  wide: "relative left-1/2 w-[min(1040px,100vw)] -translate-x-1/2 px-5 md:px-0",
  bleed: "relative left-1/2 w-screen -translate-x-1/2",
} as const;

/** Wider-than-column breakout used by charts in the magazine/showcase layouts. */
const WIDE = "relative left-1/2 w-[min(960px,calc(100vw-2.5rem))] -translate-x-1/2";

/**
 * Case-study body renderer (server component). Same typed blocks for every
 * project; the `layout` changes how some blocks are drawn:
 * - story: galleries become swipe rows; `story` blocks pin a device.
 * - magazine: narrow column, galleries as swipe rows, big pull quotes.
 * - showcase: galleries become a bento of screens; charts break out wider.
 */
export function CaseBlocks({ blocks, title, layout }: { blocks: readonly ContentBlock[]; title: string; layout: CaseLayout }) {
  return (
    <div className="flex flex-col gap-7" data-testid="case-study-body" data-layout={layout}>
      {blocks.map((block, index) => (
        <Block key={index} block={block} title={title} first={index === 0} layout={layout} />
      ))}
    </div>
  );
}

function Block({ block, title, first, layout }: { block: ContentBlock; title: string; first: boolean; layout: CaseLayout }) {
  const wideViz = layout === "showcase" ? WIDE : undefined;
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
      return <p className={cn("leading-[1.75] text-ink-1/85", layout === "magazine" ? "text-[1.15rem]" : "text-[1.07rem]")}>{block.text}</p>;
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
        <blockquote
          className={cn("my-16 flex flex-col md:my-24", layout === "magazine" ? "items-start border-l-4 border-accent pl-6 text-left" : "items-center text-center")}
          data-testid="quote"
        >
          {layout === "magazine" ? null : (
            <span aria-hidden="true" className="font-display text-[4rem] leading-none text-ink-3">
              “
            </span>
          )}
          <p className={cn("max-w-[40rem] font-display leading-[1.3] text-balance text-ink-1", layout === "magazine" ? "text-[1.9rem] md:text-[2.4rem]" : "-mt-3 text-[1.7rem] md:text-[2rem]")}>
            {block.text}
          </p>
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
        <div className="my-6 flex flex-col gap-4" data-testid="metrics-block">
          {block.badge ? (
            <span className="self-start rounded-full border border-hairline bg-canvas px-3 py-1 text-xs font-semibold tracking-wide text-ink-2 uppercase" data-testid="viz-badge">
              {block.badge}
            </span>
          ) : null}
          <dl
            className={cn(
              "grid gap-x-8 gap-y-8 border-t border-hairline pt-8",
              block.items.length === 4 ? "grid-cols-2 md:grid-cols-4" : block.items.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2",
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
          {block.source ? <p className="text-xs text-ink-3">Source: {block.source}</p> : null}
        </div>
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
      if (layout === "showcase") return <Bento images={block.images} />;
      if (block.images.length > 1)
        return <ImageRow block={{ type: "imageRow", images: block.images.map((img) => ({ ...img, device: "browser" as const })) }} />;
      return (
        <figure className="my-6 flex flex-col gap-3" data-testid="gallery">
          <ZoomImage src={block.images[0].src} alt={block.images[0].alt} />
          {block.images[0].caption ? <figcaption className="text-center text-sm text-ink-3">{block.images[0].caption}</figcaption> : null}
        </figure>
      );
    case "imageRow":
      return <ImageRow block={block} />;
    case "story":
      return <StoryScroller block={block} />;
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
              <a href={link.href} rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium text-accent underline-offset-4 hover:text-accent-hover hover:underline">
                {link.label}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      );
    case "callout":
      return <p className="rounded-[var(--radius)] bg-accent-tint px-5 py-4 text-ink-1">{block.text}</p>;
    case "barChart":
      return <BarChart className={wideViz} {...block} />;
    case "lineChart":
      return <LineChart className={wideViz} {...block} />;
    case "funnel":
      return <Funnel className={wideViz} {...block} />;
    case "flow":
      return <FlowDiagram className={WIDE} {...block} />;
    case "moduleMap":
      return <ModuleMap className={wideViz} {...block} />;
    case "timeline":
      return <Timeline className={wideViz} {...block} />;
    case "beforeAfter":
      return <BeforeAfter className={wideViz} {...block} />;
    case "stackedBar":
      return <StackedBar className={wideViz} {...block} />;
    case "scoreLadder":
      return <ScoreLadder className={wideViz} {...block} />;
    case "compareSlider":
      return <CompareSlider className={wideViz} {...block} />;
    case "scrubTimeline":
      return <ScrubTimeline className={wideViz} {...block} />;
    case "explorable":
      return <Explorable className={WIDE} {...block} />;
    case "video":
      return <VideoLoop {...block} />;
    case "code":
      return (
        <figure className="my-6 flex flex-col gap-3" data-testid="code-block">
          <pre className="overflow-x-auto rounded-[20px] bg-ink-1 p-5 font-mono text-[0.85rem] leading-relaxed text-white/90" tabIndex={0} aria-label={`${block.language} sample`}>
            <code>{block.code}</code>
          </pre>
          {block.caption ? <figcaption className="text-sm text-ink-3">{block.caption}</figcaption> : null}
        </figure>
      );
  }
}

/** Showcase gallery: a bento of screens, the first one large. */
function Bento({ images }: { images: BlockOf<"gallery">["images"] }) {
  return (
    <ul className={cn("my-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4", WIDE)} data-testid="bento" data-wide="">
      {images.map((image, i) => (
        <li
          key={image.src}
          className={cn("flex flex-col gap-2", i === 0 ? "col-span-2 md:row-span-2" : i % 3 === 1 ? "col-span-2 md:col-span-2" : "col-span-1 md:col-span-2")}
        >
          <ZoomImage src={image.src} alt={image.alt} aspect={i === 0 ? "aspect-[4/3] md:aspect-[4/3.35]" : "aspect-[16/10]"} />
          {image.caption ? <p className="text-sm text-ink-3">{image.caption}</p> : null}
        </li>
      ))}
    </ul>
  );
}

type BlockOf<T extends ContentBlock["type"]> = Extract<ContentBlock, { type: T }>;
