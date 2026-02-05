import { test, expect } from "@playwright/test";

//test 11
test("UI_User_Categories-11: Edit button should not be visible for user", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/ui/categories`);
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();

  // prove it's USER view
  await expect(page.getByRole("link", { name: /Add A Category/i })).toHaveCount(0);
  await expect(page.getByRole("columnheader", { name: "Actions" })).toHaveCount(0);

  await expect(page.locator('a[title="Edit"]')).toHaveCount(0);
});

//test 12
test("UI_User_Categories-12: Delete button should not be visible for user", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/ui/categories`);
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();

  // prove it's USER view
  await expect(page.getByRole("link", { name: /Add A Category/i })).toHaveCount(0);
  await expect(page.getByRole("columnheader", { name: "Actions" })).toHaveCount(0);

  await expect(page.locator('form[action*="/ui/categories/delete"]')).toHaveCount(0);
});

// logout and login  admin side

//test 13
test("UI_User_Categories-13: should show 'No category found' when no categories exist", async ({
  page,
  baseURL,
}) => {
  // 1️⃣ Navigate to Categories page as USER
  await page.goto(`${baseURL}/ui/categories`);
  await page.waitForLoadState("networkidle");

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

test.only("UI_User_Categories-14: pagination works and each page has different data", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/ui/categories`);
  await page.waitForLoadState("networkidle");

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

    // ✅ read expected href before click
    const href = await link.getAttribute("href");
    expect(href).toBeTruthy();

    await link.click();
    await page.waitForLoadState("networkidle");

    // ✅ verify URL contains that href
    await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

    const ids = await getIdsOnCurrentPage();
    expect(ids.length).toBeGreaterThan(0);

    pageData.push({ label: await link.innerText(), ids });
  }

  // ✅ compare pages: must be different
  for (let i = 0; i < pageData.length - 1; i++) {
    const setA = new Set(pageData[i].ids);
    const setB = new Set(pageData[i + 1].ids);

    const overlap = [...setA].filter((id) => setB.has(id));
    expect(overlap, `Overlap between page ${pageData[i].label} and ${pageData[i + 1].label}: ${overlap.join(", ")}`)
      .toHaveLength(0);
  }
});


//test 15
test("UI_User_Categories-15: Add Category button should not be visible for user", async ({ page, baseURL }) => {
  // 1) Navigate to Categories page as USER
  await page.goto(`${baseURL}/ui/categories`);
  await page.waitForLoadState("networkidle");

  // 2) Categories heading visible
  await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();

  // 3) Assert Add Category button/link is NOT visible
  // In admin UI it's usually: <a> Add A Category </a>
  const addCategoryBtn = page.getByRole("link", { name: /add a category/i });

  await expect(addCategoryBtn).toHaveCount(0);

  // Optional: table visible
  await expect(page.locator("table")).toBeVisible();
});

