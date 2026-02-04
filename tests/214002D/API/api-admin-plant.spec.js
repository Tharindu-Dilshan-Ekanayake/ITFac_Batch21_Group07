import { test, expect } from "@playwright/test";
import { getAdminApiContext } from "../../../utils/api-admin";

let createdPlantId;

test("Get plants list", async ({ baseURL }) => {
  const context = await getAdminApiContext();
  const response = await context.get(`${baseURL}/api/plants`);

  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(Array.isArray(data)).toBeTruthy();
  expect(data.length).toBeGreaterThan(0);
});

test("Create a new plant with valid category ID", async ({ baseURL }) => {
  const context = await getAdminApiContext();

  const newPlant = {
    name: "API Test Plant",
    price: 150,
    quantity: 20,
    categoryId: 55,
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

  createdPlantId = responseBody.id;
});

// test("Delete existing plant", async ({ baseURL }) => {
//   const context = await getAdminApiContext();

//   const createRes = await context.post(`${baseURL}/api/plants`, {
//     data: {
//       name: "Delete Test Plant",
//       price: 10,
//       quantity: 5,
//       categoryId: 55,
//     },
//   });

//   expect(createRes.status()).toBe(201);

//   const createdBody = await createRes.json();
//   expect(createdBody).toHaveProperty("id");

//   const plantId = createdBody.id;
//   const deleteRes = await context.delete(
//     `${baseURL}/api/plants/${plantId}`
//   );
//   expect(deleteRes.status()).toBe(204);
// });
