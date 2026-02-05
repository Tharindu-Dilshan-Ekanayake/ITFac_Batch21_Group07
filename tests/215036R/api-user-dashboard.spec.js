import { test, expect, request } from "@playwright/test";
import { getUserApiContext } from "../../utils/api-user";

test("Get all categories", async ({ baseURL }) => {
    const context = await getUserApiContext(baseURL);
    const response = await context.get(`/api/categories`);
    expect(response.status()).toBe(200);
    const data = await response.json();

    // Structure validation
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
});

test("Get category summary", async ({ baseURL }) => {
    const context = await getUserApiContext(baseURL);
    const response = await context.get(`/api/categories/summary`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // Response validation
    expect(data).toHaveProperty("mainCategories");
    expect(data).toHaveProperty("subCategories");
});

test("Get all plants", async ({ baseURL }) => {
    const context = await getUserApiContext(baseURL);
    const response = await context.get(`/api/plants`);
    expect(response.status()).toBe(200);
    const data = await response.json();

    // Structure validation
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
});

test("Get plants summary", async({ baseURL }) => {
    const context = await getUserApiContext(baseURL);
    const response = await context.get(`/api/plants/summary`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // Response validation
    expect(data).toHaveProperty("totalPlants");
    expect(data).toHaveProperty("lowStockPlants");
});

test("Get all sales", async ({ baseURL }) => {
    const context = await getUserApiContext(baseURL);
    const response = await context.get(`/api/sales`);
    expect(response.status()).toBe(200);
    const data = await response.json();

    // Structure validation
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
});

test("Prevent access without token", async ({ baseURL }) => {
  const context = await request.newContext({
    baseURL
    // No headers = no token
  });

  const response = await context.get("/api/categories");
  expect([401, 403]).toContain(response.status());

  const data = await response.json();
  expect(data.message || data.error).toBeDefined();
});

test("Prevent access with invalid token", async ({ baseURL }) => {
  const context = await request.newContext({
    baseURL,
    extraHTTPHeaders: {
      Authorization: "Bearer THIS_IS_A_FAKE_TOKEN_12345"
    }
  });

  const response = await context.get("/api/plants");

  expect(response.status()).toBe(401);

  const body = await response.json();

  expect(body.message || body.error).toBeDefined();
});
