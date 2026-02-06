import { Given, When, Then } from "@cucumber/cucumber";
import "dotenv/config";
import { expect, request } from "@playwright/test";
import { getAdminApiContext } from "../../../utils/api-admin.js";

When(
  "I create 10 categories and 10 sub-categories 215036R_AdminApi",
  async function () {
    const context = await getAdminApiContext();
    this.createdCategoryIds = [];
    let randomNumber = Math.floor(Math.random() * 1000);

    // Create 10 categories
    for (let i = 0; i < 10; i++) {
      const createPayload = {
        name: `n${i}${randomNumber}`,
        parent: {},
      };
      const createResponse = await context.post("/api/categories", {
        data: createPayload,
      });
      expect(createResponse.status()).toBe(201);
      const data = await createResponse.json();
      this.createdCategoryIds.push(data.id);
      randomNumber++;
    }

    // Create 10 sub-categories
    for (let i = 0; i < 10; i++) {
      const createPayload = {
        name: `s${i}${randomNumber}`,
        parent: { id: this.createdCategoryIds[i] },
      };
      const createResponse = await context.post("/api/categories", {
        data: createPayload,
      });
      expect(createResponse.status()).toBe(201);
      randomNumber++;
    }
  },
);

Then("I get category summary 215036R_AdminApi", async function () {
  const context = await getAdminApiContext();
  this.response = await context.get(`/api/categories/summary`);
});

Then("the response status should be 200 215036R_AdminApi", async function () {
  expect(this.response.status()).toBe(200);
});

Then(
  "the response should have category summary properties 215036R_AdminApi",
  async function () {
    const data = await this.response.json();
    expect(data).toHaveProperty("mainCategories");
    expect(data).toHaveProperty("subCategories");
  },
);

When(
  "I create category, sub-category and 10 plants 215036R_AdminApi",
  async function () {
    const context = await getAdminApiContext();
    let randomNumber = Math.floor(Math.random() * 1000);

    // Create category
    const createPayload = {
      name: `new${randomNumber}`,
      parent: {},
      subCategories: [],
    };
    const createResponse = await context.post("/api/categories", {
      data: createPayload,
    });
    expect(createResponse.status()).toBe(201);
    const createdCategoryData = await createResponse.json();

    // Create sub-category
    const createSubcategoryPayload = {
      name: `s${randomNumber}`,
      parent: { id: createdCategoryData.id },
    };
    const createSubcategoryResponse = await context.post("/api/categories", {
      data: createSubcategoryPayload,
    });
    expect(createSubcategoryResponse.status()).toBe(201);
    const createdSubCategoryData = await createSubcategoryResponse.json();

    this.createdPlantsIds = [];
    // Create 10 plants
    for (let i = 0; i < 10; i++) {
      const createPlantPayload = {
        name: `p${randomNumber}`,
        price: 100,
        quantity: 10,
        category: {
          id: createdSubCategoryData.id,
          name: createdSubCategoryData.name,
          parent: {
            id: createdCategoryData.id,
          },
        },
      };
      const createPlantResponse = await context.post(
        `/api/plants/category/${createdSubCategoryData.id}`,
        {
          data: createPlantPayload,
        },
      );
      expect(createPlantResponse.status()).toBe(201);
      const createdPlantData = await createPlantResponse.json();
      this.createdPlantsIds.push(createdPlantData.id);
      randomNumber++;
    }
  },
);

Then("I get all plants 215036R_AdminApi", async function () {
  const context = await getAdminApiContext();
  this.response = await context.get(`/api/plants`);
});

Then(
  "the response should contain plants array 215036R_AdminApi",
  async function () {
    const data = await this.response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  },
);

Then("I delete all created plants 215036R_AdminApi", async function () {
  const context = await getAdminApiContext();
  for (const plant of this.createdPlantsIds) {
    const deleteResponse = await context.delete(`/api/plants/${plant}`);
    expect(deleteResponse.status()).toBe(204);
  }
});

When(
  "I create category, sub-category and 10 plants with varying quantities 215036R_AdminApi",
  async function () {
    const context = await getAdminApiContext();
    let randomNumber = Math.floor(Math.random() * 1000);

    // Create category
    const createPayload = {
      name: `new${randomNumber}`,
      parent: {},
      subCategories: [],
    };
    const createResponse = await context.post("/api/categories", {
      data: createPayload,
    });
    expect(createResponse.status()).toBe(201);
    const createdCategoryData = await createResponse.json();

    // Create sub-category
    const createSubcategoryPayload = {
      name: `s${randomNumber}`,
      parent: { id: createdCategoryData.id },
    };
    const createSubcategoryResponse = await context.post("/api/categories", {
      data: createSubcategoryPayload,
    });
    expect(createSubcategoryResponse.status()).toBe(201);
    const createdSubCategoryData = await createSubcategoryResponse.json();

    this.createdPlantsIds = [];
    // Create 10 plants with varying quantities
    for (let i = 0; i < 10; i++) {
      const createPlantPayload = {
        name: `p${randomNumber}`,
        price: 100,
        quantity: 10 - i,
        category: {
          id: createdSubCategoryData.id,
          name: createdSubCategoryData.name,
          parent: {
            id: createdCategoryData.id,
          },
        },
      };
      const createPlantResponse = await context.post(
        `/api/plants/category/${createdSubCategoryData.id}`,
        {
          data: createPlantPayload,
        },
      );
      expect(createPlantResponse.status()).toBe(201);
      const createdPlantData = await createPlantResponse.json();
      this.createdPlantsIds.push(createdPlantData.id);
      randomNumber++;
    }
  },
);

