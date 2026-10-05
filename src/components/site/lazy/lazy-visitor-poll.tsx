"use client";

import dynamic from "next/dynamic";
import { WhenVisible } from "./when-visible";

// The poll renders nothing until its data arrives, so a 1px placeholder is visually identical.
const VisitorPoll = dynamic(() => import("@/components/site/visitor/stats/visitor-poll").then((m) => m.VisitorPoll), { ssr: false });

export function LazyVisitorPoll() {
  return (
    <WhenVisible>
      <VisitorPoll />
    </WhenVisible>
  );
}
