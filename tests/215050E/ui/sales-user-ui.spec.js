import { test, expect } from '@playwright/test';

test.describe('User Sales Management', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/ui/sales');
  });

  test('UI_User_Sales-01 Verify sales page UI elements', async ({ page }) => {
    // Verify Sales header
    const salesHeader = page.locator('h1, h2, h3').filter({ hasText: /sales/i });
    await expect(salesHeader).toBeVisible();

    // Verify that users do NOT have a Sell button (only admins should)
    const sellButton = page.locator('button:has-text("Sell"), a:has-text("Sell")');
    const sellButtonCount = await sellButton.count();
    expect(sellButtonCount).toBe(0);

    // Verify table headers that USERS should see
    const plantHeader = page.locator('th:has-text("Plant")');
    await expect(plantHeader).toBeVisible();

    const quantityHeader = page.locator('th:has-text("Quantity")');
    await expect(quantityHeader).toBeVisible();

    const totalPriceHeader = page.locator('th:has-text("Total")');
    await expect(totalPriceHeader).toBeVisible();

    const soldAtHeader = page.locator('th:has-text("Sold")');
    await expect(soldAtHeader).toBeVisible();

    // Users do NOT have Actions column (only admins do)
    const actionsHeader = page.locator('th:has-text("Actions")');
    const actionsCount = await actionsHeader.count();
    expect(actionsCount).toBe(0); // Should NOT exist for users
}); // passed


  test('UI_User_Sales-02 Verify no sales data available', async ({ page }) => {
    const salesRows = page.locator('table tbody tr');
    const count = await salesRows.count();
    if (count === 0) {
      const noDataMsg = page.locator('text=No sales found');
      await expect(noDataMsg).toBeVisible();
    } else {
      test.skip(); // Skip if there is data
    }
  });

  test('UI_User_Sales-03 Paginated data visibility', async ({ page }) => {
    const salesRows = page.locator('table tbody tr');
    const count = await salesRows.count();
    expect(count).toBeGreaterThan(0);
    const pagination = page.locator('[class*="pagination"], nav[aria-label="pagination"]');
    if (count > 10) {
      await expect(pagination).toBeVisible();
      const paginationButtons = pagination.locator('button, a');
      const buttonCount = await paginationButtons.count();
      expect(buttonCount).toBeGreaterThan(0);
    } else {
      await expect(pagination).toHaveCount(0);
    }
  });//passed

  test('UI_User_Sales-04 Verify default sorting on descending sold date', async ({ page }) => {
    // Get all sold date cells
    const soldDates = page.locator('table tbody tr td:nth-child(4)');
    const count = await soldDates.count();

    const dates = [];
    for (let i = 0; i < count; i++) {
      const dateText = await soldDates.nth(i).textContent();
      dates.push(new Date(dateText.trim()));
    }

    // Verify dates are in descending order (newest first)
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
    }
  }); // passed

  test('UI_User_Sales-05 Sort plants by Plant name', async ({ page }) => {
    const plantHeaderLink = page.locator('th:has-text("Plant") a');
    await plantHeaderLink.click();
    await page.waitForTimeout(1000);
    const names1 = await page.locator('table tbody tr td:nth-child(1)').allTextContents();
    await plantHeaderLink.click();
    await page.waitForTimeout(1000);
    const names2 = await page.locator('table tbody tr td:nth-child(1)').allTextContents();
    const unique = new Set([...names1, ...names2]);
    if (unique.size > 1) {
      const isDifferent = JSON.stringify(names1) !== JSON.stringify(names2);
      expect(isDifferent).toBe(true);
      const sortedAsc = [...names1].sort((a, b) => a.trim().toLowerCase().localeCompare(b.trim().toLowerCase()));
      const sortedDesc = [...names1].sort((a, b) => b.trim().toLowerCase().localeCompare(a.trim().toLowerCase()));
      const isAscOrDesc = JSON.stringify(names1) === JSON.stringify(sortedAsc) || JSON.stringify(names1) === JSON.stringify(sortedDesc);
      expect(isAscOrDesc).toBe(true);
    } else {
      test.skip();
    }
  }); //passed



  test('UI_User_Sales-06 Sort plants by Quantity', async ({ page }) => {
    const quantityHeaderLink = page.locator('th:has-text("Quantity") a');
    await quantityHeaderLink.click();
    await page.waitForTimeout(1000);
    const quantities1Text = await page.locator('table tbody tr td:nth-child(2)').allTextContents();
    const quantities1 = quantities1Text.map(q => parseInt(q.replace(/[^\d]/g, '')));
    await quantityHeaderLink.click();
    await page.waitForTimeout(1000);
    const quantities2Text = await page.locator('table tbody tr td:nth-child(2)').allTextContents();
    const quantities2 = quantities2Text.map(q => parseInt(q.replace(/[^\d]/g, '')));
    const unique = new Set([...quantities1, ...quantities2]);
    if (unique.size > 1) {
      const isDifferent = JSON.stringify(quantities1) !== JSON.stringify(quantities2);
      expect(isDifferent).toBe(true);
      const sortedAsc = [...quantities1].sort((a, b) => a - b);
      const sortedDesc = [...quantities1].sort((a, b) => b - a);
      const isAscOrDesc = JSON.stringify(quantities1) === JSON.stringify(sortedAsc) || JSON.stringify(quantities1) === JSON.stringify(sortedDesc);
      expect(isAscOrDesc).toBe(true);
    } else {
      test.skip();
    }
  }); // passed



  test('UI_User_Sales-07 Sort plants by Total price', async ({ page }) => {
    const priceHeaderLink = page.locator('th:has-text("Total") a');
    await priceHeaderLink.click();
    await page.waitForTimeout(1000);
    const prices1Text = await page.locator('table tbody tr td:nth-child(3)').allTextContents();
    const prices1 = prices1Text.map(p => parseFloat(p.replace(/[^\d.]/g, '')));
    await priceHeaderLink.click();
    await page.waitForTimeout(1000);
    const prices2Text = await page.locator('table tbody tr td:nth-child(3)').allTextContents();
    const prices2 = prices2Text.map(p => parseFloat(p.replace(/[^\d.]/g, '')));
    const unique = new Set([...prices1, ...prices2]);
    if (unique.size > 1) {
      const isDifferent = JSON.stringify(prices1) !== JSON.stringify(prices2);
      expect(isDifferent).toBe(true);
      const sortedAsc = [...prices1].sort((a, b) => a - b);
      const sortedDesc = [...prices1].sort((a, b) => b - a);
      const isAscOrDesc = JSON.stringify(prices1) === JSON.stringify(sortedAsc) || JSON.stringify(prices1) === JSON.stringify(sortedDesc);
      expect(isAscOrDesc).toBe(true);
    } else {
      test.skip();
    }
  });  // passed



  test('UI_User_Sales-08 Sort plants by Sold date', async ({ page }) => {
    const soldAtHeaderLink = page.locator('th:has-text("Sold") a');
    await soldAtHeaderLink.click();
    await page.waitForTimeout(1000);
    const dates1Text = await page.locator('table tbody tr td:nth-child(4)').allTextContents();
    const dates1 = dates1Text.map(d => new Date(d.trim()).getTime());
    await soldAtHeaderLink.click();
    await page.waitForTimeout(1000);
    const dates2Text = await page.locator('table tbody tr td:nth-child(4)').allTextContents();
    const dates2 = dates2Text.map(d => new Date(d.trim()).getTime());
    const unique = new Set([...dates1, ...dates2]);
    if (unique.size > 1) {
      const isDifferent = JSON.stringify(dates1) !== JSON.stringify(dates2);
      expect(isDifferent).toBe(true);
      const sortedAsc = [...dates1].sort((a, b) => a - b);
      const sortedDesc = [...dates1].sort((a, b) => b - a);
      const isAscOrDesc = JSON.stringify(dates1) === JSON.stringify(sortedAsc) || JSON.stringify(dates1) === JSON.stringify(sortedDesc);
      expect(isAscOrDesc).toBe(true);
    } else {
      test.skip();
    }
  }); // passed
});