import { test, expect, request } from "@playwright/test";
import { getUserApiContext } from "../../utils/api-user"; 
import { createCategoryAsAdmin, deleteCategoryAsAdmin } from "./functions/api-category-function-admin.js";
// ⬆️ this should attach USER token, not admin

test("API_USER-16: Prevent category creation by unauthorized user", async () => {
  const context = await getUserApiContext();

  const payload = {
    name: "Unt"
  };

  const res = await context.post("/api/categories", {
    data: payload,
  });

  // ✅ must be forbidden
  expect(res.status(), await res.text()).toBe(403);

  const body = await res.json();

  // ✅ optional but good assertions
  expect(body).toHaveProperty("status", 403);
  expect(body).toHaveProperty("error");
});

/**
 * API_USER-17: Update category unauthorized
 * Ensure user can not update category
 * Preconditions: Valid user token, Valid category ID
 * Steps:
 *   1. Provide valid category ID
 *   2. Provide updated name
 *   3. Send PUT /api/categories/{id}
 * Expected: 403 Forbidden
 */
test("API_USER-17: Update category unauthorized", async () => {
  // 1) Create category using helper function (admin role)
  const randomNumber = Math.floor(Math.random() * 1000);
  const category = await createCategoryAsAdmin(`TestCat${randomNumber}`);
  const categoryId = category.id;

  // 2) Try to UPDATE the category using USER context (should be forbidden)
  const userContext = await getUserApiContext();

  const updatePayload = {
    name: `UpdatedCat${randomNumber}`,
  };

  // 3) Send PUT /api/categories/{id}
  const updateRes = await userContext.put(`/api/categories/${categoryId}`, {
    data: updatePayload,
  });

  // Expected: 403 Forbidden
  expect(updateRes.status(), await updateRes.text()).toBe(403);

  const body = await updateRes.json();
  expect(body).toHaveProperty("status", 403);
  expect(body).toHaveProperty("error");

  // Cleanup: delete the category using helper function
  await deleteCategoryAsAdmin(categoryId);
});

/**
 * API_USER-18: Delete category unauthorized
 * Ensure user can not delete existing category
 * Preconditions: Valid user token, Valid category ID
 * Steps:
 *   1. Provide valid category ID
 *   2. Send DELETE /api/categories/{id}
 * Expected: 403 Forbidden
 */
test("API_USER-18: Delete category unauthorized", async () => {
  // 1) Create category using helper function (admin role)
  const randomNumber = Math.floor(Math.random() * 1000);
  const category = await createCategoryAsAdmin(`TestCat${randomNumber}`);
  const categoryId = category.id;

  // 2) Try to DELETE the category using USER context (should be forbidden)
  const userContext = await getUserApiContext();

  const deleteRes = await userContext.delete(`/api/categories/${categoryId}`);

  // Expected: 403 Forbidden
  expect(deleteRes.status(), await deleteRes.text()).toBe(403);

  const body = await deleteRes.json();
  expect(body).toHaveProperty("status", 403);
  expect(body).toHaveProperty("error");

  // Cleanup: delete the category using helper function (admin)
  await deleteCategoryAsAdmin(categoryId);
});

/**
 * API_USER-19: Create category without token
 * Ensure category creation is blocked without authentication
 * Preconditions: No token
 * Steps:
 *   1. Send POST /api/categories with valid category name
 * Expected: 401 Unauthorized
 */
test("API_USER-19: Create category without token", async () => {
  // Create context WITHOUT any token
  const context = await request.newContext({
    baseURL: process.env.BASE_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  });

  const payload = {
    name: `NoAuthCat${Math.floor(Math.random() * 1000)}`,
  };

  // 1) Send POST /api/categories with valid category name (no token)
  const res = await context.post("/api/categories", {
    data: payload,
  });

  // Expected: 401 Unauthorized
  expect(res.status(), await res.text()).toBe(401);

  const body = await res.json();
  expect(body).toHaveProperty("status", 401);
  expect(body).toHaveProperty("error");
});

/**
 * API_USER-20: Update category without token
 * Ensure category update is blocked without authentication
 * Preconditions: No token, admin creates category first
 * Steps:
 *   1. Send PUT /api/categories/{id}
 * Expected: 401 Unauthorized
 */
test("API_USER-20: Update category without token", async () => {
  // 1) Create category using admin first
  const randomNumber = Math.floor(Math.random() * 1000);
  const category = await createCategoryAsAdmin(`TestCat${randomNumber}`);
  const categoryId = category.id;

  // 2) Create context WITHOUT any token
  const context = await request.newContext({
    baseURL: process.env.BASE_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  });

  const updatePayload = {
    name: `UpdatedNoAuth${randomNumber}`,
  };

  // 3) Send PUT /api/categories/{id} without token
  const res = await context.put(`/api/categories/${categoryId}`, {
    data: updatePayload,
  });

  // Expected: 401 Unauthorized
  expect(res.status(), await res.text()).toBe(401);

  const body = await res.json();
  expect(body).toHaveProperty("status", 401);
  expect(body).toHaveProperty("error");

  // Cleanup: delete the category using admin
  await deleteCategoryAsAdmin(categoryId);
});

/**
 * API_USER-21: Delete category without token
 * Ensure category deletion is blocked without authentication
 * Preconditions: No token, admin creates category first
 * Steps:
 *   1. Send DELETE /api/categories/{id}
 * Expected: 401 Unauthorized
 */
test("API_USER-21: Delete category without token", async () => {
  // 1) Create category using admin first
  const randomNumber = Math.floor(Math.random() * 1000);
  const category = await createCategoryAsAdmin(`TestCat${randomNumber}`);
  const categoryId = category.id;

  // 2) Create context WITHOUT any token
  const context = await request.newContext({
    baseURL: process.env.BASE_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  });

  // 3) Send DELETE /api/categories/{id} without token
  const res = await context.delete(`/api/categories/${categoryId}`);

  // Expected: 401 Unauthorized
  expect(res.status(), await res.text()).toBe(401);

  const body = await res.json();
  expect(body).toHaveProperty("status", 401);
  expect(body).toHaveProperty("error");

  // Cleanup: delete the category using admin
  await deleteCategoryAsAdmin(categoryId);
});



