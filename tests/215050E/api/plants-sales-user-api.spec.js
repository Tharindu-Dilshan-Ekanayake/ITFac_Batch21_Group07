const { test, expect } = require('@playwright/test');
import { getUserApiContext } from '../../../utils/api-user.js';
import { getAdminApiContext } from '../../../utils/api-admin.js';

test.describe('User Plants & Sales API', () => {

 test('API_USER-30 Get plants by category ID', async () => {
  const adminContext = await getAdminApiContext();
  
  const randomNumber = Math.floor(Math.random() * 1000);

  // Step 1: Create MAIN category
  const mainCategoryPayload = {
    name: `Main${randomNumber}`,
    subCategories: []
  };

  const mainCategoryResponse = await adminContext.post("/api/categories", { 
    data: mainCategoryPayload 
  });
  
  if (mainCategoryResponse.status() !== 201) {
    console.error('Main category creation failed. Status:', mainCategoryResponse.status());
    console.error('Response:', await mainCategoryResponse.text());
  }
  
  expect(mainCategoryResponse.status()).toBe(201);
  const mainCategory = await mainCategoryResponse.json();

  // Step 2: Create SUB-CATEGORY under the main category
  const subCategoryPayload = {
    name: `Sub${randomNumber}`,
    parent: mainCategory,  // Pass the entire parent category object, not just the ID
    subCategories: []
  };

  const subCategoryResponse = await adminContext.post("/api/categories", { 
    data: subCategoryPayload 
  });
  
  if (subCategoryResponse.status() !== 201) {
    console.error('Sub-category creation failed. Status:', subCategoryResponse.status());
    console.error('Response:', await subCategoryResponse.text());
  }
  
  expect(subCategoryResponse.status()).toBe(201);
  const subCategory = await subCategoryResponse.json();
  const categoryId = subCategory.id;

  // Step 3: Create plant under the SUB-CATEGORY
  const plantRes = await adminContext.post(`/api/plants/category/${categoryId}`, {
    data: {
      name: `Test Plant ${Date.now()}`,
      price: 500,
      quantity: 10,
      category: subCategory  // Pass the sub-category object
    }
  });
  
  if (plantRes.status() !== 201) {
    console.error('Plant creation failed. Status:', plantRes.status());
    console.error('Response:', await plantRes.text());
  }
  
  expect(plantRes.status()).toBe(201);

  // Test: User gets plants by category ID
  const userContext = await getUserApiContext();
  const response = await userContext.get(`/api/plants/category/${categoryId}`);
  
  expect(response.status()).toBe(200);
  const body = await response.json();
  
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeGreaterThan(0);
  expect(body[0].category.id).toBe(categoryId);
}); //passed




 test('API_USER-31 Selling plant unauthorized', async () => {
  const adminContext = await getAdminApiContext();
  const randomNumber = Math.floor(Math.random() * 100000);

  // Step 1: Create MAIN category
  const mainCategoryPayload = {
    name: `Main${randomNumber}`,
    subCategories: []
  };

  const mainCategoryResponse = await adminContext.post("/api/categories", { 
    data: mainCategoryPayload 
  });
  
  if (mainCategoryResponse.status() !== 201) {
    console.error('Main category creation failed. Status:', mainCategoryResponse.status());
    console.error('Response:', await mainCategoryResponse.text());
  }
  
  expect(mainCategoryResponse.status()).toBe(201);
  const mainCategory = await mainCategoryResponse.json();

  // Step 2: Create SUB-CATEGORY
  const subCategoryPayload = {
    name: `Sub${randomNumber}`,
    parent: mainCategory,  // Pass the entire parent category object, not just the ID
    subCategories: []
  };

  const subCategoryResponse = await adminContext.post("/api/categories", { 
    data: subCategoryPayload 
  });
  
  if (subCategoryResponse.status() !== 201) {
    console.error('Sub-category creation failed. Status:', subCategoryResponse.status());
    console.error('Response:', await subCategoryResponse.text());
  }
  
  expect(subCategoryResponse.status()).toBe(201);
  const subCategory = await subCategoryResponse.json();
  const categoryId = subCategory.id;


  // Step 3: Create plant under the sub-category
  const plantRes = await adminContext.post(`/api/plants/category/${categoryId}`, {
    data: {
      name: `Test Plant ${Date.now()}`,
      price: 500,
      quantity: 10,
      category: subCategory  // Pass the sub-category object
    }
  });
  
  if (plantRes.status() !== 201) {
    console.error('Plant creation failed. Status:', plantRes.status());
    console.error('Response:', await plantRes.text());
  }
  
  expect(plantRes.status()).toBe(201);
  const plant = await plantRes.json();

  // Test: User tries to sell (should be forbidden)
  const userContext = await getUserApiContext();
  const response = await userContext.post(`/api/sales/plant/${plant.id}?quantity=1`);
  
  console.log('Response status:', response.status());
  console.log('Response body:', await response.text());
  // EXPECTED: 403 (Forbidden)
  // ACTUAL: 201 (Success) - This is a BUG in the API, as regular users should not be able to sell plants.
  expect(response.status()).toBe(403);
}); // failed - BUG: regular users can sell plants, should be forbidden



  test('API_USER-32 Get sale by sale ID', async () => {
  const adminContext = await getAdminApiContext();
  const randomNumber = Math.floor(Math.random() * 100000);
  
  let mainCategory, subCategory, plant, sale;
  
  try {
    // Step 1: Create MAIN category
    const mainCategoryPayload = {
      name: `Main${randomNumber}`,
      subCategories: []
    };
    const mainCategoryResponse = await adminContext.post("/api/categories", { 
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
    const subCategoryResponse = await adminContext.post("/api/categories", { 
      data: subCategoryPayload 
    });
    
    if (subCategoryResponse.status() !== 201) {
      console.error('Sub-category creation failed. Status:', subCategoryResponse.status());
      console.error('Response:', await subCategoryResponse.text());
    }
    
    expect(subCategoryResponse.status()).toBe(201);
    subCategory = await subCategoryResponse.json();
    
    // Step 3: Create plant under the sub-category
    const plantRes = await adminContext.post(`/api/plants/category/${subCategory.id}`, {
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
    const sellResponse = await adminContext.post(
      `/api/sales/plant/${plant.id}?quantity=1`
    );
    expect(sellResponse.status()).toBe(201);
    sale = await sellResponse.json();
    const saleId = sale.id;
    
    // Test: User gets sale by ID
    const userContext = await getUserApiContext();
    const response = await userContext.get(`/api/sales/${saleId}`);
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Assertions based on actual API response structure
    expect(body.id).toBe(sale.id);
    expect(body).toHaveProperty('plant');
    expect(body.plant).toHaveProperty('id');
    expect(body.plant.id).toBe(plant.id);
    expect(body).toHaveProperty('quantity');
    expect(body.quantity).toBe(1);
    expect(body).toHaveProperty('totalPrice');
    expect(body.totalPrice).toBe(500);
    expect(body).toHaveProperty('soldAt');
    
  } finally {
    // CLEANUP - Delete in reverse order of dependencies
    
    // 1. Delete sale first (if it was created)
    if (sale?.id) {
      await adminContext.delete(`/api/sales/${sale.id}`);
    }
    
    // 2. Delete inventory records associated with the plant
    if (plant?.id) {
      await adminContext.delete(`/api/inventory/plant/${plant.id}`);
    }
    
    // 3. Delete the plant
    if (plant?.id) {
      await adminContext.delete(`/api/plants/${plant.id}`);
    }
    
    // 4. Delete sub-category
    if (subCategory?.id) {
      await adminContext.delete(`/api/categories/${subCategory.id}`);
    }
    
    // 5. Delete main category
    if (mainCategory?.id) {
      await adminContext.delete(`/api/categories/${mainCategory.id}`);
    }
  }
}); // passed



  test('API_USER-33 Get sale by invalid sale ID', async () => {
    const userContext = await getUserApiContext();
    
    const invalidSaleId = 999999;
    const response = await userContext.get(`/api/sales/${invalidSaleId}`);
    
    expect(response.status()).toBe(404);
  });  //passed




  test('API_USER-34 Delete sale unauthorized', async () => {
  const adminContext = await getAdminApiContext();
  const randomNumber = Math.floor(Math.random() * 100000);
  
  let mainCategory, subCategory, plant, sale;
  
  try {
    // Step 1: Create MAIN category
    const mainCategoryPayload = {
      name: `Main${randomNumber}`,
      subCategories: []
    };
    const mainCategoryResponse = await adminContext.post("/api/categories", { 
      data: mainCategoryPayload 
    });
    
    expect(mainCategoryResponse.status()).toBe(201);
    mainCategory = await mainCategoryResponse.json();
    
    // Step 2: Create SUB-CATEGORY
    const subCategoryPayload = {
      name: `Sub${randomNumber}`,
      parent: mainCategory,
      subCategories: []
    };
    const subCategoryResponse = await adminContext.post("/api/categories", { 
      data: subCategoryPayload 
    });
    
    expect(subCategoryResponse.status()).toBe(201);
    subCategory = await subCategoryResponse.json();
    
    // Step 3: Create plant under the sub-category
    const plantRes = await adminContext.post(`/api/plants/category/${subCategory.id}`, {
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
    
    // Step 4: Admin creates a sale
    const saleRes = await adminContext.post(`/api/sales/plant/${plant.id}?quantity=1`);
    expect(saleRes.status()).toBe(201);
    sale = await saleRes.json();
    
    // Test: User tries to delete (should be forbidden)
    const userContext = await getUserApiContext();
    const response = await userContext.delete(`/api/sales/${sale.id}`);
    
    expect(response.status()).toBe(403);
    
  } finally {
    // CLEANUP - Delete in reverse order of dependencies
    
    // 1. Delete sale (if it was created and still exists)
    if (sale?.id) {
      try {
        await adminContext.delete(`/api/sales/${sale.id}`);
      } catch (error) {
        console.log('Sale already deleted or cleanup failed');
      }
    }
    
    // 2. Delete inventory records associated with the plant
    if (plant?.id) {
      try {
        await adminContext.delete(`/api/inventory/plant/${plant.id}`);
      } catch (error) {
        console.log('Inventory cleanup failed or not found');
      }
    }
    
    // 3. Delete the plant
    if (plant?.id) {
      try {
        await adminContext.delete(`/api/plants/${plant.id}`);
      } catch (error) {
        console.log('Plant cleanup failed');
      }
    }
    
    // 4. Delete sub-category
    if (subCategory?.id) {
      try {
        await adminContext.delete(`/api/categories/${subCategory.id}`);
      } catch (error) {
        console.log('Sub-category cleanup failed');
      }
    }
    
    // 5. Delete main category
    if (mainCategory?.id) {
      try {
        await adminContext.delete(`/api/categories/${mainCategory.id}`);
      } catch (error) {
        console.log('Main category cleanup failed');
      }
    }
  }
});//failed - BUG: regular users can delete sales, should be forbidden
});