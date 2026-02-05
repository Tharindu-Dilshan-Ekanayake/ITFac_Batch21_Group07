import { test, expect } from "@playwright/test";
import { getAdminApiContext } from "../../utils/api-admin";

test("API_ADMIN-11: Create main category (no parent)", async () => {
  const context = await getAdminApiContext();
  const randomNumber = Math.floor(Math.random() * 1000);

  const createPayload = {
    name: `new${randomNumber}`,
    // main category => no parent field
    subCategories: []
  };

  const createResponse = await context.post("/api/categories", { data: createPayload });
  expect(createResponse.status()).toBe(201);

  const createData = await createResponse.json();
  expect(createData).toHaveProperty("id");
  expect(createData.name).toBe(createPayload.name);

  // main category usually returns null/undefined parentId
  if ("parentId" in createData) {
    expect(createData.parentId === null || createData.parentId === undefined).toBeTruthy();
  }

});


test("API_ADMIN-12: Create parent then sub-category using parentId", async () => {
  const context = await getAdminApiContext();
  const rnd = Math.floor(Math.random() * 100000);

  // 1) CREATE PARENT (main category)
  const parentPayload = { name: `PARENT${rnd}` };

  const parentRes = await context.post("/api/categories", { data: parentPayload });
  expect(parentRes.status(), await parentRes.text()).toBe(201);

  const parent = await parentRes.json();
  expect(parent).toHaveProperty("id");
  const parentId = parent.id;

  // 2) CREATE CHILD (sub-category)
  // Try parentId style first (most common)
  const childPayloadA = { name: `CHILD${rnd}`, parentId };

  let childRes = await context.post("/api/categories", { data: childPayloadA });

  // If API doesn't accept parentId, fallback to nested parent object
  if (childRes.status() === 400) {
    const childPayloadB = { name: `CHILD${rnd}`, parent: { id: parentId } };
    childRes = await context.post("/api/categories", { data: childPayloadB });
  }

  expect(childRes.status(), await childRes.text()).toBe(201);
  const child = await childRes.json();
  expect(child).toHaveProperty("id");
  expect(child.name).toContain(`CHILD${rnd}`);

  // 3) VERIFY LINK
  // Your API may return parentId OR parent object. Handle both.
  const actualParentId =
    child.parentId ?? child.parent?.id ?? child.parent?.["id"];

  expect(actualParentId).toBe(parentId);

  // Optional: verify parent has subCategories (if returned)
  // const parentGet = await context.get(`/api/categories/${parentId}`);
  // expect(parentGet.status()).toBe(200);

  // 4) CLEANUP (delete child first then parent)
//   const delChild = await context.delete(`/api/categories/${child.id}`);
//   expect([200, 204]).toContain(delChild.status());

//   const delParent = await context.delete(`/api/categories/${parentId}`);
//   expect([200, 204]).toContain(delParent.status());
});

test("API_ADMIN-13: Prevent duplicate main category", async () => {
  const context = await getAdminApiContext();
  const rnd = Math.floor(Math.random() * 100);
  const name = `DUP${rnd}`;

  // 1) Create main category
  const createRes1 = await context.post("/api/categories", {
    data: { name }, // no parent => main category
  });

  expect(createRes1.status(), await createRes1.text()).toBe(201);
  const created = await createRes1.json();
  expect(created).toHaveProperty("id");

  // 2) Try to create again with SAME name (duplicate main category)
  const createRes2 = await context.post("/api/categories", {
    data: { name }, // same name again
  });

  // 3) Expect 400
  expect(createRes2.status(), await createRes2.text()).toBe(400);

  // Optional: check error message (depends on backend response format)
  const errorBodyText = await createRes2.text();

  // You can keep it flexible:
  expect(errorBodyText.toLowerCase()).toContain("duplicate"); 
  // or use:
  // expect(errorBodyText.toLowerCase()).toContain("already");

  // 4) Cleanup (delete the first category)
//   const delRes = await context.delete(`/api/categories/${created.id}`);
//   expect([200, 204]).toContain(delRes.status());
});

//test 14

//test 15
test("API_ADMIN-15: Prevent main category creation with empty name", async () => {
  const context = await getAdminApiContext();

  const createPayload = {
    name: "", // ❌ invalid
    subCategories: [],
  };

  const res = await context.post("/api/categories", { data: createPayload });

  // ✅ should fail
  expect(res.status(), await res.text()).toBe(400);

  const body = await res.json();

  // ✅ validate error response shape
  expect(body).toHaveProperty("status", 400);
  expect(body).toHaveProperty("message", "Validation failed");
  expect(body).toHaveProperty("error", "BAD_REQUEST");
  expect(body).toHaveProperty("details");

  // ✅ validate field-level validation message
  expect(body.details).toHaveProperty("name");
  expect(body.details.name).toMatch(/between 3 and 10 characters|required|empty/i);
});

//test 16

//test 17
test("API_ADMIN-17: Update category (create then update name)", async () => {
  const context = await getAdminApiContext();

  // ---------- 1) CREATE MAIN CATEGORY ----------
  const random = Math.floor(Math.random() * 10000);
  const originalName = `CAT${random}`;

  const createPayload = {
    name: originalName,
    subCategories: [],
    // no parent -> main category
  };

  const createRes = await context.post("/api/categories", { data: createPayload });
  expect(createRes.status(), await createRes.text()).toBe(201);

  const created = await createRes.json();
  expect(created).toHaveProperty("id");
  expect(created.name).toBe(originalName);

  const categoryId = created.id;

  // ---------- 2) UPDATE CATEGORY NAME ----------
  const updatedName = `CT${random}-UPD`;

  const updatePayload = {
    name: updatedName,
    // parentId: null, // optional; include if your API expects it
  };

  const updateRes = await context.put(`/api/categories/${categoryId}`, {
    data: updatePayload,
  });

  expect(updateRes.status(), await updateRes.text()).toBe(200);

  const updated = await updateRes.json();
  expect(updated).toHaveProperty("id", categoryId);
  expect(updated).toHaveProperty("name", updatedName);

  // ---------- 3) (OPTIONAL) GET AND VERIFY ----------
  const getRes = await context.get(`/api/categories/${categoryId}`);
  expect(getRes.status(), await getRes.text()).toBe(200);

  const fetched = await getRes.json();
  expect(fetched.id).toBe(categoryId);
  expect(fetched.name).toBe(updatedName);

  // ---------- 4) CLEANUP ----------
//   const delRes = await context.delete(`/api/categories/${categoryId}`);
//   expect(delRes.status(), await delRes.text()).toBe(204);
});

//test 18


//test 19
test.only("API_ADMIN-19: Delete category by ID (create then delete)", async () => {
  const context = await getAdminApiContext();

  // ---------- 1) CREATE CATEGORY ----------
  const rnd = Math.floor(Math.random() * 10000);
  const name = `DEL_${rnd}`;

  const createRes = await context.post("/api/categories", {
    data: { name },
  });

  expect(createRes.status(), await createRes.text()).toBe(201);

  const created = await createRes.json();
  expect(created).toHaveProperty("id");
  const id = created.id;

  // ---------- 2) DELETE CATEGORY ----------
  const deleteRes = await context.delete(`/api/categories/${id}`);

  // Expected: 204 No Content
  expect(deleteRes.status(), await deleteRes.text()).toBe(204);

  // ---------- 3) (OPTIONAL) VERIFY IT IS DELETED ----------
  const getRes = await context.get(`/api/categories/${id}`);
  expect(getRes.status(), await getRes.text()).toBe(404);
});