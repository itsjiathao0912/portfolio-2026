"use client";

import { cn } from "@/lib/utils";

/** Radio-group pill control: arrow keys move, Enter/Space/click select. Touch targets ≥ 40px. */
export function Segmented<T extends string>({
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
              const step = e.key === "ArrowRight" ? 1 : -1;
              const next = options[(index + step + options.length) % options.length];
              onChange(next.value);
              const sibling = e.currentTarget.parentElement?.children[(index + step + options.length) % options.length];
              if (sibling instanceof HTMLElement) sibling.focus();
            }}
            className={cn(
              "min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
              on ? "border-ink-1 bg-ink-1 text-white" : "border-hairline bg-bg text-ink-2 hover:border-border-strong",
            )}
            data-testid="gocrypto-option"
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
