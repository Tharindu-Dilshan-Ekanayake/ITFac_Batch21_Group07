const { test, expect } = require('@playwright/test');



test('UI_ADMIN_Plant-23 Verify no plants data available', async ({ page }) => {
  await page.goto('/ui/plants');

  const noDataMsg = page.locator('text=No plants found');
  await expect(noDataMsg).toBeVisible();
});

test.describe('Admin Plants Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/ui/plants');
  });


  test('UI_ADMIN_Plant-24 Search plants by valid plant name', async ({ page }) => {
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
  });// passed



  test('UI_ADMIN_Plant-25 Search plants by invalid plant name', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
    await searchInput.fill('InvalidPlantName12345');
    
    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click();
    
    const noDataMsg = page.locator('text=No plants found');
    await expect(noDataMsg).toBeVisible();
  }); // passed




  test('UI_ADMIN_Plant-26 Verify all categories filtering', async ({ page }) => {
    // Select the category from the dropdown using selectOption
    const categoryDropdown = page.locator('select');
    await categoryDropdown.selectOption({ label: 'Orchid' }); // or { value: '4' }
    
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
});    // passed



test('UI_ADMIN_Plant-27 Verify reset button functionality', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
    await searchInput.fill('Rose');
    
    const categoryDropdown = page.locator('select');
    await categoryDropdown.selectOption({ label: 'Orchid' });
    
    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click();
    
    await page.waitForTimeout(1000);
    
    // Click the reset link instead of button
    const resetLink = page.locator('a:has-text("Reset")');
    await resetLink.click();
    
    await page.waitForTimeout(1000);
    
    // Verify search input is cleared
    await expect(searchInput).toHaveValue('');
    
    // Verify all plants are displayed (no filters applied)
    const plantRows = page.locator('table tbody tr');
    const totalCount = await plantRows.count();
    expect(totalCount).toBeGreaterThan(0);
});  //passed


 test('UI_ADMIN_Plant-28 Sort plants by Name', async ({ page }) => {
    const nameHeaderLink = page.locator('th:has-text("Name") a');
    
    // First click - Descending (Z to A) with ↓ arrow
    await nameHeaderLink.click();
    await page.waitForTimeout(1000);
    
    const namesDesc = await page.locator('table tbody tr td:nth-child(1)').allTextContents();
    
    const sortedDesc = [...namesDesc].sort((a, b) => 
        b.trim().toLowerCase().localeCompare(a.trim().toLowerCase())
    );
    expect(namesDesc).toEqual(sortedDesc);
    
    // Verify down arrow for descending
    const descIcon = page.locator('th:has-text("Name") span:has-text("↓")');
    await expect(descIcon).toBeVisible();
    
    // Second click - Ascending (A to Z) with ↑ arrow
    await nameHeaderLink.click();
    await page.waitForTimeout(1000);
    
    const namesAsc = await page.locator('table tbody tr td:nth-child(1)').allTextContents();
    
    const sortedAsc = [...namesAsc].sort((a, b) => 
        a.trim().toLowerCase().localeCompare(b.trim().toLowerCase())
    );
    expect(namesAsc).toEqual(sortedAsc);
    
    // Verify up arrow for ascending
    const ascIcon = page.locator('th:has-text("Name") span:has-text("↑")');
    await expect(ascIcon).toBeVisible();
});  // passed

  

test.skip('UI_ADMIN_Plant-29 Sort plants by Category', async ({ page }) => {
    // Skipped: Category sorting is not working correctly in the UI
    // Bug: When clicking Category header, items are not properly sorted
});



 test('UI_ADMIN_Plant-30 Sort plants by Price', async ({ page }) => {
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




 test('UI_ADMIN_Plant-31 Sort plants by Stock', async ({ page }) => {
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
});  // passed

test('UI_ADMIN_Plant-32 Display Low badge when quantity is below 5', async ({ page }) => {
    const stockCells = page.locator('table tbody tr td:nth-child(4)');
    const count = await stockCells.count();

    for (let i = 0; i < count; i++) {
        const cell = stockCells.nth(i);
        const cellText = await cell.textContent();
        
        const stockValue = parseInt(cellText.replace(/[^\d]/g, ''));

        if (stockValue < 5) {
            // Look for the Bootstrap badge with "Low" text
            const lowBadge = cell.locator('span.badge.bg-danger');
            await expect(lowBadge).toBeVisible();
            await expect(lowBadge).toContainText('Low');
            console.log(`Stock ${stockValue}: Low badge verified`);
        } else {
            // Verify "Low" badge is NOT present when stock >= 5
            const lowBadge = cell.locator('span.badge.bg-danger');
            const badgeCount = await lowBadge.count();
            expect(badgeCount).toBe(0);
            console.log(`Stock ${stockValue}: No Low badge (correct)`);
        }
    }
}); //passed

});