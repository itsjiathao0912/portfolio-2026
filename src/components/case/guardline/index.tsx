import type { CaseBlockMap } from "../types";
import { ActionDesk } from "./action-desk";
import { RingUnmask } from "./ring-unmask";
import { VerdictCheck } from "./verdict-check";

/** Bespoke blocks for the "guardline" case study. Key = Name used in "guardline/<Name>". */
export const blocks: CaseBlockMap = { ActionDesk, RingUnmask, VerdictCheck };
