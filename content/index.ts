// Registry of every content entry. To add a project: create a file in
// content/projects/ and add it to this array. Order here does not matter —
// display order is each project's `sortOrder`.
//
// Relative `.ts` imports only (see content/schema.ts for why).

import placeholderProject from "./projects/placeholder-project.ts";

export const projectEntries: readonly unknown[] = [placeholderProject];
