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

describe("nested LinkedIn frames", () => {
  const co = (origin: string) => btoa(origin).replace(/=/g, ".");
  test("reCAPTCHA inside the LinkedIn embed is LinkedIn's", () => {
    expect(isThirdPartyMessage(`https://www.google.com/recaptcha/enterprise/anchor?co=${co("https://www.linkedin.com:443")}`)).toBe(true);
    expect(isThirdPartyMessage(`https://www.google.com/recaptcha/enterprise/anchor?co=${co("http://127.0.0.1:3003")}`)).toBe(false);
    expect(isThirdPartyMessage("https://www.google.com/recaptcha/api.js")).toBe(false);
  });
  test("subframe-only API errors with no source are attributed to the embed", () => {
    expect(isThirdPartyMessage("", "getInstalledRelatedApps() is only supported in top-level browsing contexts.")).toBe(true);
    expect(isThirdPartyMessage("", "TypeError: x is undefined")).toBe(false);
  });
});
