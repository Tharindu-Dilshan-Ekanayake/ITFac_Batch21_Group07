import { Given, When, Then } from "@cucumber/cucumber";
import "dotenv/config";
import { expect } from "@playwright/test";
import { getUserApiContext } from "../../../utils/api-user.js";
import { getAdminApiContext } from "../../../utils/api-admin.js";

// Background
Given("I have a valid user token 214079R_UserApi", async function () {
  // The token is read inside getUserApiContext, so we just ensure it's callable
  // We can initialize the context here if we want to cache it, or just do nothing
  // and let the steps call the context getter.
});

// Scenario 1: Get category by valid ID
When("I create a category as admin 214079R_UserApi", async function () {
  const adminContext = await getAdminApiContext();
  const randomNumber = Math.floor(Math.random() * 1000);
  this.createPayload = {
    name: `c${randomNumber}`,
    parent: {},
    subCategories: [],
  };
  this.createResponse = await adminContext.post("/api/categories", {
    data: this.createPayload,
  });
  expect(this.createResponse.status()).toBe(201);
  this.createData = await this.createResponse.json();
  this.createdCategoryId = this.createData.id;
});

When("I get the category by its ID as user 214079R_UserApi", async function () {
  const userContext = await getUserApiContext();
  this.response = await userContext.get(
    `/api/categories/${this.createdCategoryId}`,
  );
});

Then(
  "the response status should be {int} 214079R_UserApi",
  async function (statusCode) {
    expect(this.response.status()).toBe(statusCode);
  },
);

Then(
  "the response data should have valid category properties 214079R_UserApi",
  async function () {
    const data = await this.response.json();
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("name");
    expect(data).toHaveProperty("parentId");
  },
);

Then(
  "I delete the created category as admin 214079R_UserApi",
  async function () {
    const adminContext = await getAdminApiContext();
    const deleteResponse = await adminContext.delete(
      `/api/categories/${this.createdCategoryId}`,
    );
    expect(deleteResponse.status()).toBe(204);
  },
);

// Scenario 2: Get category by invalid ID
When("I get a category by invalid ID 999 214079R_UserApi", async function () {
  const userContext = await getUserApiContext();
  this.response = await userContext.get(`/api/categories/999`);
});

// Scenario 3: Get sub-categories
When(
  "I create a category and a sub-category as admin 214079R_UserApi",
  async function () {
    const adminContext = await getAdminApiContext();
    const randomNumber = Math.floor(Math.random() * 1000);

    // Create parent
    const createPayload = {
      name: `s${randomNumber}`,
      parent: {},
      subCategories: [],
    };
    const createResponse = await adminContext.post("/api/categories", {
      data: createPayload,
    });
    expect(createResponse.status()).toBe(201);
    const createData = await createResponse.json();
    this.createdCategoryId = createData.id; // Store parent ID for deletion/reference

    // Create sub-category
    const subCategoryPayload = {
      name: `ss${randomNumber}`,
      parent: { id: createData.id },
    };
    const subCategoryResponse = await adminContext.post("/api/categories", {
      data: subCategoryPayload,
    });
    expect(subCategoryResponse.status()).toBe(201);
  },
);

When("I get sub-categories as user 214079R_UserApi", async function () {
  const userContext = await getUserApiContext();
  this.response = await userContext.get(`/api/categories/sub-categories`);
});

Then(
  "the response should contain sub-category properties 214079R_UserApi",
  async function () {
    const data = await this.response.json();
    if (data.length > 0) {
      expect(data[0]).toHaveProperty("id");
      expect(data[0]).toHaveProperty("name");
      expect(data[0]).toHaveProperty("subCategories");
    }
  },
);

// Scenario 4: Search categories with pagination
When(
  "I search categories with pagination parameters as user 214079R_UserApi",
  async function () {
    const userContext = await getUserApiContext();
    this.response = await userContext.get(
      `/api/categories/page?page=0&size=10&name=anthuriam`,
    );
  },
);

Then(
  "the response should contain pagination properties 214079R_UserApi",
  async function () {
    const data = await this.response.json();
    expect(data).toHaveProperty("totalPages");
    expect(data).toHaveProperty("pageable");
    expect(data).toHaveProperty("content");
  },
);

// Scenario 5: Prevent search with invalid pagination
When(
  "I search categories with invalid pagination parameters as user 214079R_UserApi",
  async function () {
    const userContext = await getUserApiContext();
    this.response = await userContext.get(
      `/api/categories/page?page=-1&size=10&name=anthuriam`,
    );
  },
);

Then(
  "the response should contain error message {string} 214079R_UserApi",
  async function (errorMsg) {
    const data = await this.response.json();
    expect(data.error).toBe(errorMsg);
  },
);
