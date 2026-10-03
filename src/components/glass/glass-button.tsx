"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/motion/magnetic";
import { LiquidGlass } from "./liquid-glass";

const HEIGHT = { sm: 44, md: 52, lg: 60 } as const;

interface GlassButtonProps {
  href: string;
  children: React.ReactNode;
  size?: keyof typeof HEIGHT;
  className?: string;
  external?: boolean;
  "data-testid"?: string;
}

/** Primary glass pill: refracting glass, magnetic on fine pointers, grows on press. */
export function GlassButton({ href, children, size = "md", className, external, ...rest }: GlassButtonProps) {
  const h = HEIGHT[size];
  const inner = (
    <LiquidGlass radius={h / 2} tint="light" className="shadow-nav" style={{ height: h }}>
      <span className="relative flex h-full items-center gap-2 px-6 text-[15px] font-semibold whitespace-nowrap text-ink-1">{children}</span>
    </LiquidGlass>
  );
  const cls = cn("inline-flex rounded-full", className);
  return (
    <Magnetic>
      {external || href.startsWith("mailto:") ? (
        <a href={href} className={cls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} data-testid={rest["data-testid"]}>
          {inner}
        </a>
      ) : (
        <Link href={href} className={cls} data-testid={rest["data-testid"]}>
          {inner}
        </Link>
      )}
    </Magnetic>
  );
}
