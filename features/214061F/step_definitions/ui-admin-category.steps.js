const { Given, When, Then } = require("@cucumber/cucumber");
const dotenv = require("dotenv");
const { expect } = require("@playwright/test");

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

async function ensureAdminLoggedIn(page) {
  // Always perform a fresh login, similar to tests/auth/admin.ui.setup.js
  await page.goto(`${BASE_URL}/ui/login`);

  const userName = page.locator('[name="username"]');
  const password = page.locator('[name="password"]');
  const signIn = page.locator('[type="submit"]');

  await userName.fill(process.env.ADMIN_USERNAME || "admin");
  await password.fill(process.env.ADMIN_PASSWORD || "admin123");
  await signIn.click();

  await page.waitForURL(`${BASE_URL}/ui/dashboard`);

  // Navigate to Categories page after successful login
  await page.goto(`${BASE_URL}/ui/categories`);
  await page.waitForLoadState("networkidle");
}

// NOTE: This assumes your Cucumber World provides `this.page` (Playwright Page)

Given("I am logged in as an admin", async function () {
  const page = this.page;
  await ensureAdminLoggedIn(page);
});

Given("I am on the Categories page", async function () {
  const page = this.page;
  await page.goto(`${BASE_URL}/ui/categories`);
  await page.waitForLoadState("networkidle");
});

Then("I should see the Add Category button", async function () {
  const page = this.page;
  const addCategoryButton = page.locator('a[href="/ui/categories/add"]');
  await expect(addCategoryButton).toBeVisible();
});

Then("the Add Category button should be enabled", async function () {
  const page = this.page;
  const addCategoryButton = page.locator('a[href="/ui/categories/add"]');
  await expect(addCategoryButton).toBeEnabled();
});

When("I click the Add Category button", async function () {
  const page = this.page;
  const addCategoryButton = page.locator('a[href="/ui/categories/add"]');
  await expect(addCategoryButton).toBeVisible();
  await addCategoryButton.click();
});

Then("I should be on the Add Category page", async function () {
  const page = this.page;
  await expect(page).toHaveURL(/\/ui\/categories\/add/);
});

Then(
  'the Add Category page title should be {string}',
  async function (expectedTitle) {
    const page = this.page;
    await expect(page).toHaveTitle(expectedTitle);
  }
);

When("I go to the Add Category page from Categories", async function () {
  const page = this.page;
  // Already on Categories from Background, but be explicit and reuse the same flow
  await page.goto(`${BASE_URL}/ui/categories`);
  await page.waitForLoadState("networkidle");

  const addCategoryButton = page.locator('a[href="/ui/categories/add"]');
  await expect(addCategoryButton).toBeVisible();
  await addCategoryButton.click();

  await expect(page).toHaveURL(/\/ui\/categories\/add/);
  await expect(page).toHaveTitle(/QA Training App \| Add A Category/i);
});

When("I am on the Add Category page", async function () {
  const page = this.page;
  await page.goto(`${BASE_URL}/ui/categories/add`);
  await page.waitForLoadState("networkidle");
});

When("I enter a category name {string} and save", async function (name) {
  const page = this.page;
  await page.locator('input[name="name"]').fill(name);
  await page.locator("button:has-text('Save')").click();
});

When("I enter a main category name {string} and save", async function (name) {
  const page = this.page;
  await page.locator('input[name="name"]').fill(name);
  // Parent select is left as default (Main Category)
  await page.locator("button:has-text('Save')").click();
});

When("I leave the category name empty and save", async function () {
  const page = this.page;
  await page.locator('input[name="name"]').fill("");
  await page.locator("button:has-text('Save')").click();
});

When("I type a temporary category name {string}", async function (name) {
  const page = this.page;
  await page.locator('input[name="name"]').fill(name);
});

When("I click Cancel on the Add Category form", async function () {
  const page = this.page;
  const cancelButton = page.locator('a.btn.btn-secondary[href="/ui/categories"]:has-text("Cancel")');
  await expect(cancelButton).toBeVisible();
  await cancelButton.click();
});

Then(
  "I should see a {string} validation message",
  async function (message) {
    const page = this.page;
    await expect(page.locator(`text=/${message}/i`)).toBeVisible();
  }
);

Then(
  "I should see a {string} success message",
  async function (message) {
    const page = this.page;
    const successAlert = page.locator('.alert-success');
    await expect(successAlert).toContainText(new RegExp(message, 'i'));
  }
);

Then("the category name field should be invalid", async function () {
  const page = this.page;
  await expect(page.locator('input[name="name"]')).toHaveClass(/is-invalid/);
});

Then("I should still be on the Add Category page", async function () {
  const page = this.page;
  await expect(page).toHaveURL(/\/ui\/categories\/add/);
});

Then("I should be on the Categories page", async function () {
  const page = this.page;
  await expect(page).toHaveURL(/\/ui\/categories$/);
});

Then(
  "the category {string} should not exist in the table",
  async function (name) {
    const page = this.page;
    await expect(page.locator('table')).not.toContainText(name);
  }
);

Then(
  "the category {string} should exist in the table",
  async function (name) {
    const page = this.page;
    await expect(page.locator('table')).toContainText(name);
  }
);

Then(
  "I should see the category {string} as a main category in the table",
  async function (name) {
    const page = this.page;
    const row = page.locator('table tbody tr', { hasText: name });
    await expect(row).toBeVisible();
    await expect(row).toContainText('-');
  }
);

