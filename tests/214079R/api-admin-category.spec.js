import { test, expect } from "@playwright/test";
import { getAdminApiContext } from "../../utils/api-admin";


test("Get category by valid ID", async () => {
    const context = await getAdminApiContext();
    const response = await context.get(`/api/categories/6`); // ID 6 selected cause that item exists in the database
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // Response validation
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("name");
    expect(data).toHaveProperty("parentId");
});

test("Get category by invalid ID", async () => {
    const context = await getAdminApiContext();
    const response = await context.get(`/api/categories/999`); // ID 999 selected cause that item does not exist in the database
    expect(response.status()).toBe(404);
});

test("Get sub-categories", async () => {
    const context = await getAdminApiContext();
    const response = await context.get(`/api/categories/sub-categories`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    // Verify atleast one object is having properties
    expect(data[0]).toHaveProperty("id");
    expect(data[0]).toHaveProperty("name");
    expect(data[0]).toHaveProperty("subCategories");
});

test("Search categories with pagination", async () => {
    const context = await getAdminApiContext();
    // Page count set to 0, items per page set to 10, and name set as anthuriam
    const response = await context.get(`api/categories/page?page=0&size=10&name=anthuriam`); 
    expect(response.status()).toBe(200);
    const data = await response.json();

    // Verify response have relevant properties
    expect(data).toHaveProperty("totalPages");
    expect(data).toHaveProperty("pageable");
    expect(data).toHaveProperty("content");
    expect(data).toHaveProperty("last");
    expect(data).toHaveProperty("size");
    expect(data).toHaveProperty("number");
    expect(data).toHaveProperty("sort");
    expect(data).toHaveProperty("first");
    expect(data).toHaveProperty("numberOfElements");
    expect(data).toHaveProperty("empty");
});

test("Get all categories", async () => {
    const context = await getAdminApiContext();
    const response = await context.get(`/api/categories`);
    // Response validation
    expect(response.status()).toBe(200);

    // Verify response have relevant properties
    const data = await response.json();
    expect(data[0]).toHaveProperty("id");
    expect(data[0]).toHaveProperty("name");
    expect(data[0]).toHaveProperty("parentName");
});