import test, { expect } from "@playwright/test";

test("Verify dashboard content and active tab highlight", async ({ page, baseURL }) => {
  // Go to dashboard page
  await page.goto(`${baseURL}/ui/dashboard`);

  // Verify header is visible
  await expect(page.locator(".container-fluid h3")).toContainText("Dashboard");

  // Locate the Dashboard tab and Logo
  const dashboardTab = page.locator('a[href="/ui/dashboard"]');
  const logo = page.locator(".sidebar-logo img");

  // Locators for the cards by their headings
  const categoriesCard = page.locator('h6:has-text("Categories")');
  const plantsCard = page.locator('h6:has-text("Plants")');
  const salesCard = page.locator('h6:has-text("Sales")');

  // Check if the Dashboard tab, logo are visible and dashboard tab has the 'active' class
  await expect(logo).toBeVisible();
  await expect(dashboardTab).toBeVisible();
  await expect(dashboardTab).toHaveClass(/active/);

  // Check if each card is visible
  await expect(categoriesCard).toBeVisible();
  await expect(plantsCard).toBeVisible();
  await expect(salesCard).toBeVisible();
});

test("Verify visibility of summery data", async ({ page, baseURL }) => {
  // Go to dashboard page
  await page.goto(`${baseURL}/ui/dashboard`);

  const cards = ["Categories", "Plants", "Sales"];

  for (const name of cards) {
    const card = page
      .locator(`h6:has-text("${name}")`)
      .locator("..")
      .locator("..");

    // Locator for getting numbers
    const numbers = card.locator("div.fw-bold");

    // Check all numbers are non-empty
    const count = await numbers.count();
    for (let i = 0; i < count; i++) {
      const text = await numbers.nth(i).textContent();
      expect(text.trim()).not.toBe("");
    }

    // Check button is visible
    await expect(card.locator("a.btn")).toBeVisible();
  }
});

test("Navigation via Manage Categories button", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/ui/dashboard`);

  // Locator for the manage categories button
  const manageCategories = page.locator('a:has-text("Manage Categories")');
  await manageCategories.click();

  // Waits for loading the page
  await expect(page).toHaveURL(/\/ui\/categories/);

  // Ensure admin is on the categories page
  const categoriesHeading = page.locator('h3:has-text("Categories")');
  await expect(categoriesHeading).toBeVisible();
});

test("Navigation via Manage Plants button", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/ui/dashboard`);

  // Locator for the manage categories button
  const managePlants = page.locator('a:has-text("Manage Plants")');
  await managePlants.click();

  // Waits for loading the page
  await expect(page).toHaveURL(/\/ui\/plants/);

  // Ensure admin is on the categories page
  const plantsHeading = page.locator('h3:has-text("Plants")');
  await expect(plantsHeading).toBeVisible();
});

test("Navigation via View Sales button", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/ui/dashboard`);

  // Locator for the manage categories button
  const viewSales = page.locator('a:has-text("View Sales")');
  await viewSales.click();

  // Waits for loading the page
  await expect(page).toHaveURL(/\/ui\/sales/);

  // Ensure admin is on the categories page
  const salesHeading = page.locator('h3:has-text("Sales")');
  await expect(salesHeading).toBeVisible();
});

test("Verify categories sidebar navigation and highlights active tab", async ({ page, baseURL }) => {
   await page.goto(`${baseURL}/ui/dashboard`);

   // Locate the Dashboard tab and Logo
  const categoriesTab = page.locator('a.nav-link[href="/ui/categories"]:has-text("Categories")');
  await categoriesTab.click();

  // Waits for loading the page
  await expect(page).toHaveURL(/\/ui\/categories/);

  // Re-locate AFTER page loads
  const activeCategoriesTab = page.locator('a[href="/ui/categories"]');

  // Verify categories tab is active
  await expect(activeCategoriesTab).toHaveClass(/active/);

});

test("Verify plants sidebar navigation and highlights active tab", async ({ page, baseURL }) => {
   await page.goto(`${baseURL}/ui/dashboard`);

   // Locate the Dashboard tab and Logo
  const plantsTab = page.locator('a.nav-link[href="/ui/plants"]:has-text("Plants")');
  await plantsTab.click();

  // Waits for loading the page
  await expect(page).toHaveURL(/\/ui\/plants/);

  // Re-locate AFTER page loads
  const activePlantsTab = page.locator('a[href="/ui/plants"]');

  // Verify categories tab is active
  await expect(activePlantsTab).toHaveClass(/active/);

});

test("Verify sales sidebar navigation and highlights active tab", async ({ page, baseURL }) => {
   await page.goto(`${baseURL}/ui/dashboard`);

   // Locate the Dashboard tab and Logo
  const salesTab = page.locator('a.nav-link[href="/ui/sales"]:has-text("Sales")');
  await salesTab.click();

  // Waits for loading the page
  await expect(page).toHaveURL(/\/ui\/sales/);

  // Re-locate AFTER page loads
  const activeSalesTab = page.locator('a[href="/ui/sales"]');

  // Verify categories tab is active
  await expect(activeSalesTab).toHaveClass(/active/);

});