import type { ReactNode } from "react";
import type { GuideSectionId } from "../role-ids";

/**
 * Marks a home section as somewhere the guide can stand: a plain block wrapper
 * with `data-guide-walkable` and `data-guide-id`. It adds no padding, border,
 * overflow or style, so wrapping a section changes nothing about the layout.
 * The guide measures its top edge; it never touches the section's markup.
 */
export function GuideSection({ id, children }: { id: GuideSectionId; children: ReactNode }) {
  return (
    <div data-guide-walkable="true" data-guide-id={id}>
      {children}
    </div>
  );
}
