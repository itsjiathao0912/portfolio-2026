import { defineConfig, devices } from "@playwright/test";

// The server is owned by scripts/run-isolated-e2e.mjs (private build dir,
// private DB, free port), which passes the URL in E2E_BASE_URL. There is
// deliberately no `webServer` block: Playwright must never build or start the
// app itself, or it would share a dist dir with whatever else is running.
const baseURL = process.env.E2E_BASE_URL;
if (!baseURL) {
  throw new Error("E2E_BASE_URL is not set. Run E2E through `pnpm test:e2e:isolated`.");
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  outputDir: "test-results",
  use: {
    baseURL,
    trace: "retain-on-failure",
    // Light theme only: run as a dark-mode OS user to prove nothing flips.
    colorScheme: "dark",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
