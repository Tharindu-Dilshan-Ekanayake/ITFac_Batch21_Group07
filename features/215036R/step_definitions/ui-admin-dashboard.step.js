const { Given, When, Then, Before } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");
const path = require("path");

// Load admin authentication
const adminAuth = require("../../../admin-auth.json");

Given("I am logged in as an admin", async function () {
  await this.page.goto(`${this.baseUrl}/ui/dashboard`);
  
  // Check if already logged in by looking for dashboard content
  const dashboardHeading = this.page.locator("h3:has-text('Dashboard')");
  const isLoggedIn = await dashboardHeading.isVisible().catch(() => false);
  
  if (!isLoggedIn) {
    // Perform login
    await this.page.goto(`${this.baseUrl}/ui/login`);
    
    const emailInput = this.page.locator("input[type='email']");
    const passwordInput = this.page.locator("input[type='password']");
    const loginButton = this.page.locator("button:has-text('Login')");
    
    await emailInput.fill(adminAuth.email);
    await passwordInput.fill(adminAuth.password);
    await loginButton.click();
    
    // Wait for navigation to dashboard
    await this.page.waitForURL(/\/ui\/dashboard/);
  }
});

Given("I am on the Dashboard page", async function () {
  await this.page.goto(`${this.baseUrl}/ui/dashboard`);
  const dashboardHeading = this.page.locator("h3:has-text('Dashboard')");
  await expect(dashboardHeading).toBeVisible();
});

Then("I should see the Dashboard heading", async function () {
  const dashboardHeading = this.page.locator(".container-fluid h3");
  await expect(dashboardHeading).toContainText("Dashboard");
});

Then("the Dashboard tab should be visible", async function () {
  const dashboardTab = this.page.locator('a[href="/ui/dashboard"]');
  await expect(dashboardTab).toBeVisible();
});

Then("the Dashboard tab should have the active class", async function () {
  const dashboardTab = this.page.locator('a[href="/ui/dashboard"]');
  await expect(dashboardTab).toHaveClass(/active/);
});

Then("the logo should be visible", async function () {
  const logo = this.page.locator(".sidebar-logo img");
  await expect(logo).toBeVisible();
});

Then("I should see the Categories card", async function () {
  const categoriesCard = this.page.locator('h6:has-text("Categories")');
  await expect(categoriesCard).toBeVisible();
});

Then("I should see the Plants card", async function () {
  const plantsCard = this.page.locator('h6:has-text("Plants")');
  await expect(plantsCard).toBeVisible();
});

Then("I should see the Sales card", async function () {
  const salesCard = this.page.locator('h6:has-text("Sales")');
  await expect(salesCard).toBeVisible();
});

Then("the Categories sidebar navigation should be visible", async function () {
  const categoriesNav = this.page.locator('a.nav-link[href="/ui/categories"]:has-text("Categories")');
  await expect(categoriesNav).toBeVisible();
});

Then("the Plants sidebar navigation should be visible", async function () {
  const plantsNav = this.page.locator('a.nav-link[href="/ui/plants"]:has-text("Plants")');
  await expect(plantsNav).toBeVisible();
});

Then("the Sales sidebar navigation should be visible", async function () {
  const salesNav = this.page.locator('a.nav-link[href="/ui/sales"]:has-text("Sales")');
  await expect(salesNav).toBeVisible();
});

Then("the Logout button should be visible", async function () {
  const logoutButton = this.page.locator('a.nav-link[href="/ui/logout"]:has-text("Logout")');
  await expect(logoutButton).toBeVisible();
});

Then("the Categories card should display summary numbers", async function () {
  const card = this.page.locator('h6:has-text("Categories")').locator("..").locator("..");
  const numbers = card.locator("div.fw-bold");
  
  const count = await numbers.count();
  expect(count).toBeGreaterThan(0);
  
  for (let i = 0; i < count; i++) {
    const text = await numbers.nth(i).textContent();
    expect(text.trim()).not.toBe("");
  }
});

