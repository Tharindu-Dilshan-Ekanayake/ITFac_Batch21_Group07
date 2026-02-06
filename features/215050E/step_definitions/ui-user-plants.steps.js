import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

/* ======================================================
   Helper: Ensure normal user is logged in
====================================================== */
async function ensureUserLoggedIn(page) {
  await page.goto(`${BASE_URL}/ui/login`);

  await page.locator('[name="username"]').fill(
    process.env.USER_USERNAME || "testuser"
  );
  await page.locator('[name="password"]').fill(
    process.env.USER_PASSWORD || "test123"
  );
  await page.locator('[type="submit"]').click();

  await page.waitForURL(`${BASE_URL}/ui/dashboard`, { timeout: 30000 });

  await page.goto(`${BASE_URL}/ui/plants`);
  await page.waitForLoadState("networkidle");
}

/* ======================================================
   Helper: Check if array is sorted (allows equal values)
====================================================== */
function isSorted(arr, compareFn) {
  for (let i = 1; i < arr.length; i++) {
    if (compareFn(arr[i - 1], arr[i]) > 0) {
      return false;
    }
  }
  return true;
}

/* ======================================================
   GIVEN
====================================================== */
Given("the user is on the plants page", async function () {
  await ensureUserLoggedIn(this.page);
});

/* ======================================================
   SEARCH
====================================================== */
When("the user searches for a plant with name {string}", async function (plantName) {
  const searchInput = this.page.getByPlaceholder(/search/i);
  await searchInput.waitFor({ state: "visible" });
  await searchInput.fill(plantName);

  const searchButton = this.page.getByRole("button", { name: /search/i });
  await searchButton.click();
  
  await this.page.waitForTimeout(1000);
});

Then("plants matching {string} should be shown", async function (plantName) {
  const rows = this.page.locator("table tbody tr");
  await expect(rows.first()).toBeVisible();

  const count = await rows.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const text = await rows.nth(i).textContent();
    expect(text.toLowerCase()).toContain(plantName.toLowerCase());
  }
});

Then("no plants should be found", async function () {
  const noDataMsg = this.page.locator("text=No plants found");
  await expect(noDataMsg).toBeVisible();
});

/* ======================================================
   FILTER BY CATEGORY
====================================================== */
When('the user filters by category {string}', async function (category) {
  const categoryDropdown = this.page.locator('select');
  await categoryDropdown.waitFor({ state: 'visible' });
  await categoryDropdown.selectOption({ label: category });
  
  const searchButton = this.page.locator('button:has-text("Search")');
  await searchButton.click();
  
  await this.page.waitForTimeout(1000);
});

Then("plants in category {string} should be shown", async function (category) {
  const rows = this.page.locator("table tbody tr");
  await expect(rows.first()).toBeVisible();

  const count = await rows.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const text = await rows.nth(i).textContent();
    expect(text.toLowerCase()).toContain(category.toLowerCase());
  }
});

/* ======================================================
   SORT BY NAME
====================================================== */
When("the user sorts plants by Name", async function () {
  // Click the <a> tag inside the header (matching Playwright test)
  const nameHeaderLink = this.page.locator('th:has-text("Name") a');
  await nameHeaderLink.waitFor({ state: "visible" });
  
  // Log before clicking (for debugging)
  const beforeNames = await this.page.locator('table tbody tr td:nth-child(1)').allTextContents();
  console.log('Names BEFORE click:', beforeNames.map(n => n.trim()).filter(n => n));
  
  // Wait for network request to complete after clicking sort
  await Promise.all([
    this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {}),
    nameHeaderLink.click()
  ]);
  
  // Additional wait to ensure DOM updates
  await this.page.waitForTimeout(1000);
  
  // Log after clicking (for debugging)
  const afterNames = await this.page.locator('table tbody tr td:nth-child(1)').allTextContents();
  console.log('Names AFTER click:', afterNames.map(n => n.trim()).filter(n => n));
});

