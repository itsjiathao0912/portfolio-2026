"use client";

import { ArrowUpRight } from "lucide-react";
import { useInView } from "motion/react";
import { useRef, useState } from "react";
import { LinkedinIcon } from "./brand-icons";
import { Reveal } from "./reveal";

export interface LinkedinPost {
  urn: string;
  height: number;
  title: string;
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

const FRAME_W = 504;

function Embed({ post }: { post: LinkedinPost }) {
  const ref = useRef<HTMLDivElement>(null);
  // Load LinkedIn only when the card is near the viewport (privacy + perf).
  const near = useInView(ref, { once: true, margin: "600px 0px" });
  const [loaded, setLoaded] = useState(false);
  const src = linkedinEmbedSrc(post.urn)!;
  return (
    <div ref={ref} className="relative overflow-hidden rounded-[20px] bg-bg shadow-card ring-1 ring-black/5" style={{ height: post.height }}>
      {!loaded ? (
        <div data-testid="linkedin-placeholder" className="absolute inset-0 flex flex-col gap-4 p-6" aria-hidden="true">
          <div className="flex items-center gap-3">
            <span className="size-12 rounded-full bg-canvas" />
            <span className="flex flex-col gap-2">
              <span className="h-3 w-32 rounded bg-canvas" />
              <span className="h-3 w-20 rounded bg-canvas" />
            </span>
          </div>
          <p className="text-[15px] font-medium text-ink-1">{post.title}</p>
          <span className="mt-2 h-48 rounded-xl bg-canvas" />
          <LinkedinIcon className="mt-auto size-6 self-end text-[#0a66c2]" />
        </div>
      ) : null}
      {near ? (
        <iframe
          src={src}
          title={`LinkedIn post: ${post.title}`}
          width={FRAME_W}
          height={post.height}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
          data-testid="linkedin-embed"
          className="block h-full w-full border-0"
        />
      ) : null}
    </div>
  );
}

/**
 * "On LinkedIn": Thao's posts as official embeds. Desktop: a row of cards;
 * phone: a horizontal snap scroller. Each iframe mounts only near the
 * viewport, with a placeholder card until it loads.
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
            <Embed post={post} />
            <div className="mt-4 flex items-start justify-between gap-4 px-1">
              <p className="text-[15px] leading-[1.4] font-medium text-ink-1">{post.title}</p>
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
