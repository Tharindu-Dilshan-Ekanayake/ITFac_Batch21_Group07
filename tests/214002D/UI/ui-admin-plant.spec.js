const { test, expect } = require("@playwright/test");

test.describe.serial("UI_ADMIN_Plant — Admin Plant Module", () => {
  const categoryId = "2";
  const price = "250";
  const quantityLow = "2";
  const quantityNormal = "10";

  const timestamp = Date.now();
  const plantNameNormal = `Test Tulip ${timestamp}`;

  const uniqueId = Math.floor(Math.random() * 1000);
  const plantNameLow = `RoseLow${uniqueId}`;


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

  const fieldError = (page, selector) =>
    page.locator(`${selector} + div, ${selector} ~ div`);



  test("UI_ADMIN_Plant-01: Navigate to Add Plant page", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/plants`);
    await page.getByRole("link", { name: /add a plant/i }).click();
    await expect(page.locator("form")).toBeVisible();
  });

  test("UI_ADMIN_Plant-02: Validate Plant Name is required", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    await fillPlantForm(page, "", categoryId, price, quantityNormal);
    await page.getByRole("button", { name: /save/i }).click();

    await expect(fieldError(page, "#name"))
      .toContainText(/Plant name is required/i);
  });

  test("UI_ADMIN_Plant-03: Validate Plant Name length", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    await fillPlantForm(page, "AB", categoryId, price, quantityNormal);
    await page.getByRole("button", { name: /save/i }).click();

    await expect(fieldError(page, "#name"))
      .toContainText(/Plant name must/i);

    await fillPlantForm(
      page,
      "AB" + "C".repeat(24),
      categoryId,
      price,
      quantityNormal
    );
    await page.getByRole("button", { name: /save/i }).click();

    await expect(fieldError(page, "#name"))
      .toContainText(/Plant name must/i);
  });

  test("UI_ADMIN_Plant-04: Validate Category is required", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    await fillPlantForm(page, plantNameNormal, "", price, quantityNormal);
    await page.getByRole("button", { name: /save/i }).click();

    await expect(fieldError(page, "#categoryId"))
      .toContainText(/Category is required/i);
  });

  test("UI_ADMIN_Plant-05: Validate Price is required", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    await fillPlantForm(page, plantNameNormal, categoryId, "", quantityNormal);
    await page.getByRole("button", { name: /save/i }).click();

    await expect(fieldError(page, "#price"))
      .toContainText(/Price is required/i);
  });

  test("UI_ADMIN_Plant-06: Validate Price cannot be 0 or negative", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    await fillPlantForm(page, plantNameNormal, categoryId, "-10", quantityNormal);
    await page.getByRole("button", { name: /save/i }).click();

    await expect(fieldError(page, "#price"))
      .toContainText(/Price must be greater than 0/i);
  });

  test("UI_ADMIN_Plant-07: Validate Quantity is required", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    await fillPlantForm(page, plantNameNormal, categoryId, price, "");
    await page.getByRole("button", { name: /save/i }).click();

    await expect(fieldError(page, "#quantity"))
      .toContainText(/Quantity is required/i);
  });

  test("UI_ADMIN_Plant-08: Validate Quantity cannot be negative", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    await fillPlantForm(page, plantNameNormal, categoryId, price, "-5");
    await page.getByRole("button", { name: /save/i }).click();

    await expect(fieldError(page, "#quantity"))
      .toContainText(/Quantity cannot be negative/i);
  });

  test("UI_ADMIN_Plant-10: Create plant and verify LOW badge", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    await fillPlantForm(page, plantNameLow, categoryId, price, quantityLow);

    await Promise.all([
      page.waitForURL(`${baseURL}/ui/plants`),
      page.getByRole("button", { name: /save/i }).click()
    ]);

    const row = page.locator("tr", { hasText: plantNameLow });
    await expect(row).toBeVisible();

    const stockCell = row.locator("td").nth(3);
    await expect(stockCell).toContainText(quantityLow);

    await expect(stockCell.locator(".badge.bg-danger"))
      .toHaveText("Low");
  });

  test("UI_ADMIN_Plant-11: Cancel button on Add Plant", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    await fillPlantForm(page, plantNameNormal, categoryId, price, quantityNormal);
    await page.getByRole("link", { name: /cancel/i }).click();

    await expect(page).toHaveURL(/\/ui\/plants$/);
  });

  test("UI_ADMIN_Plant-12: Verify Edit button and edit page", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/plants`);

    const row = page.locator("tr", { hasText: plantNameLow });
    await row.locator('a[title="Edit"]').click();

    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator("#name")).toHaveValue(plantNameLow);
  });

  test("UI_ADMIN_Plant-13: Edit plant and save changes", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/plants`);

    const row = page.locator("tr", { hasText: plantNameLow });
    await row.locator('a[title="Edit"]').click();

    await page.locator("#quantity").fill("8");

    await Promise.all([
      page.waitForURL(`${baseURL}/ui/plants`),
      page.getByRole("button", { name: /save/i }).click()
    ]);

    await expect(page.locator("tr", { hasText: plantNameLow }))
      .toContainText("8");
  });

  test("UI_ADMIN_Plant-14: Delete plant with confirmation", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/plants`);

    const row = page.locator("tr", { hasText: plantNameLow });

    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });

    await row.locator('button[title="Delete"]').click();

    await expect(page.locator("tr", { hasText: plantNameLow }))
      .toHaveCount(0);
  });
});
