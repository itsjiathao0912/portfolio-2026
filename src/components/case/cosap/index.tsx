import type { CaseBlockMap } from "../types";
import { ExpenseRelay } from "./expense-relay";
import { LeaveGuard } from "./leave-guard";
import { LoopToggle } from "./loop-toggle";

/** Bespoke blocks for the "cosap" case study. Key = Name used in "cosap/<Name>". */
export const blocks: CaseBlockMap = { ExpenseRelay, LeaveGuard, LoopToggle };
