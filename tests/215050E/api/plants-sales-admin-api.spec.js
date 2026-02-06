import{ test, expect } from '@playwright/test';
import { getAdminApiContext } from '../../../utils/api-admin.js';


test.describe('Admin Plants & Sales API', () => {

  test('API_ADMIN-28 Get plants by category ID', async () => {
    const context = await getAdminApiContext();
    const categoryId = 3;

    const response = await context.get(`/api/plants/category/${categoryId}`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);

    if (body.length > 0) {
      expect(body[0]).toHaveProperty('id');
      expect(body[0]).toHaveProperty('name');
    }
  });  // passed



  test('API_ADMIN-29 Get plant summary', async () => {
    const context = await getAdminApiContext();

    const response = await context.get('/api/plants/summary');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('totalPlants');
  });   // passed



  test('API_ADMIN-30 Search plants with pagination', async () => {
    const context = await getAdminApiContext();

    const response = await context.get('/api/plants/paged?page=0&size=10&sort=name');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('content');
    expect(Array.isArray(body.content)).toBe(true);
  });   // passed



  test('API_ADMIN-31 Sell plant and update stock', async () => {
  const context = await getAdminApiContext();

  const createPlantPayload = {
    id: 0,
    name: `TestPlant-${Date.now()}`,
    price: 500,
    quantity: 10,
    category: {
      id: 3
    }
  };

  const createPlantRes = await context.post('/api/plants/category/3', {
    data: createPlantPayload
  });

  // Debug helper (keep if needed)
  if (createPlantRes.status() !== 201) {
    console.log('Create plant error:', await createPlantRes.text());
  }

  expect(createPlantRes.status()).toBe(201);
  const plant = await createPlantRes.json();
  expect(plant).toHaveProperty('id');

  // Sell 1 unit
  const sellResponse = await context.post(
    `/api/sales/plant/${plant.id}?quantity=1`
  );

  expect(sellResponse.status()).toBe(201);
});      // passed


  test('API_ADMIN-32 Prevent sale with invalid quantity', async () => {
    const context = await getAdminApiContext();
    const plantId = 1;
    const invalidQuantity = -5;

    const response = await context.post(
      `/api/sales/plant/${plantId}?quantity=${invalidQuantity}`
    );

    expect(response.status()).toBe(400);
  });  // passed



  test('API_ADMIN-33 Get all sales', async () => {
    const context = await getAdminApiContext();

    const response = await context.get('/api/sales');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });  // passed



  test('API_ADMIN-34 Get sale by sale ID', async () => {
  const context = await getAdminApiContext();

  /* ---------------- Step 1: Create a plant ---------------- */
  const plantRes = await context.post('/api/plants/category/3', {
    data: {
      name: `Test Plant ${Date.now()}`,
      price: 500,
      quantity: 20,
      description: 'Plant created for sale test',
      status: 'SELLABLE'
    }
  });

  expect(plantRes.status()).toBe(201);
  const plant = await plantRes.json();
  const plantId = plant.id;

  /* ---------------- Step 2: Create a sale ---------------- */
  
  const saleRes = await context.post(`/api/sales/plant/${plant.id}?quantity=3`, {
    data: {
      plantId: plantId,
      quantity: 3
    }
  });

  expect(saleRes.status()).toBe(201);
  const sale = await saleRes.json();
  const saleId = sale.id;

  /* ---------------- Step 3: Get sale by ID ---------------- */
  const response = await context.get(`/api/sales/${saleId}`);
  expect(response.status()).toBe(200);

  const body = await response.json();

  /* ---------------- Step 4: Assertions ---------------- */
 
    expect(body).toHaveProperty('id', saleId);
    expect(body.plant.id).toBe(plantId);
    expect(body.quantity).toBe(3);

    });    // passed

    


  test('API_ADMIN-35 Get sale by invalid sale ID', async () => {
    const context = await getAdminApiContext();
    const invalidSaleId = 999999;

    const response = await context.get(`/api/sales/${invalidSaleId}`);
    expect(response.status()).toBe(404);
  });   // passed


  

  test('API_ADMIN-36 Delete sale authorized', async () => {
  const context = await getAdminApiContext();

  /* ---------------- Step 1: Create a plant ---------------- */
  const plantRes = await context.post('/api/plants/category/3', {
    data: {
      name: `Test Plant ${Date.now()}`,
      price: 500,
      quantity: 10,
      description: 'Plant for delete sale test',
      status: 'SELLABLE'
    }
  });

  expect(plantRes.status()).toBe(201);
  const plant = await plantRes.json();
  const plantId = plant.id;

  /* ---------------- Step 2: Create a sale ---------------- */
  const saleRes = await context.post(`/api/sales/plant/${plantId}?quantity=1`, {
    data: { plantId, quantity: 1 }
  });

  expect(saleRes.status()).toBe(201);
  const sale = await saleRes.json();
  const saleId = sale.id;

  /* ---------------- Step 3: Delete the sale ---------------- */
  const deleteRes = await context.delete(`/api/sales/${saleId}`);
  expect(deleteRes.status()).toBe(204);
});   // passed


});
