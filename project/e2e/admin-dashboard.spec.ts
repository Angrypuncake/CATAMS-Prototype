import { test, expect } from "@playwright/test";

test("navigate to Admin dashboard after login", async ({ page }) => {
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

  await page.getByRole("link", { name: /enter/i }).nth(3).click();
  await page.waitForURL("**/dashboard/admin");
  await expect(page).toHaveURL(/\/dashboard\/admin/);
  await expect(
    page.getByRole("heading", { name: /system admin dashboard/i }),
  ).toBeVisible();
});

test("admin can view system statistics", async ({ page }) => {
  await page.route("**/api/admin/overview", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        totals: {
          users: 150,
          allocations: 500,
        },
        userRoles: [],
        userRolesTotal: 0,
      }),
    });
  });

  await page.goto("/login");
  await page.getByLabel(/username/i).fill("demouser@demo.edu");
  await page.getByLabel(/password/i).fill("10");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/portal");

  await page.getByRole("link", { name: /enter/i }).nth(3).click();
  await page.waitForURL("**/dashboard/admin");

  await expect(page.getByText("Users")).toBeVisible();
  await expect(page.getByRole("heading", { name: "150" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "500" })).toBeVisible();
});

test("admin can navigate to bulk import allocations", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/username/i).fill("demouser@demo.edu");
  await page.getByLabel(/password/i).fill("10");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/portal");

  await page.getByRole("link", { name: /enter/i }).nth(3).click();
  await page.waitForURL("**/dashboard/admin");

  const bulkImportButton = page.getByRole("link", {
    name: /bulk import allocations/i,
  });
  await expect(bulkImportButton).toBeVisible();
  await bulkImportButton.click();
  await page.waitForURL("**/admin/import");
  await expect(page).toHaveURL(/\/admin\/import/);
});

test("admin can navigate to edit allocations", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/username/i).fill("demouser@demo.edu");
  await page.getByLabel(/password/i).fill("10");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/portal");

  await page.getByRole("link", { name: /enter/i }).nth(3).click();
  await page.waitForURL("**/dashboard/admin");

  const editAllocationsButton = page.getByRole("link", {
    name: /edit allocations/i,
  });
  await expect(editAllocationsButton).toBeVisible();
  await editAllocationsButton.click();
  await page.waitForURL("**/admin/allocations");
  await expect(page).toHaveURL(/\/admin\/allocations/);
});

test("admin can toggle between staged and runs in import history", async ({
  page,
}) => {
  await page.route("**/api/admin/history**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        staged: [
          {
            id: 1,
            status: "staged",
            created_at: "2025-10-24T10:00:00Z",
          },
        ],
        runs: [
          {
            id: 2,
            status: "committed",
            started_at: "2025-10-24T09:00:00Z",
            finished_at: "2025-10-24T09:15:00Z",
          },
        ],
        stagedTotal: 1,
        runsTotal: 1,
      }),
    });
  });

  await page.goto("/login");
  await page.getByLabel(/username/i).fill("demouser@demo.edu");
  await page.getByLabel(/password/i).fill("10");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/portal");

  await page.getByRole("link", { name: /enter/i }).nth(3).click();
  await page.waitForURL("**/dashboard/admin");

  const stagedButton = page.getByRole("button", { name: /^staged$/i });
  const runsButton = page.getByRole("button", { name: /^runs$/i });

  await expect(stagedButton).toBeVisible();
  await expect(runsButton).toBeVisible();
  await runsButton.click();
  await expect(runsButton).toHaveAttribute("aria-pressed", "true");
});

test("admin can view validation reports", async ({ page }) => {
  await page.route("**/api/admin/overview", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        totals: {
          users: 150,
          allocations: 500,
        },
        userRoles: [],
        userRolesTotal: 0,
      }),
    });
  });

  await page.goto("/login");
  await page.getByLabel(/username/i).fill("demouser@demo.edu");
  await page.getByLabel(/password/i).fill("10");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/portal");

  await page.getByRole("link", { name: /enter/i }).nth(3).click();
  await page.waitForURL("**/dashboard/admin");

  await expect(page.getByText(/validation reports/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /invalid tutor emails/i }),
  ).toBeVisible();
});

test("admin can view user and role management table", async ({ page }) => {
  await page.route("**/api/admin/overview", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        totals: {
          users: 3,
          allocations: 10,
        },
        userRoles: [
          {
            id: 1,
            email: "user1@example.com",
            roles: ["tutor"],
            active: true,
            created_at: "2025-01-01T00:00:00Z",
          },
          {
            id: 2,
            email: "user2@example.com",
            roles: ["coordinator", "tutor"],
            active: true,
            created_at: "2025-02-01T00:00:00Z",
          },
        ],
        userRolesTotal: 2,
      }),
    });
  });

  await page.goto("/login");
  await page.getByLabel(/username/i).fill("demouser@demo.edu");
  await page.getByLabel(/password/i).fill("10");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/portal");

  await page.getByRole("link", { name: /enter/i }).nth(3).click();
  await page.waitForURL("**/dashboard/admin");

  await expect(page.getByText(/user.*role management/i)).toBeVisible();
});
