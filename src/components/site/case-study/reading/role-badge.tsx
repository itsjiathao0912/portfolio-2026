import type { Owner } from "@content/schema.ts";
import { cn } from "@/lib/utils";
import { ROLE_LABEL } from "./logic";

/**
 * Who built what, in three outlines: solid navy = Thao owned, dashed = the team, ghost = the platform
 * she built on. Used only where her drafts or decks state the split.
 */
export function RoleBadge({ owner, className }: { owner: Owner; className?: string }) {
  return (
    <span
      data-testid="role-badge"
      data-owner={owner}
      className={cn(
        "inline-flex h-[22px] items-center self-start rounded-lg px-2 text-[12px] leading-none font-semibold whitespace-nowrap",
        owner === "owned" && "border border-navy bg-bg text-navy",
        owner === "team" && "border border-dashed border-ink-3 bg-bg text-ink-2",
        owner === "platform" && "bg-canvas text-ink-3",
        className,
      )}
    >
      {ROLE_LABEL[owner]}
    </span>
  );
}
