"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Muted ambient loop. Loads nothing until near the viewport (preload="none"),
 * plays only while visible, pauses off-screen. Reduced motion: poster + controls,
 * never autoplays.
 */
export function VideoLoop({ src, poster, alt, caption, aspect }: { src: string; poster: string; alt: string; caption?: string; aspect: "portrait" | "landscape" }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video || reduce) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <figure className="my-8 flex flex-col items-center gap-3" data-testid="video-loop">
      <video
        ref={ref}
        className={cn("w-full rounded-[22px] bg-canvas object-cover shadow-lg", aspect === "portrait" ? "aspect-[9/16] max-w-[340px]" : "aspect-video")}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        controls={!!reduce}
        aria-label={alt}
      />
      {caption ? <figcaption className="max-w-[34rem] text-center text-sm text-ink-3">{caption}</figcaption> : null}
    </figure>
  );
}
