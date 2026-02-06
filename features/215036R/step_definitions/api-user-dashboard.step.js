import { Given, When, Then, After } from "@cucumber/cucumber";
import { expect, request } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

// Helper: get fresh USER context
async function getUserApiContext() {
  const loginContext = await request.newContext({ baseURL: BASE_URL });
  const loginRes = await loginContext.post("/api/auth/login", {
    data: {
      username: process.env.USER_USERNAME,
      password: process.env.USER_PASSWORD,
    },
  });

  expect(loginRes.status(), await loginRes.text()).toBe(200);
  const loginBody = await loginRes.json();
  const token = loginBody.token;

  return await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

// Helper: get fresh ADMIN context
async function getAdminApiContext() {
  const loginContext = await request.newContext({ baseURL: BASE_URL });
  const loginRes = await loginContext.post("/api/auth/login", {
    data: {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    },
  });

  expect(loginRes.status(), await loginRes.text()).toBe(200);
  const loginBody = await loginRes.json();
  const token = loginBody.token;

  return await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

// ---------- GIVEN ----------

Given("I have a valid user token 215036R_UserApi", async function () {
  this.apiContext = await getUserApiContext();
});

// ---------- WHEN ----------

When(
  "I create {int} categories as admin 215036R_UserApi",
  async function (count) {
    const adminContext = await getAdminApiContext();
    this.createdCategoryIds = [];

    let randomNumber = Math.floor(Math.random() * 1000);
    for (let i = 0; i < count; i++) {
      const createPayload = {
        name: `new${randomNumber}`,
        parent: {},
      };
      const createResponse = await adminContext.post("/api/categories", {
        data: createPayload,
      });
      expect(createResponse.status()).toBe(201);
      const data = await createResponse.json();
      this.createdCategoryIds.push(data.id);
      randomNumber++;
    }
  },
);

When("I get all categories as user 215036R_UserApi", async function () {
  this.apiResponse = await this.apiContext.get("/api/categories");
  this.apiResponseBody = await this.apiResponse.json();
});

When(
  "I create {int} categories and sub-categories as admin 215036R_UserApi",
  async function (count) {
    const adminContext = await getAdminApiContext();
    this.createdCategoryIds = [];

    let randomNumber = Math.floor(Math.random() * 1000);
    // Create categories
    for (let i = 0; i < count; i++) {
      const createPayload = {
        name: `n${i}${randomNumber}`,
        parent: {},
      };
      const createResponse = await adminContext.post("/api/categories", {
        data: createPayload,
      });
      expect(createResponse.status()).toBe(201);
      const data = await createResponse.json();
      this.createdCategoryIds.push(data.id);
      randomNumber++;
    }

    // Create sub-categories
    for (let i = 0; i < count; i++) {
      const createPayload = {
        name: `s${i}${randomNumber}`,
        parent: { id: this.createdCategoryIds[i] },
      };
      const createResponse = await adminContext.post("/api/categories", {
        data: createPayload,
      });
      expect(createResponse.status()).toBe(201);
      randomNumber++;
    }
  },
);

When("I get category summary as user 215036R_UserApi", async function () {
  this.apiResponse = await this.apiContext.get("/api/categories/summary");
  this.apiResponseBody = await this.apiResponse.json();
});

When(
  "I create category, sub-category, and {int} plants as admin 215036R_UserApi",
  async function (count) {
    const adminContext = await getAdminApiContext();
    let randomNumber = Math.floor(Math.random() * 1000);

    // Create category
    const createPayload = {
      name: `new${randomNumber}`,
      parent: {},
      subCategories: [],
    };
    const createResponse = await adminContext.post("/api/categories", {
      data: createPayload,
    });
    expect(createResponse.status()).toBe(201);
    const createdCategoryData = await createResponse.json();

    // Create sub-category
    const createSubcategoryPayload = {
      name: `s${randomNumber}`,
      parent: { id: createdCategoryData.id },
    };
    const createSubcategoryResponse = await adminContext.post(
      "/api/categories",
      {
        data: createSubcategoryPayload,
      },
    );
    expect(createSubcategoryResponse.status()).toBe(201);
    const createdSubCategoryData = await createSubcategoryResponse.json();

    // Create plants
    this.createdPlantsIds = [];
    for (let i = 0; i < count; i++) {
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
      const createPlantResponse = await adminContext.post(
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

When("I get all plants as user 215036R_UserApi", async function () {
  this.apiResponse = await this.apiContext.get("/api/plants");
  this.apiResponseBody = await this.apiResponse.json();
});

When(
  "I create category, sub-category, and plants with varying stock as admin 215036R_UserApi",
  async function () {
    const adminContext = await getAdminApiContext();
    let randomNumber = Math.floor(Math.random() * 1000);

    // Create category
    const createPayload = {
      name: `new${randomNumber}`,
      parent: {},
      subCategories: [],
    };
    const createResponse = await adminContext.post("/api/categories", {
      data: createPayload,
    });
    expect(createResponse.status()).toBe(201);
    const createdCategoryData = await createResponse.json();

    // Create sub-category
    const createSubcategoryPayload = {
      name: `s${randomNumber}`,
      parent: { id: createdCategoryData.id },
    };
    const createSubcategoryResponse = await adminContext.post(
      "/api/categories",
      {
        data: createSubcategoryPayload,
      },
    );
    expect(createSubcategoryResponse.status()).toBe(201);
    const createdSubCategoryData = await createSubcategoryResponse.json();

    // Create plants with varying stock
    this.createdPlantsIds = [];
    for (let i = 0; i < 10; i++) {
      const createPlantPayload = {
        name: `p${randomNumber}`,
        price: 100,
        quantity: 10 - i, // Varying stock
        category: {
          id: createdSubCategoryData.id,
          name: createdSubCategoryData.name,
          parent: {
            id: createdCategoryData.id,
          },
        },
      };
      const createPlantResponse = await adminContext.post(
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

When("I get plants summary as user 215036R_UserApi", async function () {
  this.apiResponse = await this.apiContext.get("/api/plants/summary");
  this.apiResponseBody = await this.apiResponse.json();
});

When(
  "I create category, sub-category, plants, and {int} sales as admin 215036R_UserApi",
  async function (count) {
    const adminContext = await getAdminApiContext();
    let randomNumber = Math.floor(Math.random() * 1000);

    // Create category
    const createPayload = {
      name: `new${randomNumber}`,
      parent: {},
      subCategories: [],
    };
    const createResponse = await adminContext.post("/api/categories", {
      data: createPayload,
    });
    expect(createResponse.status()).toBe(201);
    const createdCategoryData = await createResponse.json();

    // Create sub-category
    const createSubcategoryPayload = {
      name: `s${randomNumber}`,
      parent: { id: createdCategoryData.id },
    };
    const createSubcategoryResponse = await adminContext.post(
      "/api/categories",
      {
        data: createSubcategoryPayload,
      },
    );
    expect(createSubcategoryResponse.status()).toBe(201);
    const createdSubCategoryData = await createSubcategoryResponse.json();

    // Create plants
    this.createdPlantsIds = [];
    for (let i = 0; i < count; i++) {
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
      const createPlantResponse = await adminContext.post(
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
    for (let i = 0; i < count; i++) {
      const createSalesResponse = await adminContext.post(
        `/api/sales/plant/${this.createdPlantsIds[i]}?quantity=1`,
      );
      expect(createSalesResponse.status()).toBe(201);
      const createdSalesData = await createSalesResponse.json();
      this.createdSalesIds.push(createdSalesData.id);
    }
  },
);

When("I get all sales as user 215036R_UserApi", async function () {
  this.apiResponse = await this.apiContext.get("/api/sales");
  this.apiResponseBody = await this.apiResponse.json();
});

When(
  "I try to get categories without token 215036R_UserApi",
  async function () {
    const context = await request.newContext({
      baseURL: BASE_URL,
    });
    this.apiResponse = await context.get("/api/categories");
    this.apiResponseBody = await this.apiResponse.json();
  },
);

When(
  "I try to get plants with invalid token 215036R_UserApi",
  async function () {
    const context = await request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        Authorization: "Bearer THIS_IS_A_FAKE_TOKEN_12345",
      },
    });
    this.apiResponse = await context.get("/api/plants");
    this.apiResponseBody = await this.apiResponse.json();
  },
);

// ---------- THEN ----------

Then(
  "the response status should be {int} 215036R_UserApi",
  async function (statusCode) {
    expect(this.apiResponse.status()).toBe(statusCode);
  },
);

Then(
  "the response status should be {int} or {int} 215036R_UserApi",
  async function (statusCode1, statusCode2) {
    expect([statusCode1, statusCode2]).toContain(this.apiResponse.status());
  },
);

Then(
  "the response should have valid category list properties 215036R_UserApi",
  async function () {
    expect(this.apiResponseBody[0]).toHaveProperty("id");
    expect(this.apiResponseBody[0]).toHaveProperty("name");
    expect(this.apiResponseBody[0]).toHaveProperty("parentName");
  },
);

Then(
  "the response should have category summary properties 215036R_UserApi",
  async function () {
    expect(this.apiResponseBody).toHaveProperty("mainCategories");
    expect(this.apiResponseBody).toHaveProperty("subCategories");
  },
);

Then(
  "the response should be a valid plants array 215036R_UserApi",
  async function () {
    expect(Array.isArray(this.apiResponseBody)).toBe(true);
    expect(this.apiResponseBody.length).toBeGreaterThan(0);
  },
);

Then(
  "the response should have plants summary properties 215036R_UserApi",
  async function () {
    expect(this.apiResponseBody).toHaveProperty("totalPlants");
    expect(this.apiResponseBody).toHaveProperty("lowStockPlants");
  },
);

Then(
  "the response should be a valid sales array 215036R_UserApi",
  async function () {
    expect(Array.isArray(this.apiResponseBody)).toBe(true);
    expect(this.apiResponseBody.length).toBeGreaterThan(0);
  },
);

Then(
  "the response should contain an error message 215036R_UserApi",
  async function () {
    expect(
      this.apiResponseBody.message || this.apiResponseBody.error,
    ).toBeDefined();
  },
);

Then(
  "I delete all created categories as admin 215036R_UserApi",
  async function () {
    if (!this.createdCategoryIds || this.createdCategoryIds.length === 0) {
      return;
    }

    const adminContext = await getAdminApiContext();
    for (const id of this.createdCategoryIds) {
      const deleteResponse = await adminContext.delete(`/api/categories/${id}`);
      expect(deleteResponse.status()).toBe(204);
    }
  },
);

Then("I delete all created plants as admin 215036R_UserApi", async function () {
  if (!this.createdPlantsIds || this.createdPlantsIds.length === 0) {
    return;
  }

  const adminContext = await getAdminApiContext();
  for (const plant of this.createdPlantsIds) {
    const deleteResponse = await adminContext.delete(`/api/plants/${plant}`);
    expect(deleteResponse.status()).toBe(204);
  }
});

Then("I delete all created sales as admin 215036R_UserApi", async function () {
  if (!this.createdSalesIds || this.createdSalesIds.length === 0) {
    return;
  }

  const adminContext = await getAdminApiContext();
  for (const sale of this.createdSalesIds) {
    const deleteResponse = await adminContext.delete(`/api/sales/${sale}`);
    expect(deleteResponse.status()).toBe(204);
  }
});
