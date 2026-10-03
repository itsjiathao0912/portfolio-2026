import { test as base } from "@playwright/test";

export { devices, expect } from "@playwright/test";

/**
 * Every spec runs with LinkedIn stubbed: the home page pre-loads the official
 * embeds as the section approaches, and the live embeds (plus the frames they
 * nest) would make every home test depend on a third party's network and
 * console noise. A spec that needs specific embed content registers its own
 * `page.route`, which takes precedence over this context-level stub.
 */
export const test = base.extend<{ stubLinkedin: void }>({
  stubLinkedin: [
    async ({ context }, use) => {
      await context.route(/^https:\/\/([a-z0-9-]+\.)*(linkedin\.com|licdn\.com)\//, (route) =>
        route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>post</title>" })
      );
      await use();
    },
    { auto: true },
  ],
});
