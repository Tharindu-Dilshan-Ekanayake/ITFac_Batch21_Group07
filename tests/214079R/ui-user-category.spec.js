import { test, expect } from "@playwright/test";

test("Verify categories page UI elements", async ({ page, baseURL }) => {

    await page.goto(`${baseURL}/ui/categories`);

    // Waits for loading the page
    await expect(page).toHaveURL(/\/ui\/categories/);
    // Categories headings
    const categoriesHeading = page.locator('h3:has-text("Categories")');
    const mainHeader = page.locator('h2:has-text("QA Training Application")');
    await expect(categoriesHeading).toBeVisible();
    await expect(mainHeader).toBeVisible();

    // Search input
    const searchInput = page.locator('input[name="name"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute("placeholder", "Search sub category");

    // Parent filter
    const parentFilter = page.locator('select[name="parentId"]');
    await expect(parentFilter).toBeVisible();

    // Verify dropdown options exist
    await expect(parentFilter).toContainText("All Parents");

    // Buttons
    const searchButton = page.locator("button:has-text('Search')");
    const resetButton = page.locator("a:has-text('Reset')");

    await expect(searchButton).toBeVisible();
    await expect(resetButton).toBeVisible();

    // Table
    const table = page.locator("table");
    await expect(table).toBeVisible();

    // Table headings
    const headers = table.locator("thead th");

    await expect(headers.nth(0)).toHaveText(/ID/);
    await expect(headers.nth(1)).toHaveText(/Name/);
    await expect(headers.nth(2)).toHaveText(/Parent/);
    await expect(headers.nth(3)).toHaveText(/Actions/);
});

test("Verify no categories data available",  async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/categories`);
    
    const rows = page.locator("tbody tr");
    const emptyText = page.locator("text=No category found");

    // Verify no categories data available
    if (await rows.count() === 0) {
        await expect(emptyText).toBeVisible();
    } else {
        const searchInput = page.locator('input[name="name"]');
        await searchInput.fill("invalid_name"); // Fill an invalid category name
        const searchButton = page.locator("button:has-text('Search')");
        await searchButton.click();

        const emptyText = page.locator("text=No category found");
        await expect(emptyText).toBeVisible(); 
    }
});

test("Search categories by valid category name", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/categories`);
    // Ensure data exists
    const firstRowCategoryName = await page.locator('table tbody tr:first-child td:nth-child(2)').textContent();

    const searchInput = page.locator('input[name="name"]');
    await searchInput.fill(firstRowCategoryName);
    const searchButton = page.locator("button:has-text('Search')");
    await searchButton.click();

    const rows = page.locator("tbody tr");
    const emptyText = page.locator("text=No category found");

    // Verify availability of category data
    if (await rows.count() === 0) {
        await expect(emptyText).toBeVisible();
    } else {
        // Verify category data is not empty and visible
        for (let i = 0; i < await rows.count(); i++) {
            const nameCell = rows.nth(i).locator("td:nth-child(2)");
            await expect(nameCell).toHaveText(firstRowCategoryName);
        }
    }
});

test("Search categories by invalid category name", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/categories`);

    const searchInput = page.locator('input[name="name"]');
    await searchInput.fill("invalid_input"); // Insert invalid category name
    const searchButton = page.locator("button:has-text('Search')");
    await searchButton.click();

    const emptyText = page.locator("text=No category found");
    await expect(emptyText).toBeVisible();
    
});

test("Verify parent category filtering", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/ui/categories`);

  const parentFilter = page.locator('select[name="parentId"]');
  const searchButton = page.locator("button:has-text('Search')");
  const rows = page.locator("tbody tr");
  const emptyText = page.locator("text=No category found");

  // Get all options
  const options = parentFilter.locator("option");

  // Ensure there is at least one selectable parent
  const optionCount = await options.count();
  expect(optionCount).toBeGreaterThan(1);

  // Select the first real parent option (index 1)
  const selectedValue = await options.nth(1).getAttribute("value");
  const selectedText = await options.nth(1).textContent();

  await parentFilter.selectOption(selectedValue);
  await searchButton.click();

  // Assertion
  if (await rows.count() === 0) {
    await expect(emptyText).toBeVisible();
  } else {
    for (let i = 0; i < await rows.count(); i++) {
      const parentCell = rows.nth(i).locator("td:nth-child(3)");
      await expect(parentCell).toHaveText(selectedText.trim());
    }
  }
});

