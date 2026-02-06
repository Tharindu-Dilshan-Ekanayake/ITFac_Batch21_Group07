import { test, expect } from '@playwright/test';
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
  const randomNumber = Math.floor(Math.random() * 100000);
  
  let mainCategory, subCategory, plant, sale;
  
  try {
    // Step 1: Create MAIN category
    const mainCategoryPayload = {
      name: `Main${randomNumber}`,
      subCategories: []
    };
    const mainCategoryResponse = await context.post("/api/categories", { 
      data: mainCategoryPayload 
    });
    
    if (mainCategoryResponse.status() !== 201) {
      console.error('Main category creation failed. Status:', mainCategoryResponse.status());
      console.error('Response:', await mainCategoryResponse.text());
    }
    
    expect(mainCategoryResponse.status()).toBe(201);
    mainCategory = await mainCategoryResponse.json();
    
    // Step 2: Create SUB-CATEGORY
    const subCategoryPayload = {
      name: `Sub${randomNumber}`,
      parent: mainCategory,
      subCategories: []
    };
    const subCategoryResponse = await context.post("/api/categories", { 
      data: subCategoryPayload 
    });
    
    if (subCategoryResponse.status() !== 201) {
      console.error('Sub-category creation failed. Status:', subCategoryResponse.status());
      console.error('Response:', await subCategoryResponse.text());
    }
    
    expect(subCategoryResponse.status()).toBe(201);
    subCategory = await subCategoryResponse.json();
    
    // Step 3: Create plant under the sub-category
    const plantRes = await context.post(`/api/plants/category/${subCategory.id}`, {
      data: {
        name: `Test Plant ${Date.now()}`,
        price: 500,
        quantity: 10,
        category: subCategory
      }
    });
    
    if (plantRes.status() !== 201) {
      console.error('Plant creation failed. Status:', plantRes.status());
      console.error('Response:', await plantRes.text());
    }
    
    expect(plantRes.status()).toBe(201);
    plant = await plantRes.json();
    
    // Step 4: Sell 1 unit
    const sellResponse = await context.post(
      `/api/sales/plant/${plant.id}?quantity=1`
    );
    expect(sellResponse.status()).toBe(201);
    sale = await sellResponse.json();
    
  } finally {
    // CLEANUP - Delete in reverse order of dependencies
    
    // 1. Delete sale first (if it was created)
    if (sale?.id) {
      await context.delete(`/api/sales/${sale.id}`);
    }
    
    // 2. Delete inventory records associated with the plant
    if (plant?.id) {
      await context.delete(`/api/inventory/plant/${plant.id}`);
    }
    
    // 3. Delete the plant
    if (plant?.id) {
      await context.delete(`/api/plants/${plant.id}`);
    }
    
    // 4. Delete sub-category
    if (subCategory?.id) {
      await context.delete(`/api/categories/${subCategory.id}`);
    }
    
    // 5. Delete main category
    if (mainCategory?.id) {
      await context.delete(`/api/categories/${mainCategory.id}`);
    }
  }
});

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
    const randomNumber = Math.floor(Math.random() * 100000);
  
  let mainCategory, subCategory, plant, sale;
  

    // Step 1: Create MAIN category
    const mainCategoryPayload = {
      name: `Main${randomNumber}`,
      subCategories: []
    };
    const mainCategoryResponse = await context.post("/api/categories", { 
      data: mainCategoryPayload 
    });
    
    if (mainCategoryResponse.status() !== 201) {
      console.error('Main category creation failed. Status:', mainCategoryResponse.status());
      console.error('Response:', await mainCategoryResponse.text());
    }
    
    expect(mainCategoryResponse.status()).toBe(201);
    mainCategory = await mainCategoryResponse.json();
    
    // Step 2: Create SUB-CATEGORY
    const subCategoryPayload = {
      name: `Sub${randomNumber}`,
      parent: mainCategory,
      subCategories: []
    };
    const subCategoryResponse = await context.post("/api/categories", { 
      data: subCategoryPayload 
    });
    
    if (subCategoryResponse.status() !== 201) {
      console.error('Sub-category creation failed. Status:', subCategoryResponse.status());
      console.error('Response:', await subCategoryResponse.text());
    }
    
    expect(subCategoryResponse.status()).toBe(201);
    subCategory = await subCategoryResponse.json();
    
    // Step 3: Create plant under the sub-category
    const plantRes = await context.post(`/api/plants/category/${subCategory.id}`, {
      data: {
        name: `Test Plant ${Date.now()}`,
        price: 500,
        quantity: 10,
        category: subCategory
      }
    });
    
    if (plantRes.status() !== 201) {
      console.error('Plant creation failed. Status:', plantRes.status());
      console.error('Response:', await plantRes.text());
    }
    
    expect(plantRes.status()).toBe(201);
    plant = await plantRes.json();
    
    // Step 4: Sell 1 unit
    const sellResponse = await context.post(
      `/api/sales/plant/${plant.id}?quantity=1`
    );
    expect(sellResponse.status()).toBe(201);
    sale = await sellResponse.json();
    

    const response = await context.get('/api/sales');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });  // passed



  test('API_ADMIN-34 Get sale by sale ID', async () => {
  const context = await getAdminApiContext();

  const randomNumber = Math.floor(Math.random() * 100000);
  
  let mainCategory, subCategory, plant, sale;
  

    // Step 1: Create MAIN category
    const mainCategoryPayload = {
      name: `Main${randomNumber}`,
      subCategories: []
    };
    const mainCategoryResponse = await context.post("/api/categories", { 
      data: mainCategoryPayload 
    });
    
    if (mainCategoryResponse.status() !== 201) {
      console.error('Main category creation failed. Status:', mainCategoryResponse.status());
      console.error('Response:', await mainCategoryResponse.text());
    }
    
    expect(mainCategoryResponse.status()).toBe(201);
    mainCategory = await mainCategoryResponse.json();
    
    // Step 2: Create SUB-CATEGORY
    const subCategoryPayload = {
      name: `Sub${randomNumber}`,
      parent: mainCategory,
      subCategories: []
    };
    const subCategoryResponse = await context.post("/api/categories", { 
      data: subCategoryPayload 
    });
    
    if (subCategoryResponse.status() !== 201) {
      console.error('Sub-category creation failed. Status:', subCategoryResponse.status());
      console.error('Response:', await subCategoryResponse.text());
    }
    
    expect(subCategoryResponse.status()).toBe(201);
    subCategory = await subCategoryResponse.json();
    
    // Step 3: Create plant under the sub-category
    const plantRes = await context.post(`/api/plants/category/${subCategory.id}`, {
      data: {
        name: `Test Plant ${Date.now()}`,
        price: 500,
        quantity: 10,
        category: subCategory
      }
    });
    
    if (plantRes.status() !== 201) {
      console.error('Plant creation failed. Status:', plantRes.status());
      console.error('Response:', await plantRes.text());
    }
    
    expect(plantRes.status()).toBe(201);
    plant = await plantRes.json();
    
    // Step 4: Sell 1 unit
    const sellResponse = await context.post(
      `/api/sales/plant/${plant.id}?quantity=1`
    );
    expect(sellResponse.status()).toBe(201);
    sale = await sellResponse.json();
     const saleId = sale.id;

  /* Step 3: Get sale by ID */
  const response = await context.get(`/api/sales/${saleId}`);
  expect(response.status()).toBe(200);

  const body = await response.json();

  /*  Step 4: Assertions */
 
    expect(body).toHaveProperty('id', saleId);
    expect(body.plant.id).toBe(plant.id);
    expect(body.quantity).toBe(1);

    });    // passed

    


  test('API_ADMIN-35 Get sale by invalid sale ID', async () => {
    const context = await getAdminApiContext();
    const invalidSaleId = 999999;

    const response = await context.get(`/api/sales/${invalidSaleId}`);
    expect(response.status()).toBe(404);
  });   // passed


  

  test('API_ADMIN-36 Delete sale authorized', async () => {
  const context = await getAdminApiContext();

  const randomNumber = Math.floor(Math.random() * 100000);
  
  let mainCategory, subCategory, plant, sale;
  

    // Step 1: Create MAIN category
    const mainCategoryPayload = {
      name: `Main${randomNumber}`,
      subCategories: []
    };
    const mainCategoryResponse = await context.post("/api/categories", { 
      data: mainCategoryPayload 
    });
    
    if (mainCategoryResponse.status() !== 201) {
      console.error('Main category creation failed. Status:', mainCategoryResponse.status());
      console.error('Response:', await mainCategoryResponse.text());
    }
    
    expect(mainCategoryResponse.status()).toBe(201);
    mainCategory = await mainCategoryResponse.json();
    
    // Step 2: Create SUB-CATEGORY
    const subCategoryPayload = {
      name: `Sub${randomNumber}`,
      parent: mainCategory,
      subCategories: []
    };
    const subCategoryResponse = await context.post("/api/categories", { 
      data: subCategoryPayload 
    });
    
    if (subCategoryResponse.status() !== 201) {
      console.error('Sub-category creation failed. Status:', subCategoryResponse.status());
      console.error('Response:', await subCategoryResponse.text());
    }
    
    expect(subCategoryResponse.status()).toBe(201);
    subCategory = await subCategoryResponse.json();
    
    // Step 3: Create plant under the sub-category
    const plantRes = await context.post(`/api/plants/category/${subCategory.id}`, {
      data: {
        name: `Test Plant ${Date.now()}`,
        price: 500,
        quantity: 10,
        category: subCategory
      }
    });
    
    if (plantRes.status() !== 201) {
      console.error('Plant creation failed. Status:', plantRes.status());
      console.error('Response:', await plantRes.text());
    }
    
    expect(plantRes.status()).toBe(201);
    plant = await plantRes.json();
    
    // Step 4: Sell 1 unit
    const sellResponse = await context.post(
      `/api/sales/plant/${plant.id}?quantity=1`
    );
    expect(sellResponse.status()).toBe(201);
    sale = await sellResponse.json();
    
  const saleId = sale.id;

  /*  Step 3: Delete the sale  */
  const deleteRes = await context.delete(`/api/sales/${saleId}`);
  expect(deleteRes.status()).toBe(204);
});   // passed


});
