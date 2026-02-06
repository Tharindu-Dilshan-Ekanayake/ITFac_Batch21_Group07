const { Given, When, Then, Before, After } = require("@cucumber/cucumber");
const { expect, request } = require("@playwright/test");

// Load authentication
const adminAuth = require("../../../admin-auth.json");

// Store context and data for the scenario
let adminContext = null;
let createdCategoryIds = [];
let createdSubCategoryIds = [];
let createdPlantsIds = [];
let createdSalesIds = [];
let lastResponse = null;
let lastResponseData = null;

Given("I am an admin with valid API token", async function () {
  adminContext = await getAdminApiContext(this.baseUrl);
});

When("admin creates 10 categories", async function () {
  createdCategoryIds = [];
  
  let randomNumber = Math.floor(Math.random() * 10000);
  
  for (let i = 0; i < 10; i++) {
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
});

When("admin creates 10 sub-categories under the created categories", async function () {
  createdSubCategoryIds = [];
  let randomNumber = Math.floor(Math.random() * 10000);
  
  for (let i = 0; i < 10; i++) {
    const createPayload = {
      name: `s${randomNumber}`,
      parent: { id: createdCategoryIds[i] },
    };
    
    const createResponse = await adminContext.post('/api/categories', {
      data: createPayload
    });
    
    expect(createResponse.status()).toBe(201);
    const data = await createResponse.json();
    createdSubCategoryIds.push(data.id);
    randomNumber++;
  }
});

When("I retrieve category summary via API", async function () {
  lastResponse = await adminContext.get(`/api/categories/summary`);
  lastResponseData = await lastResponse.json();
});

Then("the response status should be 200", async function () {
  expect(lastResponse.status()).toBe(200);
});

Then("the summary response should have mainCategories property", async function () {
  expect(lastResponseData).toHaveProperty("mainCategories");
});

Then("the summary response should have subCategories property", async function () {
  expect(lastResponseData).toHaveProperty("subCategories");
});

When("admin creates a category and sub-category for plants", async function () {
  createdCategoryIds = [];
  createdSubCategoryIds = [];
  
  let randomNumber = Math.floor(Math.random() * 10000);
  
  const createPayload = {
    name: `new${randomNumber}`,
    parent: {},
    subCategories: []
  };
  
  const createResponse = await adminContext.post('/api/categories', {
    data: createPayload
  });
  
  expect(createResponse.status()).toBe(201);
  const createdCategoryData = await createResponse.json();
  createdCategoryIds.push(createdCategoryData.id);
  
  // Create sub-category
  const createSubcategoryPayload = {
    name: `s${randomNumber}`,
    parent: { id: createdCategoryData.id },
  };
  
  const createSubcategoryResponse = await adminContext.post('/api/categories', {
    data: createSubcategoryPayload
  });
  
  expect(createSubcategoryResponse.status()).toBe(201);
  const createdSubCategoryData = await createSubcategoryResponse.json();
  createdSubCategoryIds.push(createdSubCategoryData.id);
  
  // Store for later use
  this.mainCategoryId = createdCategoryData.id;
  this.subCategoryId = createdSubCategoryData.id;
  this.subCategoryName = createdSubCategoryData.name;
});

When("admin creates 10 plants under the sub-category", async function () {
  createdPlantsIds = [];
  let randomNumber = Math.floor(Math.random() * 10000);
  
  for (let i = 0; i < 10; i++) {
    const createPlantPayload = {
      name: `p${randomNumber}`,
      price: 100,
      quantity: 10,
      category: {
        id: this.subCategoryId,
        name: this.subCategoryName,
        parent: {
          id: this.mainCategoryId
        }
      },
    };
    
    const createPlantResponse = await adminContext.post(`/api/plants/category/${this.subCategoryId}`, {
      data: createPlantPayload
    });
    
    expect(createPlantResponse.status()).toBe(201);
    const createdPlantData = await createPlantResponse.json();
    createdPlantsIds.push(createdPlantData.id);
    randomNumber++;
  }
});

When("I retrieve all plants via API", async function () {
  lastResponse = await adminContext.get(`/api/plants`);
  lastResponseData = await lastResponse.json();
});

Then("the plants response should be an array", async function () {
  expect(Array.isArray(lastResponseData)).toBe(true);
});

Then("the plants response should have items greater than 0", async function () {
  expect(lastResponseData.length).toBeGreaterThan(0);
});

When("admin deletes all created plants", async function () {
  for (const plant of createdPlantsIds) {
    const deleteResponse = await adminContext.delete(`/api/plants/${plant}`);
    expect(deleteResponse.status()).toBe(204);
  }
  createdPlantsIds = [];
});

When("admin creates 10 plants with varying quantities", async function () {
  createdPlantsIds = [];
  let randomNumber = Math.floor(Math.random() * 10000);
  
  for (let i = 0; i < 10; i++) {
    const createPlantPayload = {
      name: `p${randomNumber}`,
      price: 100,
      quantity: 10 - i,
      category: {
        id: this.subCategoryId,
        name: this.subCategoryName,
        parent: {
          id: this.mainCategoryId
        }
      },
    };
    
    const createPlantResponse = await adminContext.post(`/api/plants/category/${this.subCategoryId}`, {
      data: createPlantPayload
    });
    
    expect(createPlantResponse.status()).toBe(201);
    const createdPlantData = await createPlantResponse.json();
    createdPlantsIds.push(createdPlantData.id);
    randomNumber++;
  }
});

When("I retrieve plants summary via API", async function () {
  lastResponse = await adminContext.get(`/api/plants/summary`);
  lastResponseData = await lastResponse.json();
});

Then("the plants summary should have totalPlants property", async function () {
  expect(lastResponseData).toHaveProperty("totalPlants");
});

Then("the plants summary should have lowStockPlants property", async function () {
  expect(lastResponseData).toHaveProperty("lowStockPlants");
});

When("admin creates a category and sub-category for sales", async function () {
  createdCategoryIds = [];
  createdSubCategoryIds = [];
  
  let randomNumber = Math.floor(Math.random() * 10000);
  
  const createPayload = {
    name: `new${randomNumber}`,
    parent: {},
    subCategories: []
  };
  
  const createResponse = await adminContext.post('/api/categories', {
    data: createPayload
  });
  
  expect(createResponse.status()).toBe(201);
  const createdCategoryData = await createResponse.json();
  createdCategoryIds.push(createdCategoryData.id);
  
  // Create sub-category
  const createSubcategoryPayload = {
    name: `s${randomNumber}`,
    parent: { id: createdCategoryData.id },
  };
  
  const createSubcategoryResponse = await adminContext.post('/api/categories', {
    data: createSubcategoryPayload
  });
  
  expect(createSubcategoryResponse.status()).toBe(201);
  const createdSubCategoryData = await createSubcategoryResponse.json();
  createdSubCategoryIds.push(createdSubCategoryData.id);
  
  // Store for later use
  this.mainCategoryId = createdCategoryData.id;
  this.subCategoryId = createdSubCategoryData.id;
  this.subCategoryName = createdSubCategoryData.name;
});

When("admin creates 10 sales records from the plants", async function () {
  createdSalesIds = [];
  
  for (let i = 0; i < 10; i++) {
    const createSalesResponse = await adminContext.post(`/api/sales/plant/${createdPlantsIds[i]}?quantity=1`);
    expect(createSalesResponse.status()).toBe(201);
    const createdSalesData = await createSalesResponse.json();
    createdSalesIds.push(createdSalesData.id);
  }
});

When("I retrieve all sales via API", async function () {
  lastResponse = await adminContext.get(`/api/sales`);
  lastResponseData = await lastResponse.json();
});

Then("the sales response should be an array", async function () {
  expect(Array.isArray(lastResponseData)).toBe(true);
});

Then("the sales response should have items greater than 0", async function () {
  expect(lastResponseData.length).toBeGreaterThan(0);
});

When("admin deletes all created sales and plants", async function () {
  for (const sale of createdSalesIds) {
    const deleteResponse = await adminContext.delete(`/api/sales/${sale}`);
    expect(deleteResponse.status()).toBe(204);
  }
  createdSalesIds = [];
  
  for (const plant of createdPlantsIds) {
    const deleteResponse = await adminContext.delete(`/api/plants/${plant}`);
    expect(deleteResponse.status()).toBe(204);
  }
  createdPlantsIds = [];
});

When("I try to access categories API without token", async function () {
  const context = await request.newContext({
    baseURL: this.baseUrl
    // No headers = no token
  });
  
  lastResponse = await context.get("/api/categories");
  lastResponseData = await lastResponse.json();
});

Then("the response status should be 401 or 403", async function () {
  expect([401, 403]).toContain(lastResponse.status());
});

Then("the response should contain an error message", async function () {
  expect(lastResponseData.message || lastResponseData.error).toBeDefined();
});

When("I try to access plants API with an invalid token", async function () {
  const context = await request.newContext({
    baseURL: this.baseUrl,
    extraHTTPHeaders: {
      Authorization: "Bearer THIS_IS_A_FAKE_TOKEN_12345"
    }
  });
  
  lastResponse = await context.get("/api/plants");
  lastResponseData = await lastResponse.json();
});

Then("the response status should be 401", async function () {
  expect(lastResponse.status()).toBe(401);
});

// Helper function to get admin API context with token
async function getAdminApiContext(baseUrl) {
  const loginResponse = await request.post(`${baseUrl}/api/auth/login`, {
    data: {
      email: adminAuth.email,
      password: adminAuth.password
    }
  });
  
  const loginData = await loginResponse.json();
  const token = loginData.token || loginData.accessToken;
  
  return await request.newContext({
    baseURL: baseUrl,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

// Cleanup after each scenario
After(async function () {
  // Clean up any remaining created data
  if (adminContext) {
    for (const id of createdCategoryIds) {
      await adminContext.delete(`/api/categories/${id}`).catch(() => {});
    }
    for (const id of createdPlantsIds) {
      await adminContext.delete(`/api/plants/${id}`).catch(() => {});
    }
    for (const id of createdSalesIds) {
      await adminContext.delete(`/api/sales/${id}`).catch(() => {});
    }
  }
  
  createdCategoryIds = [];
  createdSubCategoryIds = [];
  createdPlantsIds = [];
  createdSalesIds = [];
  adminContext = null;
});
