import { cn } from "@/lib/utils";
import { evidenceTone } from "./logic";

/**
 * Honesty chip. Sourced figures wear the green "Settled" check (the same chip the ticker and the
 * coin use); modelled, targeted or demo figures are muted with a dash. One label per figure.
 */
export function EvidenceBadge({ label, className, testId = "viz-badge" }: { label: string; className?: string; testId?: string }) {
  const settled = evidenceTone(label) === "settled";
  return (
    <span
      data-testid={testId}
      data-tone={settled ? "settled" : "muted"}
      className={cn(
        "inline-flex h-[22px] items-center gap-1 self-start rounded-lg px-2 text-[12px] leading-none font-semibold whitespace-nowrap",
        settled ? "bg-[color-mix(in_srgb,var(--success)_10%,white)] text-success" : "bg-canvas text-ink-3",
        className,
      )}
    >
      <span aria-hidden="true">{settled ? "✓" : "–"}</span>
      {label}
    </span>
  );
}
