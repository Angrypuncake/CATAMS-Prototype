import { test, expect } from "@playwright/test";

test("navigate to TA dashboard after login", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/username/i).fill("demouser@demo.edu");
  await page.getByLabel(/password/i).fill("10");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/portal");
  await expect(
    page.getByRole("heading", {
      name: /Casual Academic Time Allocation System/i,
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: /enter/i }).nth(1).click();
  await page.waitForURL("**/dashboard/assistant");
  await expect(page).toHaveURL(/\/dashboard\/assistant/);
});
