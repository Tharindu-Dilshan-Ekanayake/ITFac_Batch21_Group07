const {test} = require('@playwright/test');

test('First Playwright test', async  () =>
{
});

test.only('Second Playwright test', async  () =>
{
});


// import { test, expect } from "@playwright/test";

test("Admin can add a plant and verify Low stock badge", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/ui/plants`);

  // Click "Add A Plant"
  const addNewPlant = page.locator("a:has-text('Add A Plant')");
  await addNewPlant.click();

  // Wait for form to be visible
  const form = page.locator("form");
  await expect(form).toBeVisible();

  // Click "Cancel" to verify navigation back to plants page
  await page.getByRole("link", { name: "Cancel" }).click();
  await expect(page).toHaveURL(/\/ui\/plants$/);

  // Go back to Add Plant form again
  await page.goto(`${baseURL}/ui/plants/add`);
  await expect(page.locator("form")).toBeVisible();

  const plantName = "Test Rose Low";
  const category = "2";
  const price = "250";
  const quantity = "2";

  await page.locator("#name").fill(plantName);
  await page.locator("#categoryId").selectOption(category);
  await page.locator("#price").fill(price);
  await page.locator("#quantity").fill(quantity);

  // Click Save
  await page.getByRole("button", { name: "Save" }).click();

  // ---- VERIFY SUCCESS ALERT ----
  const alert = page.locator("div.alert-success");
  await expect(alert).toBeVisible({ timeout: 5000 });
  await expect(alert.locator("span")).toHaveText(/Plant added successfully/i);

  // ---- VERIFY REDIRECT TO PLANTS PAGE ----
  await expect(page).toHaveURL(/\/ui\/plants$/);

  // ---- VERIFY PLANT EXISTS IN TABLE ----
  const row = page.locator("tr", { hasText: plantName });
  await expect(row).toBeVisible();

  // ---- VERIFY STOCK VALUE DISPLAYED ----
  const stockCell = row.locator("td").nth(3);
  await expect(stockCell.locator(".text-danger")).toHaveText("2");

  // ---- VERIFY "LOW" BADGE DISPLAYED (UI_ADMIN_Plant-01) ----
  const lowBadge = stockCell.locator("span.badge.bg-danger");
  await expect(lowBadge).toBeVisible();
  await expect(lowBadge).toHaveText("Low");
});