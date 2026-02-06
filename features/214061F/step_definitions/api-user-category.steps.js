const { Given, When, Then, After } = require("@cucumber/cucumber");
const { expect, request } = require("@playwright/test");
const dotenv = require("dotenv");

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

Given("I am an authenticated user via API", async function () {
  this.apiContext = await getUserApiContext();
});

Given("I am not authenticated via API", async function () {
  // Context without Authorization header
  this.apiContext = await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      "Content-Type": "application/json",
    },
  });
});

Given(
  "there is an existing category created by an admin",
  async function () {
    const adminContext = await getAdminApiContext();
    const name = `TestCat${Math.floor(Math.random() * 1000)}`;

    const res = await adminContext.post("/api/categories", {
      data: { name },
    });

    expect(res.status(), await res.text()).toBe(201);
    const body = await res.json();
    this.categoryId = body.id;
    this.createdCategoryIds = this.createdCategoryIds || [];
    this.createdCategoryIds.push(body.id);
  }
);

// ---------- WHEN ----------

When("I try to create a category with name {string}", async function (name) {
  const payload = { name };

  this.apiResponse = await this.apiContext.post("/api/categories", {
    data: payload,
  });

  this.apiResponseBody = await this.apiResponse.json();
});

When(
  "I try to create a category with a valid name via API",
  async function () {
    const payload = {
      name: `NoAuthCat${Math.floor(Math.random() * 1000)}`,
    };

    this.apiResponse = await this.apiContext.post("/api/categories", {
      data: payload,
    });

    this.apiResponseBody = await this.apiResponse.json();
  }
);

When("I try to update that category name via API", async function () {
  const payload = {
    name: `UpdatedCat${Math.floor(Math.random() * 1000)}`,
  };

  this.apiResponse = await this.apiContext.put(
    `/api/categories/${this.categoryId}`,
    { data: payload }
  );

  this.apiResponseBody = await this.apiResponse.json();
});

When("I try to delete that category via API", async function () {
  this.apiResponse = await this.apiContext.delete(
    `/api/categories/${this.categoryId}`
  );

  this.apiResponseBody = await this.apiResponse.json();
});

// ---------- THEN ----------

Then("the API response status should be {int}", async function (statusCode) {
  expect(
    this.apiResponse.status(),
    await this.apiResponse.text()
  ).toBe(statusCode);
});

Then(
  "the API response body should have status {int} and an error message",
  async function (statusCode) {
    expect(this.apiResponseBody).toHaveProperty("status", statusCode);
    expect(this.apiResponseBody).toHaveProperty("error");
  }
);

// ---------- CLEANUP ----------

// After each scenario, delete any categories that were created via admin
After(async function () {
  if (!this.createdCategoryIds || this.createdCategoryIds.length === 0) {
    return;
  }

  const adminContext = await getAdminApiContext();
  for (const id of this.createdCategoryIds) {
    try {
      await adminContext.delete(`/api/categories/${id}`);
    } catch (e) {
      // ignore
    }
  }
});
