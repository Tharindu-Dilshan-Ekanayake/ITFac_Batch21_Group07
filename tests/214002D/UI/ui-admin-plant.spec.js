import { test, expect } from "@playwright/test";
import {
  price,
  quantityLow,
  quantityNormal,
  generatePlantNames,
} from "../data/plant.data.js";

test.describe.serial("UI_ADMIN_Plant — Admin Plant Module", () => {
  const {
    plantNameNormal,
    plantNameLow,
    plantUpdateName,
    plantDeleteName,
    CategoryCreateName1,
    CategoryCreateName2,
  } = generatePlantNames();

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

  let categoryId;

  const fieldError = (page, selector) =>
    page.locator(`${selector} + div, ${selector} ~ div`);

  test("UI_ADMIN_Plant-01: Navigate to Add Plant page", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants`);
    await page.getByRole("link", { name: /add a plant/i }).click();
    await expect(page.locator("form")).toBeVisible({ timeout: 5000 });
  });

  test("Category Setup: Create categories for plant tests", async ({
    page,
    baseURL,
  }) => {
    const parentCreateName1 = CategoryCreateName1;
    const parentCreateName2 = CategoryCreateName2;

    await page.goto(`${baseURL}/ui/categories`);

    await page.locator('a[href="/ui/categories/add"]').click();
    await expect(page).toHaveTitle("QA Training App | Add A Category");

    await page.locator('input[name="name"]').fill(parentCreateName1);
    await page.getByRole("button", { name: /save/i }).click();

    await expect(page).toHaveURL(/\/ui\/categories$/);

    await page.locator('a[href="/ui/categories/add"]').click();
    await expect(page).toHaveTitle("QA Training App | Add A Category");

    await page.locator('input[name="name"]').fill(parentCreateName2);
    await page.getByRole("button", { name: /save/i }).click();

    await expect(page).toHaveURL(/\/ui\/categories$/);

    const table = page.locator("table");
    await expect(table).toBeVisible();

    const firstRow = page.locator("tbody tr").nth(0);
    const secondRow = page.locator("tbody tr").nth(1);

    const firstCategoryId = (
      await firstRow.locator("td").nth(0).textContent()
    ).trim();

    const secondCategoryId = (
      await secondRow.locator("td").nth(0).textContent()
    ).trim();

    console.log("First Category ID:", firstCategoryId);
    console.log("Second Category ID:", secondCategoryId);

    categoryId = secondCategoryId;

    const editSecondCategory = secondRow.locator('a[title="Edit"]');
    await expect(editSecondCategory).toBeVisible();
    await editSecondCategory.click();

    await page.locator("#parentId").selectOption({ value: firstCategoryId });

    await page.getByRole("button", { name: /save/i }).click();

    await expect(page).toHaveURL(/\/ui\/categories$/);

    console.log(
      `Updated SECOND Category (${secondCategoryId}) parent to FIRST Category (${firstCategoryId})`,
    );
  });

  test("UI_ADMIN_Plant-02: Validate Plant Name is required", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants/add`);
    await fillPlantForm(page, "", categoryId, price, quantityNormal);
    await page.locator("#price").click();

    await page.getByRole("button", { name: /save/i }).click();

    const nameError = fieldError(page, "#name");
    await expect(nameError).toBeVisible();
    await expect(nameError).toContainText(/plant name is required/i);
  });

  test("UI_ADMIN_Plant-03: Validate Plant Name length", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    await fillPlantForm(page, "AB", categoryId, price, quantityNormal);
    await page.locator("#price").click();
    await page.getByRole("button", { name: /save/i }).click();

    await expect(fieldError(page, "#name")).toContainText(/Plant name must/i);

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

  test("UI_ADMIN_Plant-04: Validate Category is required", async ({
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

  test("UI_ADMIN_Plant-05: Validate Price is required", async ({
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

  test("UI_ADMIN_Plant-06: Validate Price cannot be 0 or negative", async ({
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

  test("UI_ADMIN_Plant-07: Validate Quantity is required", async ({
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

  test("UI_ADMIN_Plant-08: Validate Quantity cannot be 0 or negative", async ({
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

  test("UI_ADMIN_Plant-10: Create plant and verify LOW badge", async ({
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
  });

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

  test("UI_ADMIN_Plant-12: Create plant then update it", async ({
    page,
    baseURL,
  }) => {
    const updatePlantName = plantUpdateName;

    await page.goto(`${baseURL}/ui/plants/add`);
    await expect(page.locator("form")).toBeVisible({ timeout: 5000 });

    await fillPlantForm(page, updatePlantName, categoryId, price, quantityLow);

    await Promise.all([
      page.waitForURL(`${baseURL}/ui/plants`, { timeout: 15000 }),
      page.getByRole("button", { name: /save/i }).click(),
    ]);

    const createdRow = page.locator("tr", { hasText: updatePlantName });
    await expect(createdRow).toBeVisible({ timeout: 5000 });

    const editButton = createdRow.locator('a[title="Edit"]');
    await expect(editButton).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/ui\/plants\/edit\/\d+/, { timeout: 10000 }),
      editButton.click(),
    ]);

    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator("#name")).toHaveValue(updatePlantName);

    await page.locator("#quantity").fill("8");

    await Promise.all([
      page.waitForURL(`${baseURL}/ui/plants`),
      page.getByRole("button", { name: /save/i }).click(),
    ]);

    const updatedRow = page.locator("tr", { hasText: updatePlantName });
    const stockCell = updatedRow.locator("td").nth(3);

    await expect(stockCell).toContainText("8");
  });

  test("UI_ADMIN_Plant-13: Create plant then delete it", async ({
    page,
    baseURL,
  }) => {
    const deletePlantName = plantDeleteName;

    await page.goto(`${baseURL}/ui/plants/add`);
    await expect(page.locator("form")).toBeVisible({ timeout: 5000 });

    await fillPlantForm(
      page,
      deletePlantName,
      categoryId,
      price,
      quantityNormal,
    );

    await Promise.all([
      page.waitForURL(`${baseURL}/ui/plants`, { timeout: 15000 }),
      page.getByRole("button", { name: /save/i }).click(),
    ]);

    const row = page.locator("tr", { hasText: deletePlantName });
    await expect(row).toBeVisible({ timeout: 5000 });
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      expect(dialog.message()).toContain("Delete this plant?");
      await dialog.accept();
    });

    await row.locator('button[title="Delete"]').click();
    await expect(page.locator("tr", { hasText: deletePlantName })).toHaveCount(
      0,
    );

    const alert = page.locator(".alert.alert-success");
    await expect(alert).toBeVisible({ timeout: 10000 });
    await expect(alert.locator("span")).toHaveText(
      "Plant deleted successfully",
    );
  });
});
