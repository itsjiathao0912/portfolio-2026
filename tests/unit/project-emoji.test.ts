import { describe, expect, test } from "bun:test";
import { existsSync, statSync } from "node:fs";
import { PROJECT_EMOJI, PROJECT_EMOJI_FILE } from "../../src/components/site/home/project-meta.ts";

describe("animated project emoji", () => {
  test("every project with an emoji has a self-hosted animated + still file", () => {
    for (const slug of Object.keys(PROJECT_EMOJI)) {
      const file = PROJECT_EMOJI_FILE[slug];
      expect(file).toBeTruthy();
      for (const suffix of ["", "-still"]) {
        const path = `public/emoji/${file}${suffix}.webp`;
        expect(existsSync(path)).toBe(true);
        expect(statSync(path).size).toBeLessThan(90_000);
      }
    }
  });
});
