/**
 * Author-facing marker for missing content. Rendered only by `next dev`
 * (NODE_ENV development), so a production build never shows it.
 */
export function DevGap({ note }: { note: string }) {
  if (process.env.NODE_ENV !== "development" || !note) return null;
  return (
    <span
      data-testid="dev-gap"
      className="ml-2 inline-flex rounded-md border border-dashed border-danger/60 bg-tint-rose px-2 py-0.5 font-mono text-[11px] text-danger"
    >
      gap: {note}
    </span>
  );
}
