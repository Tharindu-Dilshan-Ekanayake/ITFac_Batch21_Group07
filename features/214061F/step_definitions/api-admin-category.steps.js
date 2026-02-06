import { When, Then } from "@cucumber/cucumber";
import "dotenv/config";
import { expect } from "@playwright/test";
import { getAdminApiContext } from "../../../utils/api-admin.js";

// API_ADMIN-11: Create main category (no parent)
When(
	"I create a main category without parent 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();
		const randomNumber = Math.floor(Math.random() * 1000);

		this.createPayload = {
			name: `new${randomNumber}`,
			subCategories: [],
		};

		this.response = await context.post("/api/categories", {
			data: this.createPayload,
		});

		this.createData = await this.response.json();
		this.lastCreatedId = this.createData.id;
	},
);

Then(
	"the creation response status should be 201 214061F_AdminApi",
	async function () {
		expect(this.response.status()).toBe(201);
	},
);

Then(
	"the created category should have no parent 214061F_AdminApi",
	async function () {
		expect(this.createData).toHaveProperty("id");
		expect(this.createData.name).toBe(this.createPayload.name);

		if ("parentId" in this.createData) {
			expect(
				this.createData.parentId === null ||
					this.createData.parentId === undefined,
			).toBeTruthy();
		}
	},
);

Then("I delete the created category 214061F_AdminApi", async function () {
	const context = await getAdminApiContext();
	this.response = await context.delete(
		`/api/categories/${this.lastCreatedId}`,
	);
});

Then(
	"the deletion response status should be 204 214061F_AdminApi",
	async function () {
		expect(this.response.status()).toBe(204);
	},
);

// API_ADMIN-12: Create parent then sub-category using parent object
When(
	"I create a parent and sub-category using parent object 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();
		const rnd = Math.floor(Math.random() * 1000);

		// Create parent (main category)
		const parentName = `PAR${rnd}`;
		const parentPayload = { name: parentName };

		const parentRes = await context.post("/api/categories", {
			data: parentPayload,
		});
		expect(parentRes.status(), await parentRes.text()).toBe(201);

		this.parent = await parentRes.json();
		this.parentId = this.parent.id;

		// Create child (sub-category) using parent object
		const childName = `SUB${rnd}`;
		const childPayload = { name: childName, parent: { id: this.parentId } };

		const childRes = await context.post("/api/categories", {
			data: childPayload,
		});
		expect(childRes.status(), await childRes.text()).toBe(201);

		this.child = await childRes.json();
	},
);

Then(
	"the parent and sub-category should be created successfully 214061F_AdminApi",
	async function () {
		expect(this.parent).toHaveProperty("id");
		expect(this.child).toHaveProperty("id");
	},
);

Then(
	"the sub-category should be linked to the parent 214061F_AdminApi",
	async function () {
		if (this.child.parent || typeof this.child.parentId !== "undefined") {
			const actualParentId =
				this.child.parent?.id ?? this.child.parent?.["id"] ?? this.child.parentId;
			expect(actualParentId).toBe(this.parentId);
		}
	},
);

Then(
	"I delete the created parent and sub-category categories 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();

		if (this.child?.id) {
			const delChild = await context.delete(`/api/categories/${this.child.id}`);
			expect([200, 204]).toContain(delChild.status());
		}

		if (this.parentId) {
			const delParent = await context.delete(
				`/api/categories/${this.parentId}`,
			);
			expect([200, 204]).toContain(delParent.status());
		}
	},
);

// API_ADMIN-13: Prevent duplicate main category
When(
	"I create a main category for duplicate test 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();
		const rnd = Math.floor(Math.random() * 100);
		this.dupName = `DUP${rnd}`;

		const createRes1 = await context.post("/api/categories", {
			data: { name: this.dupName },
		});

		expect(createRes1.status(), await createRes1.text()).toBe(201);
		const created = await createRes1.json();
		this.firstCategoryId = created.id;
	},
);

When(
	"I try to create another main category with the same name 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();

		this.duplicateResponse = await context.post("/api/categories", {
			data: { name: this.dupName },
		});
	},
);

