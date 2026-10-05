import { describe, expect, test } from "bun:test";
import { NEAR_MARGIN } from "@/components/site/lazy/defer-style";

describe("NEAR_MARGIN", () => {
  test("near margin mounts ~600px ahead", () => {
    expect(NEAR_MARGIN).toBe("600px 0px");
  });
});
