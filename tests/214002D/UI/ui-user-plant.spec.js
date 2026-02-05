import { test, expect } from "@playwright/test";

test.describe("UI_User_Plants Module", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ui/plants`);
    await page.locator("table").waitFor({ state: "visible" });
  });

  test("UI_User_Plants-01: Verify plants page UI elements availability", async ({
    page,
  }) => {
    await expect(page.getByPlaceholder("Search plant")).toBeVisible();

    await expect(page.locator("select[name='categoryId']")).toBeVisible();

    await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Reset" })).toBeVisible();

    await expect(
      page.getByRole("columnheader", { name: "Name" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Category" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Price" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Stock" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Actions" }),
    ).toBeVisible();
  });

  //  Need to test
  // test("UI_User_Plants-02: Verify no plants data available", async ({
  //   page,
  // }) => {
  //   const rows = page.locator("tbody tr");

  //   const rowCount = await rows.count();

  //   if (rowCount === 0) {
  //     await expect(page.getByText("No plants found")).toBeVisible();
  //   } else {
  //     test.skip(true, "Plants data exists, empty state not applicable");
  //   }
  // });

  test("UI_User_Plants-03: Verify plants pagination works correctly", async ({
    page,
    baseURL,
  }) => {
    //  PAGE 1 – VERIFY DATA

    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();

    // Capture first row text from page 1
    const firstRowPage1 = await rows.first().innerText();

    //  PAGINATION CONTROLS

    const pagination = page.locator("nav .pagination");
    await expect(pagination).toBeVisible();

    const pageItems = pagination.locator("li.page-item");
    expect(await pageItems.count()).toBeGreaterThan(1);

    // Active page should be 1
    const activePage = pagination.locator("li.page-item.active");
    await expect(activePage).toHaveText("1");

    // Previous should be disabled
    const previousBtn = pagination.locator(
      "li.page-item.disabled >> text=Previous",
    );
    await expect(previousBtn).toBeVisible();

    //  GO TO PAGE 2
    const nextBtn = pagination.locator("li.page-item >> text=Next");
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Wait a short delay for rows to load
    await page.waitForTimeout(700); // 0.7 second
    await expect(pagination.locator("li.page-item.active")).toHaveText("2");
    await expect(rows.first()).toBeVisible();

    // Capture first row text from page 2
    const firstRowPage2 = await rows.first().innerText();

    // Validate page 1 and page 2 data are different
    expect(firstRowPage2).not.toEqual(firstRowPage1);

    //  GO BACK TO PAGE 1
    const prevBtnEnabled = pagination.locator("li.page-item >> text=Previous");
    await prevBtnEnabled.click();

    // Wait a short delay for rows to load
    await page.waitForTimeout(700); // 0.7 second
    await expect(pagination.locator("li.page-item.active")).toHaveText("1");
    await expect(rows.first()).toBeVisible();

    // Re-check first row matches original page 1 data
    const firstRowPage1Again = await rows.first().innerText();
    expect(firstRowPage1Again).toEqual(firstRowPage1);
  });

  test("UI_User_Plants-04: Verify Low badge when quantity below 5", async ({
    page,
  }) => {
    const lowBadges = page.locator("span.badge.bg-danger", { hasText: "Low" });
    if (await lowBadges.count()) {
      await expect(lowBadges.first()).toBeVisible();
      await expect(lowBadges.first()).toHaveText("Low");
    } else {
      test.skip(true, "No low-stock plants available in current data");
    }
  });

  test("UI_User_Plants-05: Verify Edit button is NOT displayed", async ({
    page,
  }) => {
    const editBButton = page.getByRole("button", { name: "Edit" });

    await expect(editBButton).toHaveCount(0);
  });

  test("UI_User_Plants-06: Verify Delete button is NOT displayed", async ({
    page,
  }) => {
    const deleteButton = page.getByRole("button", { name: "Delete" });

    await expect(deleteButton).toHaveCount(0);
  });
});