Then(
	"the duplicate main category creation should fail with 400 214061F_AdminApi",
	async function () {
		expect(
			this.duplicateResponse.status(),
			await this.duplicateResponse.text(),
		).toBe(400);

		const errorBodyText = await this.duplicateResponse.text();
		expect(errorBodyText.toLowerCase()).toContain("duplicate");
	},
);

Then(
	"I delete the first created main category for duplicate test 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();
		const delRes = await context.delete(
			`/api/categories/${this.firstCategoryId}`,
		);
		expect([200, 204]).toContain(delRes.status());
	},
);

// API_ADMIN-14: Prevent duplicate sub-category under same parent
When(
	"I create a parent category and a sub-category 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();

		const parentPayload = {
			name: `PARENT${Math.floor(Math.random() * 1000)}`,
			subCategories: [],
		};

		const parentRes = await context.post("/api/categories", {
			data: parentPayload,
		});
		expect(parentRes.status(), await parentRes.text()).toBe(201);

		const parent = await parentRes.json();
		this.parentId = parent.id;

		const subName = `SUB${Math.floor(Math.random() * 1000)}`;
		this.subName = subName;

		const childPayload = {
			name: subName,
			parent: { id: this.parentId },
			subCategories: [],
		};

		const childRes1 = await context.post("/api/categories", {
			data: childPayload,
		});
		expect(childRes1.status(), await childRes1.text()).toBe(201);

		const child1 = await childRes1.json();
		this.childId = child1.id;
	},
);

When(
	"I try to create a duplicate sub-category under the same parent 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();

		const childPayload = {
			name: this.subName,
			parent: { id: this.parentId },
			subCategories: [],
		};

		this.duplicateChildResponse = await context.post("/api/categories", {
			data: childPayload,
		});
	},
);

Then(
	"the duplicate sub-category creation should fail with 400 and validation message 214061F_AdminApi",
	async function () {
		expect(
			this.duplicateChildResponse.status(),
			await this.duplicateChildResponse.text(),
		).toBe(400);

		const err = await this.duplicateChildResponse.json();

		expect(err).toHaveProperty("status", 400);
		expect(err).toHaveProperty("message");
		expect(
			String(err.message).toLowerCase(),
		).toMatch(/duplicate|already|exist|unique|validation|bad request/);
	},
);

Then(
	"I delete the created sub-category and parent 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();

		if (this.childId) {
			const delChild = await context.delete(
				`/api/categories/${this.childId}`,
			);
			expect([200, 204]).toContain(delChild.status());
		}

		if (this.parentId) {
			const delParent = await context.delete(
				`/api/categories/${this.parentId}`,
			);
			expect([200, 204]).toContain(delParent.status());
		}
	},
);

// API_ADMIN-15: Prevent main category creation with empty name
When(
	"I try to create a main category with empty name 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();

		const payload = { name: "" };
		this.response = await context.post("/api/categories", { data: payload });
	},
);

Then(
	"the main category creation with empty name should fail with 400 and validation details 214061F_AdminApi",
	async function () {
		expect(this.response.status()).toBe(400);

		const body = await this.response.json();

		expect(body).toHaveProperty("status", 400);
		expect(body).toHaveProperty("error");
		expect(body).toHaveProperty("message");
		expect(body).toHaveProperty("details");
		expect(body.details).toHaveProperty("name");
		expect(body.details.name).toMatch(/mandatory|required|between 3 and 10/i);
	},
);

// API_ADMIN-16: Prevent sub-category creation with empty name
When(
	"I create a valid parent category for empty sub-category test 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();

		const parentPayload = {
			name: `PARENT${Math.floor(Math.random() * 1000)}`,
			subCategories: [],
		};

		const parentRes = await context.post("/api/categories", {
			data: parentPayload,
		});
		expect(parentRes.status(), await parentRes.text()).toBe(201);

		const parent = await parentRes.json();
		this.parentId = parent.id;
	},
);

When(
	"I try to create a sub-category with empty name under that parent 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();

		const childPayload = {
			name: "",
			parent: { id: this.parentId },
			subCategories: [],
		};

		this.response = await context.post("/api/categories", {
			data: childPayload,
		});
	},
);

