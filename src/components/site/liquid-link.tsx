"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  // Solid black pill; the fill is the reference's softer charcoal.
  primary: "bg-ink-1 text-bg [--liquid-fill:var(--ink-hover)] [--liquid-text:var(--bg)]",
  // Outlined pill; fills black, label flips white.
  outline: "border border-hairline bg-bg text-ink-1 [--liquid-fill:var(--ink-1)] [--liquid-text:var(--bg)]",
  // On a black band.
  inverse: "border border-white/25 bg-white/5 text-bg [--liquid-fill:var(--bg)] [--liquid-text:var(--ink-1)]",
  // Nav item: plain text, soft grey chip grows behind it on hover.
  nav: "text-ink-1 [--liquid-fill:rgba(0,0,0,0.06)] [--liquid-text:var(--ink-1)]",
} as const;

const SIZES = {
  md: "h-12 px-6 text-[0.95rem]",
  sm: "h-10 px-4 text-sm",
  nav: "h-[42px] px-5 text-[15px]",
} as const;

interface LiquidLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  className?: string;
  /** External links open in a new tab; internal links navigate in place. */
  external?: boolean;
  active?: boolean;
  onClick?: () => void;
  "data-testid"?: string;
}

/**
 * Pill link with a liquid fill. On hover-capable pointers the fill grows from
 * the exact point the cursor entered and drains on leave. Keyboard focus fills
 * from the centre. On touch, a press plays one short pulse that always clears
 * itself, so no fill can stay stuck after the finger lifts.
 */
export function LiquidLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  external = false,
  active = false,
  onClick,
  ...rest
}: LiquidLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [filled, setFilled] = useState(false);
  const [pressed, setPressed] = useState(false);
  const pressTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(pressTimer.current), []);

  function setOrigin(clientX: number, clientY: number) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--lx", `${clientX - rect.left}px`);
    el.style.setProperty("--ly", `${clientY - rect.top}px`);
  }

  const props = {
    ref,
    className: cn(
      "liquid inline-flex select-none items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap",
      VARIANTS[variant],
      SIZES[size],
      active && variant === "nav" && "bg-black/[0.06] text-ink-1",
      className
    ),
    "data-filled": filled ? "true" : "false",
    "data-pressed": pressed ? "true" : "false",
    "aria-current": active ? ("page" as const) : undefined,
    onPointerEnter: (event: React.PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      setOrigin(event.clientX, event.clientY);
      setFilled(true);
    },
    onPointerLeave: (event: React.PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      setOrigin(event.clientX, event.clientY);
      setFilled(false);
    },
    onPointerDown: (event: React.PointerEvent) => {
      if (event.pointerType === "mouse") return;
      setOrigin(event.clientX, event.clientY);
      setPressed(true);
      window.clearTimeout(pressTimer.current);
      pressTimer.current = window.setTimeout(() => setPressed(false), 320);
    },
    onFocus: (event: React.FocusEvent<HTMLAnchorElement>) => {
      if (!event.currentTarget.matches(":focus-visible")) return;
      event.currentTarget.style.setProperty("--lx", "50%");
      event.currentTarget.style.setProperty("--ly", "50%");
      setFilled(true);
    },
    onBlur: () => setFilled(false),
    onClick,
    "data-testid": rest["data-testid"],
  };

  const label = <span className="relative inline-flex items-center gap-2">{children}</span>;

  if (external || href.startsWith("mailto:")) {
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} {...props}>
      {label}
    </Link>
  );
}
