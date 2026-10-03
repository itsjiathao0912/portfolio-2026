"use client";

import { cn } from "@/lib/utils";

/** Radio-group pill control: arrow keys move, Enter/Space/click select. Touch targets ≥ 40px. */
export function Pills<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const index = options.findIndex((o) => o.value === value);
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              e.preventDefault();
              const i = (index + (e.key === "ArrowRight" ? 1 : -1) + options.length) % options.length;
              onChange(options[i].value);
              const sibling = e.currentTarget.parentElement?.children[i];
              if (sibling instanceof HTMLElement) sibling.focus();
            }}
            className={cn(
              "min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
              on ? "border-ink-1 bg-ink-1 text-white" : "border-hairline bg-bg text-ink-2 hover:border-border-strong",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** On/off switch button with a visible state word. */
export function Toggle({ label, on, onChange, onText = "Yes", offText = "No" }: { label: string; on: boolean; onChange: (on: boolean) => void; onText?: string; offText?: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onChange(!on)}
      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl border border-hairline bg-bg px-4 text-left text-sm text-ink-1 transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <span>{label}</span>
      <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", on ? "bg-ink-1 text-white" : "bg-ink-1/10 text-ink-2")}>{on ? onText : offText}</span>
    </button>
  );
}

export type Status = "live" | "proto" | "design";
export const STATUS_LABEL: Record<Status, string> = { live: "Live", proto: "Prototyped", design: "Designed" };
export const STATUS_CHIP: Record<Status, string> = {
  live: "bg-tint-mint text-ink-1",
  proto: "bg-tint-butter text-ink-1",
  design: "border border-dashed border-border-strong text-ink-2",
};
