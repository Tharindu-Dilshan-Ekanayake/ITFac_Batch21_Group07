const { Given, When, Then } = require("@cucumber/cucumber");
const { expect, request } = require("@playwright/test");
const dotenv = require("dotenv");

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

Given("I am an authenticated user via API", async function () {
  // Log in fresh to get a valid USER token (do not rely on user-token.json)
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

  this.apiContext = await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
});

When("I try to create a category with name {string}", async function (name) {
  const payload = { name };

  this.apiResponse = await this.apiContext.post("/api/categories", {
    data: payload,
  });

  this.apiResponseBody = await this.apiResponse.json();
});

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
