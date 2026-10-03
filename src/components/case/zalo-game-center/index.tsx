import type { CaseBlockMap } from "../types";
import { ExperimentReveal } from "./experiment-reveal";
import { MeasureFirst } from "./measure-first";
import { OwnershipLens } from "./ownership-lens";

/** Bespoke blocks for the "zalo-game-center" case study. Key = Name used in "zalo-game-center/<Name>". */
export const blocks: CaseBlockMap = { ExperimentReveal, MeasureFirst, OwnershipLens };
