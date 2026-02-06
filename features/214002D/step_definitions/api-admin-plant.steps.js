import { Given, When, Then, After } from "@cucumber/cucumber";
import { expect, request } from "@playwright/test";
import "dotenv/config";
import { check_PlantID } from "../../../tests/214002D/data/plant.data.js";

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

// Fresh admin API context via login (independent of admin-token.json)
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

// Shared state
let createdCategoryId;
let createdParentCategoryId;
let createdPlantId;

// ---------- CATEGORY SETUP ----------

When(
  "I create a main and sub-category for plants 214002D_AdminApi",
  async function () {
    const context = await getAdminApiContext();
    const randomNumber1 = Math.floor(Math.random() * 1000);
    const randomNumber2 = Math.floor(Math.random() * 1000);

    const createPayload1 = {
      name: `new${randomNumber1}`,
      parent: {},
      subCategories: [],
    };

    const createResponse1 = await context.post("/api/categories", {
      data: createPayload1,
    });
    expect(createResponse1.status()).toBe(201);
    const createData1 = await createResponse1.json();
    createdParentCategoryId = createData1.id;

    const createPayload2 = {
      name: `new${randomNumber2}`,
      parent: { id: createdParentCategoryId },
      subCategories: [],
    };

    const createResponse2 = await context.post("/api/categories", {
      data: createPayload2,
    });
    expect(createResponse2.status()).toBe(201);
    const createData2 = await createResponse2.json();
    createdCategoryId = createData2.id;
  },
);

Then(
  "the category hierarchy for plants should be created successfully 214002D_AdminApi",
  async function () {
    expect(createdParentCategoryId).toBeDefined();
    expect(createdCategoryId).toBeDefined();
  },
);

Given(
  "I have a valid plant category hierarchy 214002D_AdminApi",
  async function () {
    if (!createdCategoryId || !createdParentCategoryId) {
      const context = await getAdminApiContext();
      const randomNumber1 = Math.floor(Math.random() * 1000);
      const randomNumber2 = Math.floor(Math.random() * 1000);

      const createPayload1 = {
        name: `new${randomNumber1}`,
        parent: {},
        subCategories: [],
      };

      const createResponse1 = await context.post("/api/categories", {
        data: createPayload1,
      });
      expect(createResponse1.status()).toBe(201);
      const createData1 = await createResponse1.json();
      createdParentCategoryId = createData1.id;

      const createPayload2 = {
        name: `new${randomNumber2}`,
        parent: { id: createdParentCategoryId },
        subCategories: [],
      };

      const createResponse2 = await context.post("/api/categories", {
        data: createPayload2,
      });
      expect(createResponse2.status()).toBe(201);
      const createData2 = await createResponse2.json();
      createdCategoryId = createData2.id;
    }
  },
);

// ---------- CREATE PLANT ----------

When(
  "I create a new plant with that category 214002D_AdminApi",
  async function () {
    const context = await getAdminApiContext();

    const newPlant = {
      name: "Test Admin Plant",
      price: 150,
      quantity: 20,
      categoryId: createdCategoryId,
    };

    this.response = await context.post(
      `/api/plants/category/${newPlant.categoryId}`,
      {
        data: newPlant,
      },
    );

    const responseBody = await this.response.json();
    createdPlantId = responseBody.id;
    this.plantResponseBody = responseBody;
  },
);

Then(
  "the plant should be created successfully with an id 214002D_AdminApi",
  async function () {
    expect(this.response.status()).toBe(201);
    expect(this.plantResponseBody).toHaveProperty("id");
  },
);

// ---------- DUPLICATE PLANT ----------

When(
  "I create a duplicate plant with the same name in the same category 214002D_AdminApi",
  async function () {
    const context = await getAdminApiContext();

    const duplicatePlant = {
      name: "Test Duplicate Plant",
      price: 150,
      quantity: 20,
      categoryId: createdCategoryId,
    };

    const firstResponse = await context.post(
      `/api/plants/category/${duplicatePlant.categoryId}`,
      {
        data: duplicatePlant,
      },
    );
    expect(firstResponse.status()).toBe(201);
    const firstBody = await firstResponse.json();
    this.firstDuplicatePlantId = firstBody.id;

    this.response = await context.post(
      `/api/plants/category/${duplicatePlant.categoryId}`,
      {
        data: duplicatePlant,
      },
    );
    this.duplicateBody = await this.response.json();
  },
);

Then(
  "the duplicate plant creation should fail with 400 and DUPLICATE_RESOURCE 214002D_AdminApi",
  async function () {
    expect(this.response.status()).toBe(400);
    expect(this.duplicateBody.status).toBe(400);
    expect(this.duplicateBody.error).toBe("DUPLICATE_RESOURCE");
  },
);

// ---------- GET BY CATEGORY ----------

