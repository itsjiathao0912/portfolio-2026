"use client";

import { motion } from "motion/react";
import { SPRING } from "@/components/motion/springs";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { VisitorTop } from "../visitor-panel";
import { useVisitor } from "../store";
import { leaderLine, rankLine, tileCounts } from "./stats-copy";
import { useLiveStats } from "./use-live-stats";

/**
 * The picker row with live numbers: a count under each role tile and the
 * one-line summary ("You're visitor #213 · 48 from Vietnam"), plus a playful
 * "Founders are leading so far." Drop-in replacement for <VisitorTop />.
 * Before the first stats arrive nothing is drawn and nothing shifts.
 */
export function LiveVisitorTop() {
  const { role, ready, ordinal } = useVisitor();
  const { data, ref } = useLiveStats({ role, ready });
  const reduce = useReducedMotion();

  const line = data ? rankLine({ ordinal, role, roleCount: data.you.roleCount, country: data.you.country, countryCount: data.you.countryCount, countryRank: data.you.countryRank, total: data.total }) : null;
  const lead = data ? leaderLine(data.byRole, role) : null;

  // The tile aggregate is cached 10 s server-side but roleCount is fresh: never show a tile below the line.
  const counts = data ? tileCounts(role ? { ...data.byRole, [role]: Math.max(data.byRole[role] ?? 0, data.you.roleCount) } : data.byRole) : undefined;

  const summary = line ? (
    <motion.div initial={reduce ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={reduce ? { duration: 0 } : SPRING.ui}>
      <p data-testid="visitor-rank-line">{line}</p>
      {lead ? (
        <p data-testid="visitor-leader-line" className="text-[13px] text-ink-3">
          {lead}
        </p>
      ) : null}
    </motion.div>
  ) : null;

  return (
    <div ref={ref} data-testid="visitor-live">
      <VisitorTop counts={counts} summary={summary} />
    </div>
  );
}
