import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { CursorReveal, MASK_ON, TOGGLE_OFF } from "../../src/components/gems/cursor-reveal";

const out = renderToStaticMarkup(<CursorReveal alt="the casual one">Serious headline</CursorReveal>);

describe("CursorReveal SSR (no hydration layout shift)", () => {
  test("server HTML renders both the toggle block and the mask layer", () => {
    expect(out).toContain('data-testid="cursor-reveal-toggle"');
    expect(out).toContain('data-testid="cursor-reveal-layer"');
  });
  test("mask layer hidden by default, shown only on fine-pointer + motion-ok", () => {
    const layer = out.match(/<div[^>]*data-testid="cursor-reveal-layer"[^>]*>/)?.[0] ?? "";
    expect(layer).toContain(" hidden ");
    expect(layer).toContain(MASK_ON);
  });
  test("toggle block hidden on fine-pointer + motion-ok via CSS", () => {
    expect(out).toContain(`class="mt-3 ${TOGGLE_OFF}"`);
    expect(TOGGLE_OFF).toBe("[@media(hover:hover)_and_(pointer:fine)_and_(prefers-reduced-motion:no-preference)]:hidden");
  });
  test("data-mode is toggle on the server", () => {
    expect(out).toContain('data-mode="toggle"');
  });
});
