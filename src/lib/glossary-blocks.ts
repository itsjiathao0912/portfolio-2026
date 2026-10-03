// Pre-pass that decides, for one case-study page, which phrases get a glossary hover.
// Runs on the server in document order so "first occurrence per page" is deterministic.
import type { ContentBlock } from "@content/schema.ts";
import { annotateText, type GlossarySegment } from "./glossary";

export interface BlockGloss {
  text?: GlossarySegment[];
  items?: GlossarySegment[][];
  fields?: Record<string, GlossarySegment[]>;
}

export function glossBlocks(blocks: readonly ContentBlock[]): Map<number, BlockGloss> {
  const seen = new Set<string>();
  const out = new Map<number, BlockGloss>();
  const a = (text: string) => annotateText(text, seen);
  blocks.forEach((block, index) => {
    switch (block.type) {
      case "paragraph":
      case "callout":
        out.set(index, { text: a(block.text) });
        break;
      case "list":
        out.set(index, { items: block.items.map(a) });
        break;
      case "steps":
      case "features":
        out.set(index, { items: block.items.map((item) => a(item.text)) });
        break;
      case "metrics":
        out.set(index, { items: block.items.map((item) => a(item.label)) });
        break;
      case "decision":
        out.set(index, {
          fields: {
            rejected: a(block.rejected.text),
            chosen: a(block.chosen.text),
            because: a(block.because),
            ...(block.cost ? { cost: a(block.cost) } : {}),
          },
        });
        break;
      case "results":
        out.set(index, {
          items: [...block.items.map((item) => a(item.label)), ...block.shipped.map(a)],
          fields: block.next ? { next: a(block.next) } : {},
        });
        break;
      default:
        break;
    }
  });
  return out;
}
