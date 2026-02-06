import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import dotenv from "dotenv";
import {
  price,
  quantityLow,
  quantityNormal,
  generatePlantNames,
} from "../../../tests/214002D/data/plant.data.js";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

const {
  plantNameNormal,
  plantNameLow,
  plantUpdateName,
  plantDeleteName,
} = generatePlantNames();

const fillPlantForm = async (page, name, category, price, quantity) => {
  if (name !== null) {
    await page.locator("#name").fill("");
    await page.locator("#name").fill(name);
  }

  if (category !== null && category !== "") {
    await page.locator("#categoryId").selectOption(category);
  }

  if (price !== null) {
    await page.locator("#price").fill("");
    await page.locator("#price").fill(price);
  }

  if (quantity !== null) {
    await page.locator("#quantity").fill("");
    await page.locator("#quantity").fill(quantity);
  }
};

const fieldError = (page, selector) =>
  page.locator(`${selector} + div, ${selector} ~ div`);

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

Given("I am logged in as an admin 214002D_Admin", async function () {
  const page = this.page;
  await ensureAdminLoggedIn(page);
});

Given("I have created test categories 214002D_Admin", async function () {
  const { CategoryCreateName1, CategoryCreateName2 } = generatePlantNames();
  const page = this.page;
  const parentCreateName1 = CategoryCreateName1;
  const parentCreateName2 = CategoryCreateName2;

  console.log(
    `Creating categories: ${parentCreateName1}, ${parentCreateName2}`,
  );
  await page.goto(`${BASE_URL}/ui/categories`);
  await page.locator('a[href="/ui/categories/add"]').click();
  await page.locator('input[name="name"]').fill(parentCreateName1);
  await page.getByRole("button", { name: /save/i }).click();

  await page.locator('a[href="/ui/categories/add"]').click();
  await page.locator('input[name="name"]').fill(parentCreateName2);
  await page.getByRole("button", { name: /save/i }).click();

  const table = page.locator("table");
  await expect(table).toBeVisible();

  const firstRow = page.locator("tr", { hasText: parentCreateName1 });
  const secondRow = page.locator("tr", { hasText: parentCreateName2 });

  const firstCategoryId = (
    await firstRow.locator("td").nth(0).textContent()
  ).trim();
  const secondCategoryId = (
    await secondRow.locator("td").nth(0).textContent()
  ).trim();

  this.TestCategoryId_1 = firstCategoryId;
  this.TestCategoryId_2 = secondCategoryId;
  this.categoryId = secondCategoryId;
  console.log(`Category IDs: ${firstCategoryId}, ${secondCategoryId}`);

  await secondRow.locator('a[title="Edit"]').click();
  await page.locator("#parentId").selectOption({ value: firstCategoryId });
  await page.getByRole("button", { name: /save/i }).click();
  await expect(page).toHaveURL(/\/ui\/categories$/);
  console.log("Category setup complete");
});

When("I go to the Admin Plants page 214002D_Admin", async function () {
  const page = this.page;
  await page.goto(`${BASE_URL}/ui/plants`);
});

When("I click on the Add A Plant link 214002D_Admin", async function () {
  const page = this.page;
  await page.getByRole("link", { name: /add a plant/i }).click();
});

Then("I should see the plant form 214002D_Admin", async function () {
  const page = this.page;
  await expect(page.locator("form")).toBeVisible();
});

When("I am on the Add Plant page 214002D_Admin", async function () {
  const page = this.page;
  await page.goto(`${BASE_URL}/ui/plants/add`);
});

When(
  "I fill the plant form with name {string}, category {string}, price {string}, and quantity {string} 214002D_Admin",
  async function (name, category, priceVal, quantityVal) {
    const page = this.page;
    console.log(
      `Filling form: name="${name}", category="${category}", price="${priceVal}", quantity="${quantityVal}"`,
    );
    // Map "Test" to actual categoryId if necessary, or just use categoryId from world
    const catId = category === "" ? "" : this.categoryId;
    await fillPlantForm(page, name, catId, priceVal, quantityVal);

    if (name === "" || name === "AB" || name.length > 25) {
      console.log("Clicking price field to trigger validation");
      await page.locator("#price").click(); // Trigger validation if needed as per spec
    }
  },
);

