import { test, expect, request } from "@playwright/test";
import { getAdminApiContext } from "../../utils/api-admin";

// Helper function to create categories
const createCategory = async () => {
    // Create a category in admin side
    const adminContext = await getAdminApiContext();
    const createdCategoryIds = [];

    let randomNumber = Math.floor(Math.random() * 1000);
    // Create 10 categories
    for(let i = 0; i < 10; i++) {
        const createPayload = {
            name: `new${randomNumber}`,
            parent: {},
        };
        const createResponse = await adminContext.post('/api/categories', {
            data: createPayload
        });
        expect(createResponse.status()).toBe(201);
        const data = await createResponse.json();
        createdCategoryIds.push(data.id);
        randomNumber++;
    }
    return createdCategoryIds;
};

const createSubCategory = async (createdCategoryIds) => {
    // Create a category in admin side
    const adminContext = await getAdminApiContext();
    const categoryIds = createdCategoryIds;
    let randomNumber = Math.floor(Math.random() * 1000);

    // Create 10 sub-categories
    for(let i = 0; i < 10; i++) {
        const createPayload = {
            name: `s${randomNumber}`,
            parent: {id: categoryIds[i]},
        };
        const createResponse = await adminContext.post('/api/categories', {
            data: createPayload
        });
        expect(createResponse.status()).toBe(201);
        const data = await createResponse.json();
        randomNumber++;
    }
    return ;
};

test("Get category summary", async () => {
    // Wait for create categories and sub-categories
    const createdCategoryIds = await createCategory();
    await createSubCategory(createdCategoryIds);
    
    const adminContext = await getAdminApiContext();
    const adminResponse = await adminContext.get(`/api/categories/summary`);
    expect(adminResponse.status()).toBe(200);
    const adminData = await adminResponse.json();
    
    // Response validation
    expect(adminData).toHaveProperty("mainCategories");
    expect(adminData).toHaveProperty("subCategories");
});

test("Get all plants", async () => {

    // Create a category
    const adminContext = await getAdminApiContext();
    let randomNumber = Math.floor(Math.random() * 1000);
    const createPayload = {
        name: `new${randomNumber}`,
        parent: {},
        subCategories: []
    };
    const createResponse = await adminContext.post('/api/categories', {
        data: createPayload
    });
    const createdCategoryData = await createResponse.json();
    expect(createResponse.status()).toBe(201);

    // Create a sub-category
    const createSubcategoryPayload = {
        name: `s${randomNumber}`,
        parent: {id: createdCategoryData.id},
    };
    const createSubcategoryResponse = await adminContext.post('/api/categories', {
        data: createSubcategoryPayload
    });
    expect(createSubcategoryResponse.status()).toBe(201);
    const createdSubCategoryData = await createSubcategoryResponse.json();
    const createdPlantsIds = [];

    // Create plants
    for(let i = 0; i < 10; i++) {
        const createPlantPayload = {
            name: `p${randomNumber}`,
            price: 100,
            quantity: 10,
            category: {
                id: createdSubCategoryData.id,
                name: createdSubCategoryData.name,
                parent: {
                    id: createdCategoryData.id
                }
            },
        }
        const createPlantResponse = await adminContext.post(`/api/plants/category/${createdSubCategoryData.id}`, {
            data: createPlantPayload
        });
        expect(createPlantResponse.status()).toBe(201);
        const createdPlantData = await createPlantResponse.json();
        createdPlantsIds.push(createdPlantData.id);
        randomNumber++;
    }

    const response = await adminContext.get(`/api/plants`);
    expect(response.status()).toBe(200);
    const data = await response.json();

    // Structure validation
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    // Delete the created plants
    for(const plant of createdPlantsIds) {
        const deleteResponse = await adminContext.delete(`/api/plants/${plant}`);
        expect(deleteResponse.status()).toBe(204);
    }
});

