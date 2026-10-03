// Registry of every content entry. To add a project: create a file in
// content/projects/ and add it to this array. Order here does not matter —
// display order is each project's `sortOrder`.
//
// Relative `.ts` imports only (see content/schema.ts for why).

import cortexSentinel from "./projects/cortex-sentinel.ts";
import cosap from "./projects/cosap.ts";
import ledgr from "./projects/ledgr.ts";
import lumicap from "./projects/lumicap.ts";
import pac from "./projects/pac.ts";
import reorcDataPlatform from "./projects/reorc-data-platform.ts";
import zaloGameCenter from "./projects/zalo-game-center.ts";
import site from "./site.ts";

export const projectEntries: readonly unknown[] = [
  lumicap,
  cosap,
  pac,
  zaloGameCenter,
  reorcDataPlatform,
  ledgr,
  cortexSentinel,
];

export const siteEntry: unknown = site;
