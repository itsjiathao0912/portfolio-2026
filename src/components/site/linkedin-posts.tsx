"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { type CSSProperties, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LiftCard } from "@/components/ui/lift-card";
import { CARD_GAP, CARD_W, isEmbed, relativeDate, type LinkedinPostEntry } from "./linkedin-data";

export { CARD_GAP, CARD_W };
import { LinkedinIcon } from "./brand-icons";
import { Reveal } from "./reveal";

export type LinkedinPost = LinkedinPostEntry;

/**
 * Card widths (px). Desktop: 3 × 384 + 2 × 24px gap = the 1200px content column
 * at 1440, so three posts sit fully on one row; more scroll. Phone: 320 + 16px
 * gap leaves the next card peeking (~1.1 visible at 390). A cross-origin embed cannot
 * report its height, so each post's height is measured at these widths and
 * stored in content/site.ts (no reserved blank space). If a viewer sees
 * LinkedIn's cookie banner, the embed scrolls inside instead.
 */
/** Start loading embeds this far before the section scrolls into view. */
export const PRELOAD_MARGIN = "800px 0px";

const URN = /^urn:li:(share|ugcPost|activity):\d+$/;

/** Official COLLAPSED embed URL for a post urn; null for anything that is not a LinkedIn urn. */
export function linkedinEmbedSrc(urn: string) {
  return URN.test(urn) ? `https://www.linkedin.com/embed/feed/update/${urn}?collapsed=1` : null;
}

/** Drop duplicate urns and anything that is not a valid urn, keeping order. */
export function dedupePosts<T extends { urn: string }>(posts: readonly T[]) {
  const seen = new Set<string>();
  return posts.filter((p) => linkedinEmbedSrc(p.urn) && !seen.has(p.urn) && (seen.add(p.urn), true));
}

const DATE_FMT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** "13 Sep 2026" for an ISO date; the raw string when it does not parse. */
export function formatPostDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : DATE_FMT.format(d);
}

/** How long an embed may take before we stop waiting and show the text card instead. */
export const EMBED_TIMEOUT_MS = 9000;

/**
 * A blocked embed (ad blocker, tracking protection, X-Frame-Options) still fires `load` for the
 * browser's error page, and a cross-origin frame cannot be inspected, so `onLoad` alone proves
 * nothing. We also (a) probe the embed URL: a network-level block rejects the request, and
 * (b) give up after EMBED_TIMEOUT_MS without a load. Either way the text-first card stays.
 */
function useEmbedHealth(src: string, active: boolean) {
  const [state, setState] = useState<"waiting" | "loaded" | "failed">("waiting");
  useEffect(() => {
    if (!active) return;
    let done = false;
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => {
      if (!done) setState((s) => (s === "loaded" ? s : "failed"));
    }, EMBED_TIMEOUT_MS);
    // no-cors HEAD: opaque on success, a TypeError when the request is blocked.
    fetch(src, { method: "HEAD", mode: "no-cors", credentials: "omit", signal: ctrl.signal }).catch((err: unknown) => {
      if ((err as { name?: string })?.name === "AbortError") return;
      setState("failed");
    });
    return () => {
      done = true;
      ctrl.abort();
      window.clearTimeout(timer);
    };
  }, [src, active]);
  const markLoaded = () => setState((s) => (s === "failed" ? s : "loaded"));
  return [state, markLoaded] as const;
}