test("Get plants summary", async() => {

    // Create a category
    const adminContext = await getAdminApiContext();
    let randomNumber = Math.floor(Math.random() * 1000);
    const createPayload = {
        name: `new${randomNumber}`,
        parent: {},
        subCategories: []
    };
    const createResponse = await adminContext.post('/api/categories', {
        data: createPayload
    });
    const createdCategoryData = await createResponse.json();
    expect(createResponse.status()).toBe(201);

    // Create a sub-category
    const createSubcategoryPayload = {
        name: `s${randomNumber}`,
        parent: {id: createdCategoryData.id},
    };
    const createSubcategoryResponse = await adminContext.post('/api/categories', {
        data: createSubcategoryPayload
    });
    expect(createSubcategoryResponse.status()).toBe(201);
    const createdSubCategoryData = await createSubcategoryResponse.json();
    const createdPlantsIds = [];

    // Create plants
    for(let i = 0; i < 10; i++) {
        const createPlantPayload = {
            name: `p${randomNumber}`,
            price: 100,
            quantity: 10-i,
            category: {
                id: createdSubCategoryData.id,
                name: createdSubCategoryData.name,
                parent: {
                    id: createdCategoryData.id
                }
            },
        }
        const createPlantResponse = await adminContext.post(`/api/plants/category/${createdSubCategoryData.id}`, {
            data: createPlantPayload
        });
        expect(createPlantResponse.status()).toBe(201);
        const createdPlantData = await createPlantResponse.json();
        createdPlantsIds.push(createdPlantData.id);
        randomNumber++;
    }

    const response = await adminContext.get(`/api/plants/summary`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // Response validation
    expect(data).toHaveProperty("totalPlants");
    expect(data).toHaveProperty("lowStockPlants");

    // Delete the created plants
    for(const plant of createdPlantsIds) {
        const deleteResponse = await adminContext.delete(`/api/plants/${plant}`);
        expect(deleteResponse.status()).toBe(204);
    }
});

test("Get all sales", async () => {

    // Create a category
    const adminContext = await getAdminApiContext();
    let randomNumber = Math.floor(Math.random() * 1000);
    const createPayload = {
        name: `new${randomNumber}`,
        parent: {},
        subCategories: []
    };
    const createResponse = await adminContext.post('/api/categories', {
        data: createPayload
    });
    const createdCategoryData = await createResponse.json();
    expect(createResponse.status()).toBe(201);

    // Create a sub-category
    const createSubcategoryPayload = {
        name: `s${randomNumber}`,
        parent: {id: createdCategoryData.id},
    };
    const createSubcategoryResponse = await adminContext.post('/api/categories', {
        data: createSubcategoryPayload
    });
    expect(createSubcategoryResponse.status()).toBe(201);
    const createdSubCategoryData = await createSubcategoryResponse.json();
    const createdPlantsIds = [];

    // Create plants
    for(let i = 0; i < 10; i++) {
        const createPlantPayload = {
            name: `p${randomNumber}`,
            price: 100,
            quantity: 10,
            category: {
                id: createdSubCategoryData.id,
                name: createdSubCategoryData.name,
                parent: {
                    id: createdCategoryData.id
                }
            },
        }
        const createPlantResponse = await adminContext.post(`/api/plants/category/${createdSubCategoryData.id}`, {
            data: createPlantPayload
        });
        expect(createPlantResponse.status()).toBe(201);
        const createdPlantData = await createPlantResponse.json();
        createdPlantsIds.push(createdPlantData.id);
        randomNumber++;
    }

    // Create sales
    const createdSalesIds = [];
    for(let i = 0; i < 10; i++) {
        const createSalesResponse = await adminContext.post(`/api/sales/plant/${createdPlantsIds[i]}?quantity=1`);
        expect(createSalesResponse.status()).toBe(201);
        const createdSalesData = await createSalesResponse.json();
        createdSalesIds.push(createdSalesData.id);
    }

    const response = await adminContext.get(`/api/sales`);
    expect(response.status()).toBe(200);
    const data = await response.json();

    // Structure validation
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    // Delete the created sales
    for(const sale of createdSalesIds) {
        const deleteResponse = await adminContext.delete(`/api/sales/${sale}`);
        expect(deleteResponse.status()).toBe(204);
    }
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
