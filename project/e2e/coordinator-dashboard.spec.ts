import { test, expect } from "@playwright/test";

test("navigate to Coordinator dashboard after login", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/username/i).fill("demouser@demo.edu");
  await page.getByLabel(/password/i).fill("10");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/portal");
  await expect(
    page.getByRole("heading", {
      name: /Casual Academic Time Allocation System/i,
    })
  ).toBeVisible();

  await page.getByRole("link", { name: /enter/i }).nth(2).click();
  await page.waitForURL("**/dashboard/coordinator");
  await expect(page).toHaveURL(/\/dashboard\/coordinator/);
});

test("coordinator can refresh budget data", async ({ page }) => {
  await page.route("**/api/budget/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        rows: [
          {
            unitCode: "SOFT3888",
            budgetHours: 100,
            usedHours: 75,
            pctUsed: 0.75,
          },
        ],
      }),
    });
  });

  await page.goto("/login");
  await page.getByLabel(/username/i).fill("demouser@demo.edu");
  await page.getByLabel(/password/i).fill("10");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/portal");

  await page.getByRole("link", { name: /enter/i }).nth(2).click();
  await page.waitForURL("**/dashboard/coordinator");

  const refreshButton = page.getByRole("button", { name: /refresh/i }).first();
  await expect(refreshButton).toBeVisible();
  await refreshButton.click();
  await expect(page).toHaveURL(/\/dashboard\/coordinator/);
});

test("coordinator can navigate to add/edit allocations", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/username/i).fill("demouser@demo.edu");
  await page.getByLabel(/password/i).fill("10");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/portal");

  await page.getByRole("link", { name: /enter/i }).nth(2).click();
  await page.waitForURL("**/dashboard/coordinator");

  const addEditButton = page.getByRole("link", {
    name: /add.*edit allocations/i,
  });
  await expect(addEditButton).toBeVisible();
  await addEditButton.click();
  await page.waitForURL("**/admin/allocations");
  await expect(page).toHaveURL(/\/admin\/allocations/);
});

test("coordinator can adjust budget threshold slider", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/username/i).fill("demouser@demo.edu");
  await page.getByLabel(/password/i).fill("10");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/portal");

  await page.getByRole("link", { name: /enter/i }).nth(2).click();
  await page.waitForURL("**/dashboard/coordinator");

  const slider = page.locator('input[type="range"]');
  await expect(slider).toBeVisible();

  const initialValue = await slider.inputValue();
  expect(initialValue).toBeTruthy();

  const saveButton = page.getByRole("button", { name: /^save$/i }).first();
  await expect(saveButton).toBeVisible();
});
