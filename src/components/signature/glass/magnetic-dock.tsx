"use client";

import { useRef, useState } from "react";
import { LiquidGlass } from "@/components/glass/liquid-glass";
import { cn } from "@/lib/utils";
import { dockScale } from "./math";
import { useReducedMotion } from "./use-reduced-motion";

export interface DockItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}

export interface MagneticDockProps {
  items: DockItem[];
  /** "fixed" floats at the bottom of the viewport; "inline" sits in flow (lab/demo). */
  position?: "fixed" | "inline";
  className?: string;
  label?: string;
}

/**
 * Floating glass dock with macOS-style magnification. Works with mouse,
 * pen and touch (drag a finger along it). Keyboard focus magnifies the
 * focused item. Reduced motion: no magnification, plain hover tint.
 * Icons grow with transform only, so the dock never shifts layout.
 */
export function MagneticDock({ items, position = "fixed", className, label = "Quick actions" }: MagneticDockProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [x, setX] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const reduced = useReducedMotion();

  const centers = () =>
    Array.from(listRef.current?.children ?? []).map((li) => {
      const r = (li as HTMLElement).getBoundingClientRect();
      return r.left + r.width / 2;
    });
  const [cs, setCs] = useState<number[]>([]);

  const onMove = (e: React.PointerEvent) => {
    if (reduced) return;
    setCs(centers());
    setX(e.clientX);
  };

  return (
    <nav
      aria-label={label}
      className={cn(position === "fixed" && "fixed inset-x-0 bottom-4 z-40 flex justify-center", position === "inline" && "flex justify-center", className)}
    >
      <LiquidGlass radius={22} className="relative px-2 py-2" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setX(null)} onPointerCancel={() => setX(null)}>
        <ul ref={listRef} className="flex items-end gap-2" style={{ touchAction: "pan-y" }}>
          {items.map((it, i) => {
            const fromPointer = x !== null && cs[i] !== undefined ? dockScale(x, cs[i]) : 1;
            const s = reduced ? 1 : Math.max(fromPointer, focused === i ? 1.35 : 1);
            return (
              <li key={it.label} className="relative">
                <a
                  href={it.href}
                  target={it.external ? "_blank" : undefined}
                  rel={it.external ? "noopener noreferrer" : undefined}
                  aria-label={it.label}
                  onFocus={() => {
                    setFocused(i);
                    setCs(centers());
                  }}
                  onBlur={() => setFocused(null)}
                  className="group flex size-11 items-center justify-center rounded-2xl bg-white/70 text-navy shadow-[0_2px_8px_rgba(10,20,60,0.12)] outline-none transition-[background-color] duration-200 hover:bg-white focus-visible:ring-2 focus-visible:ring-accent [&_svg]:size-5"
                  style={{
                    transform: `translateY(${(1 - s) * 14}px) scale(${s})`,
                    transformOrigin: "bottom center",
                    transition: reduced ? undefined : "transform 140ms var(--ease-out)",
                    color: "#1e3a8a",
                  }}
                >
                  <span aria-hidden="true">{it.icon}</span>
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-navy px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    {it.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </LiquidGlass>
    </nav>
  );
}
