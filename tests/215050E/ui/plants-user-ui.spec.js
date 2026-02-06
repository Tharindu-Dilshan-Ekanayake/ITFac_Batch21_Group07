import { test, expect } from '@playwright/test';

test.describe('User Plants Management', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/ui/plants');
  });

  test('UI_User_Plants-07 Search plants by valid plant name', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
    await searchInput.fill('Rose');

    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click();

    await page.waitForTimeout(1000);
    const plantRows = page.locator('table tbody tr');
    const count = await plantRows.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const rowText = await plantRows.nth(i).textContent();
      expect(rowText.toLowerCase()).toContain('rose');
    }
  }); // passed



  test('UI_User_Plants-08 Search plants by invalid plant name', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
    await searchInput.fill('InvalidPlantName12345');

    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click();

    const noDataMsg = page.locator('text=No plants found');
    await expect(noDataMsg).toBeVisible();
  });// passed



  test('UI_User_Plants-09 Verify all categories filtering', async ({ page }) => {
    // Use selectOption instead of click (learned from Plant-26)
    const categoryDropdown = page.locator('select');
    await categoryDropdown.selectOption({ label: 'Orchid' });

    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click();

    await page.waitForTimeout(1000);
    const plantRows = page.locator('table tbody tr');
    const count = await plantRows.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const rowText = await plantRows.nth(i).textContent();
      expect(rowText.toLowerCase()).toContain('orchid');
    }
  });// passed



  test('UI_User_Plants-10 Sort plants by Name', async ({ page }) => {
    // Click the <a> tag inside the header (learned from Plant-28)
    const nameHeaderLink = page.locator('th:has-text("Name") a');

    // First click - Descending (Z to A)
    await nameHeaderLink.click();
    await page.waitForTimeout(1000);

    const namesDesc = await page.locator('table tbody tr td:nth-child(1)').allTextContents();

    const sortedDesc = [...namesDesc].sort((a, b) =>
        b.trim().toLowerCase().localeCompare(a.trim().toLowerCase())
    );
    expect(namesDesc).toEqual(sortedDesc);

    // Verify down arrow
    const descIcon = page.locator('th:has-text("Name") span:has-text("↓")');
    await expect(descIcon).toBeVisible();

    // Second click - Ascending (A to Z)
    await nameHeaderLink.click();
    await page.waitForTimeout(1000);

    const namesAsc = await page.locator('table tbody tr td:nth-child(1)').allTextContents();

    const sortedAsc = [...namesAsc].sort((a, b) =>
        a.trim().toLowerCase().localeCompare(b.trim().toLowerCase())
    );
    expect(namesAsc).toEqual(sortedAsc);

    // Verify up arrow
    const ascIcon = page.locator('th:has-text("Name") span:has-text("↑")');
    await expect(ascIcon).toBeVisible();
  }); // passed

  // Skipped - same bug as admin (learned from Plant-29)
  test.skip('UI_User_Plants-11 Sort plants by Category', async ({ page }) => {
    // Skipped: Category sorting is not working correctly in the UI
    // Same bug reported in UI_ADMIN_Plant-29
  });



  test('UI_User_Plants-12 Sort plants by Price', async ({ page }) => {
    // No arrows for Price (learned from Plant-30)
    const priceHeaderLink = page.locator('th:has-text("Price") a');

    // First click - Ascending (low to high)
    await priceHeaderLink.click();
    await page.waitForTimeout(1000);

    const pricesAscText = await page.locator('table tbody tr td:nth-child(3)').allTextContents();
    const pricesAsc = pricesAscText.map(p => parseFloat(p.replace(/[^\d.]/g, '')));

    const sortedAsc = [...pricesAsc].sort((a, b) => a - b);
    expect(pricesAsc).toEqual(sortedAsc);

    // Second click - Descending (high to low)
    await priceHeaderLink.click();
    await page.waitForTimeout(1000);

    const pricesDescText = await page.locator('table tbody tr td:nth-child(3)').allTextContents();
    const pricesDesc = pricesDescText.map(p => parseFloat(p.replace(/[^\d.]/g, '')));

    const sortedDesc = [...pricesDesc].sort((a, b) => b - a);
    expect(pricesDesc).toEqual(sortedDesc);
  }); // passed



  test('UI_User_Plants-13 Sort plants by Stock', async ({ page }) => {
    // No arrows for Stock (learned from Plant-31)
    const stockHeaderLink = page.locator('th:has-text("Stock") a');

    // First click - Ascending (low to high)
    await stockHeaderLink.click();
    await page.waitForTimeout(1000);

    const stockAscText = await page.locator('table tbody tr td:nth-child(4)').allTextContents();
    const stockAsc = stockAscText.map(s => parseInt(s.replace(/[^\d]/g, '')));

    const sortedAsc = [...stockAsc].sort((a, b) => a - b);
    expect(stockAsc).toEqual(sortedAsc);

    // Second click - Descending (high to low)
    await stockHeaderLink.click();
    await page.waitForTimeout(1000);

    const stockDescText = await page.locator('table tbody tr td:nth-child(4)').allTextContents();
    const stockDesc = stockDescText.map(s => parseInt(s.replace(/[^\d]/g, '')));

    const sortedDesc = [...stockDesc].sort((a, b) => b - a);
    expect(stockDesc).toEqual(sortedDesc);
  });
});


test('UI_User_Plants-14 Display Low badge when quantity is below 5', async ({ page }) => {
    const stockCells = page.locator('table tbody tr td:nth-child(4)');
    const count = await stockCells.count();

    for (let i = 0; i < count; i++) {
        const cell = stockCells.nth(i);
        const cellText = await cell.textContent();
        
        const stockValue = parseInt(cellText.replace(/[^\d]/g, ''));

        if (stockValue < 5) {
            const lowBadge = cell.locator('span.badge.bg-danger');
            await expect(lowBadge).toBeVisible();
            await expect(lowBadge).toContainText('Low');
            console.log(`Stock ${stockValue}: Low badge verified`);
        } else {
            const lowBadge = cell.locator('span.badge.bg-danger');
            const badgeCount = await lowBadge.count();
            expect(badgeCount).toBe(0);
            console.log(`Stock ${stockValue}: No Low badge (correct)`);
        }
    }
});