Then('plants should be sorted by Name {string}', async function (order) {
  // Wait a bit for the DOM to update after sorting
  await this.page.waitForTimeout(500);
  
  const names = (await this.page.locator('table tbody tr td:nth-child(1)').allTextContents())
    .map(n => n.trim().toLowerCase())
    .filter(n => n); // ignore empty
  
  console.log(`Names in table (${order}):`, names);
  
  // Check if this looks like it might be sorting by timestamp instead of alphabetically
  if (names.length > 0 && names[0].includes('test plant')) {
    const timestamps = names.map(n => {
      const match = n.match(/(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    });
    console.log('Extracted timestamps:', timestamps);
    
    // Check if it's sorted by timestamp
    const timestampSorted = isSorted(timestamps, (a, b) => order === 'asc' ? a - b : b - a);
    if (timestampSorted) {
      console.log('⚠️  WARNING: Data appears to be sorted by TIMESTAMP, not NAME alphabetically');
      console.log('   This suggests the backend is sorting by creation time or ID, not the name field');
    }
  }
  
  const cmp = (a, b) => order === 'asc'
    ? a.localeCompare(b)
    : b.localeCompare(a);
  
  const sorted = isSorted(names, cmp);
  
  if (!sorted) {
    console.log('❌ Expected order:', order);
    console.log('❌ Actual values:', names);
    console.log('');
    console.log('🔍 DEBUGGING TIPS:');
    console.log('1. Check if the sort is working at all (are values changing?)');
    console.log('2. Check if it might be sorting by a different field (ID, timestamp, etc.)');
    console.log('3. Verify the column header click is triggering the correct sort parameter');
    console.log('4. Check browser console for JavaScript errors');
  }
  
  expect(sorted).toBe(true);
});

Then("the Name column should show {string} arrow", async function (arrow) {
  const icon = this.page.locator(
    `th:has-text("Name") span:has-text("${arrow}")`
  );
  await expect(icon).toBeVisible();
});

/* ======================================================
   SORT BY PRICE
====================================================== */
When("the user sorts plants by Price", async function () {
  // Click the <a> tag inside the header (matching Playwright test)
  const priceHeaderLink = this.page.locator('th:has-text("Price") a');
  await priceHeaderLink.waitFor({ state: "visible" });
  
  // Wait for network request to complete after clicking sort
  await Promise.all([
    this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {}),
    priceHeaderLink.click()
  ]);
  
  // Additional wait to ensure DOM updates
  await this.page.waitForTimeout(1000);
});

Then('plants should be sorted by Price {string}', async function (order) {
  // Wait a bit for the DOM to update after sorting
  await this.page.waitForTimeout(500);
  
  const prices = (await this.page.locator('table tbody tr td:nth-child(3)').allTextContents())
    .map(p => parseFloat(p.replace(/[^\d.]/g, '')))
    .filter(p => !isNaN(p));
  
  console.log(`Prices in table (${order}):`, prices);
  
  const cmp = (a, b) => order === 'asc' ? a - b : b - a;
  const sorted = isSorted(prices, cmp);
  
  if (!sorted) {
    console.log('❌ Expected order:', order);
    console.log('❌ Actual values:', prices);
  }
  
  expect(sorted).toBe(true);
});

/* ======================================================
   SORT BY STOCK
====================================================== */
When("the user sorts plants by Stock", async function () {
  // Click the <a> tag inside the header (matching Playwright test)
  const stockHeaderLink = this.page.locator('th:has-text("Stock") a');
  await stockHeaderLink.waitFor({ state: "visible" });
  
  // Wait for network request to complete after clicking sort
  await Promise.all([
    this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {}),
    stockHeaderLink.click()
  ]);
  
  // Additional wait to ensure DOM updates
  await this.page.waitForTimeout(1000);
});

Then('plants should be sorted by Stock {string}', async function (order) {
  // Wait a bit for the DOM to update after sorting
  await this.page.waitForTimeout(500);
  
  const stock = (await this.page.locator('table tbody tr td:nth-child(4)').allTextContents())
    .map(s => parseInt(s.replace(/[^\d]/g, '')))
    .filter(s => !isNaN(s));
  
  console.log(`Stock in table (${order}):`, stock);
  
  const cmp = (a, b) => order === 'asc' ? a - b : b - a;
  const sorted = isSorted(stock, cmp);
  
  if (!sorted) {
    console.log('❌ Expected order:', order);
    console.log('❌ Actual values:', stock);
  }
  
  expect(sorted).toBe(true);
});

/* ======================================================
   LOW STOCK BADGE
====================================================== */
Then("Low badge should be shown for stock below {int}", async function (threshold) {
  const rows = this.page.locator("table tbody tr");

  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const cell = rows.nth(i).locator("td:nth-child(4)");
    const text = await cell.textContent();
    const value = parseInt(text.replace(/[^\d]/g, ""));

    const lowBadge = cell.locator("span.badge.bg-danger");

    if (value < threshold) {
      await expect(lowBadge).toBeVisible();
      await expect(lowBadge).toContainText("Low");
      console.log(`Stock ${value}: Low badge verified`);
    } else {
      await expect(lowBadge).toHaveCount(0);
      console.log(`Stock ${value}: No Low badge (correct)`);
    }
  }
});