import Link from "next/link";
import { Reveal } from "@/components/site/reveal";

/** A quiet pointer under the portrait: where to start reading the work. */
export function PortraitNote({ href, label }: { href: string; label: string }) {
  return (
    <Reveal className="mt-5">
      <aside
        data-testid="about-note"
        className="rounded-[var(--radius)] bg-canvas px-5 py-4 text-[15px] leading-[1.5] text-ink-2 ring-1 ring-hairline"
      >
        <p className="text-sm text-ink-3">Not sure where to start?</p>
        <Link href={href} className="mt-1 inline-flex min-h-11 items-center font-medium text-ink-1 underline underline-offset-4 hover:text-accent">
          {label} →
        </Link>
      </aside>
    </Reveal>
  );
}
