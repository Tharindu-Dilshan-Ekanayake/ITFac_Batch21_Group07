import { request, expect } from "@playwright/test";

// Utility functions for API interactions and test data management

async function login(baseURL, username, password) {
  const context = await request.newContext();
  const response = await context.post(`${baseURL}/api/auth/login`, {
    data: { username, password },
  });
  expect(response.status()).toBe(200);
  const { token } = await response.json();
  return token;
}

export async function loginAdmin(baseURL) {
  return await login(
    baseURL,
    process.env.ADMIN_USERNAME,
    process.env.ADMIN_PASSWORD,
  );
}

export async function loginUserForUI(baseURL, page) {

  await page.goto(`${baseURL}/ui/login`);
  const userName = page.locator('[name="username"]');
  const password = page.locator('[name="password"]');
  const signIn = page.locator('[type="submit"]');

  await userName.fill(process.env.USER_USERNAME);
  await password.fill(process.env.USER_PASSWORD);
  await signIn.click();

  await page.waitForURL(`${baseURL}/ui/dashboard`);
}

// Get API context with admin token for authenticated requests
export async function getApiContextWithToken(token) {
  return request.newContext({
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

// Create test plants and categories for testing

export async function createTestPlants(baseURL) {
  const adminToken = await loginAdmin(baseURL);
  const adminContext = await getApiContextWithToken(adminToken);

  const r1 = Math.floor(Math.random() * 1000);
  const r2 = Math.floor(Math.random() * 1000);

  // Parent Category
  const parentRes = await adminContext.post(`${baseURL}/api/categories`, {
    data: { name: `parent-${r1}`, parent: {}, subCategories: [] },
  });
  expect(parentRes.status()).toBe(201);
  const parentCategory = await parentRes.json();

  // Child Category
  const childRes = await adminContext.post(`${baseURL}/api/categories`, {
    data: {
      name: `child-${r2}`,
      parent: { id: parentCategory.id },
      subCategories: [],
    },
  });
  expect(childRes.status()).toBe(201);
  const childCategory = await childRes.json();

  // Plant
  const plantRes = await adminContext.post(
    `${baseURL}/api/plants/category/${childCategory.id}`,
    {
      data: {
        name: `Low Stock Plant ${r2}`,
        price: 150,
        quantity: 3,
        categoryId: childCategory.id,
      },
    },
  );
  expect(plantRes.status()).toBe(201);
  const plant = await plantRes.json();

  return {
    plantId: plant.id,
    categoryId: childCategory.id,
    parentCategoryId: parentCategory.id,
  };
}

// Delete test plants and categories after testing
export async function deleteTestPlants(baseURL, ids) {
  const adminToken = await loginAdmin(baseURL);
  const adminContext = await getApiContextWithToken(adminToken);

  if (ids.plantId)
    await adminContext.delete(`${baseURL}/api/plants/${ids.plantId}`);
  if (ids.categoryId)
    await adminContext.delete(`${baseURL}/api/categories/${ids.categoryId}`);
  if (ids.parentCategoryId)
    await adminContext.delete(
      `${baseURL}/api/categories/${ids.parentCategoryId}`,
    );
}
