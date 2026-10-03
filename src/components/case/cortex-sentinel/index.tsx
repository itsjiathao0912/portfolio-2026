import type { CaseBlockMap } from "../types";
import { AgentLoop } from "./agent-loop";
import { AutoClearGate } from "./auto-clear-gate";
import { HonestyMap } from "./honesty-map";

/** Bespoke blocks for the "cortex-sentinel" case study. Key = Name used in "cortex-sentinel/<Name>". */
export const blocks: CaseBlockMap = { AgentLoop, AutoClearGate, HonestyMap };
