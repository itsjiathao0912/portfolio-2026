import { Check } from "lucide-react";
import type { BlockGloss } from "@/lib/glossary-blocks";
import { EvidenceBadge } from "./evidence-badge";
import { GlossText } from "./gloss-text";
import type { BlockOf } from "./types";

/**
 * The closing band, same frame on every case: up to three sourced numbers each with its evidence
 * badge, or (when no outcome can be verified) what shipped. Never decorative, never invented.
 */
export function ResultsBand({ block, gloss }: { block: BlockOf<"results">; gloss?: BlockGloss }) {
  const labelGloss = gloss?.items ?? [];
  const shippedGloss = labelGloss.slice(block.items.length);
  return (
    <section
      aria-label={block.heading}
      data-testid="results-band"
      className="rounded-xl bg-canvas px-6 py-8 md:px-10 md:py-10"
    >
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="inline-flex size-6 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success)_14%,white)] text-success">
          <Check className="size-3.5" strokeWidth={3} />
        </span>
        <h2 className="text-[1.5rem] leading-tight md:text-[1.75rem]">{block.heading}</h2>
      </div>
      {block.items.length > 0 ? (
        <dl
          data-testid="results-items"
          className={block.items.length === 1 ? "mt-8 grid grid-cols-1 gap-8" : block.items.length === 2 ? "mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2" : "mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3"}
        >
          {block.items.map((item, i) => (
            <div key={item.label} className="flex min-w-0 flex-col-reverse justify-end gap-3">
              <dt className="flex flex-col gap-2 text-sm leading-snug text-ink-2">
                <span>
                  <GlossText segments={labelGloss[i]} fallback={item.label} />
                </span>
                {item.badge ? <EvidenceBadge label={item.badge} testId="results-badge" /> : null}
              </dt>
              <dd className="font-display text-[2.25rem] leading-none text-ink-1 md:text-[2.75rem]">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {block.shipped.length > 0 ? (
        <ul data-testid="results-shipped" className="mt-6 flex flex-col gap-3">
          {block.shipped.map((line, i) => (
            <li key={line} className="flex items-start gap-3 text-[1.05rem] leading-snug text-ink-1">
              <Check className="mt-1 size-4 shrink-0 text-success" strokeWidth={2.5} aria-hidden="true" />
              <span>
                <GlossText segments={shippedGloss[i]} fallback={line} />
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {block.next ? (
        <p className="mt-8 border-t border-hairline pt-6 text-base leading-snug text-ink-1" data-testid="results-next">
          <span className="font-semibold">What I would do next: </span>
          <GlossText segments={gloss?.fields?.next} fallback={block.next} />
        </p>
      ) : null}
      <p className="mt-6 text-xs text-ink-3">Source: {block.source}</p>
    </section>
  );
}
