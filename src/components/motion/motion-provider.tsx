"use client";

import { MotionConfig } from "motion/react";

/** Site-wide: motion honours the OS reduced-motion setting everywhere. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
