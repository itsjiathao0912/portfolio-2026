import type { CaseBlockMap } from "../types";
import { ContractCheck } from "./contract-check";
import { CrossCheck } from "./cross-check";
import { RuleTree } from "./rule-tree";

/** Bespoke blocks for the "ledgr" case study. Key = Name used in "ledgr/<Name>". */
export const blocks: CaseBlockMap = { ContractCheck, CrossCheck, RuleTree };
