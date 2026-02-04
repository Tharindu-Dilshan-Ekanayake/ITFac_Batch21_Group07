import { test, expect } from "@playwright/test";

test("UI_User_Categories-11: Edit button should not be visible for user", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/ui/categories`);
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();

  // prove it's USER view
  await expect(page.getByRole("link", { name: /Add A Category/i })).toHaveCount(0);
  await expect(page.getByRole("columnheader", { name: "Actions" })).toHaveCount(0);

  await expect(page.locator('a[title="Edit"]')).toHaveCount(0);
});

test("UI_User_Categories-12: Delete button should not be visible for user", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/ui/categories`);
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();

  // prove it's USER view
  await expect(page.getByRole("link", { name: /Add A Category/i })).toHaveCount(0);
  await expect(page.getByRole("columnheader", { name: "Actions" })).toHaveCount(0);

  await expect(page.locator('form[action*="/ui/categories/delete"]')).toHaveCount(0);
});



test.only("UI_User_Categories-13: should show 'No category found' when no categories exist", async ({
  page,
  baseURL,
}) => {
  // 1️⃣ Navigate to Categories page as USER
  await page.goto(`${baseURL}/ui/categories`);
  await page.waitForLoadState("networkidle");

  // 2️⃣ Verify Categories page loaded
  await expect(
    page.getByRole("heading", { name: "Categories" })
  ).toBeVisible();

  // 3️⃣ Verify EMPTY STATE message (from your screenshot)
  await expect(
    page.getByText("No category found")
  ).toBeVisible();

  // 4️⃣ Ensure no category names exist in table
  const dataRows = page.locator("table tbody tr td", {
    hasNotText: "No category found",
  });

  await expect(dataRows).toHaveCount(0);
});

