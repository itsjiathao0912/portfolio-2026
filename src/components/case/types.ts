import type { ComponentType } from "react";

/** Props every custom case-study block receives: the block's `props` spread, plus `source`. */
export type CaseBlockProps = Record<string, unknown> & { source?: string };
export type CaseBlockComponent = ComponentType<CaseBlockProps>;
export type CaseBlockMap = Record<string, CaseBlockComponent>;
