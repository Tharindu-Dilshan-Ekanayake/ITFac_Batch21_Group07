import { Given, When, Then } from "@cucumber/cucumber";
import "dotenv/config";
import { expect } from "@playwright/test";
import { getAdminApiContext } from "../../../utils/api-admin.js";

When(
  "I create a category with random name 214079R_AdminApi",
  async function () {
    const context = await getAdminApiContext();
    const randomNumber = Math.floor(Math.random() * 1000);
    this.createPayload = {
      name: `new${randomNumber}`,
      parent: {},
      subCategories: [],
    };
    this.response = await context.post("/api/categories", {
      data: this.createPayload,
    });
    this.createData = await this.response.json();
    this.lastCreatedId = this.createData.id;
  },
);

Then(
  "the creation response status should be 201 214079R_AdminApi",
  async function () {
    expect(this.response.status()).toBe(201);
  },
);

When("I get the category by its ID 214079R_AdminApi", async function () {
  const context = await getAdminApiContext();
  this.response = await context.get(`/api/categories/${this.lastCreatedId}`);
});

Then("the response status should be 200 214079R_AdminApi", async function () {
  expect(this.response.status()).toBe(200);
});

Then(
  "the response data should have valid category properties 214079R_AdminApi",
  async function () {
    const data = await this.response.json();
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("name");
    expect(data).toHaveProperty("parentId");
  },
);

Then("I delete the created category 214079R_AdminApi", async function () {
  const context = await getAdminApiContext();
  this.response = await context.delete(`/api/categories/${this.lastCreatedId}`);
});

Then(
  "the deletion response status should be 204 214079R_AdminApi",
  async function () {
    expect(this.response.status()).toBe(204);
  },
);

When("I get a category by invalid ID 999 214079R_AdminApi", async function () {
  const context = await getAdminApiContext();
  this.response = await context.get(`/api/categories/999`);
});

Then("the response status should be 404 214079R_AdminApi", async function () {
  expect(this.response.status()).toBe(404);
});

When(
  "I create a category and a sub-category 214079R_AdminApi",
  async function () {
    const context = await getAdminApiContext();
    const randomNumber = Math.floor(Math.random() * 1000);

    // Create main category
    const createPayload = {
      name: `new${randomNumber}`,
      parent: {},
      subCategories: [],
    };
    const createResponse = await context.post("/api/categories", {
      data: createPayload,
    });
    expect(createResponse.status()).toBe(201);
    const createData = await createResponse.json();

    // Create sub-category
    const subCategoryPayload = {
      name: `s${randomNumber}`,
      parent: { id: createData.id },
    };
    const subCategoryResponse = await context.post("/api/categories", {
      data: subCategoryPayload,
    });
    expect(subCategoryResponse.status()).toBe(201);
  },
);

When("I get sub-categories 214079R_AdminApi", async function () {
  const context = await getAdminApiContext();
  this.response = await context.get(`/api/categories/sub-categories`);
});

Then(
  "the response should contain sub-category properties 214079R_AdminApi",
  async function () {
    const data = await this.response.json();
    if (data.length > 0) {
      expect(data[0]).toHaveProperty("id");
      expect(data[0]).toHaveProperty("name");
      expect(data[0]).toHaveProperty("subCategories");
    }
  },
);

When(
  "I search categories with pagination parameters 214079R_AdminApi",
  async function () {
    const context = await getAdminApiContext();
    this.response = await context.get(
      `/api/categories/page?page=0&size=10&name=anthuriam`,
    );
  },
);

Then(
  "the response should contain pagination properties 214079R_AdminApi",
  async function () {
    const data = await this.response.json();
    this.responseData = data; // store for next step

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
  },
);

Then(
  "the content should have category properties 214079R_AdminApi",
  async function () {
    const data = this.responseData;
    if (data.content.length > 0) {
      data.content.forEach((item) => {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("name");
        expect(item).toHaveProperty("parent");
        expect(item).toHaveProperty("subCategories");
      });
    }
  },
);

When("I create 10 categories 214079R_AdminApi", async function () {
  const context = await getAdminApiContext();
  this.createdCategoryIds = [];
  for (let i = 0; i < 10; i++) {
    const randomNumber = Math.floor(Math.random() * 1000);
    const createPayload = {
      name: `cat${i}${randomNumber}`,
      parent: {},
      subCategories: [],
    };
    const createResponse = await context.post("/api/categories", {
      data: createPayload,
    });
    expect(createResponse.status()).toBe(201);
    const data = await createResponse.json();
    this.createdCategoryIds.push(data.id);
  }
});

When("I get all categories 214079R_AdminApi", async function () {
  const context = await getAdminApiContext();
  this.response = await context.get(`/api/categories`);
});

Then(
  "the response should contain category objects 214079R_AdminApi",
  async function () {
    const data = await this.response.json();
    if (data.length > 0) {
      expect(data[0]).toHaveProperty("id");
      expect(data[0]).toHaveProperty("name");
      expect(data[0]).toHaveProperty("parentName");
    }
  },
);

Then("I delete all created categories 214079R_AdminApi", async function () {
  const context = await getAdminApiContext();
  for (const id of this.createdCategoryIds) {
    const deleteResponse = await context.delete(`/api/categories/${id}`);
    expect(deleteResponse.status()).toBe(204);
  }
});
