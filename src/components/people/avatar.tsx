import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";
import { cn } from "@/lib/utils";
import { ALL_SEEDS, pastelFor, stackSplit, symbolId } from "./avatar-logic";

// Server components. Each seed is rendered to SVG once (at request time, no
// network) and shared through one <symbol> sprite, so the page carries every
// drawing a single time however many circles use it.

const cache = new Map<string, { viewBox: string; body: string }>();

function render(seed: string) {
  const hit = cache.get(seed);
  if (hit) return hit;
  const svg = createAvatar(notionists, { seed, backgroundColor: ["transparent"] }).toString();
  const match = /^<svg([^>]*)>([\s\S]*)<\/svg>$/.exec(svg);
  const viewBox = /viewBox="([^"]+)"/.exec(match?.[1] ?? "")?.[1] ?? "0 0 1744 1744";
  // The licence metadata block is dead weight on a page.
  const body = (match?.[2] ?? "").replace(/<metadata>[\s\S]*?<\/metadata>/g, "");
  const out = { viewBox, body };
  cache.set(seed, out);
  return out;
}

/** Render once per page; the circles below point at these symbols. */
export function AvatarSprite({ seeds = ALL_SEEDS }: { seeds?: readonly string[] }) {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" className="pointer-events-none absolute size-0 overflow-hidden" data-testid="avatar-sprite">
      <defs>
        {seeds.map((seed) => {
          const { viewBox, body } = render(seed);
          return <symbol key={seed} id={symbolId(seed)} viewBox={viewBox} dangerouslySetInnerHTML={{ __html: body }} />;
        })}
      </defs>
    </svg>
  );
}

const SIZES = { 32: "size-8", 44: "size-11", 64: "size-16" } as const;

/** A pastel circle with one notionists avatar inside, white ring, resting shadow. */
export function Avatar({ seed, size = 44, className }: { seed: string; size?: keyof typeof SIZES; className?: string }) {
  const { viewBox } = render(seed);
  return (
    <span
      data-testid="avatar"
      className={cn("inline-grid shrink-0 place-items-center overflow-hidden rounded-full shadow-1 ring-2 ring-bg", SIZES[size], className)}
      style={{ background: pastelFor(seed) }}
    >
      <svg viewBox={viewBox} className="size-[92%]" aria-hidden="true" focusable="false">
        <use href={`#${symbolId(seed)}`} />
      </svg>
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
