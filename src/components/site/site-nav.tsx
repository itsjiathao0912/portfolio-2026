"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LiquidLink } from "./liquid-link";

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

function isActive(pathname: string, href: string) {
  if (href === "/#work") return pathname === "/work" || pathname.startsWith("/work/");
  if (href === "/about") return pathname === "/about";
  return false;
}

export function SiteNav({ name, email, linkedin }: SiteNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const sheetRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the sheet whenever the route changes (state adjusted during render,
  // not in an effect, so there is no flash of the old state).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // While open: Escape closes, Tab is trapped inside the sheet, page scroll is locked.
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

  // Hide the pill while reading downwards, bring it back on any upward scroll.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        if (Math.abs(y - last) < 6) return;
        setHidden(y > last && y > 240);
        last = y;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const mail = `mailto:${email}`;

  return (
    <header
      data-hidden={hidden && !open ? "true" : "false"}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-end px-4 pt-4 transition-transform duration-300 ease-out md:justify-center md:pt-[29px] md:data-[hidden=true]:-translate-y-[140%] motion-reduce:transition-none"
    >
      {/* Desktop: floating pill */}
      <nav
        aria-label="Main"
        className="pointer-events-auto hidden h-[54px] items-center gap-1 rounded-full bg-white/85 px-1.5 shadow-nav backdrop-blur-xl backdrop-saturate-150 transition-transform duration-200 ease-out hover:scale-[1.05] motion-reduce:hover:scale-100 md:flex"
      >
        <LiquidLink href="/" variant="nav" size="nav" active={false}>
          {name}
        </LiquidLink>
        {ITEMS.map((item) => (
          <LiquidLink key={item.href} href={item.href} variant="nav" size="nav" active={isActive(pathname, item.href)}>
            {item.label}
          </LiquidLink>
        ))}
        {linkedin ? (
          <LiquidLink href={linkedin} variant="nav" size="nav" external>
            LinkedIn
          </LiquidLink>
        ) : null}
        <LiquidLink href={mail} variant="nav" size="nav" data-testid="nav-contact">
          Get in touch
        </LiquidLink>
      </nav>

      {/* Mobile: floating round menu button */}
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        data-testid="menu-toggle"
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto relative z-10 flex size-14 items-center justify-center rounded-full bg-white text-ink-1 shadow-nav active:scale-95 md:hidden"
      >
        <span className="sr-only">{name}</span>
        <span
          aria-hidden="true"
          className={`absolute h-0.5 w-5 rounded bg-current transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-1"}`}
        />
        <span
          aria-hidden="true"
          className={`absolute h-0.5 w-5 rounded bg-current transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-1"}`}
        />
      </button>

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
              className="pointer-events-auto absolute inset-x-2.5 top-2.5 rounded-[20px] bg-bg px-3 pt-20 pb-4 shadow-card-hover md:hidden"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <nav aria-label="Mobile" className="flex flex-col">
                {[{ href: "/", label: "Home" }, ...ITEMS].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="font-display rounded-2xl px-6 py-3 text-left text-[32px] text-ink-1 active:bg-black/5"
                  >
                    {item.label}
                  </Link>
                ))}
                {linkedin ? (
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display rounded-2xl px-6 py-3 text-left text-[32px] text-ink-1 active:bg-black/5"
                  >
                    LinkedIn
                  </a>
                ) : null}
                <a href={mail} className="font-display rounded-2xl px-6 py-3 text-left text-[32px] text-ink-1 active:bg-black/5">
                  Get in touch
                </a>
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
