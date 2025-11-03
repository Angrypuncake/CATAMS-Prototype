import { test, expect } from "@playwright/test";

test("home redirects to login", async ({ page }) => {
  await page.goto("/");
  await page.waitForURL("**/login");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: /sign in to your account/i })).toBeVisible();
});
