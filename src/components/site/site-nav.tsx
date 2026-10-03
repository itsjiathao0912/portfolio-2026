"use client";

import { AnimatePresence, LayoutGroup, motion, useMotionValueEvent, useScroll, type PanInfo } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LocalTime } from "@/components/gems/local-time";
import { LiquidGlass } from "@/components/glass/liquid-glass";
import { Magnetic } from "@/components/motion/magnetic";
import { INSTANT, PRESS_SCALE, SPRING } from "@/components/motion/springs";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/#highlights", label: "Highlights" },
  { href: "/#work", label: "Work" },
  { href: "/about", label: "About" },
] as const;

interface SiteNavProps {
  name: string;
  email: string;
  linkedin: string | null;
}

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/#work") return pathname === "/work" || pathname.startsWith("/work/");
  if (href === "/about") return pathname === "/about";
  return false;
}

/** Sheet closes on a flick up, or when dragged up past 30% of its height. */
export function shouldCloseSheet(offsetY: number, velocityY: number, height: number) {
  return velocityY < -500 || offsetY < -height * 0.3;
}

const PILL_H = 64;
const PILL_H_SM = 56;

function NavItem({
  href,
  label,
  highlighted,
  current,
  external,
  onHover,
  testId,
}: {
  href: string;
  label: string;
  highlighted: boolean;
  current: boolean;
  external?: boolean;
  onHover: (href: string | null) => void;
  testId?: string;
}) {
  const reduce = useReducedMotion();
  const cls = "relative z-10 flex h-[48px] items-center rounded-full px-5 text-[15px] font-medium whitespace-nowrap text-ink-1 outline-offset-0";
  const content = (
    <>
      {highlighted ? (
        <motion.span
          layoutId="nav-active"
          aria-hidden="true"
          data-testid="nav-indicator"
          className="absolute inset-0 -z-10 rounded-full bg-black/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
          transition={reduce ? INSTANT : SPRING.indicator}
        />
      ) : null}
      {label}
    </>
  );
  const handlers = {
    onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && onHover(href),
    onFocus: () => onHover(href),
    "aria-current": current ? ("page" as const) : undefined,
    "data-testid": testId,
    className: cls,
  };
  return (
    <Magnetic strength={4}>
      {external || href.startsWith("mailto:") ? (
        <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...handlers}>
          {content}
        </a>
      ) : (
        <Link href={href} {...handlers}>
          {content}
        </Link>
      )}
    </Magnetic>
  );
}

