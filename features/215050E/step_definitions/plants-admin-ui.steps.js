import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

async function ensureAdminLoggedIn(page) {
	await page.goto(`${BASE_URL}/ui/login`);

	const userName = page.locator('[name="username"]');
	const password = page.locator('[name="password"]');
	const signIn = page.locator('[type="submit"]');

	await userName.fill(process.env.ADMIN_USERNAME || "admin");
	await password.fill(process.env.ADMIN_PASSWORD || "admin123");
	await signIn.click();

	await page.waitForURL(`${BASE_URL}/ui/dashboard`);
}

// Uses CustomWorld from features/support/world.js

Given(
	"I am logged in as an admin user 215050E_PlantsUI",
	async function () {
		if (!this.page) {
			throw new Error("Playwright page is not initialized in World");
		}

		await ensureAdminLoggedIn(this.page);
	},
);

When(
	"I navigate to the admin plants page 215050E_PlantsUI",
	async function () {
		await this.page.goto(`${BASE_URL}/ui/plants`);
	},
);

Then(
	"I should see the \"No plants found\" message 215050E_PlantsUI",
	async function () {
		const noDataMsg = this.page.locator("text=No plants found");
		await expect(noDataMsg).toBeVisible();
	},
);

Given(
	"I am on the admin plants page 215050E_PlantsUI",
	async function () {
		await ensureAdminLoggedIn(this.page);
		await this.page.goto(`${BASE_URL}/ui/plants`);
	},
);

When(
	"I search plants by name \"Rose\" 215050E_PlantsUI",
	async function () {
		const searchInput = this.page.locator(
			'input[placeholder*="Search"], input[type="search"]',
		);
		await searchInput.fill("Rose");
		const searchButton = this.page.locator('button:has-text("Search")');
		await searchButton.click();
		await this.page.waitForTimeout(1000);
	},
);

When(
	"I search plants by name \"InvalidPlantName12345\" 215050E_PlantsUI",
	async function () {
		const searchInput = this.page.locator(
			'input[placeholder*="Search"], input[type="search"]',
		);
		await searchInput.fill("InvalidPlantName12345");
		const searchButton = this.page.locator('button:has-text("Search")');
		await searchButton.click();
		await this.page.waitForTimeout(1000);
	},
);

Then(
	"I should see at least one plant row in the admin table 215050E_PlantsUI",
	async function () {
		const plantRows = this.page.locator("table tbody tr");
		const count = await plantRows.count();
		expect(count).toBeGreaterThan(0);
	},
);

Then(
	"all visible plant rows should contain the text \"Rose\" in the name column 215050E_PlantsUI",
	async function () {
		const nameCells = this.page.locator(
			"table tbody tr td:nth-child(1)",
		);
		const names = await nameCells.allTextContents();
		for (const name of names) {
			expect(name.toLowerCase()).toContain("rose");
		}
	},
);

When(
	"I select the category \"Orchid\" in the admin plants page 215050E_PlantsUI",
	async function () {
		const categoryDropdown = this.page.locator("select");
		await categoryDropdown.selectOption({ label: "Orchid" });
	},
);

When(
	"I apply the plants search filter 215050E_PlantsUI",
	async function () {
		const searchButton = this.page.locator('button:has-text("Search")');
		await searchButton.click();
		await this.page.waitForTimeout(1000);
	},
);

When(
	"I click the reset link in the admin plants page 215050E_PlantsUI",
	async function () {
		const resetLink = this.page.locator('a:has-text("Reset")');
		await resetLink.click();
		await this.page.waitForTimeout(1000);
	},
);

Then(
	"the plants search input should be empty 215050E_PlantsUI",
	async function () {
		const searchInput = this.page.locator(
			'input[placeholder*="Search"], input[type="search"]',
		);
		await expect(searchInput).toHaveValue("");
	},
);

When(
	"I sort plants by name in descending order 215050E_PlantsUI",
	async function () {
		const nameHeaderLink = this.page.locator('th:has-text("Name") a');
		await nameHeaderLink.click();
		await this.page.waitForTimeout(1000);
	},
);

Then(
	"the admin plants table should be sorted by name descending with down arrow 215050E_PlantsUI",
	async function () {
		const namesDesc = await this.page
			.locator("table tbody tr td:nth-child(1)")
			.allTextContents();
		const sortedDesc = [...namesDesc].sort((a, b) =>
			b.trim().toLowerCase().localeCompare(a.trim().toLowerCase()),
		);
		expect(namesDesc).toEqual(sortedDesc);

		const descIcon = this.page.locator(
			'th:has-text("Name") span:has-text("↓")',
		);
		await expect(descIcon).toBeVisible();
	},
);

