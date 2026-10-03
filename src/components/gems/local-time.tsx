"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SaigonDesk } from "@/components/site/saigon-desk";
import { localTimeLine } from "./logic";

/**
 * "It's 18:30 in Saigon" — Thao's local time, ticking once every 20s. Rendered
 * only after hydration (the server's clock would never match the visitor's),
 * so it never causes a hydration mismatch. Tap or hover opens the Saigon desk
 * popover (both clocks plus the overlapping working hours).
 */
export function LocalTime({ className, inline = false }: { className?: string; inline?: boolean }) {
  const [line, setLine] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setLine(localTimeLine(new Date()));
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <SaigonDesk inline={inline} className={inline ? "mt-3" : undefined}>
      <span
        className={cn("label-mono block text-[12px] text-ink-3 tabular-nums", className)}
        data-testid="local-time"
        aria-live="off"
      >
        {line ?? " "}
      </span>
    </SaigonDesk>
  );
}
