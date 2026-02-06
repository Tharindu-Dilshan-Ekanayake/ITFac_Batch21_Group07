import { Given, When, Then, After } from "@cucumber/cucumber";
import { expect, request } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

/* ---------- AUTH HELPERS ---------- */

async function getAdminApiContext() {
  const loginContext = await request.newContext({ baseURL: BASE_URL });

  const loginRes = await loginContext.post("/api/auth/login", {
    data: {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    },
  });

  expect(loginRes.status(), await loginRes.text()).toBe(200);
  const { token } = await loginRes.json();

  return await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}


// Helper to create main category, subcategory, and plant
async function createCategorySubcategoryPlant(apiContext, random = Math.floor(Math.random() * 100000)) {
  // MAIN CATEGORY
  const mainRes = await apiContext.post('/api/categories', {
    data: { name: `Main${random}`, subCategories: [] },
  });
  expect(mainRes.status()).toBe(201);
  const mainCategory = await mainRes.json();

  // SUB CATEGORY
  const subRes = await apiContext.post('/api/categories', {
    data: {
      name: `Sub${random}`,
      parent: mainCategory,
      subCategories: [],
    },
  });
  expect(subRes.status()).toBe(201);
  const subCategory = await subRes.json();

  // PLANT
  const plantRes = await apiContext.post(
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

/* ---------- GIVEN ---------- */

Given("I am an authenticated admin via API", async function () {
  this.apiContext = await getAdminApiContext();
});

Given('the admin API context is initialized', async function () {
  this.apiContext = await getAdminApiContext();
});


Given('a main category, sub category and plant exist', async function () {
  const { mainCategory, subCategory, plant } = await createCategorySubcategoryPlant(this.apiContext);
  this.mainCategory = mainCategory;
  this.subCategory = subCategory;
  this.plant = plant;
});


Given('a sale exists', async function () {
  // Ensure plant exists
  if (!this.plant) {
    const { mainCategory, subCategory, plant } = await createCategorySubcategoryPlant(this.apiContext);
    this.mainCategory = mainCategory;
    this.subCategory = subCategory;
    this.plant = plant;
  }
  // Sell 1 unit
  const sellResponse = await this.apiContext.post(
    `/api/sales/plant/${this.plant.id}?quantity=1`
  );
  expect(sellResponse.status()).toBe(201);
  this.sale = await sellResponse.json();
});

Given("there is an existing plant ready for sale", async function () {
  const random = Math.floor(Math.random() * 10000);

  // MAIN CATEGORY
  const mainRes = await this.apiContext.post("/api/categories", {
    data: { name: `Main${random}`, subCategories: [] },
  });
  expect(mainRes.status()).toBe(201);
  this.mainCategory = await mainRes.json();

  // SUB CATEGORY
  const subRes = await this.apiContext.post("/api/categories", {
    data: {
      name: `Sub${random}`,
      parent: this.mainCategory,
      subCategories: [],
    },
  });
  expect(subRes.status()).toBe(201);
  this.subCategory = await subRes.json();

  // PLANT
  const plantRes = await this.apiContext.post(
    `/api/plants/category/${this.subCategory.id}`,
    {
      data: {
        name: `Plant${Date.now()}`,
        price: 500,
        quantity: 10,
        category: this.subCategory,
      },
    }
  );
  expect(plantRes.status()).toBe(201);
  this.plant = await plantRes.json();
});

/* ---------- WHEN ---------- */

When("I sell {int} quantity of the plant", async function (qty) {
  this.apiResponse = await this.apiContext.post(
    `/api/sales/plant/${this.plant.id}?quantity=${qty}`
  );

  if (this.apiResponse.status() !== 204) {
    this.apiResponseBody = await this.apiResponse.json();
  }
});

When('the admin requests plants by category id {int}', async function (categoryId) {
  this.apiResponse = await this.apiContext.get(`/api/plants/category/${categoryId}`);
  this.apiResponseBody = await this.apiResponse.json();
});

When('the admin requests plant summary', async function () {
  this.apiResponse = await this.apiContext.get('/api/plants/summary');
  this.apiResponseBody = await this.apiResponse.json();
});

When('the admin searches plants with pagination', async function () {
  this.apiResponse = await this.apiContext.get('/api/plants/paged?page=0&size=10&sort=name');
  this.apiResponseBody = await this.apiResponse.json();
});

When('the admin sells {int} quantity of the plant', async function (qty) {
  this.apiResponse = await this.apiContext.post(`/api/sales/plant/${this.plant.id}?quantity=${qty}`);
  if (this.apiResponse.status() !== 204) {
    this.apiResponseBody = await this.apiResponse.json();
  }
});


When('the admin sells plant with invalid quantity', async function () {
  // Ensure plant exists
  if (!this.plant) {
    const { mainCategory, subCategory, plant } = await createCategorySubcategoryPlant(this.apiContext);
    this.mainCategory = mainCategory;
    this.subCategory = subCategory;
    this.plant = plant;
  }
  this.apiResponse = await this.apiContext.post(`/api/sales/plant/${this.plant.id}?quantity=-5`);
  if (this.apiResponse.status() !== 204) {
    try {
      this.apiResponseBody = await this.apiResponse.json();
    } catch {}
  }
});

When('the admin requests all sales', async function () {
  this.apiResponse = await this.apiContext.get('/api/sales');
  this.apiResponseBody = await this.apiResponse.json();
});

When('the admin requests sale by ID', async function () {
  this.apiResponse = await this.apiContext.get(`/api/sales/${this.sale.id}`);
  this.apiResponseBody = await this.apiResponse.json();
});

When('the admin requests sale by invalid ID', async function () {
  this.apiResponse = await this.apiContext.get('/api/sales/999999');
  try {
    this.apiResponseBody = await this.apiResponse.json();
  } catch {}
});

When('the admin deletes the sale', async function () {
  this.apiResponse = await this.apiContext.delete(`/api/sales/${this.sale.id}`);
});

When("I request all sales via API", async function () {
  this.apiResponse = await this.apiContext.get("/api/sales");
  this.apiResponseBody = await this.apiResponse.json();
});

When("I request sale by ID via API", async function () {
  this.apiResponse = await this.apiContext.get(
    `/api/sales/${this.sale.id}`
  );
  this.apiResponseBody = await this.apiResponse.json();
});

When("I delete the sale via API", async function () {
  this.apiResponse = await this.apiContext.delete(
    `/api/sales/${this.sale.id}`
  );
});

/* ---------- THEN ---------- */

Then("the API response status should be {int}", async function (status) {
  expect(
    this.apiResponse.status(),
    await this.apiResponse.text()
  ).toBe(status);
});

Then('the response status should be {int}', async function (status) {
  expect(this.apiResponse.status(), await this.apiResponse.text()).toBe(status);
});

Then('the response should be an array of plants', function () {
  expect(Array.isArray(this.apiResponseBody)).toBe(true);
});

Then('the response should contain totalPlants', function () {
  expect(this.apiResponseBody).toHaveProperty('totalPlants');
});

Then('the response should contain paged plant content', function () {
  expect(this.apiResponseBody).toHaveProperty('content');
  expect(Array.isArray(this.apiResponseBody.content)).toBe(true);
});

Then('the response should be a list of sales', function () {
  expect(Array.isArray(this.apiResponseBody)).toBe(true);
});

Then('the sale details should be correct', function () {
  expect(this.apiResponseBody).toHaveProperty('id', this.sale.id);
  expect(this.apiResponseBody.plant.id).toBe(this.plant.id);
  expect(this.apiResponseBody.quantity).toBe(1);
});

Then("the sales list should be returned", async function () {
  expect(Array.isArray(this.apiResponseBody)).toBe(true);
});

Then("the sale should be created successfully", async function () {
  expect(this.apiResponseBody).toHaveProperty("id");
  this.sale = this.apiResponseBody;
});

/* ---------- CLEANUP ---------- */

After(async function () {
  const adminContext = await getAdminApiContext();

  try {
    if (this.sale?.id) {
      await adminContext.delete(`/api/sales/${this.sale.id}`);
    }
    if (this.plant?.id) {
      await adminContext.delete(`/api/plants/${this.plant.id}`);
    }
    if (this.subCategory?.id) {
      await adminContext.delete(`/api/categories/${this.subCategory.id}`);
    }
    if (this.mainCategory?.id) {
      await adminContext.delete(`/api/categories/${this.mainCategory.id}`);
    }
  } catch (e) {
    // cleanup best-effort
  }
});
