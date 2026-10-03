import type { ContentBlock } from "@content/schema.ts";

export type BlockOf<T extends ContentBlock["type"]> = Extract<ContentBlock, { type: T }>;