export function SiteNav({ name, email, linkedin }: SiteNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const sheetRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the sheet whenever the route changes (adjusted during render).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // The nav stays visible on scroll; past the hero it compacts a little
  // (transform only — the glass size never changes).
  const { scrollY } = useScroll();
  const [compact, setCompact] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setCompact(y > 80));

  // While open: Escape closes, Tab is trapped, page scroll is locked.
  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    const toggle = toggleRef.current;
    const focusables = () =>
      Array.from(sheet?.querySelectorAll<HTMLElement>("a[href], button") ?? []).concat(toggle ? [toggle] : []);
    focusables()[0]?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const list = focusables();
      const index = list.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey ? (index <= 0 ? list.length - 1 : index - 1) : index === list.length - 1 ? 0 : index + 1;
      event.preventDefault();
      list[next]?.focus();
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const mail = `mailto:${email}`;
  const all = [
    { href: "/", label: name },
    ...ITEMS,
    ...(linkedin ? [{ href: linkedin, label: "LinkedIn", external: true }] : []),
    { href: mail, label: "Get in touch", testId: "nav-contact" },
  ] as { href: string; label: string; external?: boolean; testId?: string }[];
  const activeHref = all.find((i) => isActive(pathname, i.href))?.href ?? null;
  const highlighted = hovered ?? activeHref;

  function onDragEnd(_: unknown, info: PanInfo) {
    const h = sheetRef.current?.offsetHeight ?? 400;
    if (shouldCloseSheet(info.offset.y, info.velocity.y, h)) setOpen(false);
  }

  return (
    <header
      data-compact={compact ? "true" : "false"}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-end px-4 pt-[var(--nav-top-sm)] md:justify-center md:pt-[var(--nav-top)]"
    >
      {/* Desktop: floating liquid-glass pill. */}
      <motion.div
        className="pointer-events-auto hidden md:block"
        animate={{ scale: compact && !reduce ? 0.94 : 1, y: compact && !reduce ? -6 : 0 }}
        transition={reduce ? INSTANT : SPRING.sheet}
        style={{ transformOrigin: "50% 0%" }}
      >
        <LiquidGlass radius={PILL_H / 2} tint="light" style={{ height: PILL_H }} className="flex items-center">
          <nav aria-label="Main" className="flex items-center gap-0.5 px-2" onPointerLeave={() => setHovered(null)} onBlur={() => setHovered(null)}>
            <LayoutGroup id="main-nav">
              {all.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  external={item.external}
                  testId={item.testId}
                  current={item.href === activeHref}
                  highlighted={item.href === highlighted}
                  onHover={setHovered}
                />
              ))}
            </LayoutGroup>
          </nav>
          {/* Thao's local time lives inside the pill (never floats over content); shown from 1024px up. */}
          <span className="mr-5 ml-1 hidden items-center gap-3 border-l border-hairline pl-4 lg:flex">
            <LocalTime className="whitespace-nowrap" />
          </span>
        </LiquidGlass>
      </motion.div>

      {/* Mobile: round glass menu button. */}
      <motion.button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        data-testid="menu-toggle"
        onClick={() => setOpen((v) => !v)}
        whileTap={reduce ? undefined : { scale: PRESS_SCALE }}
        transition={SPRING.press}
        className="pointer-events-auto relative z-10 rounded-full md:hidden"
      >
        <LiquidGlass radius={PILL_H_SM / 2} tint="light" className="flex items-center justify-center text-ink-1" style={{ width: PILL_H_SM, height: PILL_H_SM }}>
          <span className="sr-only">{name}</span>
          <span
            aria-hidden="true"
            className={cn("absolute h-0.5 w-5 rounded bg-current transition-transform duration-300", open ? "rotate-45" : "-translate-y-1")}
          />
          <span
            aria-hidden="true"
            className={cn("absolute h-0.5 w-5 rounded bg-current transition-transform duration-300", open ? "-rotate-45" : "translate-y-1")}
          />
        </LiquidGlass>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="backdrop"
              className="pointer-events-auto fixed inset-0 -z-10 bg-black/20 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="sheet"
              id="mobile-menu"
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              data-testid="mobile-menu"
              className="pointer-events-auto absolute inset-x-2.5 top-2.5 touch-none rounded-xl bg-bg px-3 pt-20 pb-3 shadow-card-hover md:hidden"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -60 }}
              transition={reduce ? { duration: 0.15 } : SPRING.sheet}
              drag={reduce ? false : "y"}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              dragMomentum={false}
              onDragEnd={onDragEnd}
            >
              <nav aria-label="Mobile" className="flex flex-col items-center">
                {[{ href: "/", label: "Home" }, ...ITEMS].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className="font-display w-full rounded-2xl px-6 py-3 text-center text-[32px] text-ink-1 active:bg-black/5"
                  >
                    {item.label}
                  </Link>
                ))}
                {linkedin ? (
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display w-full rounded-2xl px-6 py-3 text-center text-[32px] text-ink-1 active:bg-black/5"
                  >
                    LinkedIn
                  </a>
                ) : null}
                <a href={mail} className="font-display w-full rounded-2xl px-6 py-3 text-center text-[32px] text-ink-1 active:bg-black/5">
                  Get in touch
                </a>
              </nav>
              <LocalTime className="mt-3 text-center" />
              <span aria-hidden="true" className="mx-auto mt-2 block h-1.5 w-10 rounded-full bg-black/15" />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
