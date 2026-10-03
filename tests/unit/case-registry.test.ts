import { describe, expect, test } from "bun:test";
import { contentBlockSchema } from "../../content/schema.ts";
import { CASE_SLUG_LOADERS, parseCustomKey, resolveCustomBlock } from "../../src/components/case/registry.tsx";

const SLUGS = ["ledgr", "cortex-sentinel", "gocrypto", "cosap", "lumicap", "guardline", "zalo-game-center", "reorc-data-platform", "pac"];

describe("case custom-block registry", () => {
  test("has a loader for every case-study slug, each exporting a blocks map", async () => {
    expect(Object.keys(CASE_SLUG_LOADERS).sort()).toEqual([...SLUGS].sort());
    for (const slug of SLUGS) {
      const mod = await CASE_SLUG_LOADERS[slug]();
      expect(typeof mod.blocks).toBe("object");
    }
  });
  test("parses keys", () => {
    expect(parseCustomKey("ledgr/Hero")).toEqual({ slug: "ledgr", name: "Hero" });
    expect(parseCustomKey("bad")).toBeNull();
    expect(parseCustomKey("ledgr/../x")).toBeNull();
  });
  test("unknown slug, unknown name, malformed key and prototype keys resolve to null", async () => {
    expect(await resolveCustomBlock("nope/Thing")).toBeNull();
    expect(await resolveCustomBlock("ledgr/DoesNotExist")).toBeNull();
    expect(await resolveCustomBlock("ledgr")).toBeNull();
    expect(await resolveCustomBlock("ledgr/toString")).toBeNull();
  });
  test("schema accepts a custom block and rejects a malformed key", () => {
    expect(contentBlockSchema.safeParse({ type: "custom", component: "ledgr/Hero", props: { a: 1 } }).success).toBe(true);
    expect(contentBlockSchema.safeParse({ type: "custom", component: "Hero" }).success).toBe(false);
  });
});
