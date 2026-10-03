"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { buildRailStops, type RailStop } from "./ledger-data";

type Props = {
  stops?: RailStop[];
  heading?: string;
  className?: string;
};

/**
 * Horizontal career timeline driven by vertical scroll (desktop, ≥768px):
 * the section pins, the skyline / dot / card layers slide at different speeds,
 * a small train marks "you are here", and each company's colour washes the
 * background. Phones and reduced motion get the same cards in a native,
 * keyboard-scrollable snap row with no pinning or parallax. Layout is identical
 * in both modes at first paint (pinning only adds transforms) — no shift.
 */
export function CareerRail({ stops = buildRailStops(), heading = "The route so far", className = "" }: Props) {
  const outer = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const [pin, setPin] = useState(false);
  const [distance, setDistance] = useState(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => {
      const on = mq.matches && !reduce;
      setPin(on);
      const el = track.current;
      if (el) setDistance(Math.max(0, el.scrollWidth - el.clientWidth));
    };
    update();
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const cardsX = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const dotsX = useTransform(scrollYProgress, [0, 1], [0, -distance * 0.55]);
  const skyX = useTransform(scrollYProgress, [0, 1], [0, -distance * 0.25]);
  const trainLeft = useTransform(scrollYProgress, [0, 1], ["2%", "92%"]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!pin) return;
    setActive(Math.min(stops.length - 1, Math.round(v * (stops.length - 1))));
  });

  const current = stops[active] ?? stops[0];

  return (
    <section
      ref={outer}
      aria-label={heading}
      className={`relative ${className}`}
      style={{ height: pin ? `${Math.max(2, stops.length) * 70}vh` : undefined }}
    >
      <motion.div
        className="overflow-hidden md:sticky md:top-0 md:flex md:h-screen md:flex-col md:justify-center"
        animate={{ backgroundColor: pin ? current.wash : "var(--canvas)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="px-6 pt-10 md:px-12 md:pt-28">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink-3)]">Career rail</p>
          <h2 className="mt-1 text-3xl font-semibold text-[var(--ink-1)] md:text-5xl">{heading}</h2>
          <p aria-live="polite" className="sr-only">
            {pin ? `Now viewing ${current.company}, ${current.period}` : ""}
          </p>
        </div>

        <div className="relative mt-6">
          {/* layer 1 — original skyline, slowest */}
          <motion.svg
            aria-hidden
            viewBox="0 0 1600 160"
            preserveAspectRatio="xMinYMax slice"
            className="pointer-events-none absolute inset-x-0 bottom-10 h-40 w-[200%] text-[var(--navy)] opacity-[0.07]"
            style={{ x: pin ? skyX : 0 }}
          >
            {Array.from({ length: 40 }, (_, i) => {
              const h = 40 + ((i * 37) % 110);
              const w = 22 + ((i * 13) % 26);
              return <rect key={i} x={i * 40} y={160 - h} width={w} height={h} rx="3" fill="currentColor" />;
            })}
          </motion.svg>
          {/* layer 2 — coin dots, mid speed */}
          <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 top-6 flex w-[200%] gap-24 pl-20" style={{ x: pin ? dotsX : 0 }}>
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i} className="h-3 w-3 shrink-0 rounded-full border-2 border-[var(--accent)] opacity-30" style={{ marginTop: (i * 29) % 70 }} />
            ))}
          </motion.div>

          {/* layer 3 — cards */}
          <motion.ol
            ref={track}
            tabIndex={pin ? -1 : 0}
            aria-label="Career chapters, oldest first"
            className="relative flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-16 pt-14 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] md:overflow-visible md:px-12"
            style={{ x: pin ? cardsX : 0 }}
          >
            {stops.map((s, i) => (
              <li key={s.id} className="snap-start">
                <article
                  tabIndex={0}
                  onFocus={() => !pin && setActive(i)}
                  className="w-[78vw] max-w-[340px] rounded-[var(--radius)] border border-[var(--hairline)] bg-white/90 p-6 shadow-[var(--shadow-card)] backdrop-blur outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[var(--accent)] md:w-[340px]"
                  style={{ borderTop: `6px solid ${s.ink}` }}
                >
                  <p className="font-mono text-xs tabular-nums text-[var(--ink-3)]">{s.period}</p>
                  <h3 className="mt-2 text-xl font-semibold" style={{ color: s.ink }}>
                    {s.company}
                  </h3>
                  <p className="mt-1 text-[15px] text-[var(--ink-2)]">{s.role}</p>
                  {s.domain && (
                    <p className="mt-4 inline-block rounded-full px-3 py-1 text-xs font-medium" style={{ background: s.wash, color: s.ink }}>
                      {s.domain}
                    </p>
                  )}
                </article>
              </li>
            ))}
          </motion.ol>

          {/* the rail + train ("you are here") */}
          {pin && (
            <div aria-hidden className="absolute inset-x-12 bottom-6 h-6">
              <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-[repeating-linear-gradient(90deg,var(--navy)_0_14px,transparent_14px_22px)] opacity-40" />
              <motion.div className="absolute top-0 -translate-x-1/2" style={{ left: trainLeft }}>
                <Train color={current.ink} />
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

/** Original mini train glyph. */
function Train({ color }: { color: string }) {
  return (
    <svg width="44" height="24" viewBox="0 0 44 24">
      <rect x="2" y="3" width="34" height="14" rx="5" fill={color} />
      <rect x="8" y="6" width="7" height="6" rx="1.5" fill="#fff" />
      <rect x="19" y="6" width="7" height="6" rx="1.5" fill="#fff" />
      <path d="M36 7h4l2 6v4h-6z" fill={color} />
      <circle cx="11" cy="20" r="3" fill="var(--navy)" />
      <circle cx="29" cy="20" r="3" fill="var(--navy)" />
    </svg>
  );
}