Then(
	"the sub-category creation with empty name should fail with 400 and validation details 214061F_AdminApi",
	async function () {
		expect(this.response.status()).toBe(400);

		const err = await this.response.json();

		expect(err).toHaveProperty("status", 400);
		expect(err).toHaveProperty("message");
		expect(err.message.toLowerCase()).toContain("validation");
		expect(err).toHaveProperty("details");
		expect(err.details).toHaveProperty("name");
		expect(String(err.details.name).toLowerCase()).toMatch(
			/name|character|between|required/,
		);
	},
);

Then(
	"I delete the parent category used for empty sub-category test 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();
		const delRes = await context.delete(`/api/categories/${this.parentId}`);
		expect(delRes.status()).toBe(204);
	},
);

// API_ADMIN-17: Update category (create then update name)
When(
	"I create a main category for update 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();

		const random = Math.floor(Math.random() * 10000);
		this.originalName = `CAT${random}`;

		const createPayload = {
			name: this.originalName,
			subCategories: [],
		};

		const createRes = await context.post("/api/categories", {
			data: createPayload,
		});
		expect(createRes.status(), await createRes.text()).toBe(201);

		const created = await createRes.json();
		this.categoryId = created.id;
	},
);

When("I update the category name 214061F_AdminApi", async function () {
	const context = await getAdminApiContext();

	const random = Math.floor(Math.random() * 10000);
	this.updatedName = `CT${random}-UPD`;

	const updatePayload = {
		name: this.updatedName,
	};

	const updateRes = await context.put(
		`/api/categories/${this.categoryId}`,
		{
			data: updatePayload,
		},
	);

	this.response = updateRes;
	this.updatedCategory = await updateRes.json();
});

Then(
	"the category should be updated successfully 214061F_AdminApi",
	async function () {
		expect(this.response.status(), await this.response.text()).toBe(200);
		expect(this.updatedCategory).toHaveProperty("id", this.categoryId);
		expect(this.updatedCategory).toHaveProperty("name", this.updatedName);
	},
);

When(
	"I get the updated category by ID 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();
		this.getResponse = await context.get(
			`/api/categories/${this.categoryId}`,
		);
		this.fetchedCategory = await this.getResponse.json();
	},
);

Then(
	"the fetched category should have the updated name 214061F_AdminApi",
	async function () {
		expect(this.getResponse.status(), await this.getResponse.text()).toBe(200);
		expect(this.fetchedCategory.id).toBe(this.categoryId);
		expect(this.fetchedCategory.name).toBe(this.updatedName);
	},
);

Then(
	"I delete the updated category 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();
		const delRes = await context.delete(`/api/categories/${this.categoryId}`);
		expect(delRes.status(), await delRes.text()).toBe(204);
	},
);

// API_ADMIN-18: should return 404 when updating non-existing category
When(
	"I try to update a non existing category 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();

		const invalidId = 999999;
		const updatePayload = {
			name: "Red",
			parentId: null,
		};

		this.response = await context.put(`/api/categories/${invalidId}`, {
			data: updatePayload,
		});
		this.errorBody = await this.response.json();
	},
);

Then(
	"the update should return 404 not found 214061F_AdminApi",
	async function () {
		expect(this.response.status()).toBe(404);
		expect(this.errorBody).toHaveProperty("status");
		expect(this.errorBody).toHaveProperty("message");
		expect(this.errorBody.status).toBe(404);
		expect(this.errorBody.message.toLowerCase()).toMatch(
			/not found|category/i,
		);
	},
);

// API_ADMIN-19: Delete category by ID (create then delete)
When(
	"I create a category for delete 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();

		const rnd = Math.floor(Math.random() * 10000);
		const name = `DEL_${rnd}`;

		this.response = await context.post("/api/categories", {
			data: { name },
		});

		const created = await this.response.json();
		this.lastCreatedId = created.id;
	},
);

When(
	"I delete the created category by ID 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();
		this.response = await context.delete(
			`/api/categories/${this.lastCreatedId}`,
		);
	},
);

Then(
	"the deleted category should not be found 214061F_AdminApi",
	async function () {
		const context = await getAdminApiContext();
		const getRes = await context.get(
			`/api/categories/${this.lastCreatedId}`,
		);
		expect(getRes.status(), await getRes.text()).toBe(404);
	},
);

