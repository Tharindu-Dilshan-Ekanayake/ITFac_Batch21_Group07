import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

// Helper function to ensure user is logged in
async function ensureUserLoggedIn(page) {
  await page.goto(`${BASE_URL}/ui/login`);

  const userName = page.locator('[name="username"]');
  const password = page.locator('[name="password"]');
  const signIn = page.locator('[type="submit"]');

  await userName.fill(process.env.USER_USERNAME || "testuser");
  await password.fill(process.env.USER_PASSWORD || "test123");
  await signIn.click();

  await page.waitForURL(`${BASE_URL}/ui/dashboard`);
}

// ---------- GIVEN ----------

Given("I am logged in as a user 215036R_user", async function () {
  const page = this.page;
  await ensureUserLoggedIn(page);
});

Given("I am on the Dashboard page 215036R_user", async function () {
  const page = this.page;
  await page.goto(`${BASE_URL}/ui/dashboard`);
  await page.waitForLoadState("networkidle");
});

// ---------- THEN ----------

Then("I should see the Dashboard header 215036R_user", async function () {
  const page = this.page;
  await expect(page.locator(".container-fluid h3")).toContainText("Dashboard");
});

Then("the Dashboard tab should be active 215036R_user", async function () {
  const page = this.page;
  const dashboardTab = page.locator('a[href="/ui/dashboard"]');
  await expect(dashboardTab).toBeVisible();
  await expect(dashboardTab).toHaveClass(/active/);
});

Then("the sidebar navigation should be visible 215036R_user", async function () {
  const page = this.page;
  const logo = page.locator(".sidebar-logo img");
  const categoriesSidebar = page.locator(
    'a.nav-link[href="/ui/categories"]:has-text("Categories")',
  );
  const plantsSidebar = page.locator(
    'a.nav-link[href="/ui/plants"]:has-text("Plants")',
  );
  const salesSidebar = page.locator(
    'a.nav-link[href="/ui/sales"]:has-text("Sales")',
  );
  const logoutButton = page.locator(
    'a.nav-link[href="/ui/logout"]:has-text("Logout")',
  );

  await expect(logo).toBeVisible();
  await expect(categoriesSidebar).toBeVisible();
  await expect(plantsSidebar).toBeVisible();
  await expect(salesSidebar).toBeVisible();
  await expect(logoutButton).toBeVisible();
});

Then("all dashboard cards should be visible 215036R_user", async function () {
  const page = this.page;
  const categoriesCard = page.locator('h6:has-text("Categories")');
  const plantsCard = page.locator('h6:has-text("Plants")');
  const salesCard = page.locator('h6:has-text("Sales")');

  await expect(categoriesCard).toBeVisible();
  await expect(plantsCard).toBeVisible();
  await expect(salesCard).toBeVisible();
});

Then(
  "all dashboard cards should have non-empty summary data 215036R_user",
  async function () {
    const page = this.page;
    const cards = ["Categories", "Plants", "Sales"];

    for (const name of cards) {
      const card = page
        .locator(`h6:has-text("${name}")`)
        .locator("..")
        .locator("..");
      const numbers = card.locator("div.fw-bold");

      const count = await numbers.count();
      for (let i = 0; i < count; i++) {
        const text = await numbers.nth(i).textContent();
        expect(text.trim()).not.toBe("");
      }
    }
  },
);

Then(
  "all dashboard cards should have visible action buttons 215036R_user",
  async function () {
    const page = this.page;
    const cards = ["Categories", "Plants", "Sales"];

    for (const name of cards) {
      const card = page
        .locator(`h6:has-text("${name}")`)
        .locator("..")
        .locator("..");
      await expect(card.locator("a.btn")).toBeVisible();
    }
  },
);

// ---------- WHEN ----------

When("I click the {string} button 215036R_user", async function (buttonText) {
  const page = this.page;
  const button = page.locator(`a:has-text("${buttonText}")`);
  await button.click();
});

When("I click the Categories sidebar navigation 215036R_user", async function () {
  const page = this.page;
  const categoriesTab = page.locator(
    'a.nav-link[href="/ui/categories"]:has-text("Categories")',
  );
  await categoriesTab.click();
});

When("I click the Plants sidebar navigation 215036R_user", async function () {
  const page = this.page;
  const plantsTab = page.locator(
    'a.nav-link[href="/ui/plants"]:has-text("Plants")',
  );
  await plantsTab.click();
});

When("I click the Sales sidebar navigation 215036R_user", async function () {
  const page = this.page;
  const salesTab = page.locator(
    'a.nav-link[href="/ui/sales"]:has-text("Sales")',
  );
  await salesTab.click();
});

// ---------- THEN (Page Navigation) ----------

Then("I should be on the Categories page 215036R_user", async function () {
  const page = this.page;
  await expect(page).toHaveURL(/\/ui\/categories/);
  const categoriesHeading = page.locator('h3:has-text("Categories")');
  await expect(categoriesHeading).toBeVisible();
});

Then("I should be on the Plants page 215036R_user", async function () {
  const page = this.page;
  await expect(page).toHaveURL(/\/ui\/plants/);
  const plantsHeading = page.locator('h3:has-text("Plants")');
  await expect(plantsHeading).toBeVisible();
});

Then("I should be on the Sales page 215036R_user", async function () {
  const page = this.page;
  await expect(page).toHaveURL(/\/ui\/sales/);
  const salesHeading = page.locator('h3:has-text("Sales")');
  await expect(salesHeading).toBeVisible();
});

Then("the Categories tab should be active 215036R_user", async function () {
  const page = this.page;
  const categoriesTab = page.locator('a[href="/ui/categories"]');
  await expect(categoriesTab).toHaveClass(/active/);
});

Then("the Plants tab should be active 215036R_user", async function () {
  const page = this.page;
  const plantsTab = page.locator('a[href="/ui/plants"]');
  await expect(plantsTab).toHaveClass(/active/);
});

Then("the Sales tab should be active 215036R_user", async function () {
  const page = this.page;
  const salesTab = page.locator('a[href="/ui/sales"]');
  await expect(salesTab).toHaveClass(/active/);
});
