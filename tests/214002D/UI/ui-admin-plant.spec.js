// @ts-check
import { test, expect } from "@playwright/test";

test.describe.serial("UI_ADMIN_Plant — Admin Plant Module", () => {
  const categoryId = "2"; // change if needed
  const price = "250";
  const quantityLow = "2";
  const quantityNormal = "10";

  const timestamp = Date.now();
  const plantNameNormal = `Test Tulip ${timestamp}`;

  const uniqueId = Math.floor(Math.random() * 1000); // max 4 chars
  const plantNameLow = `RoseLow${uniqueId}`; // always < 25 chars

  /**
   * Reusable function to fill Add/Edit Plant form
   * (also clears fields first to avoid flaky behavior)
   */
  /**
   * @typedef {import('@playwright/test').Page} Page
   */

  /**
   * Plant form data for filling the form.
   * @typedef {Object} PlantFormData
   * @property {string|null} name
   * @property {string|null} category
   * @property {string|null} price
   * @property {string|null} quantity
   */

  /**
   * Fills the Add/Edit Plant form fields.
   * @param {Page} page
   * @param {PlantFormData['name']} name
   * @param {PlantFormData['category']} category
   * @param {PlantFormData['price']} price
   * @param {PlantFormData['quantity']} quantity
   */
  const fillPlantForm = async (page, name, category, price, quantity) => {
    if (name !== null) {
      await page.locator("#name").fill("");
      await page.locator("#name").fill(name);
    }

    if (category !== null && category !== "") {
      await page.locator("#categoryId").selectOption(category);
    }

    if (price !== null) {
      await page.locator("#price").fill("");
      await page.locator("#price").fill(price);
    }

    if (quantity !== null) {
      await page.locator("#quantity").fill("");
      await page.locator("#quantity").fill(quantity);
    }
  };

  // Helper: get validation message under a field
  /**
   * Returns the locator for the validation message under a field.
   * @param {import('@playwright/test').Page} page
   * @param {string} selector
   * @returns {import('@playwright/test').Locator}
   */
  const fieldError = (
    /** @type {import('@playwright/test').Page} */ page,
    /** @type {string} */ selector,
  ) => page.locator(`${selector} + div, ${selector} ~ div`);

  /* ======================================================
     UI_ADMIN_Plant-02 — Navigate to Add Plant Page
  ====================================================== */
  test("UI_ADMIN_Plant-02: Navigate to Add Plant page", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants`);
    await page.getByRole("link", { name: /add a plant/i }).click();
    await expect(page.locator("form")).toBeVisible({ timeout: 5000 });
  });

  /* ======================================================
     UI_ADMIN_Plant-03 — Plant Name Required
  ====================================================== */
  test("UI_ADMIN_Plant-03: Validate Plant Name is required", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    await fillPlantForm(page, "", categoryId, price, quantityNormal);
    await page.locator("#price").click(); // trigger validation
    await page.getByRole("button", { name: /save/i }).click();

    await page.waitForTimeout(500);

    await expect(fieldError(page, "#name")).toContainText(
      /Plant name is required/i,
    );
  });

  /* ======================================================
     UI_ADMIN_Plant-04 — Plant Name Length Validation (FIXED)
  ====================================================== */
  test("UI_ADMIN_Plant-04: Validate Plant Name length", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    // Case 1: Less than 3 characters
    await fillPlantForm(page, "AB", categoryId, price, quantityNormal);
    await page.locator("#price").click(); // trigger validation
    await page.getByRole("button", { name: /save/i }).click();

    await expect(fieldError(page, "#name")).toContainText(/Plant name must/i);

    // Case 2: More than 25 characters
    await fillPlantForm(
      page,
      "AB" + "C".repeat(24),
      categoryId,
      price,
      quantityNormal,
    );
    await page.locator("#price").click();
    await page.getByRole("button", { name: /save/i }).click();

    await page.waitForTimeout(500);

    await expect(fieldError(page, "#name")).toContainText(/Plant name must/i);
  });

  /* ======================================================
     UI_ADMIN_Plant-05 — Category Required
  ====================================================== */
  test("UI_ADMIN_Plant-05: Validate Category is required", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    await fillPlantForm(page, plantNameNormal, "", price, quantityNormal);
    await page.getByRole("button", { name: /save/i }).click();

    await page.waitForTimeout(500);

    await expect(fieldError(page, "#categoryId")).toContainText(
      /Category is required/i,
    );
  });

  /* ======================================================
     UI_ADMIN_Plant-06 — Price Required
  ====================================================== */
  test("UI_ADMIN_Plant-06: Validate Price is required", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    await fillPlantForm(page, plantNameNormal, categoryId, "", quantityNormal);
    await page.getByRole("button", { name: /save/i }).click();

    await page.waitForTimeout(500);

    await expect(fieldError(page, "#price")).toContainText(
      /Price is required/i,
    );
  });

  /* ======================================================
     UI_ADMIN_Plant-07 — Price <= 0 Validation
  ====================================================== */
  test("UI_ADMIN_Plant-07: Validate Price cannot be 0 or negative", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    await fillPlantForm(
      page,
      plantNameNormal,
      categoryId,
      "-10",
      quantityNormal,
    );
    await page.getByRole("button", { name: /save/i }).click();

    await page.waitForTimeout(500);

    await expect(fieldError(page, "#price")).toContainText(
      /Price must be greater than 0/i,
    );
  });

  /* ======================================================
     UI_ADMIN_Plant-08 — Quantity Required
  ====================================================== */
  test("UI_ADMIN_Plant-08: Validate Quantity is required", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    await fillPlantForm(page, plantNameNormal, categoryId, price, "");
    await page.getByRole("button", { name: /save/i }).click();

    await page.waitForTimeout(500);

    await expect(fieldError(page, "#quantity")).toContainText(
      /Quantity is required/i,
    );
  });

  /* ======================================================
     UI_ADMIN_Plant-09 — Quantity <= 0 Validation
  ====================================================== */
  test("UI_ADMIN_Plant-09: Validate Quantity cannot be 0 or negative", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    await fillPlantForm(page, plantNameNormal, categoryId, price, "-5");
    await page.getByRole("button", { name: /save/i }).click();

    await page.waitForTimeout(500);

    await expect(fieldError(page, "#quantity")).toContainText(
      /Quantity cannot be negative/i,
    );
  });

  /* ======================================================
     UI_ADMIN_Plant-10 + 01 — Create Plant + Verify LOW Badge
  ====================================================== */
  test("UI_ADMIN_Plant-10 & 01: Create plant and verify LOW badge", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants/add`);
    await expect(page.locator("form")).toBeVisible({ timeout: 5000 });

    await fillPlantForm(page, plantNameLow, categoryId, price, quantityLow);

    await Promise.all([
      page.waitForURL(`${baseURL}/ui/plants`, { timeout: 15000 }),
      page.getByRole("button", { name: /save/i }).click(),
    ]);

    const alert = page.locator(
      "div.alert.alert-success.alert-dismissible.fade.show",
    );

    await expect(alert).toBeVisible({ timeout: 5000 });
    await expect(alert.locator("span")).toHaveText("Plant added successfully");

    const row = page.locator("tr", { hasText: plantNameLow });
    await expect(row).toBeVisible({ timeout: 5000 });

    const stockCell = row.locator("td").nth(3);
    await expect(stockCell.locator(".text-danger")).toHaveText(quantityLow);

    const lowBadge = stockCell.locator("span.badge.bg-danger");
    await expect(lowBadge).toBeVisible();
    await expect(lowBadge).toHaveText("Low");

    const editButton = row.locator("a[title='Edit']");
    await expect(editButton).toBeVisible();
  });

  /* ======================================================
     UI_ADMIN_Plant-11 — Cancel on Add Plant
  ====================================================== */
  test("UI_ADMIN_Plant-11: Cancel button on Add Plant", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    await fillPlantForm(
      page,
      plantNameNormal,
      categoryId,
      price,
      quantityNormal,
    );

    await page.getByRole("link", { name: /cancel/i }).click();
    await expect(page).toHaveURL(/\/ui\/plants$/);
  });

  /* ======================================================
     UI_ADMIN_Plant-12 — Verify Edit Button Visible
  ====================================================== */
  test("UI_ADMIN_Plant-12: Verify Edit button visible", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants`);

    const row = page.locator("tr", { hasText: plantNameLow });
    const editButton = row.locator("a[title='Edit']");

    await expect(editButton).toBeVisible();
  });

  /* ======================================================
     UI_ADMIN_Plant-21 — Delete Plant   { Need to fix this }
  ====================================================== */
  test("UI_ADMIN_Plant-21: Delete plant with confirmation", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants`);

    const row = page.locator("tr", { hasText: plantNameLow });
    await expect(row).toBeVisible();

    await row.locator("a[title='Delete']").click();

    const confirmDialog = page.locator("div.modal-dialog");
    await expect(confirmDialog).toBeVisible();

    await confirmDialog.getByRole("button", { name: /confirm/i }).click();

    await expect(page.locator("tr", { hasText: plantNameLow })).toHaveCount(0);
  });
});
