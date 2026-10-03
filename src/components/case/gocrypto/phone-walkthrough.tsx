"use client";

import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useMotionValueEvent } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { SPRING } from "@/components/motion/springs";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

/** The five concept screens, in the order the money moves. Captions describe only what the screen shows. */
export const WALKTHROUGH_STEPS = [
  { src: "/work/gocrypto/screen-1.webp", alt: "Request money: you'll receive ₱18,290, Miguel pays $317.00, fee ₱0, arrives in minutes", title: "Request", caption: "Ana sees ₱18,290 and a ₱0 fee before Miguel pays. The link opens a licensed partner in his country; he never needs an account." },
  { src: "/work/gocrypto/screen-2.webp", alt: "Money received: ₱18,290 arrived in 3 minutes with no hidden deductions", title: "Received", caption: "It lands in 3 minutes, with the three steps shown. The ₱18,290 she was shown is the ₱18,290 she gets." },
  { src: "/work/gocrypto/screen-3.webp", alt: "₱18,290 is yours: keep it growing at 3% a year, or get cash, or pay bills", title: "It is yours", caption: "One recommended choice, keep it growing, next to cash and bills. Cash is always available; the screen only shows what waiting earns." },
  { src: "/work/gocrypto/screen-4.webp", alt: "How your money is protected: insured pesos, verified sender, a hold on a reported transfer, investor profile", title: "Protection", caption: "Pesos are insured. Crypto is not, and the screen says so. A reported transfer can be held for up to 30 days." },
  { src: "/work/gocrypto/screen-5.webp", alt: "GoCrypto home with Bitcoin, Ethereum and PAX Gold holdings and a monthly gold prompt", title: "Home", caption: "Months later, crypto is a small balance she chose to build from money that kept arriving, not a product she was sold." },
] as const;

/** Index of the step shown at a scroll progress (0..1) through the pinned stage. */
export function stepAt(progress: number, count: number) {
  if (count <= 1) return 0;
  return Math.min(count - 1, Math.max(0, Math.floor(progress * count)));
}

function Screen({ step, priority }: { step: (typeof WALKTHROUGH_STEPS)[number]; priority?: boolean }) {
  // The screenshots carry their own phone bezel, so the frame is only the rounded clip and shadow.
  return (
    <div className="relative aspect-[480/987] w-full overflow-hidden rounded-[2.4rem] bg-[#11141c] shadow-[0_30px_60px_-20px_rgba(11,31,77,0.45)] ring-1 ring-black/10">
      <Image src={step.src} alt={step.alt} fill unoptimized priority={priority} loading={priority ? undefined : "lazy"} sizes="280px" className="object-cover object-top" draggable={false} />
    </div>
  );
}

function Pinned({ reduce }: { reduce: boolean }) {
  const outer = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = stepAt(v, WALKTHROUGH_STEPS.length);
    setActive((prev) => {
      if (prev !== next) setDir(next > prev ? 1 : -1);
      return next;
    });
  });
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const tx = useSpring(rx, SPRING.tilt);
  const ty = useSpring(ry, SPRING.tilt);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 8);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 6);
  }
  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    // Pinned for 1.5 viewports: outer = sticky stage (100vh) + 150vh of scroll.
    <div ref={outer} className="relative hidden h-[250vh] md:block" data-testid="phone-walkthrough-pinned">
      <div className="sticky top-24 flex h-[calc(100vh-7rem)] items-center gap-10 lg:gap-16" onPointerMove={onMove} onPointerLeave={onLeave}>
        <ol className="flex flex-1 flex-col gap-2" aria-label="Walkthrough steps">
          {WALKTHROUGH_STEPS.map((s, i) => (
            <li key={s.title} aria-current={i === active ? "step" : undefined} className={cn("rounded-2xl px-5 py-3 transition-[opacity,background-color] duration-[320ms]", i === active ? "bg-canvas opacity-100" : "opacity-40")}>
              <p className="text-xs font-semibold tracking-wide text-accent uppercase">
                {i + 1} / {WALKTHROUGH_STEPS.length} · {s.title}
              </p>
              <p className={cn("mt-1 text-[0.95rem] leading-relaxed text-ink-2", i !== active && "line-clamp-1")}>{s.caption}</p>
            </li>
          ))}
        </ol>
        <motion.div className="relative w-[min(280px,calc((100vh-10rem)*0.486))] shrink-0 [perspective:900px]" style={{ rotateX: tx, rotateY: ty }}>
          <div className="relative overflow-hidden rounded-[2.4rem]">
            <AnimatePresence initial={false} mode="popLayout" custom={dir}>
              <motion.div
                key={active}
                custom={dir}
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -40 }}
                transition={{ ...SPRING.sheet, opacity: { duration: 0.32 } }}
              >
                <Screen step={WALKTHROUGH_STEPS[active]} priority={active === 0} />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Carousel() {
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  function onScroll() {
    const el = track.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }
  function go(i: number) {
    const el = track.current;
    el?.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }
  return (
    <div className="md:hidden" data-testid="phone-walkthrough-carousel">
      <ul ref={track} onScroll={onScroll} className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]" aria-label="Walkthrough screens, swipe">
        {WALKTHROUGH_STEPS.map((s, i) => (
          <li key={s.title} className="w-full shrink-0 snap-center px-2" aria-label={`${i + 1} of ${WALKTHROUGH_STEPS.length}: ${s.title}`}>
            <div className="mx-auto w-[min(240px,62vw)]">
              <Screen step={s} priority={i === 0} />
            </div>
            <p className="mt-5 text-center text-xs font-semibold tracking-wide text-accent uppercase">{s.title}</p>
            <p className="mx-auto mt-1 max-w-[30ch] text-center text-[0.95rem] leading-relaxed text-ink-2">{s.caption}</p>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-center">
        {WALKTHROUGH_STEPS.map((s, i) => (
          <button key={s.title} type="button" onClick={() => go(i)} aria-label={`Show screen ${i + 1}: ${s.title}`} aria-current={i === active} className="flex size-11 items-center justify-center" data-testid="walkthrough-dot">
            <span className={cn("block size-2.5 rounded-full transition-colors", i === active ? "bg-accent" : "bg-ink-3/40")} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Stacked() {
  return (
    <ol className="flex flex-col gap-10" data-testid="phone-walkthrough-stacked">
      {WALKTHROUGH_STEPS.map((s, i) => (
        <li key={s.title} className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
          <div className="w-[min(240px,62vw)] shrink-0">
            <Screen step={s} />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-accent uppercase">
              {i + 1} / {WALKTHROUGH_STEPS.length} · {s.title}
            </p>
            <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-2">{s.caption}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * GoCrypto product walkthrough: five real concept screens in one 2D phone.
 * Desktop pins the phone for 1.5 viewports and steps the screen with scroll;
 * phones get a swipeable carousel with dots; reduced motion gets the screens
 * stacked with captions. No canvas, no WebGL.
 */
export function PhoneWalkthrough({ source }: { source?: string }) {
  const reduce = useReducedMotion();
  return (
    <figure className="my-12" data-testid="phone-walkthrough" aria-label="GoCrypto concept screens">
      {reduce ? (
        <Stacked />
      ) : (
        <>
          <Pinned reduce={reduce} />
          <Carousel />
        </>
      )}
      {source ? <figcaption className="mt-4 text-xs text-ink-3">{source}</figcaption> : null}
    </figure>
  );
}
