import type { CaseBlockMap } from "../types";
import { PriceBooks } from "./price-books";
import { Reconcile } from "./reconcile";

/** Bespoke blocks for the "pac" case study. Key = Name used in "pac/<Name>". */
export const blocks: CaseBlockMap = { PriceBooks, Reconcile };
