"use client";

import { motion } from "motion/react";
import { SPRING } from "@/components/motion/springs";
import { ClayAvatar } from "@/components/clay/clay-avatar";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { ROLE_IDS, type RoleId } from "./role-ids";
import { tintFor } from "./role-card";
import { ROLES } from "./roles";

type Props = {
  role: RoleId | null;
  onOpen: () => void;
  chipRef?: React.Ref<HTMLButtonElement>;
};

/**
 * The compact chip above Selected work: the visitor's own character and "change".
 * Opens the change-role modal.
 */
export function VisitorChip({ role, onOpen, chipRef }: Props) {
  const reduce = useReducedMotion();
  const label = role ? ROLES[role].label : null;
  const avatar = (
    <motion.span
      key={role ?? "skip"}
      className="grid place-items-center"
      initial={reduce ? false : { scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={reduce ? { duration: 0 } : SPRING.ui}
    >
      <span className="block size-7 overflow-hidden rounded-full">
        <ClayAvatar role={role} view="bust" size={28} decorative tint={role ? tintFor(ROLE_IDS.indexOf(role)) : undefined} className={role ? undefined : "text-ink-3"} />
      </span>
    </motion.span>
  );
  return (
    <button
      ref={chipRef}
      type="button"
      data-testid="visitor-chip"
      data-role={role ?? "none"}
      aria-haspopup="dialog"
      onClick={onOpen}
      className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-hairline bg-bg py-1.5 pl-2 pr-4 text-[14px] text-ink-2 shadow-1 outline-none transition-shadow duration-[200ms] hover:shadow-2 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      <span className="grid shrink-0 place-items-center">{avatar}</span>
      <span>
        {label ? (
          <>
            You: <strong className="font-semibold text-ink-1">{label}</strong>
          </>
        ) : (
          "Showing everything"
        )}{" "}
        · <span className="text-accent">change</span>
      </span>
    </button>
  );
}
