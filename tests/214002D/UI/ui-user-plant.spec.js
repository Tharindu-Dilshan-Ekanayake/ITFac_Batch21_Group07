import { test, expect } from "@playwright/test";

test.describe("UI_User_Plants Module", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/plants`);
    await page.locator("table").waitFor({ state: "visible" });
  });

  test("UI_User_Plants-01: Verify plants page UI elements availability", async ({
    page,
  }) => {
    await expect(page.getByPlaceholder("Search plant")).toBeVisible();
    await expect(page.locator("select[name='categoryId']")).toBeVisible();
    await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Reset" })).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Name" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Category" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Price" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Stock" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Actions" }),
    ).toBeVisible();
  });

  test("UI_User_Plants-02: Verify no plants data available", async ({
    page,
  }) => {
    const rows = page.locator("tbody tr");

    if ((await rows.count()) === 0) {
      await expect(page.getByText("No plants found")).toBeVisible();
    } else {
      test.skip(true, "Plants data exists, skipping empty-state check");
    }
  });

  test("UI_User_Plants-03: Verify plants with pagination", async ({ page }) => {
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();

    const pagination = page.locator("nav, .pagination");

    if (await pagination.isVisible()) {
      await expect(pagination).toBeVisible();
    } else {
      test.skip(true, "Pagination not present for current data set");
    }
  });

  test("UI_User_Plants-04: Verify Low badge when quantity below 5", async ({
    page,
  }) => {
    const lowBadges = page.locator("span.badge.bg-danger");
    await expect(lowBadges.first()).toBeVisible();
    await expect(lowBadges.first()).toHaveText("Low");
  });

  test("UI_User_Plants-05: Verify Edit button is NOT displayed", async ({
    page,
  }) => {
    const editButton = page
      .locator("a:has-text('Edit'), button:has-text('Edit')")
      .filter({ hasText: "Edit", hasNotText: "", visible: true });

    await expect(editButton).toHaveCount(0);
  });

  test("UI_User_Plants-06: Verify Delete button is NOT displayed", async ({
    page,
  }) => {
    const deleteButton = page
      .locator("a:has-text('Delete'), button:has-text('Delete')")
      .filter({ hasText: "Delete", hasNotText: "", visible: true });

    await expect(deleteButton).toHaveCount(0);
  });
});
