import { test, expect } from "@playwright/test";
import { getAdminApiContext } from "../../utils/api-admin";

//test 11
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

  // Cleanup: delete created category
  const deleteResponse = await context.delete(`/api/categories/${createData.id}`);
  expect([200, 204]).toContain(deleteResponse.status());

});

//test 12

test("API_ADMIN-12: Create parent then sub-category using parent object", async () => {

  const context = await getAdminApiContext();
  const rnd = Math.floor(Math.random() * 1000); // keep names within length limits

  // 1) CREATE PARENT (main category)
  const parentName = `PAR${rnd}`; // between 3 and 6 chars
  const parentPayload = { name: parentName };

  const parentRes = await context.post("/api/categories", { data: parentPayload });
  expect(parentRes.status(), await parentRes.text()).toBe(201);

  const parent = await parentRes.json();
  expect(parent).toHaveProperty("id");
  const parentId = parent.id;

  // 2) CREATE CHILD (sub-category) with nested parent object
  const childName = `SUB${rnd}`; // between 3 and 6 chars
  const childPayload = { name: childName, parent: { id: parentId } };

  const childRes = await context.post("/api/categories", { data: childPayload });
  expect(childRes.status(), await childRes.text()).toBe(201);

  const child = await childRes.json();
  expect(child).toHaveProperty("id");

  // name check kept flexible in case backend normalises it
  expect(String(child.name)).toContain("SUB");

  // 3) VERIFY LINK only if backend returns parent info
  if (child.parent || typeof child.parentId !== "undefined") {
    const actualParentId = child.parent?.id ?? child.parent?.["id"] ?? child.parentId;
    expect(actualParentId).toBe(parentId);
  }

  // 4) CLEANUP (delete child first then parent)
  const delChild = await context.delete(`/api/categories/${child.id}`);
  expect([200, 204]).toContain(delChild.status());

  const delParent = await context.delete(`/api/categories/${parentId}`);
  expect([200, 204]).toContain(delParent.status());
});

//test 13

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
  const delRes = await context.delete(`/api/categories/${created.id}`);
  expect([200, 204]).toContain(delRes.status());
});

//test 14
test("API_ADMIN-14: Prevent duplicate sub-category under same parent", async () => {
  const context = await getAdminApiContext();

  // 1) Create parent category
  const parentPayload = {
    name: `PARENT${Math.floor(Math.random() * 1000)}`,
    subCategories: [],
  };

  const parentRes = await context.post("/api/categories", { data: parentPayload });
  expect(parentRes.status(), await parentRes.text()).toBe(201);

  const parent = await parentRes.json();
  const parentId = parent.id;

  // 2) Create first sub-category
  const subName = `SUB${Math.floor(Math.random() * 1000)}`;
  const childPayload = {
    name: subName,
    parent: { id: parentId },
    subCategories: [],
  };

  const childRes1 = await context.post("/api/categories", { data: childPayload });
  expect(childRes1.status(), await childRes1.text()).toBe(201);

  const child1 = await childRes1.json();
  expect(child1).toHaveProperty("id");

  // 3) Try create DUPLICATE sub-category (same name, same parent)
  const childRes2 = await context.post("/api/categories", { data: childPayload });

  // ✅ should fail
  expect(childRes2.status(), await childRes2.text()).toBe(400);

  const err = await childRes2.json();

  // ✅ flexible assertions (error message differs by backend)
  expect(err).toHaveProperty("status", 400);
  expect(err).toHaveProperty("message");
  expect(String(err.message).toLowerCase()).toMatch(/duplicate|already|exist|unique|validation|bad request/);

  // 4) Cleanup (delete child then parent)
  const delChild = await context.delete(`/api/categories/${child1.id}`);
  expect(delChild.status(), await delChild.text()).toBe(204);

  const delParent = await context.delete(`/api/categories/${parentId}`);
  expect(delParent.status(), await delParent.text()).toBe(204);
});

test("API_ADMIN-15: Prevent main category creation with empty name", async () => {
  const context = await getAdminApiContext();

  const payload = { name: "" };

  const res = await context.post("/api/categories", { data: payload });
  expect(res.status(), await res.text()).toBe(400);

  const body = await res.json();

  // common error response shape
  expect(body).toHaveProperty("status", 400);
  expect(body).toHaveProperty("error");
  expect(body).toHaveProperty("message");
  expect(body).toHaveProperty("details");
  expect(body.details).toHaveProperty("name");

  // ✅ accept real backend message
  expect(body.details.name).toMatch(/mandatory|required|between 3 and 10/i);
});

//test 16
test("API_ADMIN-16: Prevent sub-category creation with empty name", async () => {
  const context = await getAdminApiContext();

  // 1) Create a VALID parent category (main)
  const parentPayload = {
    name: `PARENT${Math.floor(Math.random() * 1000)}`,
    subCategories: []
  };

  const parentRes = await context.post("/api/categories", { data: parentPayload });
  expect(parentRes.status(), await parentRes.text()).toBe(201);

  const parent = await parentRes.json();
  expect(parent).toHaveProperty("id");
  const parentId = parent.id;

  // 2) Try create sub-category with EMPTY name + valid parent id
  const childPayload = {
    name: "",                 // ✅ empty (invalid)
    parent: { id: parentId }, // ✅ valid parent
    subCategories: []
  };

  const childRes = await context.post("/api/categories", { data: childPayload });

  // ✅ Should fail with validation
  expect(childRes.status(), await childRes.text()).toBe(400);

  const err = await childRes.json();

  // ✅ Flexible validation assertions (matches your previous error shape)
  expect(err).toHaveProperty("status", 400);
  expect(err).toHaveProperty("message");
  expect(err.message.toLowerCase()).toContain("validation");

  // details.name should exist
  expect(err).toHaveProperty("details");
  expect(err.details).toHaveProperty("name");
  // usually: "Category name must be between 3 and 10 characters"
  expect(String(err.details.name).toLowerCase()).toMatch(/name|character|between|required/);

  // 3) Cleanup: delete parent (only if created successfully)
  const delRes = await context.delete(`/api/categories/${parentId}`);
  expect(delRes.status(), await delRes.text()).toBe(204);
});

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
  const delRes = await context.delete(`/api/categories/${categoryId}`);
  expect(delRes.status(), await delRes.text()).toBe(204);
});

//test 18
test("API_ADMIN-18: should return 404 when updating non-existing category", async () => {
  const context = await getAdminApiContext();

  const invalidId = 999999; // use a very large id to avoid existing

  const updatePayload = {
    name: "Red",
    parentId: null, // valid field for update DTO (main category)
  };

  const res = await context.put(`/api/categories/${invalidId}`, {
    data: updatePayload,
  });

  // ✅ Expected: 404 Not Found
  expect(res.status(), await res.text()).toBe(404);

  const body = await res.json();

  // Typical error response shape
  expect(body).toHaveProperty("status");
  expect(body).toHaveProperty("message");

  // flexible checks
  expect(body.status).toBe(404);
  expect(body.message.toLowerCase()).toMatch(/not found|category/i);
});


//test 19
test("API_ADMIN-19: Delete category by ID (create then delete)", async () => {
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