test("Verify reset button functionality", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/categories`);

    // Ensure data exists
    const firstRowCategoryName = await page.locator('table tbody tr:first-child td:nth-child(2)').textContent();

    const searchInput = page.locator('input[name="name"]');
    await searchInput.fill(firstRowCategoryName);
    const searchButton = page.locator("button:has-text('Search')");
    await searchButton.click();

    const resetButton = page.locator("a:has-text('Reset')");

    const filteredRows = page.locator("tbody tr");
    const emptyText = page.locator("text=No category found");

    // Verify availability of category data
    if (await filteredRows.count() === 0) {
        await expect(emptyText).toBeVisible();
    } else {
        // Verify category data is not empty and visible
        for (let i = 0; i < await filteredRows.count(); i++) {
            const parentCell = filteredRows.nth(i).locator("td:nth-child(2)"); // Get the second column of table
            await expect(parentCell).toHaveText(firstRowCategoryName);
        }
    }
    
    await resetButton.click();

    const afterResetRows = page.locator("tbody tr");

    // Verify availability of category data
    if (await afterResetRows.count() === 0) {
        await expect(emptyText).toBeVisible();
    } else {
        // Verify category data is not empty and visible
        for (let i = 0; i < await afterResetRows.count(); i++) {
            const nameCell = afterResetRows.nth(i).locator("td:nth-child(2)"); // Get the third column of table
            await expect(nameCell).toBeVisible();
        }
    }
});

test("Sort categories by ID", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/ui/categories`);

  const idHeader = page.locator('th a:has-text("ID")');

  // Click once → ASC
  await idHeader.click();
  // Targets the first <td> in every row
  const columnValues = await page.locator('table td:nth-child(1)').allInnerTexts();
  const sortedAsc = [...columnValues].sort((a, b) => Number(a) - Number(b));

  expect(columnValues).toEqual(sortedAsc);
  await expectArrow(idHeader, "down");

  // Click again → DESC
  await idHeader.click();
  const descValues = await page.locator('table td:nth-child(1)').allInnerTexts();
  const sortedDesc = [...sortedAsc].reverse();
  expect(descValues).toEqual(sortedDesc);
  await expectArrow(idHeader, "up");
});

// helper function to detect arrow 
async function expectArrow(headerLocator, direction) {
  const arrow = headerLocator.locator("span");

  if (direction === "up") {
    await expect(arrow).toHaveText("↑");
  } else {
    await expect(arrow).toHaveText("↓");
  }
}

test("Sort categories by Name", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/ui/categories`);

  const nameHeader = page.locator('th a:has-text("Name")');

  // Click once → Z-A
  await nameHeader.click();
  const descValues = await page.locator('table td:nth-child(2)').allInnerTexts();
  const normalizedDesc = descValues.map(v => v.trim().toLowerCase()); // convert all capital letters to lower
  const expectedDesc = [...normalizedDesc].sort((a, b) => b.localeCompare(a));

  expect(normalizedDesc).toEqual(expectedDesc);
  await expectArrow(nameHeader, "up");

  // Click again → A-Z
  await nameHeader.click();
  const ascValues = await page.locator('table td:nth-child(2)').allInnerTexts();
  const normalizedAsc = ascValues.map(v => v.trim().toLowerCase()); // convert all capital letters to lower
  const expectedAsc = [...normalizedAsc].sort((a, b) => a.localeCompare(b));

  expect(normalizedAsc).toEqual(expectedAsc);
  await expectArrow(nameHeader, "down");
});

test("Sort categories by Parent", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/ui/categories`);

  const parentHeader = page.locator('th a:has-text("Parent")');

  // Click once → Z-A
  await parentHeader.click();
  const descValues = await page.locator('table td:nth-child(3)').allInnerTexts();
  const normalizedDesc = descValues.map(v => v.trim().toLowerCase()); // convert all capital letters to lower
  const expectedDesc = [...normalizedDesc].sort((a, b) => b.localeCompare(a));

  expect(normalizedDesc).toEqual(expectedDesc);
  await expectArrow(parentHeader, "up");

  // Click again → A-Z
  await parentHeader.click();
  const ascValues = await page.locator('table td:nth-child(3)').allInnerTexts();
  const normalizedAsc = ascValues.map(v => v.trim().toLowerCase()); // convert all capital letters to lower
  const expectedAsc = [...normalizedAsc].sort((a, b) => a.localeCompare(b));

  expect(normalizedAsc).toEqual(expectedAsc);
  await expectArrow(parentHeader, "down");
});




