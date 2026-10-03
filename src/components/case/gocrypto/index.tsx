import type { CaseBlockMap } from "../types";
import { GapFiller } from "./gap-filler";
import { PhoneWalkthrough } from "./phone-walkthrough";
import { LanguageRule } from "./language-rule";
import { RetentionStress } from "./retention-stress";
import { TransferCalculator } from "./transfer-calculator";

/** Bespoke blocks for the "gocrypto" case study. Key = Name used in "gocrypto/<Name>". */
export const blocks: CaseBlockMap = { GapFiller, TransferCalculator, LanguageRule, RetentionStress, PhoneWalkthrough };
