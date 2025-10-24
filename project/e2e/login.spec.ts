import { test, expect } from "@playwright/test";

test("login with demouser", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: /sign in to your account/i }),
  ).toBeVisible();
  await page.getByLabel(/username/i).fill("demouser@demo.edu");
  await page.getByLabel(/password/i).fill("10");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/portal");
  await expect(page).toHaveURL(/\/portal/);
});
