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
    const addCategoryButton = page.locator("a:has-text('Add A Category')");

    await expect(searchButton).toBeVisible();
    await expect(resetButton).toBeVisible();
    await expect(addCategoryButton).toBeVisible();

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
    }
});

test("Search categories by valid category name", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/categories`);

    const searchInput = page.locator('input[name="name"]');
    await searchInput.fill("basic");
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
            const nameCell = rows.nth(i).locator("td:nth-child(2)"); // Get the second column of table
            await expect(nameCell).toHaveText(/basic|Basic/); // I chose these because in my database these values persist
        }
    }
    
});

test("Search categories by invalid category name", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/categories`);

    const searchInput = page.locator('input[name="name"]');
    await searchInput.fill("invalid_input");
    const searchButton = page.locator("button:has-text('Search')");
    await searchButton.click();

    const emptyText = page.locator("text=No category found");
    await expect(emptyText).toBeVisible();
    
});

test("Verify parent category filtering", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/categories`);

    const parentFilter = page.locator('select[name="parentId"]');
    await parentFilter.selectOption({ value: "2" });
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
            const parentCell = rows.nth(i).locator("td:nth-child(3)"); // Get the third column of table
            await expect(parentCell).toHaveText("Basic"); // I chose this because in my database this value persists
        }
    }
    
});

test("Verify reset button functionality", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/categories`);

    const parentFilter = page.locator('select[name="parentId"]');
    await parentFilter.selectOption({ value: "2" });

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
            const parentCell = filteredRows.nth(i).locator("td:nth-child(3)"); // Get the third column of table
            await expect(parentCell).toHaveText("Basic"); // I chose this because in my database this value persists
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