import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

async function ensureUserLoggedIn(page) {
  await page.goto(`${BASE_URL}/ui/login`);
  const userName = page.locator('[name="username"]');
  const password = page.locator('[name="password"]');
  const signIn = page.locator('[type="submit"]');

  await userName.fill(process.env.USER_USERNAME);
  await password.fill(process.env.USER_PASSWORD);
  await signIn.click();

  await page.waitForURL(`${BASE_URL}/ui/dashboard`);
}

Given("I am logged in as a user 214002D_User", async function () {
  const page = this.page;
  await ensureUserLoggedIn(page);
});

Given("I am on the User Plants page 214002D_User", async function () {
  const page = this.page;
  await page.goto(`${BASE_URL}/ui/plants`);
  await page.waitForLoadState("networkidle");
});

Then("I should see the search plant input 214002D_User", async function () {
  const page = this.page;
  const searchInput = page.getByPlaceholder("Search plant");
  await expect(searchInput).toBeVisible();
});

Then("I should see the category filter 214002D_User", async function () {
  const page = this.page;
  const categoryFilter = page.locator('select[name="categoryId"]');
  await expect(categoryFilter).toBeVisible();
});

Then(
  "I should see the Search and Reset buttons 214002D_User",
  async function () {
    const page = this.page;
    const searchButton = page.getByRole("button", { name: "Search" });
    const resetButton = page.getByRole("link", { name: "Reset" });
    await expect(searchButton).toBeVisible();
    await expect(resetButton).toBeVisible();
  },
);

Then("I should see the Plants table 214002D_User", async function () {
  const page = this.page;
  const table = page.locator("table");
  await expect(table).toBeVisible();
});

Then("I should see the Plants table headers 214002D_User", async function () {
  const page = this.page;
  await expect(page.getByRole("columnheader", { name: "Name" })).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Category" }),
  ).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Price" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Stock" })).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Actions" }),
  ).toBeVisible();
});

When("I search for plant {string} 214002D_User", async function (plantName) {
  const page = this.page;
  const searchInput = page.getByPlaceholder("Search plant");
  await searchInput.fill(plantName);
  const searchButton = page.getByRole("button", { name: "Search" });
  await searchButton.click();
});

Then("I should see {string} text 214002D_User", async function (text) {
  const page = this.page;
  const emptyRow = page.locator("tbody tr td.text-muted");
  await expect(emptyRow).toBeVisible();
  await expect(emptyRow).toHaveText(text);
});

Then(
  "I should see the Low badge for low stock plants 214002D_User",
  async function () {
    const page = this.page;
    await page.locator("table").waitFor({ state: "visible" });
    const lowBadge = page.locator("span.badge.bg-danger", { hasText: "Low" });
    await expect(lowBadge.first()).toBeVisible();
    await expect(lowBadge.first()).toHaveText("Low");
  },
);

Then("I should not see the Edit button 214002D_User", async function () {
  const page = this.page;
  const editButton = page.getByRole("button", { name: "Edit" });
  await expect(editButton).toHaveCount(0);
});

Then("I should not see the Delete button 214002D_User", async function () {
  const page = this.page;
  const deleteButton = page.getByRole("button", { name: "Delete" });
  await expect(deleteButton).toHaveCount(0);
});
