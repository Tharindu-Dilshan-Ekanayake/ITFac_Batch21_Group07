import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import {
  createTestPlants,
  deleteTestPlants,
  loginUserForUI,
} from "../../../utils/plant-setup";

dotenv.config();


test.describe.serial("UI_User_Plants - No Data Scenario", () => {
  test("UI_User_Plants-02: Ensure there is no plants data available", async ({
    page,
    baseURL,
  }) => {
    await loginUserForUI(baseURL, page);
    await page.goto(`${baseURL}/ui/plants`);

    const emptyRow = page.locator("tbody tr td.text-muted");
    await expect(emptyRow).toBeVisible();
    await expect(emptyRow).toHaveText("No plants found");
  });
});


test.describe.serial("UI_User_Plants Module", () => {
  let testData;

  //  Create test data
  test.beforeAll(async ({ baseURL }) => {
    testData = await createTestPlants(baseURL);
  });

  // Delete test data
  test.afterAll(async ({ baseURL }) => {
    await deleteTestPlants(baseURL, testData);
  });

  // Test cases
  test("UI_User_Plants-01: Verify plants page UI elements availability", async ({
    page,
    baseURL,
  }) => {
    await loginUserForUI(baseURL, page);
    await page.goto(`${baseURL}/ui/plants`);
    await page.locator("table").waitFor({ state: "visible" });

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

  test("UI_User_Plants-04: Verify Low badge when quantity below 5", async ({
    page,
    baseURL,
  }) => {
    await loginUserForUI(baseURL, page);
    await page.goto(`${baseURL}/ui/plants`);
    await page.locator("table").waitFor({ state: "visible" });

    const lowBadge = page.locator("span.badge.bg-danger", { hasText: "Low" });
    await expect(lowBadge.first()).toBeVisible();
    await expect(lowBadge.first()).toHaveText("Low");
  });

 
  test("UI_User_Plants-05: Verify Edit button is NOT displayed", async ({
    page,
    baseURL,
  }) => {
    await loginUserForUI(baseURL, page);
    await page.goto(`${baseURL}/ui/plants`);

    const editButton = page.getByRole("button", { name: "Edit" });
    await expect(editButton).toHaveCount(0);
  });

  
  test("UI_User_Plants-06: Verify Delete button is NOT displayed", async ({
    page,
    baseURL,
  }) => {
    await loginUserForUI(baseURL, page);
    await page.goto(`${baseURL}/ui/plants`);

    const deleteButton = page.getByRole("button", { name: "Delete" });
    await expect(deleteButton).toHaveCount(0);
  });
});
