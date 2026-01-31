import { test, expect } from "@playwright/test";

test.only("Login to QA Training Application", async ({ page }) => {
  await page.goto("https://ekanayakeb21qa-7794b0a3d0a3.herokuapp.com/ui/login");

  const login = page.locator(".text-center.mb-4");
  await expect(login).toHaveText("Login");

  //  login to page
  await page.locator('//*[@id="loginForm"]/div[1]/input').fill("admin");
  await page.locator('//*[@id="loginForm"]/div[2]/input').fill("admin123");
  await page.locator('//*[@id="loginForm"]/button').click();
  await page.waitForLoadState("networkidle");

  const afterLogin = page.locator("xpath=/html/body/div/div/div[2]/div[1]/h2");
  await expect(afterLogin).toHaveText("🌸 QA Training Application");

  //  Navigate to Plants page
  const plantsPage = page.locator("xpath=/html/body/div/div/div[1]/a[3]");
  await plantsPage.click();
  await expect(plantsPage).toHaveText("Plants");

  // Add a new Plant
  const addNewPlant = page.locator(
    "xpath=/html/body/div[1]/div/div[2]/div[2]/form/div[3]/a[2]",
  );
  await addNewPlant.click();

  // Fill the Plant form

  const plantName = "Flowers Plant";
  const category = "gaskolan";
  const price = "250";
  const quantity = "19";

  // Fill form
  await page.locator('//*[@id="name"]').fill(plantName);
  await page.locator('//*[@id="categoryId"]').selectOption(category);
  await page.locator('//*[@id="price"]').fill(price);
  await page.locator('//*[@id="quantity"]').fill(quantity);

  // Click Add button
  await page
    .locator("xpath=/html/body/div/div/div[2]/div[2]/form/button")
    .click();

  // Locate the table row by plant name
const row = page.locator("tbody tr", {
  hasText: plantName,
});

// Stock column (4th column)
const stockCell = row.locator("td").nth(3);

// Assertions
await expect(row).toContainText(plantName);
await expect(row).toContainText(price);
await expect(stockCell).toContainText(quantity);

// Conditional Low badge check
if (Number(quantity) < 5) {
  await expect(stockCell).toContainText("Low");
  console.log(`Plant ${plantName} Quantity ${quantity} shows LOW badge`);
} else {
  await expect(stockCell).not.toContainText("Low");
  console.log(`Plant ${plantName} Quantity ${quantity} does NOT show LOW badge`);
}
});

