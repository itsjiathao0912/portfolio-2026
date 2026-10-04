import { test, expect } from "./fixtures";

// R8: the redesigned build-next poll: pastel bars, clay faces of voter roles,
// keyboard radiogroup, change of vote. Bodies are mocked so counts are exact.

const SHOTS = "process/features/portfolio-site/active/autoresearch-ux-261004_04-10-26/research/R8-shots";
const ZERO = { "compliance-copilot": 0, remittance: 0, "fraud-toolkit": 0, "women-in-tech": 0, "backoffice-agent": 0, "agent-payments": 0 };
const body = (counts: Record<string, number>, mine: string | null, roles: Record<string, string[]> = {}) => ({
  counts: { ...ZERO, ...counts },
  total: Object.values(counts).reduce((a, b) => a + b, 0),
  mine,
  roles,
});
const ROLES = { remittance: ["engineer", "investor", "designer"], "agent-payments": ["engineer", "student", "data", "pm"], "fraud-toolkit": ["recruiter"], "backoffice-agent": ["growth", "curious"], "compliance-copilot": ["marketer"], "women-in-tech": ["student", "designer"] };
const BASE = { remittance: 4, "agent-payments": 5, "fraud-toolkit": 2, "backoffice-agent": 2, "compliance-copilot": 1, "women-in-tech": 1 };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("thao:visitor:v1")) localStorage.setItem("thao:visitor:v1", JSON.stringify({ v: 1, role: "founder", collapsed: true, visitorId: "e2epollr8-" + Math.random().toString(36).slice(2, 12), ordinal: null }));
  });
  await page.route("**/api/visit", (r) => r.fulfill({ json: { ordinal: 1, counted: false } }));
});

async function mockPoll(page: import("@playwright/test").Page) {
  let mine: string | null = null;
  const votes: string[] = [];
  await page.route("**/api/poll", async (r) => {
    const req = r.request().postDataJSON() as { option: string | null };
    if (req.option) {
      votes.push(req.option);
      mine = req.option;
    }
    const counts: Record<string, number> = { ...BASE };
    const roles: Record<string, string[]> = { ...ROLES };
    if (mine) {
      counts[mine] += 1;
      roles[mine] = ["founder", ...(roles[mine] ?? [])].slice(0, 4);
    }
    await r.fulfill({ json: body(counts, mine, roles) });
  });
  return votes;
}

for (const [w, h] of [[1440, 900], [390, 844]] as const) {
  test(`vote shows faces, a filled bar and a check; vote can change (${w})`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    const votes = await mockPoll(page);
    await page.goto("/");
    const poll = page.getByTestId("visitor-poll");
    await poll.scrollIntoViewIfNeeded();
    await expect(page.getByTestId("poll-option-remittance")).toBeVisible();
    // Under 20 votes and not voted: calm, no faces, no numbers.
    await expect(page.locator('[data-testid^="poll-faces-"]')).toHaveCount(0);
    await expect(page.locator('[data-testid^="poll-value-"]')).toHaveCount(0);
    await page.waitForTimeout(400);
    await poll.screenshot({ path: `${SHOTS}/before-${w}.png` });

    await page.getByTestId("poll-option-remittance").click();
    await expect(page.getByTestId("poll-option-remittance")).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("poll-value-remittance")).toHaveText("5");
    await expect(page.getByTestId("poll-faces-remittance")).toHaveAttribute("aria-label", /Founder/);
    await expect(page.getByTestId("poll-faces-agent-payments")).toBeVisible();
    await page.waitForTimeout(1200); // bar fill settles
    await poll.screenshot({ path: `${SHOTS}/after-${w}.png` });

    await page.waitForTimeout(2100); // server throttles changes under 2 s; mocked here, kept honest anyway
    await page.getByTestId("poll-option-agent-payments").click();
    await expect(page.getByTestId("poll-option-agent-payments")).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("poll-option-remittance")).toHaveAttribute("aria-checked", "false");
    expect(votes).toEqual(["remittance", "agent-payments"]);
  });
}

test("keyboard: arrows move focus without voting, Space votes", async ({ page }) => {
  const votes = await mockPoll(page);
  await page.goto("/");
  await page.getByTestId("visitor-poll").scrollIntoViewIfNeeded();
  const first = page.getByTestId("poll-option-compliance-copilot");
  await expect(first).toHaveAttribute("tabindex", "0");
  await first.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByTestId("poll-option-remittance")).toBeFocused();
  expect(votes).toEqual([]);
  await page.keyboard.press("Space");
  await expect(page.getByTestId("poll-option-remittance")).toHaveAttribute("aria-checked", "true");
  expect(votes).toEqual(["remittance"]);
});
