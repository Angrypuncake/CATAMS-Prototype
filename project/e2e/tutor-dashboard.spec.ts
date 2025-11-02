import { test, expect } from "@playwright/test";

test("navigate to Tutor dashboard after login", async ({ page }) => {
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

  await page.getByRole("link", { name: /enter/i }).nth(0).click();
  await page.waitForURL("**/dashboard/tutor");
  await expect(page).toHaveURL(/\/dashboard\/tutor/);
  await expect(
    page.getByRole("heading", { name: /tutor dashboard/i }),
  ).toBeVisible();
});

test("tutor can view allocation statistics", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/username/i).fill("demouser@demo.edu");
  await page.getByLabel(/password/i).fill("10");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/portal");

  await page.getByRole("link", { name: /enter/i }).nth(0).click();
  await page.waitForURL("**/dashboard/tutor");

  await expect(page.getByText(/allocated hours/i)).toBeVisible();
  await expect(page.getByText(/upcoming sessions/i)).toBeVisible();
  await expect(page.getByText(/pending requests/i)).toBeVisible();
});

test("tutor can view and click into allocation", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/username/i).fill("demouser@demo.edu");
  await page.getByLabel(/password/i).fill("10");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/portal");

  const allocationsResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/tutor/allocations") &&
      response.status() === 200,
  );

  await page.getByRole("link", { name: /enter/i }).nth(0).click();
  await page.waitForURL("**/dashboard/tutor");

  await allocationsResponsePromise;

  const viewButton = page.getByRole("button", { name: /view/i }).first();
  await expect(viewButton).toBeVisible();
  await viewButton.click();

  await expect(
    page.getByRole("heading", { name: /allocation quick view/i }),
  ).toBeVisible();

  const viewDetailsButton = page.getByRole("link", { name: /view details/i });
  await expect(viewDetailsButton).toBeVisible();
  await viewDetailsButton.click();

  await page.waitForURL("**/dashboard/tutor/allocations/**");
  await expect(
    page.getByRole("heading", { name: /^allocation$/i }),
  ).toBeVisible();
});

test("tutor can search, sort and paginate allocations", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/username/i).fill("demouser@demo.edu");
  await page.getByLabel(/password/i).fill("10");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/portal");

  const allocationsResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/tutor/allocations") &&
      response.status() === 200,
  );

  await page.getByRole("link", { name: /enter/i }).nth(0).click();
  await page.waitForURL("**/dashboard/tutor");

  await allocationsResponsePromise;

  const searchInput = page.locator('input[type="text"]').first();
  await expect(searchInput).toBeVisible();

  const searchResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/tutor/allocations") &&
      response.url().includes("q="),
  );

  await searchInput.fill("SOFT");
  await searchResponsePromise;

  await page.waitForTimeout(500);

  const sortButton = page
    .locator("th")
    .filter({ hasText: /date/i })
    .locator("button")
    .first();
  if (await sortButton.isVisible()) {
    const sortResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/tutor/allocations") &&
        response.url().includes("sort="),
    );
    await sortButton.click();
    await sortResponsePromise;
  }

  const nextPageButton = page
    .getByRole("button", { name: /next page/i })
    .first();
  if (await nextPageButton.isEnabled()) {
    const paginationResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/tutor/allocations") &&
        response.url().includes("page=2"),
    );
    await nextPageButton.click();
    await paginationResponsePromise;
  }
});

test("tutor can view dashboard sections", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/username/i).fill("demouser@demo.edu");
  await page.getByLabel(/password/i).fill("10");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/portal");

  await page.getByRole("link", { name: /enter/i }).nth(0).click();
  await page.waitForURL("**/dashboard/tutor");

  await expect(
    page.getByRole("heading", { name: /my allocations/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /my requests/i }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /notices/i })).toBeVisible();
});
