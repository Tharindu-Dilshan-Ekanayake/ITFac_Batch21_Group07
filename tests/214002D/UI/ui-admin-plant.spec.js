import { test, expect } from "@playwright/test";
import {
  categoryId,
  price,
  quantityLow,
  quantityNormal,
  generatePlantNames,
} from "../data/plant.data.js";

test.describe.serial("UI_ADMIN_Plant — Admin Plant Module", () => {
  const { plantNameNormal, plantNameLow } = generatePlantNames();

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

  test("UI_ADMIN_Plant-01: Navigate to Add Plant page", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants`);
    await page.getByRole("link", { name: /add a plant/i }).click();
    await expect(page.locator("form")).toBeVisible({ timeout: 5000 });
  });

  test("UI_ADMIN_Plant-02: Validate Plant Name is required", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants/add`);

    await fillPlantForm(page, "", categoryId, price, quantityNormal);
    await page.locator("#price").click();
    await page.getByRole("button", { name: /save/i }).click();

    await page.waitForTimeout(500);

    await expect(fieldError(page, "#name")).toContainText(
      /Plant name is required/i,
    );
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

  test("UI_ADMIN_Plant-12: Verify Edit button and edit functionality", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants`);

    const row = page.locator("tr", { hasText: plantNameLow });
    await expect(row).toBeVisible({ timeout: 5000 });

    const editButton = row.locator('a[title="Edit"]');
    await expect(editButton).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/ui\/plants\/edit\/\d+/, { timeout: 10000 }),
      editButton.click(),
    ]);

    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator("#name")).toHaveValue(plantNameLow);

    const priceValue = await page.locator("#price").inputValue();
    expect(Number(priceValue)).toBe(Number(price));

    const quantityValue = await page.locator("#quantity").inputValue();
    expect(Number(quantityValue)).toBe(Number(quantityLow));
  });

  test("UI_ADMIN_Plant-13: Edit plant and save changes", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants`);

    const row = page.locator("tr", { hasText: plantNameLow });
    await row.locator('a[title="Edit"]').click();

    await expect(page.locator("form")).toBeVisible();

    await page.locator("#quantity").fill("8");

    await Promise.all([
      page.waitForURL(`${baseURL}/ui/plants`),
      page.getByRole("button", { name: /save/i }).click(),
    ]);

    const updatedRow = page.locator("tr", { hasText: plantNameLow });
    const stockCell = updatedRow.locator("td").nth(3);

    await expect(stockCell).toContainText("8");
  });

  test("UI_ADMIN_Plant-14: Delete plant with confirmation", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ui/plants`);

    const row = page.locator("tr", { hasText: plantNameLow });
    await expect(row).toBeVisible();

    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      expect(dialog.message()).toContain("Delete this plant?");
      await dialog.accept();
    });

    await row.locator('button[title="Delete"]').click();

    await expect(page.locator("tr", { hasText: plantNameLow })).toHaveCount(0);

    const alert = page.locator(".alert.alert-success");

    await expect(alert).toBeVisible({ timeout: 10000 });
    await expect(alert.locator("span")).toHaveText(
      "Plant deleted successfully",
    );
  });
});