Given(
  "I have a created plant and its category 214002D_AdminApi",
  async function () {
    if (!createdCategoryId || !createdPlantId) {
      const context = await getAdminApiContext();

      if (!createdCategoryId) {
        const randomNumber1 = Math.floor(Math.random() * 1000);
        const randomNumber2 = Math.floor(Math.random() * 1000);

        const createPayload1 = {
          name: `new${randomNumber1}`,
          parent: {},
          subCategories: [],
        };

        const createResponse1 = await context.post("/api/categories", {
          data: createPayload1,
        });
        expect(createResponse1.status()).toBe(201);
        const createData1 = await createResponse1.json();
        createdParentCategoryId = createData1.id;

        const createPayload2 = {
          name: `new${randomNumber2}`,
          parent: { id: createdParentCategoryId },
          subCategories: [],
        };

        const createResponse2 = await context.post("/api/categories", {
          data: createPayload2,
        });
        expect(createResponse2.status()).toBe(201);
        const createData2 = await createResponse2.json();
        createdCategoryId = createData2.id;
      }

      const newPlant = {
        name: "Test Admin Plant",
        price: 150,
        quantity: 20,
        categoryId: createdCategoryId,
      };

      const response = await context.post(
        `/api/plants/category/${newPlant.categoryId}`,
        {
          data: newPlant,
        },
      );
      expect(response.status()).toBe(201);
      const responseBody = await response.json();
      createdPlantId = responseBody.id;
    }
  },
);

When(
  "I get plants by that category ID 214002D_AdminApi",
  async function () {
    const context = await getAdminApiContext();

    this.response = await context.get(
      `/api/plants/category/${createdCategoryId}`,
    );
    this.plantsByCategory = await this.response.json();
  },
);

Then(
  "the response should contain a non-empty list of plants 214002D_AdminApi",
  async function () {
    expect(this.response.status()).toBe(200);
    expect(Array.isArray(this.plantsByCategory)).toBeTruthy();
    expect(this.plantsByCategory.length).toBeGreaterThan(0);
  },
);

// ---------- GET BY ID ----------

When(
  "I get the plant by its ID 214002D_AdminApi",
  async function () {
    const context = await getAdminApiContext();

    this.response = await context.get(`/api/plants/${createdPlantId}`);
    this.plantById = await this.response.json();
  },
);

Then(
  "the plant details should match the created plant 214002D_AdminApi",
  async function () {
    expect(this.response.status()).toBe(200);
    expect(this.plantById).toHaveProperty("id", createdPlantId);
  },
);

// ---------- UPDATE PLANT ----------

When(
  "I update the plant details 214002D_AdminApi",
  async function () {
    const context = await getAdminApiContext();

    const updatePayload = {
      name: "API Updated Plant",
      price: 200,
      quantity: 30,
      categoryId: createdCategoryId,
    };

    this.response = await context.put(`/api/plants/${createdPlantId}`, {
      data: updatePayload,
    });
    this.updatedPlant = await this.response.json();
    this.updatePayload = updatePayload;
  },
);

Then(
  "the plant should be updated with new details 214002D_AdminApi",
  async function () {
    expect(this.response.status()).toBe(200);
    expect(this.updatedPlant).toHaveProperty("id", createdPlantId);
    expect(this.updatedPlant).toHaveProperty("name", this.updatePayload.name);
    expect(this.updatedPlant).toHaveProperty(
      "price",
      this.updatePayload.price,
    );
    expect(this.updatedPlant).toHaveProperty(
      "quantity",
      this.updatePayload.quantity,
    );
  },
);

// ---------- INVALID ID ----------

When(
  "I get a plant by an invalid ID 214002D_AdminApi",
  async function () {
    const context = await getAdminApiContext();
    const invalidPlantID = check_PlantID;

    this.response = await context.get(`/api/plants/${invalidPlantID}`);
    this.invalidPlantBody = await this.response.json();
    this.invalidPlantID = invalidPlantID;
  },
);

Then(
  "the response should be 404 with NOT_FOUND error 214002D_AdminApi",
  async function () {
    expect(this.response.status()).toBe(404);
    expect(this.invalidPlantBody.status).toBe(404);
    expect(this.invalidPlantBody.error).toBe("NOT_FOUND");
    expect(this.invalidPlantBody.message).toBe(
      `Plant not found: ${this.invalidPlantID}`,
    );
  },
);

// ---------- DELETE PLANT ----------

When(
  "I delete the existing plant 214002D_AdminApi",
  async function () {
    const context = await getAdminApiContext();

    this.response = await context.delete(`/api/plants/${createdPlantId}`);
  },
);

Then(
  "the delete plant response status should be 204 214002D_AdminApi",
  async function () {
    expect(this.response.status()).toBe(204);
  },
);

// ---------- DELETE NON-EXISTING PLANT ----------

When(
  "I delete a non-existing plant 214002D_AdminApi",
  async function () {
    const context = await getAdminApiContext();
    const nonExistingPlantID = check_PlantID;

    this.response = await context.delete(`/api/plants/${nonExistingPlantID}`);
  },
);

Then(
  "the delete non-existing plant response status should be 204 214002D_AdminApi",
  async function () {
    expect(this.response.status()).toBe(204);
  },
);

// ---------- CLEANUP ----------

After(async function () {
  const context = await getAdminApiContext();

  try {
    if (createdPlantId) {
      await context.delete(`/api/plants/${createdPlantId}`);
      createdPlantId = undefined;
    }
  } catch (e) {}

  try {
    if (createdCategoryId) {
      await context.delete(`/api/categories/${createdCategoryId}`);
      createdCategoryId = undefined;
    }
  } catch (e) {}

  try {
    if (createdParentCategoryId) {
      await context.delete(`/api/categories/${createdParentCategoryId}`);
      createdParentCategoryId = undefined;
    }
  } catch (e) {}
});