When("I click the Save button 214002D_Admin", async function () {
  const page = this.page;
  console.log("Clicking Save button");
  await page.getByRole("button", { name: /save/i }).click();
});

Then(
  "I should see a validation error {string} for field {string} 214002D_Admin",
  async function (errorMessage, selector) {
    const page = this.page;
    console.log(`Expecting error "${errorMessage}" on ${selector}`);
    const error = fieldError(page, selector);
    await expect(error).toBeVisible({ timeout: 10000 });
    await expect(error).toContainText(new RegExp(errorMessage, "i"));
    console.log("Error found");
  },
);

When("I create a plant with low stock 214002D_Admin", async function () {
  const page = this.page;
  await fillPlantForm(page, plantNameLow, this.categoryId, price, quantityLow);
  await page.getByRole("button", { name: /save/i }).click();
});

Then(
  "I should see a success message {string} 214002D_Admin",
  async function (message) {
    const page = this.page;
    const alert = page.locator(".alert.alert-success");
    await expect(alert).toBeVisible();
    await expect(alert.locator("span")).toHaveText(new RegExp(message, "i"));
  },
);

Then(
  "the plant should have a {string} badge in the table 214002D_Admin",
  async function (badgeText) {
    const page = this.page;
    const row = page.locator("tr", { hasText: plantNameLow });
    await expect(row).toBeVisible();
    const stockCell = row.locator("td").nth(3);
    await expect(stockCell.locator(".text-danger")).toHaveText(quantityLow);
    const badge = stockCell.locator("span.badge.bg-danger");
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText(badgeText);
  },
);

When("I fill the plant form with valid data 214002D_Admin", async function () {
  const page = this.page;
  await fillPlantForm(
    page,
    plantNameNormal,
    this.categoryId,
    price,
    quantityNormal,
  );
});

When("I click the Cancel link 214002D_Admin", async function () {
  const page = this.page;
  await page.getByRole("link", { name: /cancel/i }).click();
});

Then(
  "I should be redirected to the Admin Plants page 214002D_Admin",
  async function () {
    const page = this.page;
    await expect(page).toHaveURL(/\/ui\/plants$/);
  },
);

When("I edit the plant to increase quantity 214002D_Admin", async function () {
  const page = this.page;
  const createdRow = page.locator("tr", { hasText: plantNameLow });
  const editButton = createdRow.locator('a[title="Edit"]');
  await editButton.click();
  await page.locator("#quantity").fill("8");
  await page.getByRole("button", { name: /save/i }).click();
});

Then(
  "the plant quantity should be updated in the table 214002D_Admin",
  async function () {
    const page = this.page;
    const updatedRow = page.locator("tr", { hasText: plantNameLow });
    const stockCell = updatedRow.locator("td").nth(3);
    await expect(stockCell).toContainText("8");
  },
);

When("I create a plant 214002D_Admin", async function () {
  const page = this.page;
  await page.goto(`${BASE_URL}/ui/plants/add`);
  await fillPlantForm(
    page,
    plantNameNormal,
    this.categoryId,
    price,
    quantityNormal,
  );
  await page.getByRole("button", { name: /save/i }).click();
});

When("I delete the plant 214002D_Admin", async function () {
  const page = this.page;
  const row = page.locator("tr", { hasText: plantNameNormal });
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await row.locator('button[title="Delete"]').click();
});

Then("the plant should not be in the table 214002D_Admin", async function () {
  const page = this.page;
  await expect(page.locator("tr", { hasText: plantNameNormal })).toHaveCount(0);
});
