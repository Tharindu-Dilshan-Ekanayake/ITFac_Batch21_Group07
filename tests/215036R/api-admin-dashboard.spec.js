import { test, expect } from "@playwright/test";
import { getAdminApiContext } from "../../utils/api-admin";


test("Get categories summary", async ({ baseURL }) => {
    const context = await getAdminApiContext(baseURL);
    const response = await context.get(`/api/categories/summary`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // Response validation
    expect(data).toHaveProperty("mainCategories");
    expect(data).toHaveProperty("subCategories");
});

test("Get all plants", async ({ baseURL }) => {
    const context = await getAdminApiContext(baseURL);
    const response = await context.get(`/api/plants`);
    expect(response.status()).toBe(200);
    const data = await response.json();

    // Structure validation
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
});

test("Get plants summary", async({ baseURL }) => {
    const context = await getAdminApiContext(baseURL);
    const response = await context.get(`/api/plants/summary`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // Response validation
    expect(data).toHaveProperty("totalPlants");
    expect(data).toHaveProperty("lowStockPlants");
});

test("Get all sales", async ({ baseURL }) => {
    const context = await getAdminApiContext(baseURL);
    const response = await context.get(`/api/sales`);
    expect(response.status()).toBe(200);
    const data = await response.json();

    // Structure validation
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
});

test("API Health Check", async ({ baseURL }) => {
    const context = await getAdminApiContext(baseURL);
    const response = await context.get(`/api/health`);
    expect(response.status()).toBe(200);
});