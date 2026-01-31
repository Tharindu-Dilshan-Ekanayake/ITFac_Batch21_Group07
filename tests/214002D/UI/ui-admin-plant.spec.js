import { test, expect } from "@playwright/test";

test("Admin can add a plant and verify Low stock badge", async ({
  page,
  baseURL,
}) => {
  await page.goto(`${baseURL}/ui/plants`);

 
  const addNewPlant = page.locator("a:has-text('Add A Plant')");
  await addNewPlant.click();


  const form = page.locator("form");
  await expect(form).toBeVisible();

  await page.getByRole("link", { name: "Cancel" }).click();
  await expect(page).toHaveURL(/\/ui\/plants$/);

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

  await page.getByRole("button", { name: "Save" }).click();

  const alert = page.locator("div.alert-success");
  await expect(alert).toBeVisible({ timeout: 5000 });
  await expect(alert.locator("span")).toHaveText(/Plant added successfully/i);

  await expect(page).toHaveURL(/\/ui\/plants$/);
  const row = page.locator("tr", { hasText: plantName });
  await expect(row).toBeVisible();

  const stockCell = row.locator("td").nth(3);
  await expect(stockCell.locator(".text-danger")).toHaveText("2");

  const lowBadge = stockCell.locator("span.badge.bg-danger");
  await expect(lowBadge).toBeVisible();
  await expect(lowBadge).toHaveText("Low");

  const editButton = row.locator("a[title='Edit']");
  await expect(editButton).toBeVisible();
});