function EmbedCard({ post, load }: { post: Extract<LinkedinPost, { kind: "embed" }>; load: boolean }) {
  const src = linkedinEmbedSrc(post.urn)!;
  const [health, markLoaded] = useEmbedHealth(src, load);
  const failed = health === "failed";
  const loaded = health === "loaded";
  return (
    <div
      className="relative isolate z-0 h-[var(--h-phone)] overflow-hidden rounded-2xl bg-bg shadow-card ring-1 ring-black/5 md:h-[var(--h-desktop)]"
      style={{ "--h-phone": `${post.embedHeight.phone}px`, "--h-desktop": `${post.embedHeight.desktop}px` } as CSSProperties}
      data-testid="linkedin-card"
      data-state={failed ? "fallback" : loaded ? "loaded" : load ? "loading" : "preview"}
    >
      {load && !failed ? (
        // Sized to the post itself; scrolls inside only if LinkedIn adds its cookie banner.
        <iframe
          src={src}
          title={`LinkedIn post: ${post.title}`}
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={markLoaded}
          data-testid="linkedin-embed"
          className={`absolute inset-0 block h-full w-full border-0 transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      ) : null}
      {loaded ? null : (
        // Text-first card until the official embed has loaded, and for good if it cannot.
        <div data-testid="linkedin-preview" aria-hidden={load && !failed} className="relative flex h-full flex-col gap-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <time dateTime={post.date} className="text-[13px] text-ink-3">
              {formatPostDate(post.date)}
            </time>
            <LinkedinIcon className="size-6 text-[#0a66c2]" />
          </div>
          <p className="text-[18px] leading-[1.3] font-semibold text-ink-1">{post.title}</p>
          <p className={failed ? "line-clamp-[9] text-[15px] leading-[1.55] text-ink-2" : "line-clamp-6 text-[15px] leading-[1.55] text-ink-2"}>{post.excerpt}</p>
          {failed ? (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="linkedin-fallback-link"
              className="mt-auto inline-flex min-h-11 items-center gap-1 text-[15px] font-semibold text-[#0a66c2] hover:underline"
            >
              View on LinkedIn <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          ) : (
            <div className="mt-2 space-y-2" aria-hidden="true">
              <div className="h-3 w-11/12 animate-pulse rounded-full bg-black/5" />
              <div className="h-3 w-4/5 animate-pulse rounded-full bg-black/5" />
              <div className="mt-4 aspect-[4/3] w-full animate-pulse rounded-xl bg-black/5" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const DEFAULT_AUTHOR = { name: "Thao Dao", headline: "Product Owner @SkyLab", avatar: "/portrait/thao-color.webp" } as const;

/** Small reaction glyphs drawn here (not LinkedIn's): like, heart, celebrate. */
function ReactionGlyphs() {
  const dot = "grid size-[18px] place-items-center rounded-full ring-2 ring-bg";
  return (
    <span className="flex -space-x-1" aria-hidden="true">
      <span className={`${dot} bg-[#0a66c2]`}>
        <svg viewBox="0 0 24 24" className="size-2.5 fill-white"><path d="M2 10h4v11H2zM8 21V10l4-7c1.5 0 2.5 1 2.5 2.5L14 9h6a2 2 0 0 1 2 2.4l-1.6 8A2 2 0 0 1 18.4 21z" /></svg>
      </span>
      <span className={`${dot} bg-[#e0245e]`}>
        <svg viewBox="0 0 24 24" className="size-2.5 fill-white"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" /></svg>
      </span>
      <span className={`${dot} bg-[#3a9d5d]`}>
        <svg viewBox="0 0 24 24" className="size-2.5 fill-white"><path d="m12 2 2.4 6.6L21 9l-5 4.6L17.5 21 12 17.2 6.5 21 8 13.6 3 9l6.6-.4z" /></svg>
      </span>
    </span>
  );
}

const noop = () => () => {};

/** Our own post card: no request to LinkedIn until a visitor clicks through. */
function CardPost({ post }: { post: Extract<LinkedinPost, { kind?: "card" }> }) {
  const author = post.author ?? DEFAULT_AUTHOR;
  // Server and first client render show the absolute date; the relative one replaces it after hydration.
  const when = useSyncExternalStore(noop, () => relativeDate(post.date, Date.now()) || formatPostDate(post.date), () => formatPostDate(post.date));
  const counts = [post.reactions !== undefined ? `${post.reactions} reactions` : null, post.comments !== undefined ? `${post.comments} comments` : null].filter(Boolean);
  return (
    <LiftCard radius="rounded-2xl" className="flex-1 bg-bg shadow-card ring-1 ring-black/5" data-testid="linkedin-card" data-state="card">
      <article className="flex h-full flex-col gap-4 p-5 md:p-6">
        <header className="flex items-center gap-3">
          <Image src={author.avatar} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] leading-tight font-semibold text-ink-1">{author.name}</p>
            <p className="truncate text-[13px] text-ink-3">
              {author.headline} · <time dateTime={post.date} suppressHydrationWarning>{when}</time>
            </p>
          </div>
          <LinkedinIcon className="size-5 shrink-0 text-[#0a66c2]" />
        </header>
        <div>
          {post.title ? <h3 className="mb-1.5 text-[17px] leading-[1.3] font-semibold text-ink-1">{post.title}</h3> : null}
          <p className="line-clamp-4 text-[15px] leading-[1.55] text-ink-2" data-testid="linkedin-excerpt">{post.excerpt}</p>
          <a href={post.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-[14px] font-medium text-ink-3 hover:text-ink-1">…more</a>
        </div>
        {post.image ? (
          <div className="relative -mx-5 mt-auto aspect-[4/3] overflow-hidden bg-canvas md:-mx-6">
            <Image src={post.image} alt={post.imageAlt ?? ""} fill sizes="(min-width: 768px) 384px, 320px" className="object-cover" />
          </div>
        ) : null}
        <footer className={`flex flex-wrap items-center justify-between gap-x-3 text-[13px] text-ink-3 ${post.image ? "" : "mt-auto"}`}>
          <span className="flex items-center gap-2 text-[12px]" data-testid="linkedin-counts">
            {post.reactions !== undefined ? <ReactionGlyphs /> : null}
            <span>{counts.join(" · ")}</span>
          </span>
          <a href={post.url} target="_blank" rel="noopener noreferrer" aria-label={`View on LinkedIn: ${post.title ?? "post"} (opens in a new tab)`} className="inline-flex min-h-11 shrink-0 items-center gap-1 text-[14px] font-medium text-ink-1 hover:text-[#0a66c2]">
            View on LinkedIn <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </footer>
      </article>
    </LiftCard>
  );
}

/** Tracks whether a horizontal scroller can move further left / right. */
function useScrollEdges<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState({ prev: false, next: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setEdges({ prev: el.scrollLeft > 2, next: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);
  return [ref, edges] as const;
}

const FADE = 40;
function edgeMask(prev: boolean, next: boolean) {
  if (!prev && !next) return undefined;
  const l = prev ? `transparent, #000 ${FADE}px` : "#000, #000";
  const r = next ? `#000 calc(100% - ${FADE}px), transparent` : "#000";
  return `linear-gradient(to right, ${l}, ${r})`;
}

function ArrowButton({ dir, disabled, onClick }: { dir: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      data-tint="light"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous posts" : "Next posts"}
      data-testid={`linkedin-${dir}`}
      className="glass grid size-11 place-items-center rounded-full text-ink-1 transition-opacity disabled:opacity-30"
    >
      <Icon className="size-5" aria-hidden="true" />
    </button>
  );
}

/** True once the element is within PRELOAD_MARGIN of the viewport. */
function useNearViewport<T extends Element>() {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setNear(true);
        io.disconnect();
      }
    }, { rootMargin: PRELOAD_MARGIN });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);
  return [ref, near] as const;
}

/**
 * "Notes on LinkedIn": Thao's posts as official collapsed embeds, which start
 * loading as the section approaches the viewport (no tap needed). One row,
 * scroll-snap carousel: three fit at 1440, more scroll (arrows on desktop,
 * swipe on touch, arrow keys when focused); edges fade where more is hidden.
 * Cards are top-aligned at each post's own measured height.
 */
export function LinkedinPosts({ posts, profileUrl }: { posts: readonly LinkedinPost[]; profileUrl: string | null }) {
  const list = dedupePosts(posts);
  const [ref, near] = useNearViewport<HTMLElement>();
  const [track, edges] = useScrollEdges<HTMLUListElement>();
  if (list.length === 0) return null;
  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const size = el.clientWidth >= 768 ? "desktop" : "phone";
    const step = CARD_W[size] + CARD_GAP[size];
    const n = Math.max(1, Math.floor((el.clientWidth + CARD_GAP[size]) / step));
    el.scrollBy({ left: dir * n * step, behavior: "smooth" });
  };
  const mask = edgeMask(edges.prev, edges.next);
  return (
    <section ref={ref} aria-labelledby="linkedin-title" className="bg-bg py-20 md:py-[130px]" data-testid="section-linkedin">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-6 md:flex-row md:items-end md:justify-between md:px-10 lg:px-[60px]">
        <h2 id="linkedin-title" className="text-[32px] md:text-[46px]">
          Notes on LinkedIn
        </h2>
        <div className="flex items-center gap-4">
          {profileUrl ? (
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1 text-[15px] font-medium text-ink-3 transition-colors hover:text-ink-1"
            >
              Follow on LinkedIn <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          ) : null}
          {edges.prev || edges.next ? (
            <div className="hidden gap-2 md:flex">
              <ArrowButton dir="prev" disabled={!edges.prev} onClick={() => page(-1)} />
              <ArrowButton dir="next" disabled={!edges.next} onClick={() => page(1)} />
            </div>
          ) : null}
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-[1320px] md:px-10 lg:px-[60px]">
        <ul
          ref={track}
          data-testid="linkedin-grid"
          tabIndex={0}
          aria-label="LinkedIn posts"
          style={{ maskImage: mask, WebkitMaskImage: mask }}
          className="flex snap-x snap-mandatory scroll-px-6 items-stretch gap-4 overflow-x-auto overscroll-x-contain px-6 pt-5 pb-5 -mt-5 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 md:scroll-px-0 md:gap-6 md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {list.map((post, i) => (
            <Reveal as="li" index={i} key={post.urn} className="flex w-[320px] shrink-0 snap-start flex-col md:w-[384px]">
              {isEmbed(post) ? (
                <>
                  <EmbedCard post={post} load={near} />
                  <div className="mt-1 flex justify-end px-1">
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 shrink-0 items-center gap-1 text-[14px] text-ink-3 hover:text-ink-1"
                      aria-label={`View on LinkedIn: ${post.title} (opens in a new tab)`}
                    >
                      View on LinkedIn <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  </div>
                </>
              ) : (
                <CardPost post={post} />
              )}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
