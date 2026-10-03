"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { LinkedinIcon } from "./brand-icons";
import { Reveal } from "./reveal";

export interface LinkedinPost {
  urn: string;
  title: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** The post's own opening text, shown as the skeleton until the embed loads. */
  excerpt: string;
  url: string;
  /** Measured collapsed-embed height (px) at CARD_W.phone / CARD_W.desktop. */
  embedHeight: { phone: number; desktop: number };
}

/**
 * Card widths (px). Desktop: 3 × 384 + 2 × 24px gap = the 1200px content column
 * at 1440, so three posts sit fully on one row; more scroll. Phone: 320 + 16px
 * gap leaves the next card peeking (~1.1 visible at 390). A cross-origin embed cannot
 * report its height, so each post's height is measured at these widths and
 * stored in content/site.ts (no reserved blank space). If a viewer sees
 * LinkedIn's cookie banner, the embed scrolls inside instead.
 */
export const CARD_W = { phone: 320, desktop: 384 } as const;
export const CARD_GAP = { phone: 16, desktop: 24 } as const;
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

function PostCard({ post, load }: { post: LinkedinPost; load: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const src = linkedinEmbedSrc(post.urn)!;
  return (
    <div
      className="relative isolate z-0 h-[var(--h-phone)] overflow-hidden rounded-[20px] bg-bg shadow-card ring-1 ring-black/5 md:h-[var(--h-desktop)]"
      style={{ "--h-phone": `${post.embedHeight.phone}px`, "--h-desktop": `${post.embedHeight.desktop}px` } as CSSProperties}
      data-testid="linkedin-card"
      data-state={loaded ? "loaded" : load ? "loading" : "preview"}
    >
      {load ? (
        // Sized to the post itself; scrolls inside only if LinkedIn adds its cookie banner.
        <iframe
          src={src}
          title={`LinkedIn post: ${post.title}`}
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
          data-testid="linkedin-embed"
          className={`absolute inset-0 block h-full w-full border-0 transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      ) : null}
      {loaded ? null : (
        // Skeleton until the official embed has loaded.
        <div data-testid="linkedin-preview" aria-hidden={load} className="relative flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <time dateTime={post.date} className="text-[13px] text-ink-3">
              {formatPostDate(post.date)}
            </time>
            <LinkedinIcon className="size-6 text-[#0a66c2]" />
          </div>
          <p className="text-[18px] leading-[1.3] font-semibold text-ink-1">{post.title}</p>
          <p className="line-clamp-6 text-[15px] leading-[1.55] text-ink-2">{post.excerpt}</p>
          <div className="mt-2 space-y-2" aria-hidden="true">
            <div className="h-3 w-11/12 animate-pulse rounded-full bg-black/5" />
            <div className="h-3 w-4/5 animate-pulse rounded-full bg-black/5" />
            <div className="mt-4 aspect-[4/3] w-full animate-pulse rounded-xl bg-black/5" />
          </div>
        </div>
      )}
    </div>
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
              className="inline-flex items-center gap-1 text-[15px] font-medium text-ink-3 transition-colors hover:text-ink-1"
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
          className="flex snap-x snap-mandatory scroll-px-6 items-start gap-4 overflow-x-auto overscroll-x-contain px-6 pb-4 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 md:scroll-px-0 md:gap-6 md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {list.map((post, i) => (
            <Reveal as="li" index={i} key={post.urn} className="w-[320px] shrink-0 snap-start md:w-[384px]">
              <PostCard post={post} load={near} />
              <div className="mt-4 flex justify-end px-1">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 text-[14px] text-ink-3 hover:text-ink-1"
                  aria-label={`View on LinkedIn: ${post.title} (opens in a new tab)`}
                >
                  View on LinkedIn <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