Then(
  "I should see an Edit button for category {string}",
  async function (name) {
    const page = this.page;
    const row = page.locator('table tbody tr', { hasText: name });
    await expect(row).toBeVisible();
    const editLink = row.locator('a[title="Edit"]');
    await expect(editLink).toBeVisible();
  }
);

Then(
  "I delete the category {string} as admin",
  async function (name) {
    const page = this.page;
    // Ensure we are on Categories page
    await page.goto(`${BASE_URL}/ui/categories`);
    await page.waitForLoadState("networkidle");

    // Find row by exact name in Name column (2nd column)
    const row = page.locator('table tbody tr', {
      has: page.locator('td:nth-child(2)', { hasText: name }),
    });
    await expect(row).toBeVisible();

    // Handle confirm dialog
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    // Click Delete button in that row
    await row.locator('form[action*="/ui/categories/delete/"] button').click();

    // Verify deleted
    await expect(page.locator('.alert-success')).toContainText(/deleted successfully/i);
    await expect(
      page.locator('table tbody tr', {
        has: page.locator('td:nth-child(2)', { hasText: name }),
      })
    ).toHaveCount(0);
  }
);

When(
  "I create a sub-category {string} under parent {string}",
  async function (childName, parentName) {
    const page = this.page;
    await page.goto(`${BASE_URL}/ui/categories/add`);
    await page.waitForLoadState("networkidle");

    await page.locator('input[name="name"]').fill(childName);

    const parentSelect = page.locator('select');
    await parentSelect.selectOption({ label: parentName });

    await page.locator("button:has-text('Save')").click();
  }
);

Then(
  "I should see the category {string} with parent {string} in the table",
  async function (childName, parentName) {
    const page = this.page;
    const row = page.locator('table tbody tr', { hasText: childName });
    await expect(row).toBeVisible();
    await expect(row).toContainText(parentName);
  }
);

When(
  "I open the edit page for category {string}",
  async function (name) {
    const page = this.page;
    // Ensure on Categories page
    await page.goto(`${BASE_URL}/ui/categories`);
    await page.waitForLoadState("networkidle");

    const rows = page.locator('table tbody tr', { hasText: name });
    await expect(rows.first()).toBeVisible();
    const row = rows.last();

    // Save parent before edit for later comparison (test 19)
    this.parentBefore = await row.locator('td').nth(2).innerText();

    await row.locator('a[title="Edit"]').click();
    await expect(page).toHaveURL(/\/ui\/categories\/edit\/\d+/);
  }
);

When("I clear the category name and save", async function () {
  const page = this.page;
  const nameInput = page.locator('input[name="name"]');
  await nameInput.click();
  await nameInput.press('Control+A');
  await nameInput.press('Backspace');
  await nameInput.blur();
  await page.locator('button:has-text("Save")').click();
});

When(
  "I change the category name to {string} but do not save",
  async function (newName) {
    const page = this.page;
    const nameInput = page.locator('input[name="name"]');
    await nameInput.click();
    await nameInput.press('Control+A');
    await nameInput.type(newName);
  }
);

When(
  "I change the category name to {string} and save",
  async function (newName) {
    const page = this.page;
    const nameInput = page.locator('input[name="name"]');
    await nameInput.click();
    await nameInput.press('Control+A');
    await nameInput.type(newName);
    await page.locator('button:has-text("Save")').click();
  }
);

Then("I should still be on the Edit Category page", async function () {
  const page = this.page;
  await expect(page).toHaveURL(/\/ui\/categories\/edit\/\d+/);
});

When("I click Cancel on the Edit Category page", async function () {
  const page = this.page;
  const cancelBtn = page.getByRole('link', { name: 'Cancel' });
  await expect(cancelBtn).toBeVisible();
  await cancelBtn.click();
});

Then(
  "the category {string} should have the same parent as before",
  async function (name) {
    const page = this.page;
    const updatedRows = page.locator('table tbody tr', { hasText: name });
    await expect(updatedRows.first()).toBeVisible();
    const updatedRow = updatedRows.last();
    const parentAfter = await updatedRow.locator('td').nth(2).innerText();
    expect(parentAfter.trim()).toBe(this.parentBefore.trim());
  }
);

Then(
  "I delete the sub-category {string} and parent {string} as admin",
  async function (childName, parentName) {
    const page = this.page;
    await page.goto(`${BASE_URL}/ui/categories`);
    await page.waitForLoadState("networkidle");

    // Delete child first
    let row = page.locator('table tbody tr', {
      has: page.locator('td:nth-child(2)', { hasText: childName }),
    });
    await expect(row).toBeVisible();

    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await row.locator('form[action*="/ui/categories/delete/"] button').click();
    await expect(page.locator('.alert-success')).toContainText(/deleted successfully/i);

    await expect(
      page.locator('table tbody tr', {
        has: page.locator('td:nth-child(2)', { hasText: childName }),
      })
    ).toHaveCount(0);

    // Then delete parent
    row = page.locator('table tbody tr', {
      has: page.locator('td:nth-child(2)', { hasText: parentName }),
    });
    await expect(row).toBeVisible();

    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await row.locator('form[action*="/ui/categories/delete/"] button').click();
    await expect(page.locator('.alert-success')).toContainText(/deleted successfully/i);

    await expect(
      page.locator('table tbody tr', {
        has: page.locator('td:nth-child(2)', { hasText: parentName }),
      })
    ).toHaveCount(0);
  }
);