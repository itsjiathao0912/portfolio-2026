import { describe, expect, test } from "bun:test";
import { isThirdPartyMessage } from "../e2e/helpers";

describe("e2e console filter", () => {
  test("ignores only LinkedIn sources", () => {
    expect(isThirdPartyMessage("https://www.linkedin.com/embed/feed/update/urn:li:share:1")).toBe(true);
    expect(isThirdPartyMessage("https://static.licdn.com/aero-v1/sc/h/x.js")).toBe(true);
    expect(isThirdPartyMessage("http://127.0.0.1:3003/_next/static/chunks/app.js")).toBe(false);
    expect(isThirdPartyMessage("https://evil-linkedin.com.example/x.js")).toBe(false);
    expect(isThirdPartyMessage("")).toBe(false);
  });
});