Then("I get plants summary 215036R_AdminApi", async function () {
  const context = await getAdminApiContext();
  this.response = await context.get(`/api/plants/summary`);
});

Then(
  "the response should have plants summary properties 215036R_AdminApi",
  async function () {
    const data = await this.response.json();
    expect(data).toHaveProperty("totalPlants");
    expect(data).toHaveProperty("lowStockPlants");
  },
);

When(
  "I create category, sub-category, 10 plants and 10 sales 215036R_AdminApi",
  async function () {
    const context = await getAdminApiContext();
    let randomNumber = Math.floor(Math.random() * 1000);

    // Create category
    const createPayload = {
      name: `new${randomNumber}`,
      parent: {},
      subCategories: [],
    };
    const createResponse = await context.post("/api/categories", {
      data: createPayload,
    });
    expect(createResponse.status()).toBe(201);
    const createdCategoryData = await createResponse.json();

    // Create sub-category
    const createSubcategoryPayload = {
      name: `s${randomNumber}`,
      parent: { id: createdCategoryData.id },
    };
    const createSubcategoryResponse = await context.post("/api/categories", {
      data: createSubcategoryPayload,
    });
    expect(createSubcategoryResponse.status()).toBe(201);
    const createdSubCategoryData = await createSubcategoryResponse.json();

    this.createdPlantsIds = [];
    // Create 10 plants
    for (let i = 0; i < 10; i++) {
      const createPlantPayload = {
        name: `p${randomNumber}`,
        price: 100,
        quantity: 10,
        category: {
          id: createdSubCategoryData.id,
          name: createdSubCategoryData.name,
          parent: {
            id: createdCategoryData.id,
          },
        },
      };
      const createPlantResponse = await context.post(
        `/api/plants/category/${createdSubCategoryData.id}`,
        {
          data: createPlantPayload,
        },
      );
      expect(createPlantResponse.status()).toBe(201);
      const createdPlantData = await createPlantResponse.json();
      this.createdPlantsIds.push(createdPlantData.id);
      randomNumber++;
    }

    // Create sales
    this.createdSalesIds = [];
    for (let i = 0; i < 10; i++) {
      const createSalesResponse = await context.post(
        `/api/sales/plant/${this.createdPlantsIds[i]}?quantity=1`,
      );
      expect(createSalesResponse.status()).toBe(201);
      const createdSalesData = await createSalesResponse.json();
      this.createdSalesIds.push(createdSalesData.id);
    }
  },
);

Then("I get all sales 215036R_AdminApi", async function () {
  const context = await getAdminApiContext();
  this.response = await context.get(`/api/sales`);
});

Then(
  "the response should contain sales array 215036R_AdminApi",
  async function () {
    const data = await this.response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  },
);

Then("I delete all created sales 215036R_AdminApi", async function () {
  const context = await getAdminApiContext();
  for (const sale of this.createdSalesIds) {
    const deleteResponse = await context.delete(`/api/sales/${sale}`);
    expect(deleteResponse.status()).toBe(204);
  }
});

When(
  "I request categories endpoint without token 215036R_AdminApi",
  async function () {
    const baseURL = process.env.BASE_URL;
    const context = await request.newContext({
      baseURL,
      // No headers = no token
    });
    this.response = await context.get("/api/categories");
  },
);

Then(
  "the response status should be 401 or 403 215036R_AdminApi",
  async function () {
    expect([401, 403]).toContain(this.response.status());
  },
);

Then(
  "the response should have error message 215036R_AdminApi",
  async function () {
    const data = await this.response.json();
    expect(data.message || data.error).toBeDefined();
  },
);

When(
  "I request plants endpoint with invalid token 215036R_AdminApi",
  async function () {
    const baseURL = process.env.BASE_URL;
    const context = await request.newContext({
      baseURL,
      extraHTTPHeaders: {
        Authorization: "Bearer THIS_IS_A_FAKE_TOKEN_12345",
      },
    });
    this.response = await context.get("/api/plants");
  },
);

Then("the response status should be 401 215036R_AdminApi", async function () {
  expect(this.response.status()).toBe(401);
});