"use client";

import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { LinkedinIcon } from "./brand-icons";
import { Reveal } from "./reveal";

export interface LinkedinPost {
  urn: string;
  title: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** The post's own opening text, shown before the embed is loaded. */
  excerpt: string;
  url: string;
}

const URN = /^urn:li:(share|ugcPost|activity):\d+$/;

/** Official embed URL for a post urn; null for anything that is not a LinkedIn urn. */
export function linkedinEmbedSrc(urn: string) {
  return URN.test(urn) ? `https://www.linkedin.com/embed/feed/update/${urn}` : null;
}

/** Drop duplicate urns and anything that is not a valid urn, keeping order. */
export function dedupePosts<T extends { urn: string }>(posts: readonly T[]) {
  const seen = new Set<string>();
  return posts.filter((p) => linkedinEmbedSrc(p.urn) && !seen.has(p.urn) && (seen.add(p.urn), true));
}

/** Every card is the same height, preview or loaded, so the row stays even. */
export const CARD_H = 520;

const DATE_FMT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** "13 Sep 2026" for an ISO date; the raw string when it does not parse. */
export function formatPostDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : DATE_FMT.format(d);
}

function PostCard({ post }: { post: LinkedinPost }) {
  // No LinkedIn request until the visitor asks: a cross-origin embed always
  // opens with LinkedIn's own cookie banner, which we cannot hide.
  const [open, setOpen] = useState(false);
  const src = linkedinEmbedSrc(post.urn)!;
  return (
    <div className="relative isolate z-0 overflow-hidden rounded-[20px] bg-bg shadow-card ring-1 ring-black/5" style={{ height: CARD_H }} data-testid="linkedin-card">
      {open ? (
        <iframe
          src={src}
          title={`LinkedIn post: ${post.title}`}
          referrerPolicy="strict-origin-when-cross-origin"
          data-testid="linkedin-embed"
          className="block h-full w-full border-0"
        />
      ) : (
        <div data-testid="linkedin-preview" className="flex h-full flex-col gap-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <time dateTime={post.date} className="text-[13px] text-ink-3">
              {formatPostDate(post.date)}
            </time>
            <LinkedinIcon className="size-6 text-[#0a66c2]" />
          </div>
          <p className="text-[18px] leading-[1.3] font-semibold text-ink-1">{post.title}</p>
          <p className="line-clamp-[9] text-[15px] leading-[1.55] text-ink-2">{post.excerpt}</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-auto inline-flex min-h-11 items-center justify-center rounded-full bg-ink-1 px-5 text-[14px] font-medium text-bg transition-opacity hover:opacity-85"
            aria-label={`Load post from LinkedIn: ${post.title}`}
          >
            Load post
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * "On LinkedIn": Thao's posts as static preview cards (excerpt + date). A
 * "Load post" tap swaps in the official embed. Desktop: a row of equal-height
 * cards; phone: a horizontal snap scroller.
 */
export function LinkedinPosts({ posts, profileUrl }: { posts: readonly LinkedinPost[]; profileUrl: string | null }) {
  const list = dedupePosts(posts);
  if (list.length === 0) return null;
  return (
    <section aria-labelledby="linkedin-title" className="bg-bg py-20 md:py-[130px]" data-testid="section-linkedin">
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
      <ul className="mt-10 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] md:gap-6 md:px-10 lg:justify-center lg:px-[60px]">
        {list.map((post, i) => (
          <Reveal as="li" index={i} key={post.urn} className="w-[86vw] max-w-[504px] shrink-0 snap-center md:w-[420px] lg:w-[400px]">
            <PostCard post={post} />
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
