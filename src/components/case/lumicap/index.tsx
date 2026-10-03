import type { CaseBlockMap } from "../types";
import { ApproveDeploy } from "./approve-deploy";
import { InvestorJourney } from "./investor-journey";
import { PauseSwitch } from "./pause-switch";

/** Bespoke blocks for the "lumicap" case study. Key = Name used in "lumicap/<Name>". */
export const blocks: CaseBlockMap = { ApproveDeploy, InvestorJourney, PauseSwitch };
