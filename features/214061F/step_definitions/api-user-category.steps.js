const { Given, When, Then } = require("@cucumber/cucumber");
const { expect, request } = require("@playwright/test");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

Given("I am an authenticated user via API", async function () {
  const { token } = JSON.parse(
    fs.readFileSync("user-token.json", "utf-8")
  );

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
