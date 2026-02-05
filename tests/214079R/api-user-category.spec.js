import { test, expect } from "@playwright/test";
import { getUserApiContext } from "../../utils/api-user";
import { getAdminApiContext } from "../../utils/api-admin";

test("Get all categories", async () => {

    // Create a category in admin side
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
    
    // Get all categories to be visibled for the user
    const userContext = await getUserApiContext();
    const userResponse = await userContext.get(`/api/categories`);
    // Response validation
    expect(userResponse.status()).toBe(200);

    // Verify response have relevant properties
    const userData = await userResponse.json();
    expect(userData[0]).toHaveProperty("id");
    expect(userData[0]).toHaveProperty("name");
    expect(userData[0]).toHaveProperty("parentName");

    // Delete the created categories
    for(const id of createdCategoryIds) {
        const deleteResponse = await context.delete(`/api/categories/${id}`);
        expect(deleteResponse.status()).toBe(204);
    };
});

test("Get category by valid ID", async () => {

    // Create a category in admin side
    const adminContext = await getAdminApiContext();
    const randomNumber = Math.floor(Math.random() * 1000);
    const createPayload = {
        name: `new${randomNumber}`,
        parent: {},
        subCategories: []
    };
    const createResponse = await adminContext.post('/api/categories', {
        data: createPayload
    });
    const createData = await createResponse.json();
    expect(createResponse.status()).toBe(201);

    // Get that category by user
    const userContext = await getUserApiContext();
    const response = await userContext.get(`/api/categories/${createData.id}`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // Response validation
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("name");
    expect(data).toHaveProperty("parentId");

    // Delete the created category
    const deleteResponse = await adminContext.delete(`/api/categories/${createData.id}`);
    expect(deleteResponse.status()).toBe(204);
});

test("Get category by invalid ID", async () => {
    const context = await getUserApiContext();
    const response = await context.get(`/api/categories/999`); // ID 999 selected cause that item does not exist in the database
    expect(response.status()).toBe(404);
});

test("Get sub-categories", async () => {

    const adminContext = await getAdminApiContext();
    const randomNumber = Math.floor(Math.random() * 1000);

    // Create a category
    const createPayload = {
        name: `new${randomNumber}`,
        parent: {},
        subCategories: []
    };
    const createResponse = await adminContext.post('/api/categories', {
        data: createPayload
    });
    const createData = await createResponse.json();
    expect(createResponse.status()).toBe(201);

    // Create a sub-category
    const subCategoryPayload = {
        name: `s${randomNumber}`,
        parent: { id: createData.id }
    };
    const subCategoryResponse = await adminContext.post('/api/categories', {
        data: subCategoryPayload
    });
    expect(subCategoryResponse.status()).toBe(201);


     // Get all sub-categories
    const userContext = await getUserApiContext();
    const userResponse = await userContext.get(`/api/categories/sub-categories`);
    expect(userResponse.status()).toBe(200);

    const userData = await userResponse.json();
    if(userData.length>0){
        // Verify atleast one object is having properties
        expect(userData[0]).toHaveProperty("id");
        expect(userData[0]).toHaveProperty("name");
        expect(userData[0]).toHaveProperty("subCategories");
    }
});

test("Search categories with pagination", async () => {
    const context = await getUserApiContext();
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

test("Prevent search categories with invalid pagination", async () => {
    const context = await getUserApiContext();
    // Page count set to -1, items per page set to 10, and name set as anthuriam
    const response = await context.get(`api/categories/page?page=-1&size=10&name=anthuriam`); 

    // Response validation
    expect(response.status()).toBe(400);

    // Verify response have correct error message
    const data = await response.json();
    expect(data.error).toBe("BAD_REQUEST");
});