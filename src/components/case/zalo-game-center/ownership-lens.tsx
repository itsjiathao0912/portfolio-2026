"use client";

import { useState } from "react";
import { VizFigure } from "@/components/dataviz/viz-figure";
import type { CaseBlockProps } from "../types";
import { Pills } from "./ui";

/** Only what the CV and Thao's Notion profile state. Team sizes and individual teammates are not known, so none are claimed. */
export const LENSES = [
  {
    id: "roadmap",
    label: "Roadmap",
    mine: ["Owned the roadmap and delivery for 1 new product launch and 4 existing products", "Market research and product-health monitoring in testing and after launch"],
    shared: "Coordinated with the engineering, design and data teams.",
  },
  {
    id: "specs",
    label: "Specs & launch",
    mine: ["Turned concepts from design docs into business requirement documents and functional specs with wireframes", "User acceptance testing before launch"],
    shared: "Worked with designers and developers from the design docs.",
  },
  {
    id: "money",
    label: "Data & money",
    mine: ["Developed and rolled out the tracking dashboard", "Ran the ad-placement A/B tests and the monthly events aimed at paying users"],
    shared: "Coordinated with the data and engineering teams.",
  },
] as const;
export type LensId = (typeof LENSES)[number]["id"];

/** Reader flips between three areas of the job to see what was mine and what was shared. */
export function OwnershipLens({ source }: CaseBlockProps) {
  const [id, setId] = useState<LensId>("roadmap");
  const lens = LENSES.find((l) => l.id === id)!;
  return (
    <VizFigure
      kind="zalo-ownership"
      title="What I owned, and what I shared"
      badge="CV + Notion profile"
      caption="Role: Product Owner. I do not claim the engineering, design or data work; I coordinated it."
      source={source}
    >
      <Pills label="Area of the job" options={LENSES.map((l) => ({ value: l.id, label: l.label }))} value={id} onChange={setId} />
      <div className="grid gap-3 sm:grid-cols-2" aria-live="polite">
        <div className="rounded-2xl bg-tint-aqua p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-2">Mine</p>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-ink-1">
            {lens.mine.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-dashed border-border-strong p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-2">With the team</p>
          <p className="mt-2 text-sm text-ink-1">{lens.shared}</p>
        </div>
      </div>
    </VizFigure>
  );
}
