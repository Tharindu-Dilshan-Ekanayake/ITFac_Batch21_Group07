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

  // Expected: Redirect to Categories page
  await expect(page).toHaveURL(/\/ui\/categories$/);

  // Expected: Success message displayed
  const successAlert = page.locator(
    '.alert-success >> text=Category created successfully'
  );
  await expect(successAlert).toBeVisible();

  // Expected: Category shown in table
  const newRow = page.locator("table tbody tr", {
    hasText: categoryName,
  });
  await expect(newRow).toBeVisible();

  // Expected: Parent column shows "-" (main category)
  await expect(newRow).toContainText("-");

  // Cleanup: Delete created category (optional)
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

//test 16
test("UI_ADMIN_Category-16: should discard changes and navigate back when Cancel is clicked", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/ui/categories/add`);
  await page.waitForLoadState("networkidle");

  const tempName = `TEMP`;
  await page.locator('input[name="name"]').fill(tempName);

  // Cancel is an <a> link, pick the correct one
  const cancelButton = page.locator('a.btn.btn-secondary[href="/ui/categories"]:has-text("Cancel")');
  await expect(cancelButton).toBeVisible();
  await cancelButton.click();

  await expect(page).toHaveURL(/\/ui\/categories$/);

  // verify not saved
  await expect(page.locator("table")).not.toContainText(tempName);
});

//test 17
test("UI_ADMIN_Category-17: should display Edit button for categories", async ({
  page,
  baseURL,
}) => {
  // Navigate to Categories page
  await page.goto(`${baseURL}/ui/categories`);
  await page.waitForLoadState("networkidle");

  // Verify table is visible
  const table = page.locator("table");
  await expect(table).toBeVisible();

  // Verify at least one Edit button is visible
  const editButton = page.locator('a[title="Edit"]').first();
  await expect(editButton).toBeVisible();
});

//test 18
test("UI_ADMIN_Category-18: should show validation error when category name is empty on edit", async ({
  page,
  baseURL,
}) => {
  // 1) CREATE CATEGORY
  await page.goto(`${baseURL}/ui/categories/add`);
  await page.waitForLoadState("networkidle");

  const createdName = `EDITtest`; // 
  await page.locator('input[name="name"]').fill(createdName);
  await page.locator('button:has-text("Save")').click();

  await expect(page).toHaveURL(/\/ui\/categories$/);
  await expect(page.locator(".alert-success")).toContainText(
    "Category created successfully"
  );

  // 2) FIND CREATED ROW (handle duplicates safely)
  const createdRows = page.locator("table tbody tr", { hasText: createdName });
  await expect(createdRows.first()).toBeVisible();
  const createdRow = createdRows.last();

  // 3) OPEN EDIT PAGE
  await createdRow.locator('a[title="Edit"]').click();
  await expect(page).toHaveURL(/\/ui\/categories\/edit\/\d+/);

  // 4) CLEAR NAME properly (trigger validation)
  const nameInput = page.locator('input[name="name"]');
  await nameInput.click();
  await nameInput.press("Control+A");
  await nameInput.press("Backspace");
  await nameInput.blur();

  // 5) SAVE
  await page.locator('button:has-text("Save")').click();

  // 6) ASSERT VALIDATION
  await expect(page.getByText("Category name is required")).toBeVisible();

  // 7) STILL ON EDIT PAGE
  await expect(page).toHaveURL(/\/ui\/categories\/edit\/\d+/);
});

//test 19
test("UI_ADMIN_Category-19: should edit category name and keep parent category default", async ({
  page,
  baseURL,
}) => {

  // 1) CREATE CATEGORY
  await page.goto(`${baseURL}/ui/categories/add`);
  await page.waitForLoadState("networkidle");

  const createdName = "EDITPass";
  await page.locator('input[name="name"]').fill(createdName);
  await page.locator('button:has-text("Save")').click();

  await expect(page).toHaveURL(/\/ui\/categories$/);
  await expect(page.locator(".alert-success"))
    .toContainText("Category created successfully");

  // 2) FIND CREATED ROW
  const createdRows = page.locator("table tbody tr", { hasText: createdName });
  await expect(createdRows.first()).toBeVisible();
  const createdRow = createdRows.last();

  // ✅ Save parent before edit
  const parentBefore = await createdRow.locator("td").nth(2).innerText();

  // 3) OPEN EDIT PAGE
  await createdRow.locator('a[title="Edit"]').click();
  await expect(page).toHaveURL(/\/ui\/categories\/edit\/\d+/);

  // 4) EDIT NAME ONLY
  const updatedName = "EditedName";
  const nameInput = page.locator('input[name="name"]');

  await nameInput.click();
  await nameInput.press("Control+A");
  await nameInput.type(updatedName);

  // 5) SAVE
  await page.locator('button:has-text("Save")').click();

  // 6) VERIFY REDIRECT
  await expect(page).toHaveURL(/\/ui\/categories$/);

  // 7) VERIFY SUCCESS MESSAGE
  await expect(page.locator(".alert-success"))
    .toContainText("Category updated successfully");

  // 8) VERIFY UPDATED DATA
  const updatedRows = page.locator("table tbody tr", { hasText: updatedName });
  await expect(updatedRows.first()).toBeVisible();
  const updatedRow = updatedRows.last();

  const parentAfter = await updatedRow.locator("td").nth(2).innerText();
  expect(parentAfter.trim()).toBe(parentBefore.trim());
});

//test 20
test("UI_ADMIN_Category-20: should show length validation when editing category name < 3 chars", async ({
  page,
  baseURL,
}) => {
  // 1) CREATE CATEGORY
  await page.goto(`${baseURL}/ui/categories/add`);
  await page.waitForLoadState("networkidle");

  const createdName = `EDITtest1`; // 
  await page.locator('input[name="name"]').fill(createdName);
  await page.locator('button:has-text("Save")').click();

  await expect(page).toHaveURL(/\/ui\/categories$/);
  await expect(page.locator(".alert-success")).toContainText(
    "Category created successfully"
  );

  // 2) FIND CREATED ROW (handle duplicates safely)
  const createdRows = page.locator("table tbody tr", { hasText: createdName });
  await expect(createdRows.first()).toBeVisible();
  const createdRow = createdRows.last();

  // 3) OPEN EDIT PAGE
  await createdRow.locator('a[title="Edit"]').click();
  await expect(page).toHaveURL(/\/ui\/categories\/edit\/\d+/);

  // 4) EDIT NAME ONLY
  const updatedName = "ab";
  const nameInput = page.locator('input[name="name"]');

  await nameInput.click();
  await nameInput.press("Control+A");
  await nameInput.type(updatedName);

  // 5) SAVE
  await page.locator('button:has-text("Save")').click();

  // 6) ASSERT VALIDATION
  await expect(page.getByText("Category name must be between 3 and 10 characters")).toBeVisible();

  // 7) STILL ON EDIT PAGE
  await expect(page).toHaveURL(/\/ui\/categories\/edit\/\d+/);
});

//test 21

//test 22
test("UI_ADMIN_Category-22: should discard changes when clicking Cancel on Edit Category", async ({ page, baseURL }) => {
  // ---------- 1) CREATE CATEGORY (precondition) ----------
  await page.goto(`${baseURL}/ui/categories/add`);
  await page.waitForLoadState("networkidle");

  const originalName = `CANCEL`;
  await page.locator('input[name="name"]').fill(originalName);
  await page.locator('button:has-text("Save")').click();

  await expect(page).toHaveURL(/\/ui\/categories$/);
  await expect(page.locator(".alert-success")).toContainText(
    "Category created successfully"
  );

  // ---------- 2) OPEN EDIT PAGE ----------
  const createdRows = page.locator("table tbody tr", { hasText: originalName });
  await expect(createdRows.first()).toBeVisible();
  const createdRow = createdRows.last();

  await createdRow.locator('a[title="Edit"]').click();
  await expect(page).toHaveURL(/\/ui\/categories\/edit\/\d+/);

  // ---------- 3) TYPE NEW TEXT (but do NOT save) ----------
  const newName = `CheckCancel`;

  const nameInput = page.locator('input[name="name"]');
  await nameInput.click();
  await nameInput.press("Control+A");
  await nameInput.type(newName);

  // ---------- 4) CLICK CANCEL ----------
  // On edit page, Cancel is an <a> link, so use role/name
  const cancelBtn = page.getByRole("link", { name: "Cancel" });
  await expect(cancelBtn).toBeVisible();
  await cancelBtn.click();

  // ---------- 5) VERIFY NAVIGATED BACK ----------
  await expect(page).toHaveURL(/\/ui\/categories$/);

  // ---------- 6) VERIFY CHANGES NOT SAVED ----------
  // Old name should still exist
  await expect(page.locator("table")).toContainText(originalName);

  // New name should NOT exist
  await expect(page.locator("table")).not.toContainText(newName);
});

//test 23
test("UI_ADMIN_Category-23: should show confirm dialog and delete category on OK", async ({ page, baseURL }) => {
  // ---------- 1) CREATE A CATEGORY TO DELETE ----------
  await page.goto(`${baseURL}/ui/categories/add`);
  await page.waitForLoadState("networkidle");

  const nameToDelete = `DEL-Test`;
  await page.locator('input[name="name"]').fill(nameToDelete);
  await page.getByRole("button", { name: "Save" }).click();

  // Back to categories page
  await expect(page).toHaveURL(/\/ui\/categories$/);
  await expect(page.locator(".alert-success")).toContainText(/created successfully/i);

  // Find the row (exact match on Name column)
  const row = page.locator("table tbody tr", {
    has: page.locator("td:nth-child(2)", { hasText: nameToDelete }),
  });
  await expect(row).toBeVisible();

  // ---------- 2) SETUP CONFIRM DIALOG HANDLER (CLICK OK) ----------
  page.once("dialog", async (dialog) => {
    // Optional: verify confirmation message
    expect(dialog.message().toLowerCase()).toContain("delete");
    await dialog.accept(); // ✅ click OK
  });

  // ---------- 3) CLICK DELETE ICON IN THAT ROW ----------
  // Delete is a <button> inside a <form action="/ui/categories/delete/{id}">
  await row.locator('form[action*="/ui/categories/delete/"] button').click();

  // ---------- 4) VERIFY SUCCESS + ROW REMOVED ----------
  await expect(page.locator(".alert-success")).toContainText(/deleted successfully/i);

  await expect(
    page.locator("table tbody tr", {
      has: page.locator("td:nth-child(2)", { hasText: nameToDelete }),
    })
  ).toHaveCount(0);
});

