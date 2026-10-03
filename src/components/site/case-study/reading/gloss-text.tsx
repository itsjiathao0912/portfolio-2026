import type { GlossarySegment } from "@/lib/glossary";
import { GlossaryTerm } from "./glossary-term";

/** Renders pre-annotated text: plain strings pass through, glossary hits become hover terms. */
export function GlossText({ segments, fallback }: { segments?: readonly GlossarySegment[]; fallback: string }) {
  if (!segments) return <>{fallback}</>;
  return (
    <>
      {segments.map((segment, i) =>
        typeof segment === "string" ? (
          segment
        ) : (
          <GlossaryTerm key={i} id={segment.id}>
            {segment.text}
          </GlossaryTerm>
        ),
      )}
    </>
  );
}
