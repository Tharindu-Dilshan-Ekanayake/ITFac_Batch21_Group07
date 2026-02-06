import { test, expect } from "@playwright/test";
import { getAdminApiContext } from "../../../utils/api-admin";
import { getUserApiContext } from "../../../utils/api-user";
import { check_PlantID } from "../data/plant.data";

let TestCategoryId;
let TestPlantId;
let categoryID_1;

test("Create category on Admin side ", async ({}) => {
  const context = await getAdminApiContext();
  const randomNumber1 = Math.floor(Math.random() * 1000);
  const randomNumber2 = Math.floor(Math.random() * 1000);

  // First create a category
  const createPayload = {
    name: `User${randomNumber1}`,
    parent: {},
    subCategories: [],
  };

  const createResponse1 = await context.post("/api/categories", {
    data: createPayload,
  });
  const createData = await createResponse1.json();
  expect(createResponse1.status()).toBe(201);

  const firstCategoryId = createData.id;
  categoryID_1 = createData.id;

  //  second category
  const createPayload2 = {
    name: `User${randomNumber2}`,
    parent: { id: firstCategoryId },
    subCategories: [],
  };
  const createResponse2 = await context.post("/api/categories", {
    data: createPayload2,
  });
  const createData2 = await createResponse2.json();
  expect(createResponse2.status()).toBe(201);
  TestCategoryId = createData2.id;
});

test("Create a new plant On Admin part to Check", async ({ baseURL }) => {
  const context = await getAdminApiContext();

  const newPlant = {
    name: "Test Admin Plant",
    price: 150,
    quantity: 20,
    categoryId: TestCategoryId,
  };

  const response = await context.post(
    `${baseURL}/api/plants/category/${newPlant.categoryId}`,
    {
      data: newPlant,
    },
  );

  expect(response.status()).toBe(201);
  const responseBody = await response.json();
  expect(responseBody).toHaveProperty("id");
  TestPlantId = responseBody.id;
});

test("Create a new plant with valid category ID", async ({ baseURL }) => {
  const context = await getUserApiContext();

  const newPlant = {
    name: "Test User Plant",
    price: 100,
    quantity: 2,
    categoryId: TestCategoryId,
  };

  const response = await context.post(
    `${baseURL}/api/plants/category/${newPlant.categoryId}`,
    {
      data: newPlant,
    },
  );

  expect(response.status()).toBe(403);
});

test("Get plant values By Plant ID", async ({ baseURL }) => {
  const context = await getUserApiContext();
  const plantID = TestPlantId;
  const response = await context.get(`${baseURL}/api/plants/${plantID}`);

  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data).toHaveProperty("id", plantID);
});

test("Plant Get by Category ID", async ({ baseURL }) => {
  const context = await getUserApiContext();
  const categoryID = TestCategoryId;
  const response = await context.get(
    `${baseURL}/api/plants/category/${categoryID}`,
  );

  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBeGreaterThan(0);

  const plant = data.find((p) => p.id === TestPlantId);
  expect(plant).toBeDefined();
  expect(plant).toHaveProperty("name", "Test Admin Plant");
});

test("Check plant exists by Invalid Plant ID", async ({ baseURL }) => {
  const context = await getUserApiContext();
  const invalidPlantID = check_PlantID;
  const response = await context.get(`${baseURL}/api/plants/${invalidPlantID}`);

  expect(response.status()).toBe(404);
  const data = await response.json();
  expect(data.status).toBe(404);
  expect(data.error).toBe("NOT_FOUND");
  expect(data.message).toBe(`Plant not found: ${invalidPlantID}`);
});

test("Check to User can Update existing plant", async ({ baseURL }) => {
  const context = await getUserApiContext();
  const plantID = TestPlantId;
  const updatePayload = {
    name: "User Plant",
    price: 180,
    quantity: 25,
    categoryId: TestCategoryId,
  };
  const response = await context.put(`${baseURL}/api/plants/${plantID}`, {
    data: updatePayload,
  });
  expect(response.status()).toBe(403);
});

test("Check to User can Delete existing plant", async ({ baseURL }) => {
  const context = await getUserApiContext();
  const plantID = TestPlantId;
  const response = await context.delete(`${baseURL}/api/plants/${plantID}`);
  expect(response.status()).toBe(403);
});

test.afterAll("Delete category Created for Plant", async ({ baseURL }) => {
  const context = await getAdminApiContext();

  // First delete plant
  const PlantID = TestPlantId;
  const response = await context.delete(`${baseURL}/api/plants/${PlantID}`);
  expect(response.status()).toBe(204);

  // Then delete category

  //  First category delete
  const categoryID = TestCategoryId;
  const response1 = await context.delete(
    `${baseURL}/api/categories/${categoryID}`,
  );
  expect(response1.status()).toBe(204);

  //  Second category delete
  const response2 = await context.delete(
    `${baseURL}/api/categories/${categoryID_1}`,
  );
  expect(response2.status()).toBe(204);
});
