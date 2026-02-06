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
  await page.goto(`${BASE_URL}/ui/categories`);
  await page.waitForLoadState("networkidle");
}

Given("I am logged in as an admin 214079R_Admin", async function () {
  const page = this.page;
  await ensureAdminLoggedIn(page);
});

Given("I am on the Admin Categories page 214079R_Admin", async function () {
  const page = this.page;
  await page.goto(`${BASE_URL}/ui/categories`);
  await page.waitForLoadState("networkidle");
});

Then("I should see the Categories header 214079R_Admin", async function () {
  const page = this.page;
  const categoriesHeading = page.locator('h3:has-text("Categories")');
  const mainHeader = page.locator('h2:has-text("QA Training Application")');
  await expect(categoriesHeading).toBeVisible();
  await expect(mainHeader).toBeVisible();
});

Then("I should see the Search input 214079R_Admin", async function () {
  const page = this.page;
  const searchInput = page.locator('input[name="name"]');
  await expect(searchInput).toBeVisible();
  await expect(searchInput).toHaveAttribute(
    "placeholder",
    "Search sub category",
  );
});

Then("I should see the Parent filter 214079R_Admin", async function () {
  const page = this.page;
  const parentFilter = page.locator('select[name="parentId"]');
  await expect(parentFilter).toBeVisible();
  await expect(parentFilter).toContainText("All Parents");
});

Then(
  "I should see the Search and Reset buttons 214079R_Admin",
  async function () {
    const page = this.page;
    const searchButton = page.locator("button:has-text('Search')");
    const resetButton = page.locator("a:has-text('Reset')");
    await expect(searchButton).toBeVisible();
    await expect(resetButton).toBeVisible();
  },
);

Then("I should see the Add Category button 214079R_Admin", async function () {
  const page = this.page;
  const addCategoryButton = page.locator("a:has-text('Add A Category')");
  await expect(addCategoryButton).toBeVisible();
});

Then("I should see the Categories table 214079R_Admin", async function () {
  const page = this.page;
  const table = page.locator("table");
  await expect(table).toBeVisible();
});

Then(
  "I should see the Categories table headers 214079R_Admin",
  async function () {
    const page = this.page;
    const headers = page.locator("table thead th");
    await expect(headers.nth(0)).toHaveText(/ID/);
    await expect(headers.nth(1)).toHaveText(/Name/);
    await expect(headers.nth(2)).toHaveText(/Parent/);
    await expect(headers.nth(3)).toHaveText(/Actions/);
  },
);

When("I search for a valid category name 214079R_Admin", async function () {
  const page = this.page;
  await page.waitForSelector("table tbody tr:first-child");
  const firstRowName = await page
    .locator("table tbody tr:first-child td:nth-child(2)")
    .textContent();

  this.searchedCategoryName = firstRowName.trim();

  const searchInput = page.locator('input[name="name"]');
  await searchInput.fill(this.searchedCategoryName);
  const searchButton = page.locator("button:has-text('Search')");
  await searchButton.click();
});

Then("I should see the category in the table 214079R_Admin", async function () {
  const page = this.page;
  const rows = page.locator("tbody tr");
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const nameCell = rows.nth(i).locator("td:nth-child(2)");
    await expect(nameCell).toHaveText(this.searchedCategoryName);
  }
});

When(
  "I search for category {string} 214079R_Admin",
  async function (categoryName) {
    const page = this.page;
    const searchInput = page.locator('input[name="name"]');
    await searchInput.fill(categoryName);
    const searchButton = page.locator("button:has-text('Search')");
    await searchButton.click();
  },
);

Then("I should see {string} text 214079R_Admin", async function (text) {
  const page = this.page;
  const emptyText = page.locator(`text=${text}`);
  await expect(emptyText).toBeVisible();
});

When("I filter by the first parent category 214079R_Admin", async function () {
  const page = this.page;
  const parentFilter = page.locator('select[name="parentId"]');
  const options = parentFilter.locator("option");
  const selectedValue = await options.nth(1).getAttribute("value");
  this.selectedParentText = await options.nth(1).textContent();
  await parentFilter.selectOption(selectedValue);
  const searchButton = page.locator("button:has-text('Search')");
  await searchButton.click();
});

Then(
  "I should see categories with the selected parent 214079R_Admin",
  async function () {
    const page = this.page;
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    if (count === 0) {
      const emptyText = page.locator("text=No category found");
      if (await emptyText.isVisible()) return;
    }
    for (let i = 0; i < count; i++) {
      const parentCell = rows.nth(i).locator("td:nth-child(3)");
      await expect(parentCell).toHaveText(this.selectedParentText.trim());
    }
  },
);

When("I click the Reset button 214079R_Admin", async function () {
  const page = this.page;
  const resetButton = page.locator("a:has-text('Reset')");
  await resetButton.click();
});

Then("I should see all categories again 214079R_Admin", async function () {
  const page = this.page;
  const rows = page.locator("tbody tr");
  if ((await rows.count()) === 0) {
    await expect(page.locator("table")).toBeVisible();
  } else {
    await expect(rows.first()).toBeVisible();
  }
});

// ----------------- ID Sorting -----------------

When(
  "I sort categories by ID {string} 214079R_Admin",
  async function (direction) {
    const page = this.page;
    const header = page.locator(`th a:has-text("ID")`);
    // Spec logic: Click once -> Asc, Click again -> Desc
    await header.click();
  },
);

Then(
  "the categories should be sorted by ID {string} 214079R_Admin",
  async function (direction) {
    const page = this.page;
    const header = page.locator(`th a:has-text("ID")`);
    const arrow = header.locator("span");

    // Spec Expectations:
    // ASC -> Arrow Down (↓)
    // DESC -> Arrow Up (↑)

    const expectedArrow = direction === "ascending" ? "↓" : "↑";
    await expect(arrow).toHaveText(expectedArrow);

    const values = await page.locator(`table td:nth-child(1)`).allInnerTexts();
    const nums = values.map((v) => Number(v));
    const sorted = [...nums].sort((a, b) => a - b);
    if (direction === "descending") sorted.reverse();

    expect(nums).toEqual(sorted);
  },
);

// ----------------- Name/Parent Sorting -----------------

When(
  "I sort categories by {string} {string} 214079R_Admin",
  async function (column, direction) {
    const page = this.page;
    const header = page.locator(`th a:has-text("${column}")`);

    // Spec logic for Name/Parent: Click once -> Desc, Click again -> Asc.
    await header.click();
  },
);

Then(
  "the categories should be sorted by {string} {string} 214079R_Admin",
  async function (column, direction) {
    const page = this.page;
    const header = page.locator(`th a:has-text("${column}")`);
    const arrow = header.locator("span");

    // Spec Expectations for Name/Parent:
    // DESC (Z-A) -> Arrow Up (↑)
    // ASC (A-Z) -> Arrow Down (↓)

    const expectedArrow = direction === "ascending" ? "↓" : "↑";
    await expect(arrow).toHaveText(expectedArrow);

    let colIndex = column === "Name" ? 2 : 3;

    const values = await page
      .locator(`table td:nth-child(${colIndex})`)
      .allInnerTexts();
    const texts = values.map((v) => v.trim().toLowerCase());

    const sorted = [...texts].sort((a, b) => a.localeCompare(b));
    if (direction === "descending") sorted.sort((a, b) => b.localeCompare(a));

    expect(texts).toEqual(sorted);
  },
);
