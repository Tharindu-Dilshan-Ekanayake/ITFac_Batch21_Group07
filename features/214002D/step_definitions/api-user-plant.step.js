import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import "dotenv/config";
import { getAdminApiContext } from "../../../utils/api-admin.js";
import { getUserApiContext } from "../../../utils/api-user.js";
import { check_PlantID } from "../../../tests/214002D/data/plant.data.js";

// Global variables to share state between scenarios (matching Playwright spec logic)
let sharedTestCategoryId;
let sharedTestPlantId;
let sharedCategoryID_1;

// Background
Given("I have a valid user token 214002D_UserApi", async function () {
  // Contexts are handled by helper functions which use dotenv
});

// Scenario 1: Create category and plant as admin
When("I create a category as admin 214002D_UserApi", async function () {
  const context = await getAdminApiContext();
  const randomNumber1 = Math.floor(Math.random() * 1000);
  const randomNumber2 = Math.floor(Math.random() * 1000);

  // Create first category
  const createPayload1 = {
    name: `User${randomNumber1}`,
    parent: {},
    subCategories: [],
  };
  const response1 = await context.post("/api/categories", {
    data: createPayload1,
  });
  expect(response1.status()).toBe(201);
  const data1 = await response1.json();
  sharedCategoryID_1 = data1.id;

  // Create second category (sub-category)
  const createPayload2 = {
    name: `User${randomNumber2}`,
    parent: { id: sharedCategoryID_1 },
    subCategories: [],
  };
  const response2 = await context.post("/api/categories", {
    data: createPayload2,
  });
  expect(response2.status()).toBe(201);
  const data2 = await response2.json();
  sharedTestCategoryId = data2.id;
  this.response = response2;
});

When("I create a plant as admin 214002D_UserApi", async function () {
  const context = await getAdminApiContext();
  const newPlant = {
    name: "Test Admin Plant",
    price: 150,
    quantity: 20,
    categoryId: sharedTestCategoryId,
  };

  this.response = await context.post(
    `/api/plants/category/${newPlant.categoryId}`,
    {
      data: newPlant,
    },
  );
  expect(this.response.status()).toBe(201);
  const responseBody = await this.response.json();
  sharedTestPlantId = responseBody.id;
});

Then(
  "the response status should be {int} 214002D_UserApi",
  async function (statusCode) {
    expect(this.response.status()).toBe(statusCode);
  },
);

// Scenario 2: Prevent user from creating a plant
When("I attempt to create a plant as user 214002D_UserApi", async function () {
  const context = await getUserApiContext();
  const newPlant = {
    name: "Test User Plant",
    price: 100,
    quantity: 2,
    categoryId: sharedTestCategoryId,
  };

  this.response = await context.post(
    `/api/plants/category/${newPlant.categoryId}`,
    {
      data: newPlant,
    },
  );
});

// Scenario 3: Get plant by ID as user
When("I get the plant by its ID as user 214002D_UserApi", async function () {
  const context = await getUserApiContext();
  this.response = await context.get(`/api/plants/${sharedTestPlantId}`);
});

Then(
  "the response data should have valid plant properties 214002D_UserApi",
  async function () {
    const data = await this.response.json();
    expect(data).toHaveProperty("id", sharedTestPlantId);
    expect(data).toHaveProperty("name");
    expect(data).toHaveProperty("price");
  },
);

// Scenario 4: Get plants by category ID as user
When("I get plants by category ID as user 214002D_UserApi", async function () {
  const context = await getUserApiContext();
  this.response = await context.get(
    `/api/plants/category/${sharedTestCategoryId}`,
  );
});

Then(
  "the response should contain the created plant 214002D_UserApi",
  async function () {
    const data = await this.response.json();
    expect(Array.isArray(data)).toBe(true);
    const plant = data.find((p) => p.id === sharedTestPlantId);
    expect(plant).toBeDefined();
  },
);

// Scenario 5: Get plant by invalid ID as user
When("I get a plant by invalid ID as user 214002D_UserApi", async function () {
  const context = await getUserApiContext();
  this.response = await context.get(`/api/plants/${check_PlantID}`);
});

Then(
  "the response error should be {string} 214002D_UserApi",
  async function (errorCode) {
    const data = await this.response.json();
    expect(data.error).toBe(errorCode);
    expect(data.message).toContain(`${check_PlantID}`);
  },
);

// Scenario 6: Prevent user from updating a plant
When("I attempt to update a plant as user 214002D_UserApi", async function () {
  const context = await getUserApiContext();
  const updatePayload = {
    name: "User Plant",
    price: 180,
    quantity: 25,
    categoryId: sharedTestCategoryId,
  };
  this.response = await context.put(`/api/plants/${sharedTestPlantId}`, {
    data: updatePayload,
  });
});

// Scenario 7: Prevent user from deleting a plant
When("I attempt to delete a plant as user 214002D_UserApi", async function () {
  const context = await getUserApiContext();
  this.response = await context.delete(`/api/plants/${sharedTestPlantId}`);
});

// Scenario 8: Admin cleanup
When("I delete the created plant as admin 214002D_UserApi", async function () {
  const context = await getAdminApiContext();
  this.response = await context.delete(`/api/plants/${sharedTestPlantId}`);
  expect(this.response.status()).toBe(204);
});

When(
  "I delete the created categories as admin 214002D_UserApi",
  async function () {
    const context = await getAdminApiContext();

    // Delete second category first
    const response2 = await context.delete(
      `/api/categories/${sharedTestCategoryId}`,
    );
    expect(response2.status()).toBe(204);

    // Delete first category
    const response1 = await context.delete(
      `/api/categories/${sharedCategoryID_1}`,
    );
    expect(response1.status()).toBe(204);

    this.response = response1;
  },
);
