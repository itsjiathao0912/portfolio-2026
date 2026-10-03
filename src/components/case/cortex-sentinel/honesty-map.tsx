"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import { cn } from "@/lib/utils";
import type { CaseBlockProps } from "../types";
import { Pills, STATUS_CHIP, STATUS_LABEL, type Status } from "./ui";

type Owner = "platform" | "ours";
interface Part { label: string; status: Status; owner: Owner; note?: string }
// Deck p.14 (layers and status chips), p.17 (live / prototyped / backtest), p.20 (what was platform vs ours), p.8 (precedents are ours).
export const LAYERS: { name: string; parts: Part[] }[] = [
  { name: "L1 · Data in", parts: [{ label: "Public ingestion API", status: "live", owner: "platform" }, { label: "Connector pipeline", status: "live", owner: "platform" }] },
  { name: "L2 · Console", parts: [{ label: "Investigation suite", status: "live", owner: "platform", note: "Re-skinned by Thao to match her mockups" }, { label: "Rule authoring", status: "live", owner: "platform" }] },
  {
    name: "L3 · Core backend",
    parts: [
      { label: "Data model", status: "live", owner: "platform" },
      { label: "Scenarios, rules, decision engine", status: "live", owner: "platform" },
      { label: "Sanctions screening", status: "live", owner: "platform" },
      { label: "Case management", status: "live", owner: "platform" },
    ],
  },
  {
    name: "L4 · Intelligence",
    parts: [
      { label: "Plain English → rule", status: "live", owner: "platform", note: "Disclosed as a platform capability" },
      { label: "Versioning and shadow tests", status: "live", owner: "platform", note: "Disclosed as a platform capability" },
      { label: "AI case review", status: "live", owner: "platform", note: "The precedents that feed it are ours" },
      { label: "Triage scorer", status: "proto", owner: "ours" },
      { label: "Precedent retrieval", status: "proto", owner: "ours" },
      { label: "Learning loop", status: "design", owner: "ours" },
    ],
  },
  { name: "L5 · Foundation", parts: [{ label: "PostgreSQL, Redis, Elasticsearch", status: "live", owner: "platform" }, { label: "Self-hosted sanctions data", status: "live", owner: "platform" }] },
];

const FILTERS = [
  { value: "all", label: "Everything" },
  { value: "live", label: "Live" },
  { value: "proto", label: "Prototyped" },
  { value: "design", label: "Designed" },
  { value: "ours", label: "Our hackathon layer" },
] as const;
type Filter = (typeof FILTERS)[number]["value"];

export function matches(p: Part, f: Filter) {
  return f === "all" || f === p.status || (f === "ours" && p.owner === "ours");
}

/** Architecture with its honesty labels made filterable: what was live, what was a prototype, who built it. */
export function HonestyMap({ source }: CaseBlockProps) {
  const [f, setF] = useState<Filter>("all");
  const shown = LAYERS.flatMap((l) => l.parts).filter((p) => matches(p, f)).length;
  return (
    <VizFigure
      kind="cortex-honesty-map"
      title="What was real on demo day, and who built it"
      badge="Status as pitched"
      caption="Most of the stack is the open-source platform we built on. Our layer is the adaptive triage, and on demo day it was a prototype that ran offline. Parts with a coloured outline are our team's; the rest is the platform."
      source={source}
    >
      <Pills label="Filter the architecture" options={FILTERS} value={f} onChange={setF} />
      <p className="text-sm text-ink-2" aria-live="polite">{shown} of {LAYERS.flatMap((l) => l.parts).length} parts shown</p>
      <div className="flex flex-col gap-3">
        {LAYERS.map((l) => (
          <div key={l.name} className="grid gap-2 sm:grid-cols-[9rem_1fr] sm:items-start">
            <p className="pt-2 text-xs font-semibold tracking-wide text-ink-3 uppercase">{l.name}</p>
            <ul className="flex flex-wrap gap-2">
              {l.parts.map((p) => {
                const on = matches(p, f);
                return (
                  <li
                    key={p.label}
                    data-owner={p.owner}
                    className={cn(
                      "flex flex-col gap-1 rounded-2xl px-3 py-2 text-sm transition-opacity motion-reduce:transition-none",
                      p.owner === "ours" ? "border-2 border-accent bg-bg" : "border border-hairline bg-bg",
                      !on && "opacity-25",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-ink-1">{p.label}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS_CHIP[p.status])}>{STATUS_LABEL[p.status]}</span>
                    </span>
                    {p.note ? <span className="text-xs text-ink-2">{p.note}</span> : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </VizFigure>
  );
}
