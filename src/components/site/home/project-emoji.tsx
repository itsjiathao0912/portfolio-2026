"use client";

import { useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { emojiFileFor, emojiFor } from "./project-meta";

/**
 * THE project emoji, used at every site (home TOC + chips, stack cards, case
 * study TOC + section button) so they cannot drift. Self-hosted animated webp
 * under /public/emoji (credits: /public/emoji/CREDITS.txt). Idle = still frame;
 * animates while `play` is true or while hovered. Reduced motion: still only.
 * Lazy-loaded. Decorative: the adjacent label is the accessible name.
 */
export function ProjectEmoji({ project, size = 24, play = false, className }: { project: string; size?: number; play?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const file = emojiFileFor(project);
  if (!file) return <span aria-hidden="true" className={className}>{emojiFor(project)}</span>;
  const playing = (play || hover) && !reduce;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny animated webp; next/image would re-encode and drop frames.
    <img
      src={`/emoji/${file}${playing ? "" : "-still"}.webp`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      draggable={false}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      data-testid="project-emoji"
      data-project-emoji=""
      data-playing={playing ? "true" : "false"}
      className={className ? `inline-block select-none ${className}` : "inline-block select-none"}
      style={{ width: size, height: size }}
    />
  );
}
