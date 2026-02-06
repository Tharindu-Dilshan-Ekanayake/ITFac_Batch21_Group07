import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import {createCategoryAsAdmin,deleteCategoryAsAdmin} from "./functions/api-category-function-admin.js"; // for cleanup

dotenv.config();

// Ensure normal user is logged in for UI tests
async function ensureUserLoggedIn(page, baseURL) {
  await page.goto(`${baseURL}/ui/categories`);
  await page.waitForLoadState("networkidle");

  if (page.url().includes("/ui/login")) {
    const userName = page.locator('[name="username"]');
    const password = page.locator('[name="password"]');
    const signIn = page.locator('[type="submit"]');

    await userName.fill(process.env.USER_USERNAME || "testuser");
    await password.fill(process.env.USER_PASSWORD || "test123");
    await signIn.click();

    await page.waitForURL(`${baseURL}/ui/dashboard`);

    await page.goto(`${baseURL}/ui/categories`);
    await page.waitForLoadState("networkidle");
  }
}

//test 11
test("UI_User_Categories-11: Edit button should not be visible for user", async ({ page, baseURL }) => {
  // 1) Create a category via ADMIN API so there is data
  const created = await createCategoryAsAdmin("EDITBT"); // 6 chars, valid
  const categoryId = created.id;

  try {
    // 2) Ensure USER is logged in and on categories page
    await ensureUserLoggedIn(page, baseURL);

    await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();

    // prove it's USER view: no Add Category link
    await expect(page.getByRole("link", { name: /Add A Category/i })).toHaveCount(0);

    // optional: ensure our created category is visible somewhere in the table
    await expect(page.locator("table tbody tr", { hasText: "EDITBT" })).toBeVisible();

    // main check: no Edit buttons in the table for user
    await expect(page.locator('table tbody tr a[title="Edit"]')).toHaveCount(0);
  } finally {
    // 3) Cleanup via ADMIN API
    if (categoryId) {
      await deleteCategoryAsAdmin(categoryId);
    }
  }
});

//test 12
test("UI_User_Categories-12: Delete button should not be visible for user", async ({ page, baseURL }) => {
  // 1) Create a category via ADMIN API so there is data
  const created = await createCategoryAsAdmin("DELTEST"); // 7 chars, valid
  const categoryId = created.id;

  try {
    // 2) Ensure USER is logged in and on categories page
    await ensureUserLoggedIn(page, baseURL);

    await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();

    // prove it's USER view: no Add Category link
    await expect(page.getByRole("link", { name: /Add A Category/i })).toHaveCount(0);

    // optional: ensure our created category is visible somewhere in the table
    await expect(page.locator("table tbody tr", { hasText: "DELTEST" })).toBeVisible();

    // main check: no Delete buttons/forms in the table for user
    await expect(
      page.locator('table tbody tr form[action*="/ui/categories/delete"]')
    ).toHaveCount(0);
  } finally {
    // 3) Cleanup via ADMIN API
    if (categoryId) {
      await deleteCategoryAsAdmin(categoryId);
    }
  }
});

//test 13
test("UI_User_Categories-13: should show 'No category found' when no categories exist", async ({
  page,
  baseURL,
}) => {
  // 1️⃣ Navigate to Categories page as USER
  await ensureUserLoggedIn(page, baseURL);

  // 2️Verify Categories page loaded
  await expect(
    page.getByRole("heading", { name: "Categories" })
  ).toBeVisible();

  // 3Verify EMPTY STATE message (from your screenshot)
  await expect(
    page.getByText("No category found")
  ).toBeVisible();

  // 4Ensure no category names exist in table
  const dataRows = page.locator("table tbody tr td", {
    hasNotText: "No category found",
  });

  await expect(dataRows).toHaveCount(0);
});

//test 14
test("UI_User_Categories-14: pagination works and each page has different data", async ({ page, baseURL }) => {
  const createdCategoryIds = [];
  try {
    // Create 12 categories for pagination test
    for (let i = 1; i <= 12; i++) {
      const categoryName = `Pagi${i}`;
      const created = await createCategoryAsAdmin(categoryName);
      if (created && created.id) {
        createdCategoryIds.push(created.id);
      }
    }

    await ensureUserLoggedIn(page, baseURL);

    const table = page.locator("table");
    await expect(table).toBeVisible();

    const pagination = page.locator("ul.pagination");
    await expect(pagination).toBeVisible();

    const pageLinks = pagination.locator("a.page-link").filter({ hasText: /^\d+$/ });
    const pageCount = await pageLinks.count();

    if (pageCount <= 1) test.skip(true, "Only one page exists, cannot validate pagination differences.");

    const getIdsOnCurrentPage = async () => {
      const rows = table.locator("tbody tr");

      if (await rows.filter({ hasText: /no category found/i }).count()) return [];

      const ids = await rows.locator("td:nth-child(1)").allInnerTexts();
      return ids.map((x) => x.trim()).filter(Boolean);
    };

    const pageData = [];

    for (let i = 0; i < pageCount; i++) {
      const link = pageLinks.nth(i);

      // read expected href before click
      const href = await link.getAttribute("href");
      expect(href).toBeTruthy();

      await link.click();
      await page.waitForLoadState("networkidle");

      // verify URL contains that href
      await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

      const ids = await getIdsOnCurrentPage();
      expect(ids.length).toBeGreaterThan(0);

      pageData.push({ label: await link.innerText(), ids });
    }

    // compare pages: must be different
    for (let i = 0; i < pageData.length - 1; i++) {
      const setA = new Set(pageData[i].ids);
      const setB = new Set(pageData[i + 1].ids);

      const overlap = [...setA].filter((id) => setB.has(id));
      expect(overlap, `Overlap between page ${pageData[i].label} and ${pageData[i + 1].label}: ${overlap.join(", ")}`)
        .toHaveLength(0);
    }
  } finally {
    // Cleanup: delete all created categories
    for (const categoryId of createdCategoryIds) {
      await deleteCategoryAsAdmin(categoryId);
    }
  }
});

//test 15
test("UI_User_Categories-15: Add Category button should not be visible for user", async ({ page, baseURL }) => {
  // 1) Navigate to Categories page as USER
  await ensureUserLoggedIn(page, baseURL);

  // 2) Categories heading visible
  await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();

  // 3) Assert Add Category button/link is NOT visible
  // In admin UI it's usually: <a> Add A Category </a>
  const addCategoryBtn = page.getByRole("link", { name: /add a category/i });

  await expect(addCategoryBtn).toHaveCount(0);

  // Optional: table visible
  await expect(page.locator("table")).toBeVisible();
});

