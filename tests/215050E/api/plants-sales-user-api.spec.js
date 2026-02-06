// const { test, expect } = require('@playwright/test');
// import { getUserApiContext } from '../../../utils/api-user.js';
// import { getAdminApiContext } from '../../../utils/api-admin.js';

// test.describe('User Plants & Sales API', () => {

//   test('API_USER-30 Get plants by category ID', async () => {
//     const adminContext = await getAdminApiContext();
    
//     // Create category
//     const categoryRes = await adminContext.post('/api/categories', {
//       data: {
//         name: `Test Category ${Date.now()}`,
//         parent: null,
//         subCategories: []
//       }
//     });
//     expect(categoryRes.status()).toBe(201);
//     const category = await categoryRes.json();
//     const categoryId = category.id;

    

//     // Create plant under this category
//     const plantRes = await adminContext.post(`/api/plants/category/${categoryId}`, {
//       data: {
//         name: `Test Plant ${Date.now()}`,
//         price: 500,
//         quantity: 10,
//          category:categoryId
//       }
//     });
//     expect(plantRes.status()).toBe(201);

//     // Test: User gets plants by category ID
//     const userContext = await getUserApiContext();
//     const response = await userContext.get(`/api/plants/category/${categoryId}`);
    
//     expect(response.status()).toBe(200);
//     const body = await response.json();
    
//     expect(Array.isArray(body)).toBe(true);
//     expect(body.length).toBeGreaterThan(0);
//     expect(body[0].category.id).toBe(categoryId);
//   });



//   test('API_USER-31 Selling plant unauthorized', async () => {
//     const adminContext = await getAdminApiContext();
//     const randomNumber = Math.floor(Math.random() * 100000);

//     // Create test data: category and plant
//     const categoryRes = await adminContext.post('/api/categories', {
//       data: {
//         name: `SellTestCategory-${randomNumber}`,
//         parent: "string",
//         subCategories: []
//       }
//     });
//     const category = await categoryRes.json();
    
//     const plantRes = await adminContext.post('/api/plants', {
//       data: {
//         name: `Sell Test Plant ${Date.now()}`,
//         price: 500,
//         quantity: 10,
//         description: 'Plant for unauthorized sell test',
//         status: 'SELLABLE',
//         categoryId: category.id
//       }
//     });
//     const plant = await plantRes.json();
//     console.log('CREATED PLANT:', plant);

//     // Test: User tries to sell (should be forbidden)
//     const userContext = await getUserApiContext();
//     const response = await userContext.post(`/api/sales/plant/${plant.id}?quantity=1`);

//     console.log(await response.text());

    
//     expect(response.status()).toBe(403);
//   });

//   test('API_USER-32 Get sale by sale ID', async () => {
//     const adminContext = await getAdminApiContext();
//     const randomNumber = Math.floor(Math.random() * 100000);

//     // Create test data: category, plant, and sale
//     const categoryRes = await adminContext.post('/api/categories', {
//       data: {
//         name: `SaleTestCategory-${randomNumber}`,
//         parent: "string",
//         subCategories: []
//       }
//     });
//     const category = await categoryRes.json();
    
//     const plantRes = await adminContext.post('/api/plants', {
//       data: {
//         name: `Sale Test Plant ${Date.now()}`,
//         price: 500,
//         quantity: 10,
//         description: 'Plant for sale test',
//         status: 'SELLABLE',
//         categoryId: category.id
//       }
//     });
//     const plant = await plantRes.json();

//     // Admin creates a sale
//     const saleRes = await adminContext.post(`/api/sales/plant/${plant.id}?quantity=2`);
//     expect(saleRes.status()).toBe(201);
//     const sale = await saleRes.json();

//     // Test: User gets sale by ID
//     const userContext = await getUserApiContext();
//     const response = await userContext.get(`/api/sales/${sale.id}`);
    
//     expect(response.status()).toBe(200);
//     const body = await response.json();
    
//     expect(body.id).toBe(sale.id);
//     expect(body).toHaveProperty('plantId');
//     expect(body).toHaveProperty('quantity');
//   });

//   test('API_USER-33 Get sale by invalid sale ID', async () => {
//     const userContext = await getUserApiContext();
    
//     const invalidSaleId = 999999;
//     const response = await userContext.get(`/api/sales/${invalidSaleId}`);
    
//     expect(response.status()).toBe(404);
//   });

//   test('API_USER-34 Delete sale unauthorized', async () => {
//     const adminContext = await getAdminApiContext();
//     const randomNumber = Math.floor(Math.random() * 100000);

//     // Create test data: category, plant, and sale
//     const categoryRes = await adminContext.post('/api/categories', {
//       data: {
//         name: `DeleteTestCategory-${randomNumber}`,
//         parent: "string",
//         subCategories: []
//       }
//     });
//     const category = await categoryRes.json();
    
//     const plantRes = await adminContext.post('/api/plants', {
//       data: {
//         name: `Delete Test Plant ${Date.now()}`,
//         price: 500,
//         quantity: 10,
//         description: 'Plant for delete test',
//         status: 'SELLABLE',
//         categoryId: category.id
//       }
//     });
//     const plant = await plantRes.json();

//     // Admin creates a sale
//     const saleRes = await adminContext.post(`/api/sales/plant/${plant.id}?quantity=1`);
//     const sale = await saleRes.json();

//     // Test: User tries to delete (should be forbidden)
//     const userContext = await getUserApiContext();
//     const response = await userContext.delete(`/api/sales/${sale.id}`);
    
//     expect(response.status()).toBe(403);
//   });
// });