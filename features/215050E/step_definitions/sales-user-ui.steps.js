import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

// Helper: Ensure normal user is logged in
async function ensureUserLoggedIn(page) {
  await page.goto(`${BASE_URL}/ui/login`);
  await page.locator('[name="username"]').fill(process.env.USER_USERNAME || "testuser");
  await page.locator('[name="password"]').fill(process.env.USER_PASSWORD || "test123");
  await page.locator('[type="submit"]').click();
  await page.waitForURL(`${BASE_URL}/ui/dashboard`, { timeout: 30000 });
}

// Helper: Check if array is sorted (allows equal values)
function isSorted(arr, compareFn) {
  for (let i = 1; i < arr.length; i++) {
    if (compareFn(arr[i - 1], arr[i]) > 0) {
      return false;
    }
  }
  return true;
}

Given("the user is on the sales page", async function () {
  await ensureUserLoggedIn(this.page);
  await this.page.goto(`${BASE_URL}/ui/sales`);
  await this.page.waitForLoadState("networkidle");
});

Then('the sales page should show correct UI elements', async function () {
	const salesHeader = this.page.locator('h1, h2, h3').filter({ hasText: /sales/i });
	await expect(salesHeader).toBeVisible();
	const sellButton = this.page.locator('button:has-text("Sell"), a:has-text("Sell")');
	const sellButtonCount = await sellButton.count();
	expect(sellButtonCount).toBe(0);
	const plantHeader = this.page.locator('th:has-text("Plant")');
	await expect(plantHeader).toBeVisible();
	const quantityHeader = this.page.locator('th:has-text("Quantity")');
	await expect(quantityHeader).toBeVisible();
	const totalPriceHeader = this.page.locator('th:has-text("Total")');
	await expect(totalPriceHeader).toBeVisible();
	const soldAtHeader = this.page.locator('th:has-text("Sold")');
	await expect(soldAtHeader).toBeVisible();
	const actionsHeader = this.page.locator('th:has-text("Actions")');
	const actionsCount = await actionsHeader.count();
	expect(actionsCount).toBe(0);
});

Then('the sales page should show no sales data message if empty', async function () {
	const salesRows = this.page.locator('table tbody tr');
	const count = await salesRows.count();
	if (count === 0) {
		const noDataMsg = this.page.locator('text=No sales found');
		await expect(noDataMsg).toBeVisible();
	} else {
		console.log('Step skipped: No sales data available.');
		return;
	}
});

Then('pagination should be visible only if more than {int} records', async function (threshold) {
	const salesRows = this.page.locator('table tbody tr');
	const count = await salesRows.count();
	const pagination = this.page.locator('[class*="pagination"], nav[aria-label="pagination"]');
	if (count > threshold) {
		await expect(pagination).toBeVisible();
		const paginationButtons = pagination.locator('button, a');
		const buttonCount = await paginationButtons.count();
		expect(buttonCount).toBeGreaterThan(0);
	} else {
		await expect(pagination).toHaveCount(0);
	}
});

Then('sales should be sorted by Sold date descending by default', async function () {
	const soldDates = this.page.locator('table tbody tr td:nth-child(4)');
	const count = await soldDates.count();
	const dates = [];
	for (let i = 0; i < count; i++) {
		const dateText = await soldDates.nth(i).textContent();
		dates.push(new Date(dateText.trim()));
	}
	for (let i = 0; i < dates.length - 1; i++) {
		expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
	}
});

Then('sales should be sortable by {string}', async function (column) {
	let headerSelector, cellSelector, parseFn;
	if (column === 'Plant') {
		headerSelector = 'th:has-text("Plant")';
		cellSelector = 'table tbody tr td:nth-child(1)';
		parseFn = v => v.trim().toLowerCase();
	} else if (column === 'Quantity') {
		headerSelector = 'th:has-text("Quantity")';
		cellSelector = 'table tbody tr td:nth-child(2)';
		parseFn = v => parseInt(v.replace(/[^\d]/g, ''));
	} else if (column === 'Total') {
		headerSelector = 'th:has-text("Total")';
		cellSelector = 'table tbody tr td:nth-child(3)';
		parseFn = v => parseFloat(v.replace(/[^\d.]/g, ''));
	} else if (column === 'Sold') {
		headerSelector = 'th:has-text("Sold")';
		cellSelector = 'table tbody tr td:nth-child(4)';
		parseFn = v => new Date(v.trim()).getTime();
	} else {
		throw new Error('Unknown column: ' + column);
	}
	const header = this.page.locator(headerSelector);
	await header.waitFor({ state: "visible" });
	await Promise.all([
		this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {}),
		header.click()
	]);
	await this.page.waitForTimeout(1000);
	const values1 = (await this.page.locator(cellSelector).allTextContents()).map(parseFn);
	await Promise.all([
		this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {}),
		header.click()
	]);
	await this.page.waitForTimeout(1000);
	const values2 = (await this.page.locator(cellSelector).allTextContents()).map(parseFn);
	const unique = new Set([...values1, ...values2]);
	if (unique.size > 1) {
		const isDifferent = JSON.stringify(values1) !== JSON.stringify(values2);
		expect(isDifferent).toBe(true);
		const cmp = (a, b) => typeof a === 'string'
			? a.localeCompare(b)
			: a - b;
		const sortedAsc = isSorted(values1, cmp);
		const sortedDesc = isSorted(values1, (a, b) => cmp(b, a));
		expect(sortedAsc || sortedDesc).toBe(true);
	} else {
		console.log('Step skipped: Not enough sales data to test sorting.');
		return;
	}
});
