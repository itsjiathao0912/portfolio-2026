import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Portrait } from "../../src/components/site/portrait";

// Render as the server would: another unit file leaves a fake `window` on globalThis.
const html = (priority?: boolean) => {
  const g = globalThis as Record<string, unknown>;
  const w = g.window;
  delete g.window;
  try {
    return renderToStaticMarkup(<Portrait src="/portrait/thao-color.webp" name="Thao" priority={priority} />);
  } finally {
    g.window = w;
  }
};

describe("Portrait LCP image", () => {
  test("priority: B/W image is eager, high fetch priority, visible in server HTML", () => {
    const out = html(true);
    const bw = out.match(/<img[^>]*thao-bw\.webp[^>]*>/)?.[0] ?? "";
    expect(bw).toContain('fetchPriority="high"');
    expect(bw).not.toContain('loading="lazy"');
    expect(bw).not.toContain("opacity-0");
  });

  test("non-priority: stays lazy, no high fetch priority", () => {
    const bw = html(false).match(/<img[^>]*thao-bw\.webp[^>]*>/)?.[0] ?? "";
    expect(bw).toContain('loading="lazy"');
    expect(bw).not.toContain("fetchPriority");
  });

  test("wrapper reserves aspect ratio", () => {
    expect(html(true)).toContain("aspect-[643/736]");
  });
});
