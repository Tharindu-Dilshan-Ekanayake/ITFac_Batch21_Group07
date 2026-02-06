import { Given, When, Then } from "@cucumber/cucumber";
import { expect, request } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

async function getAdminApiContext() {
  const loginContext = await request.newContext({ baseURL: BASE_URL });
  const loginRes = await loginContext.post('/api/auth/login', {
    data: {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    },
  });
  expect(loginRes.status()).toBe(200);
  const { token } = await loginRes.json();
  return await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

async function getUserApiContext() {
  const loginContext = await request.newContext({ baseURL: BASE_URL });
  const loginRes = await loginContext.post('/api/auth/login', {
    data: {
      username: process.env.USER_USERNAME,
      password: process.env.USER_PASSWORD,
    },
  });
  expect(loginRes.status()).toBe(200);
  const { token } = await loginRes.json();
  return await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

async function createCategorySubcategoryPlant(adminContext) {
  const random = Math.floor(Math.random() * 100000);
  // MAIN CATEGORY
  const mainRes = await adminContext.post('/api/categories', {
    data: { name: `Main${random}`, subCategories: [] },
  });
  expect(mainRes.status()).toBe(201);
  const mainCategory = await mainRes.json();

  // SUB CATEGORY
  const subRes = await adminContext.post('/api/categories', {
    data: {
      name: `Sub${random}`,
      parent: mainCategory,
      subCategories: [],
    },
  });
  expect(subRes.status()).toBe(201);
  const subCategory = await subRes.json();

  // PLANT
  const plantRes = await adminContext.post(
    `/api/plants/category/${subCategory.id}`,
    {
      data: {
        name: `Test Plant ${Date.now()}`,
        price: 500,
        quantity: 10,
        category: subCategory,
      },
    }
  );
  expect(plantRes.status()).toBe(201);
  const plant = await plantRes.json();

  return { mainCategory, subCategory, plant };
}

// --- GIVEN ---
Given('an admin has created a main category, sub category, and plant', async function () {
  this.adminContext = await getAdminApiContext();
  const { mainCategory, subCategory, plant } = await createCategorySubcategoryPlant(this.adminContext);
  this.mainCategory = mainCategory;
  this.subCategory = subCategory;
  this.plant = plant;
});

Given('the admin has created a sale for the plant', async function () {
  const saleRes = await this.adminContext.post(`/api/sales/plant/${this.plant.id}?quantity=1`);
  expect(saleRes.status()).toBe(201);
  this.sale = await saleRes.json();
});

// --- WHEN ---
When('the user requests plants by category id', async function () {
  this.userContext = await getUserApiContext();
  this.apiResponse = await this.userContext.get(`/api/plants/category/${this.subCategory.id}`);
  this.apiResponseBody = await this.apiResponse.json();
});

When('the user tries to sell the plant', async function () {
  this.userContext = await getUserApiContext();
  this.apiResponse = await this.userContext.post(`/api/sales/plant/${this.plant.id}?quantity=1`);
});

When('the user requests sale by ID', async function () {
  this.userContext = await getUserApiContext();
  this.apiResponse = await this.userContext.get(`/api/sales/${this.sale.id}`);
  this.apiResponseBody = await this.apiResponse.json();
});

When('the user requests sale by invalid ID', async function () {
  this.userContext = await getUserApiContext();
  this.apiResponse = await this.userContext.get('/api/sales/999999');
});

When('the user tries to delete the sale', async function () {
  this.userContext = await getUserApiContext();
  this.apiResponse = await this.userContext.delete(`/api/sales/${this.sale.id}`);
});

// --- THEN ---
Then('the user response status should be {int}', async function (status) {
  expect(this.apiResponse.status()).toBe(status);
});

Then('the user response should be an array of plants', function () {
  expect(Array.isArray(this.apiResponseBody)).toBe(true);
  expect(this.apiResponseBody.length).toBeGreaterThan(0);
});

Then('the user plant category id should match', function () {
  expect(this.apiResponseBody[0].category.id).toBe(this.subCategory.id);
});

Then('the user sale details should be correct', function () {
  const body = this.apiResponseBody;
  expect(body.id).toBe(this.sale.id);
  expect(body).toHaveProperty('plant');
  expect(body.plant).toHaveProperty('id');
  expect(body.plant.id).toBe(this.plant.id);
  expect(body).toHaveProperty('quantity');
  expect(body.quantity).toBe(1);
  expect(body).toHaveProperty('totalPrice');
  expect(body.totalPrice).toBe(500);
  expect(body).toHaveProperty('soldAt');
});