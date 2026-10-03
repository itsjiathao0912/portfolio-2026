import { ArrowRight } from "lucide-react";
import { LostNoteGame } from "@/components/gems/lost-note-game";
import { LiquidLink } from "@/components/site/liquid-link";

export default function NotFound() {
  return (
    <main className="relative mx-auto flex min-h-[70dvh] max-w-3xl flex-col items-start justify-center gap-6 px-5 pt-32 pb-20 md:px-8" data-testid="not-found">
      <p className="label-mono text-accent">404</p>
      <h1 className="text-5xl md:text-7xl">This page does not exist.</h1>
      <p className="text-lg text-ink-2">The link may be old, or the address has a typo. The work is still here.</p>
      <div className="flex flex-wrap gap-3">
        <LiquidLink href="/">Go home</LiquidLink>
        <LiquidLink href="/work" variant="outline">
          See the work <ArrowRight className="size-4" aria-hidden="true" />
        </LiquidLink>
      </div>
      <div className="mt-6 w-full border-t border-hairline pt-8">
        <LostNoteGame />
      </div>
    </main>
  );
}
