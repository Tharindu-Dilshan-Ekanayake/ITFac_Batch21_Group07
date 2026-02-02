// tests/admin-category.spec.js
import { test, expect } from "@playwright/test";


//test karanna admin 10 eka
test.only("UI_ADMIN_Category-10: should display Add Category button for admin", async ({
    page,
    baseURL,
  }) => {

    // Precondition: Admin already logged in (storageState)
    // Navigate to Categories page
    await page.goto(`${baseURL}/ui/categories`);
    await page.waitForLoadState("networkidle");

    // Step 1: Verify Add Category button is visible
    const addCategoryButton = page.locator("a:has-text('Add A Category')");

    await expect(addCategoryButton).toBeVisible();
    await expect(addCategoryButton).toBeEnabled();
  });

//test karanna gahuwa admin 12 eka
test("UI_ADMIN_Category-12: should show validation when category name is empty", async ({
  page,
  baseURL,
}) => {
  // Navigate to categories page
  await page.goto(`${baseURL}/ui/categories`);
  await page.waitForLoadState("networkidle");

  // Click "Add A Category" button
  const addCategoryButton = page.locator("a:has-text('Add A Category')");
  await expect(addCategoryButton).toBeVisible();
  await addCategoryButton.click();

  // Wait for Add Category page to load
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/ui\/categories\/add/);

  // Verify we're on the Add Category page
  const addCategoryHeading = page.locator("h3:has-text('Add Category')");
  await expect(addCategoryHeading).toBeVisible();

  // Leave Category Name field empty and try to save
  const categoryNameInput = page.locator('input[name="name"]'); // Update based on actual field name
  await categoryNameInput.fill(""); // Ensure it's empty

  // Click Save button
  const saveButton = page.locator("button:has-text('Save')");
  await saveButton.click();

  // Wait a moment for validation to appear
  await page.waitForTimeout(500);

  // Verify validation message appears
  const validationMessage = page.locator(
    "text=/Category name is required|Name is required|Please enter a category name/i",
  );
  await expect(validationMessage).toBeVisible();

  // Ensure still on Add Category page (not redirected)
  await expect(page).toHaveURL(/\/ui\/categories\/add/);
});