Then("the Plants card should display summary numbers", async function () {
  const card = this.page.locator('h6:has-text("Plants")').locator("..").locator("..");
  const numbers = card.locator("div.fw-bold");
  
  const count = await numbers.count();
  expect(count).toBeGreaterThan(0);
  
  for (let i = 0; i < count; i++) {
    const text = await numbers.nth(i).textContent();
    expect(text.trim()).not.toBe("");
  }
});

Then("the Sales card should display summary numbers", async function () {
  const card = this.page.locator('h6:has-text("Sales")').locator("..").locator("..");
  const numbers = card.locator("div.fw-bold");
  
  const count = await numbers.count();
  expect(count).toBeGreaterThan(0);
  
  for (let i = 0; i < count; i++) {
    const text = await numbers.nth(i).textContent();
    expect(text.trim()).not.toBe("");
  }
});

Then("the Categories card should have a button", async function () {
  const card = this.page.locator('h6:has-text("Categories")').locator("..").locator("..");
  const button = card.locator("a.btn");
  await expect(button).toBeVisible();
});

Then("the Plants card should have a button", async function () {
  const card = this.page.locator('h6:has-text("Plants")').locator("..").locator("..");
  const button = card.locator("a.btn");
  await expect(button).toBeVisible();
});

Then("the Sales card should have a button", async function () {
  const card = this.page.locator('h6:has-text("Sales")').locator("..").locator("..");
  const button = card.locator("a.btn");
  await expect(button).toBeVisible();
});

When("I click the Manage Categories button", async function () {
  const manageCategories = this.page.locator('a:has-text("Manage Categories")');
  await manageCategories.click();
});

Then("I should be navigated to the Categories page", async function () {
  await this.page.waitForURL(/\/ui\/categories/);
  expect(this.page.url()).toMatch(/\/ui\/categories/);
});

Then("the Categories heading should be visible", async function () {
  const categoriesHeading = this.page.locator('h3:has-text("Categories")');
  await expect(categoriesHeading).toBeVisible();
});

When("I click the Manage Plants button", async function () {
  const managePlants = this.page.locator('a:has-text("Manage Plants")');
  await managePlants.click();
});

Then("I should be navigated to the Plants page", async function () {
  await this.page.waitForURL(/\/ui\/plants/);
  expect(this.page.url()).toMatch(/\/ui\/plants/);
});

Then("the Plants heading should be visible", async function () {
  const plantsHeading = this.page.locator('h3:has-text("Plants")');
  await expect(plantsHeading).toBeVisible();
});

When("I click the View Sales button", async function () {
  const viewSales = this.page.locator('a:has-text("View Sales")');
  await viewSales.click();
});

Then("I should be navigated to the Sales page", async function () {
  await this.page.waitForURL(/\/ui\/sales/);
  expect(this.page.url()).toMatch(/\/ui\/sales/);
});

Then("the Sales heading should be visible", async function () {
  const salesHeading = this.page.locator('h3:has-text("Sales")');
  await expect(salesHeading).toBeVisible();
});

When("I click on Categories from the sidebar", async function () {
  const categoriesTab = this.page.locator('a.nav-link[href="/ui/categories"]:has-text("Categories")');
  await categoriesTab.click();
});

Then("the Categories tab should have the active class", async function () {
  await this.page.waitForURL(/\/ui\/categories/);
  const activeCategoriesTab = this.page.locator('a[href="/ui/categories"]');
  await expect(activeCategoriesTab).toHaveClass(/active/);
});

When("I click on Plants from the sidebar", async function () {
  const plantsTab = this.page.locator('a.nav-link[href="/ui/plants"]:has-text("Plants")');
  await plantsTab.click();
});

Then("the Plants tab should have the active class", async function () {
  await this.page.waitForURL(/\/ui\/plants/);
  const activePlantsTab = this.page.locator('a[href="/ui/plants"]');
  await expect(activePlantsTab).toHaveClass(/active/);
});

When("I click on Sales from the sidebar", async function () {
  const salesTab = this.page.locator('a.nav-link[href="/ui/sales"]:has-text("Sales")');
  await salesTab.click();
});

Then("the Sales tab should have the active class", async function () {
  await this.page.waitForURL(/\/ui\/sales/);
  const activeSalesTab = this.page.locator('a[href="/ui/sales"]');
  await expect(activeSalesTab).toHaveClass(/active/);
});
