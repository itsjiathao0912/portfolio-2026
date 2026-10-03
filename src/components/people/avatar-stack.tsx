import { ClayAvatar } from "@/components/clay/clay-avatar";
import { variantFor } from "@/components/clay/avatar-spec";
import { cn } from "@/lib/utils";
import { pastelFor, roleForPerson, stackSplit } from "./avatar-logic";

// Clay characters for the people section. Same family as the role picker tiles:
// a bust on a soft pastel disc. Each seed always gets the same person (role from
// its group, skin / hair / accent from variantFor), so renders never shuffle.

const SIZES = { 32: "size-8", 44: "size-11", 64: "size-16" } as const;

/** A pastel circle with one clay bust inside, white ring, resting shadow. */
export function Avatar({ seed, size = 44, className }: { seed: string; size?: keyof typeof SIZES; className?: string }) {
  const tint = pastelFor(seed);
  return (
    <span
      data-testid="avatar"
      className={cn("relative inline-block shrink-0 overflow-hidden rounded-full shadow-1 ring-2 ring-bg", SIZES[size], className)}
      style={{ background: tint }}
    >
      <ClayAvatar role={roleForPerson(seed)} {...variantFor(seed)} view="bust" size={size} tint={tint} decorative />
    </span>
  );
}

/**
 * Overlapping avatars (-10px), max 5 plus a "+N" chip. The fan-out on hover is
 * pure CSS and keys off an ancestor `group/card`, so this stays a server
 * component. Reduced motion: no fan-out.
 */
export function AvatarStack({ seeds, total, size = 32, label }: { seeds: readonly string[]; total?: number; size?: 32 | 44; label: string }) {
  const { shown, more: hidden } = stackSplit(seeds, 5);
  const extra = Math.max(hidden, (total ?? seeds.length) - shown.length);
  return (
    <div role="img" aria-label={label} className="flex items-center" data-testid="avatar-stack">
      {shown.map((seed, i) => (
        <span
          key={seed}
          style={{ marginLeft: i === 0 ? 0 : -10, ["--i" as string]: i }}
          className="relative transition-transform duration-300 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover/card:translate-x-[calc(var(--i)*6px)] motion-reduce:transition-none motion-reduce:[@media(hover:hover)]:group-hover/card:translate-x-0"
        >
          <Avatar seed={seed} size={size} />
        </span>
      ))}
      {extra > 0 ? (
        <span
          style={{ marginLeft: -10, ["--i" as string]: shown.length }}
          className={cn(
            "relative inline-grid shrink-0 place-items-center rounded-full bg-canvas text-[12px] font-semibold text-ink-2 ring-2 ring-bg transition-transform duration-300 ease-[var(--ease-out)] motion-reduce:transition-none",
            size === 32 ? "size-8" : "size-11",
            "[@media(hover:hover)]:group-hover/card:translate-x-[calc(var(--i)*6px)] motion-reduce:[@media(hover:hover)]:group-hover/card:translate-x-0"
          )}
        >
          +{extra}
        </span>
      ) : null}
    </div>
  );
}