When(
	"I sort plants by name in ascending order 215050E_PlantsUI",
	async function () {
		const nameHeaderLink = this.page.locator('th:has-text("Name") a');
		await nameHeaderLink.click();
		await this.page.waitForTimeout(1000);
	},
);

Then(
	"the admin plants table should be sorted by name ascending with up arrow 215050E_PlantsUI",
	async function () {
		const namesAsc = await this.page
			.locator("table tbody tr td:nth-child(1)")
			.allTextContents();
		const sortedAsc = [...namesAsc].sort((a, b) =>
			a.trim().toLowerCase().localeCompare(b.trim().toLowerCase()),
		);
		expect(namesAsc).toEqual(sortedAsc);

		const ascIcon = this.page.locator(
			'th:has-text("Name") span:has-text("↑")',
		);
		await expect(ascIcon).toBeVisible();
	},
);

When(
	"I sort plants by price ascending then descending 215050E_PlantsUI",
	async function () {
		const priceHeaderLink = this.page.locator('th:has-text("Price") a');
		await priceHeaderLink.click();
		await this.page.waitForTimeout(1000);

		const pricesAscText = await this.page
			.locator("table tbody tr td:nth-child(3)")
			.allTextContents();
		const pricesAsc = pricesAscText.map((p) =>
			parseFloat(p.replace(/[^\d.]/g, "")),
		);
		this.pricesAsc = pricesAsc;

		await priceHeaderLink.click();
		await this.page.waitForTimeout(1000);

		const pricesDescText = await this.page
			.locator("table tbody tr td:nth-child(3)")
			.allTextContents();
		const pricesDesc = pricesDescText.map((p) =>
			parseFloat(p.replace(/[^\d.]/g, "")),
		);
		this.pricesDesc = pricesDesc;
	},
);

Then(
	"the admin plants table prices should be correctly sorted for both directions 215050E_PlantsUI",
	async function () {
		const sortedAsc = [...this.pricesAsc].sort((a, b) => a - b);
		expect(this.pricesAsc).toEqual(sortedAsc);

		const sortedDesc = [...this.pricesDesc].sort((a, b) => b - a);
		expect(this.pricesDesc).toEqual(sortedDesc);
	},
);

When(
	"I sort plants by stock ascending then descending 215050E_PlantsUI",
	async function () {
		const stockHeaderLink = this.page.locator('th:has-text("Stock") a');
		await stockHeaderLink.click();
		await this.page.waitForTimeout(1000);

		const stockAscText = await this.page
			.locator("table tbody tr td:nth-child(4)")
			.allTextContents();
		const stockAsc = stockAscText.map((s) =>
			parseInt(s.replace(/[^\d]/g, ""), 10),
		);
		this.stockAsc = stockAsc;

		await stockHeaderLink.click();
		await this.page.waitForTimeout(1000);

		const stockDescText = await this.page
			.locator("table tbody tr td:nth-child(4)")
			.allTextContents();
		const stockDesc = stockDescText.map((s) =>
			parseInt(s.replace(/[^\d]/g, ""), 10),
		);
		this.stockDesc = stockDesc;
	},
);

Then(
	"the admin plants table stock values should be correctly sorted for both directions 215050E_PlantsUI",
	async function () {
		const sortedAsc = [...this.stockAsc].sort((a, b) => a - b);
		expect(this.stockAsc).toEqual(sortedAsc);

		const sortedDesc = [...this.stockDesc].sort((a, b) => b - a);
		expect(this.stockDesc).toEqual(sortedDesc);
	},
);

Then(
	"any plant with quantity below 5 should display a Low badge 215050E_PlantsUI",
	async function () {
		const rows = this.page.locator("table tbody tr");
		const count = await rows.count();
		for (let i = 0; i < count; i++) {
			const quantityText = await rows
				.nth(i)
				.locator("td:nth-child(4)")
				.textContent();
			const qty = parseInt((quantityText || "").replace(/[^\d]/g, ""), 10);
			if (qty < 5) {
				const badge = rows
					.nth(i)
					.locator('span:has-text("Low")');
				await expect(badge).toBeVisible();
			}
		}
	},
);