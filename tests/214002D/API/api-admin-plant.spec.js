import { test, expect } from "@playwright/test";
import { getAdminApiContext } from "../../../utils/api-admin";
import { check_PlantID } from "../data/plant.data";

let TestCategoryId;
let TestPlantId;
let categoryID_1;

test("Create category ", async ({ baseURL }) => {
  const context = await getAdminApiContext();
  const randomNumber1 = Math.floor(Math.random() * 1000);
  const randomNumber2 = Math.floor(Math.random() * 1000);

  // First create a category
  const createPayload = {
    name: `new${randomNumber1}`,
    parent: {},
    subCategories: [],
  };

  const createResponse1 = await context.post(`${baseURL}/api/categories`, {
    data: createPayload,
  });
  const createData = await createResponse1.json();
  expect(createResponse1.status()).toBe(201);

  const firstCategoryId = createData.id;
  categoryID_1 = createData.id;

  //  second category
  const createPayload2 = {
    name: `new${randomNumber2}`,
    parent: { id: firstCategoryId },
    subCategories: [],
  };
  const createResponse2 = await context.post(`${baseURL}/api/categories`, {
    data: createPayload2,
  });
  const createData2 = await createResponse2.json();
  expect(createResponse2.status()).toBe(201);
  TestCategoryId = createData2.id;
});

test("Create a new plant with valid category ID", async ({ baseURL }) => {
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

test("Prevent duplicate plant  same name in same category ", async ({
  baseURL,
}) => {
  const context = await getAdminApiContext();

  const duplicatePlant = {
    name: "Test Duplicate Plant",
    price: 150,
    quantity: 20,
    categoryId: TestCategoryId,
  };

  // First create the plant
  const firstResponse = await context.post(
    `${baseURL}/api/plants/category/${duplicatePlant.categoryId}`,
    {
      data: duplicatePlant,
    },
  );

  expect(firstResponse.status()).toBe(201);
  const firstBody = await firstResponse.json();
  expect(firstBody).toHaveProperty("id");

  // create the SAME plant again in SAME category
  const secondResponse = await context.post(
    `${baseURL}/api/plants/category/${duplicatePlant.categoryId}`,
    {
      data: duplicatePlant,
    },
  );

  expect(secondResponse.status()).toBe(400);
  const secondBody = await secondResponse.json();
  expect(secondBody.status).toBe(400);
  expect(secondBody.error).toBe("DUPLICATE_RESOURCE");

  // Cleanup - delete the created plant
  await context.delete(`${baseURL}/api/plants/${firstBody.id}`);
});

test("Plant Get by Category ID", async ({ baseURL }) => {
  const context = await getAdminApiContext();
  const categoryID = TestCategoryId;

  const response = await context.get(
    `${baseURL}/api/plants/category/${categoryID}`,
  );
  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(Array.isArray(data)).toBeTruthy();
  expect(data.length).toBeGreaterThan(0);
});

test("Get plant values By Plant ID", async ({ baseURL }) => {
  const context = await getAdminApiContext();
  const plantID = TestPlantId;
  const response = await context.get(`${baseURL}/api/plants/${plantID}`);

  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data).toHaveProperty("id", plantID);
});

test("Update existing plant", async ({ baseURL }) => {
  const context = await getAdminApiContext();
  const plantID = TestPlantId;

  const updatePayload = {
    name: "API Updated Plant",
    price: 200,
    quantity: 30,
    categoryId: TestCategoryId,
  };
  const response = await context.put(`${baseURL}/api/plants/${plantID}`, {
    data: updatePayload,
  });
  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(data).toHaveProperty("id", plantID);
  expect(data).toHaveProperty("name", updatePayload.name);
  expect(data).toHaveProperty("price", updatePayload.price);
  expect(data).toHaveProperty("quantity", updatePayload.quantity);
});

test("Check plant exists by Invalid Plant ID", async ({ baseURL }) => {
  const context = await getAdminApiContext();
  const invalidPlantID = check_PlantID;
  const response = await context.get(`${baseURL}/api/plants/${invalidPlantID}`);

  expect(response.status()).toBe(404);
  const data = await response.json();
  expect(data.status).toBe(404);
  expect(data.error).toBe("NOT_FOUND");
  expect(data.message).toBe(`Plant not found: ${invalidPlantID}`);
});

test("Delete existing plant", async ({ baseURL }) => {
  const context = await getAdminApiContext();
  const plantID = TestPlantId;
  const response = await context.delete(`${baseURL}/api/plants/${plantID}`);
  expect(response.status()).toBe(204);
});

test("Delete non-existing plant", async ({ baseURL }) => {
  const context = await getAdminApiContext();
  const nonExistingPlantID = check_PlantID;
  const response = await context.delete(
    `${baseURL}/api/plants/${nonExistingPlantID}`,
  );

  expect(response.status()).toBe(204);
});

test.afterAll("Delete category Created for Plant", async ({ baseURL }) => {
  const context = await getAdminApiContext();

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
