// Helper functions for admin category operations
import { getAdminApiContext } from "../../../utils/api-admin";

/**
 * Create a category using admin context
 * @returns {Promise<{id: string, name: string}>} Created category object
 */
export async function createCategoryAsAdmin(name) {
  const context = await getAdminApiContext();
  
  const payload = {
    name: name || `TestCat${Math.floor(Math.random() * 1000)}`,
  };

  const res = await context.post("/api/categories", {
    data: payload,
  });

  if (res.status() !== 201) {
    throw new Error(`Failed to create category: ${await res.text()}`);
  }

  return await res.json();
}

/**
 * Delete a category using admin context
 * @param {string} categoryId - The ID of the category to delete
 */
export async function deleteCategoryAsAdmin(categoryId) {
  const context = await getAdminApiContext();
  
  const res = await context.delete(`/api/categories/${categoryId}`);
  
  if (![200, 204].includes(res.status())) {
    throw new Error(`Failed to delete category: ${await res.text()}`);
  }
}