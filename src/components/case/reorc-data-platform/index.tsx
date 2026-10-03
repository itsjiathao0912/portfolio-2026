import type { CaseBlockMap } from "../types";
import { LineageTrace } from "./lineage-trace";
import { StoryGap } from "./story-gap";
import { UatCheckpoints } from "./uat-checkpoints";

/** Bespoke blocks for the "reorc-data-platform" case study. Key = Name used in "reorc-data-platform/<Name>". */
export const blocks: CaseBlockMap = { StoryGap, LineageTrace, UatCheckpoints };
