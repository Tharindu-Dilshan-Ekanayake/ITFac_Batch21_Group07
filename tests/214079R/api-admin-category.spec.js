import { test, expect } from "@playwright/test";
import { getAdminApiContext } from "../../utils/api-admin";


test("Get category by valid ID", async () => {
    const context = await getAdminApiContext();
    const randomNumber = Math.floor(Math.random() * 1000);
    // First create a category
    const createPayload = {
        name: `new${randomNumber}`,
        parent: {},
        subCategories: []
    };
    const createResponse = await context.post('/api/categories', {
        data: createPayload
    });
    const createData = await createResponse.json();
    expect(createResponse.status()).toBe(201);

    // Get the category
    const response = await context.get(`/api/categories/${createData.id}`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // Response validation
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("name");
    expect(data).toHaveProperty("parentId");

    // Delete the category
    const deleteResponse = await context.delete(`/api/categories/${createData.id}`);
    expect(deleteResponse.status()).toBe(204);
});

test("Get category by invalid ID", async () => {
    const context = await getAdminApiContext();
    const response = await context.get(`/api/categories/999`); // ID 999 selected cause that item does not exist in the database
    expect(response.status()).toBe(404);
});

test("Get sub-categories", async () => {
    const context = await getAdminApiContext();
    const randomNumber = Math.floor(Math.random() * 1000);

    // First create a category
    const createPayload = {
        name: `new${randomNumber}`,
        parent: {},
        subCategories: []
    };
    const createResponse = await context.post('/api/categories', {
        data: createPayload
    });
    const createData = await createResponse.json();
    expect(createResponse.status()).toBe(201);

    // create a sub-category
    const subCategoryPayload = {
        name: `s${randomNumber}`,
        parent: { id: createData.id }
    };
    const subCategoryResponse = await context.post('/api/categories', {
        data: subCategoryPayload
    });
    expect(subCategoryResponse.status()).toBe(201);

    // Get all sub-categories
    const response = await context.get(`/api/categories/sub-categories`);
    expect(response.status()).toBe(200);

    const data = await response.json();

    if(data.length>0){
        // Verify atleast one object is having properties
        expect(data[0]).toHaveProperty("id");
        expect(data[0]).toHaveProperty("name");
        expect(data[0]).toHaveProperty("subCategories");
    }   
});

test("Search categories with pagination", async () => {
    const context = await getAdminApiContext();
    const response = await context.get(`/api/categories/page?page=0&size=10&name=anthuriam`);
    expect(response.status()).toBe(200);

    const data = await response.json();

    // Verify top-level pagination properties
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

    // Verify content
    if (data.content.length > 0) {
        data.content.forEach(item => {
            expect(item).toHaveProperty("id");
            expect(item).toHaveProperty("name");
            expect(item).toHaveProperty("parent");
            expect(item).toHaveProperty("subCategories");
        });
    }
});

test("Get all categories", async () => {
    const context = await getAdminApiContext();
    const createdCategoryIds = [];

    // Create 10 categories
    for(let i = 0; i < 10; i++) {
        const randomNumber = Math.floor(Math.random() * 1000);
        const createPayload = {
            name: `new${randomNumber}`,
            parent: {},
            subCategories: []
        };
        const createResponse = await context.post('/api/categories', {
            data: createPayload
        });
        expect(createResponse.status()).toBe(201);
        const data = await createResponse.json();
        createdCategoryIds.push(data.id);
    }

    // Get all categories
    const response = await context.get(`/api/categories`);
    // Response validation
    expect(response.status()).toBe(200);
    const data = await response.json();

    if(data.length>0){
        // Verify one object have relevant properties
        expect(data[0]).toHaveProperty("id");
        expect(data[0]).toHaveProperty("name");
        expect(data[0]).toHaveProperty("parentName");
    }

    // Delete all created categories
    for(const id of createdCategoryIds) {
        const deleteResponse = await context.delete(`/api/categories/${id}`);
        expect(deleteResponse.status()).toBe(204);
    }
});