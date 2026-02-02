// tests/admin-category.spec.js
import { test, expect } from "@playwright/test";


//test 10
test("UI_ADMIN_Category-10: should display Add Category button for admin", async ({
    page,
    baseURL,
  }) => {

    // Precondition: Admin already logged in (storageState)
    // Navigate to Categories page
    await page.goto(`${baseURL}/ui/categories`);
    await page.waitForLoadState("networkidle");

    // Step 1: Verify Add Category button is visible
    //const addCategoryButton = page.locator("a:has-text('Add A Category')");
    const addCategoryButton = page.locator('a[href="/ui/categories/add"]');

    await expect(addCategoryButton).toBeVisible();
    await expect(addCategoryButton).toBeEnabled();
  });

//test 11
test("UI_ADMIN_Category-11: should navigate to Add Category page when Add Category button is clicked", async ({
    page,
    baseURL,
  }) => {

    // Precondition: Admin already logged in (storageState)
    // Navigate to Categories page
    await page.goto(`${baseURL}/ui/categories`);
    await page.waitForLoadState("networkidle");

    // Step 1: Click Add Category button
    const addCategoryButton = page.locator('a[href="/ui/categories/add"]');
    await expect(addCategoryButton).toBeVisible();
    await addCategoryButton.click();

    // Expected Result: Add Category page opens
    await expect(page).toHaveURL(/\/ui\/categories\/add/);

    //verify page title
    await expect(page).toHaveTitle("QA Training App | Add A Category");

    // Verify Add Category page heading (optional)
    //const addCategoryHeading = page.locator("h3:has-text('Add Category')");
    //await expect(addCategoryHeading).toBeVisible();
  });


//test 12
test("UI_ADMIN_Category-12: should show validation when category name is empty", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/ui/categories`);
  await page.waitForLoadState("networkidle");

  // stable selector
  await page.locator('a[href="/ui/categories/add"]').click();

  await expect(page).toHaveURL(/\/ui\/categories\/add/);
  await expect(page).toHaveTitle(/QA Training App \| Add A Category/i);

  // keep empty and save
  await page.locator('input[name="name"]').fill("");
  await page.locator("button:has-text('Save')").click();

 // verify validation message
  await expect(
    page.locator("text=/Category name is required/i")
  ).toBeVisible();

  await expect(page).toHaveURL(/\/ui\/categories\/add/);
});


//test 13
test("ADMIN_Category-13: should show error when category name is less than 3 characters", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/ui/categories/add`);

  await page.locator('input[name="name"]').fill("ab");
  await page.locator("button:has-text('Save')").click();

  await expect(
    page.getByText("Category name must be between 3 and 10 characters")
  ).toBeVisible();

  await expect(page.locator('input[name="name"]')).toHaveClass(/is-invalid/);
  await expect(page).toHaveURL(/\/ui\/categories\/add/);
});


// test("ADMIN_Category-13B: should allow category name with 4 characters", async ({ page, baseURL }) => {
//   await page.goto(`${baseURL}/ui/categories/add`);

//   const categoryNameInput = page.locator('input[name="name"]');
//   await categoryNameInput.fill("ABCd"); //less than 3 characters

//   await page.locator("button:has-text('Save')").click();

//   // Error should NOT appear
//   const errorMessage = page.locator(
//     "text=/Category name must.*3.*10/i"
//   );
//   await expect(errorMessage).not.toBeVisible();

//   // Should redirect or show succlscess
//   await expect(page).toHaveURL(/\/ui\/categories/);
// });

//test 14
test("UI_ADMIN_Category-14: should create a main category when parent category is left as Main Category", async ({
  page,
  baseURL,
}) => {
  // Precondition: Admin logged in and on Add Category page
  await page.goto(`${baseURL}/ui/categories/add`);
  await page.waitForLoadState("networkidle");

  // Step 1: Enter valid category name (unique) 3-10 characters

  const categoryName = `MAI1N`;
  await page.locator('input[name="name"]').fill(categoryName);

  // Step 2: Leave Parent Category as default (Main Category)
  // (No action needed – default is already Main Category)

  // Step 3: Click Save
  await page.locator("button:has-text('Save')").click();

  // ✅ Expected: Redirect to Categories page
  await expect(page).toHaveURL(/\/ui\/categories$/);

  // ✅ Expected: Success message displayed
  const successAlert = page.locator(
    '.alert-success >> text=Category created successfully'
  );
  await expect(successAlert).toBeVisible();

  // ✅ Expected: Category shown in table
  const newRow = page.locator("table tbody tr", {
    hasText: categoryName,
  });
  await expect(newRow).toBeVisible();

  // ✅ Expected: Parent column shows "-" (main category)
  await expect(newRow).toContainText("-");
});

//test 15
test("UI_ADMIN_Category-15: create main category and then create sub-category under it", async ({ page, baseURL }) => {
  // Step 1: Create Main Category 
  const parentName = `PARENT`;
  await page.goto(`${baseURL}/ui/categories/add`);
  await page.locator('input[name="name"]').fill(parentName);
  await page.locator("button:has-text('Save')").click();
  await expect(page).toHaveURL(/\/ui\/categories/);

  // Step 2: Create Sub Category using Parent 
  const childName = `CHILD`;
  await page.goto(`${baseURL}/ui/categories/add`);
  await page.locator('input[name="name"]').fill(childName);

  const parentSelect = page.locator("select");
  await parentSelect.selectOption({ label: parentName });

  await page.locator("button:has-text('Save')").click();

  // Assertions 
  await expect(page.locator('.alert-success')).toBeVisible();
  const row = page.locator("table tbody tr", { hasText: childName });
  await expect(row).toContainText(parentName);
});
