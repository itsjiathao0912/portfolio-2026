"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
}

/**
 * One shared card size for every post. A cross-origin embed cannot report its
 * height, so EMBED_H is MEASURED (headed Chromium, 3 Oct 2026, collapsed embeds):
 * full document height incl. the reaction bar was 822–904px at 342–504px wide.
 * That includes LinkedIn's in-flow cookie banner (~255px), which every first
 * visit shows and we cannot hide; 904 + buffer → no inner scrollbar. Re-measure
 * when a post is added or edited.
 */
export const EMBED_W = 504;
export const EMBED_H = 912;
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
      className="relative isolate z-0 overflow-hidden rounded-[20px] bg-bg shadow-card ring-1 ring-black/5"
      style={{ height: EMBED_H }}
      data-testid="linkedin-card"
      data-state={loaded ? "loaded" : load ? "loading" : "preview"}
    >
      {load ? (
        // Shared measured height: the collapsed embed never scrolls inside.
        <iframe
          src={src}
          title={`LinkedIn post: ${post.title}`}
          referrerPolicy="strict-origin-when-cross-origin"
          scrolling="no"
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
          <p className="text-[15px] leading-[1.55] text-ink-2">{post.excerpt}</p>
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
 * loading as the section approaches the viewport (no tap needed). Every card
 * is EMBED_W × EMBED_H, so rows are even, reactions/comments show and nothing
 * scrolls inside. Phones: one full-width column.
 */
export function LinkedinPosts({ posts, profileUrl }: { posts: readonly LinkedinPost[]; profileUrl: string | null }) {
  const list = dedupePosts(posts);
  const [ref, near] = useNearViewport<HTMLElement>();
  if (list.length === 0) return null;
  return (
    <section ref={ref} aria-labelledby="linkedin-title" className="bg-bg py-20 md:py-[130px]" data-testid="section-linkedin">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-6 md:flex-row md:items-end md:justify-between md:px-10 lg:px-[60px]">
        <h2 id="linkedin-title" className="text-[32px] md:text-[46px]">
          Notes on LinkedIn
        </h2>
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
      </div>
      <ul
        data-testid="linkedin-grid"
        className="mx-auto mt-10 flex max-w-[1640px] flex-wrap items-start justify-center gap-6 px-6 md:px-10"
      >
        {list.map((post, i) => (
          <Reveal as="li" index={i} key={post.urn} className="w-full max-w-[504px] md:w-[504px]">
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
    </section>
  );
}
