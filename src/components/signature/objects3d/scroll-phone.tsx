"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { LazyStage } from "./lazy-stage";
import { screenIndex, sectionProgress } from "./math";
import { PALETTE } from "./shapes";
import { useReducedMotion } from "./use-env";

const Scene = dynamic(() => import("./scroll-phone-scene"), {
  ssr: false,
  loading: () => null,
});

export type PhoneScreen = {
  src: string;
  alt: string;
  caption: string;
  project?: string;
};

export type ScrollPhoneProps = {
  screens: PhoneScreen[];
  /** Section heading shown beside the phone. */
  title?: string;
  /** Scroll distance per screen, in viewport heights. */
  perScreenVh?: number;
  className?: string;
};

/** Reduced-motion / no-WebGL fallback: same screens, as a swipeable row. */
export function PhoneFallback({ screens }: { screens: PhoneScreen[] }) {
  return (
    <ul
      style={{
        display: "flex",
        gap: 16,
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        padding: "8px 4px 16px",
        margin: 0,
        listStyle: "none",
      }}
    >
      {screens.map((s) => (
        <li
          key={s.src}
          style={{ flex: "0 0 auto", width: 200, scrollSnapAlign: "start" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.src}
            alt={s.alt}
            width={200}
            height={412}
            loading="lazy"
            style={{
              width: 200,
              height: 412,
              objectFit: "cover",
              borderRadius: 24,
              border: `6px solid ${PALETTE.navy}`,
            }}
          />
          <p
            style={{
              margin: "8px 0 0",
              font: "500 14px/1.3 var(--font-sans, system-ui)",
            }}
          >
            {s.caption}
          </p>
        </li>
      ))}
    </ul>
  );
}

/**
 * Pinned section: a 3D phone turns as you scroll and its screen swaps through real app
 * screenshots. Captions are real DOM text (the current one is marked aria-current).
 */
export function ScrollPhone({
  screens,
  title,
  perScreenVh = 70,
  className,
}: ScrollPhoneProps) {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [idx, setIdx] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      progress.current = sectionProgress(r.top, r.height, window.innerHeight);
      setIdx(screenIndex(progress.current, screens.length));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced, screens.length]);

  if (reduced) {
    return (
      <section className={className} aria-label={title ?? "App screens"}>
        {title ? <h2 style={{ margin: "0 0 16px" }}>{title}</h2> : null}
        <PhoneFallback screens={screens} />
      </section>
    );
  }

  const current = screens[idx];
  return (
    <section
      ref={section}
      className={className}
      aria-label={title ?? "App screens"}
      style={{
        height: `calc(100vh + ${screens.length * perScreenVh}vh)`,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          alignItems: "center",
          gap: 24,
          padding: "0 16px",
        }}
      >
        <LazyStage
          label={current ? `Phone showing ${current.alt}` : "Phone"}
          style={{ height: "min(70vh, 640px)" }}
          fallback={
            current ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={current.src}
                  alt=""
                  style={{
                    height: "90%",
                    width: "auto",
                    borderRadius: 28,
                    border: `8px solid ${PALETTE.navy}`,
                  }}
                />
              </div>
            ) : null
          }
        >
          {(active) => (
            <Scene
              active={active}
              srcs={screens.map((s) => s.src)}
              progress={progress}
            />
          )}
        </LazyStage>
        <div>
          {title ? <h2 style={{ margin: "0 0 16px" }}>{title}</h2> : null}
          <ol
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: 10,
            }}
          >
            {screens.map((s, i) => (
              <li
                key={s.src}
                aria-current={i === idx ? "step" : undefined}
                style={{
                  font: "500 16px/1.35 var(--font-sans, system-ui)",
                  color: i === idx ? PALETTE.navy : "#6b6c72",
                  opacity: i === idx ? 1 : 0.55,
                  borderLeft: `3px solid ${i === idx ? PALETTE.blue : "transparent"}`,
                  paddingLeft: 12,
                  transition: "opacity 300ms, color 300ms, border-color 300ms",
                }}
              >
                {s.project ? (
                  <strong
                    style={{ display: "block", fontSize: 12, letterSpacing: 1 }}
                  >
                    {s.project.toUpperCase()}
                  </strong>
                ) : null}
                {s.caption}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
