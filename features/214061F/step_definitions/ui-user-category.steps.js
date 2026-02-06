import { Given, When, Then, After } from "@cucumber/cucumber";
import dotenv from "dotenv";
import { expect, request } from "@playwright/test";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

// Helper: ensure normal user is logged in (mirror admin login flow)
async function ensureUserLoggedIn(page) {
	// Always start from login page to avoid error-state redirects
	await page.goto(`${BASE_URL}/ui/login`);

	const userName = page.locator('[name="username"]');
	const password = page.locator('[name="password"]');
	const signIn = page.locator('[type="submit"]');

	await userName.fill(process.env.USER_USERNAME || "testuser");
	await password.fill(process.env.USER_PASSWORD || "test123");
	await signIn.click();

	await page.waitForURL(`${BASE_URL}/ui/dashboard`);

	// Navigate to Categories page after successful login
	await page.goto(`${BASE_URL}/ui/categories`);
	await page.waitForLoadState("networkidle");
}

// Helper: admin API context for category management (fresh login each time)
async function getAdminApiContext() {
	// First log in as admin to obtain a fresh token
	const loginContext = await request.newContext({ baseURL: BASE_URL });
	const loginRes = await loginContext.post("/api/auth/login", {
		data: {
			username: process.env.ADMIN_USERNAME,
			password: process.env.ADMIN_PASSWORD,
		},
	});

	expect(loginRes.status(), await loginRes.text()).toBe(200);
	const loginBody = await loginRes.json();
	const adminToken = loginBody.token;

	// Use a separate context with Authorization header set
	return await request.newContext({
		baseURL: BASE_URL,
		extraHTTPHeaders: {
			Authorization: `Bearer ${adminToken}`,
			"Content-Type": "application/json",
		},
	});
}

// ---------- GIVEN ----------

Given("I am logged in as a normal user", async function () {
	const page = this.page;
	await ensureUserLoggedIn(page);
});

Given("I am on the User Categories page", async function () {
	const page = this.page;
	await page.goto(`${BASE_URL}/ui/categories`);
	await page.waitForLoadState("networkidle");
});

Given(
	'there is a category {string} created by an admin',
	async function (name) {
		const adminContext = await getAdminApiContext();

		const res = await adminContext.post("/api/categories", {
			data: { name },
		});

		expect(res.status(), await res.text()).toBe(201);
		const body = await res.json();
		this.createdCategoryIds = this.createdCategoryIds || [];
		this.createdCategoryIds.push(body.id);

		// Refresh categories page so the new row appears in the UI
		if (this.page) {
			await this.page.goto(`${BASE_URL}/ui/categories`);
			await this.page.waitForLoadState("networkidle");
		}
	}
);

Given("there are no categories in the system", async function () {
	const adminContext = await getAdminApiContext();

	const res = await adminContext.get("/api/categories");
	expect(res.status(), await res.text()).toBe(200);
	const list = await res.json();

	if (Array.isArray(list)) {
		for (const cat of list) {
			if (!cat.id) continue;
			await adminContext.delete(`/api/categories/${cat.id}`);
		}
	}

	// Reload categories page to show empty state
	if (this.page) {
		await this.page.goto(`${BASE_URL}/ui/categories`);
		await this.page.waitForLoadState("networkidle");
	}
});

Given(
	"there are at least 12 categories created by an admin",
	async function () {
		const adminContext = await getAdminApiContext();
		this.createdCategoryIds = this.createdCategoryIds || [];

		for (let i = 1; i <= 12; i++) {
			const name = `Pagi${i}`;
			const res = await adminContext.post("/api/categories", {
				data: { name },
			});
			expect(res.status(), await res.text()).toBe(201);
			const body = await res.json();
			if (body && body.id) this.createdCategoryIds.push(body.id);
		}

		// Reload categories page so pagination reflects new data
		if (this.page) {
			await this.page.goto(`${BASE_URL}/ui/categories`);
			await this.page.waitForLoadState("networkidle");
		}
	}
);

// ---------- WHEN ----------

When(
	"I browse through the user categories pages using pagination",
	async function () {
		const page = this.page;

		const table = page.locator("table");
		await expect(table).toBeVisible();

		const pagination = page.locator("ul.pagination");
		await expect(pagination).toBeVisible();

		const pageLinks = pagination
			.locator("a.page-link")
			.filter({ hasText: /^\d+$/ });
		const pageCount = await pageLinks.count();

		if (pageCount <= 1) {
			this.paginationPageData = [];
			return;
		}

		const getIdsOnCurrentPage = async () => {
			const rows = table.locator("tbody tr");

			if (await rows.filter({ hasText: /no category found/i }).count())
				return [];

			const ids = await rows.locator("td:nth-child(1)").allInnerTexts();
			return ids.map((x) => x.trim()).filter(Boolean);
		};

		const pageData = [];

		for (let i = 0; i < pageCount; i++) {
			const link = pageLinks.nth(i);
			const href = await link.getAttribute("href");
			expect(href).toBeTruthy();

			await link.click();
			await page.waitForLoadState("networkidle");

			await expect(page).toHaveURL(
				new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
			);

			const ids = await getIdsOnCurrentPage();
			expect(ids.length).toBeGreaterThan(0);

			pageData.push({ label: await link.innerText(), ids });
		}

		this.paginationPageData = pageData;
	}
);

// ---------- THEN ----------

Then(
	'I should see the category {string} in the user table',
	async function (name) {
		const page = this.page;
		await expect(
			page.locator("table tbody tr", { hasText: name })
		).toBeVisible();
	}
);

Then(
	"I should not see any Edit buttons in the user categories table",
	async function () {
		const page = this.page;
		await expect(
			page.locator('table tbody tr a[title="Edit"]')
		).toHaveCount(0);
	}
);

Then(
	"I should not see any Delete controls in the user categories table",
	async function () {
		const page = this.page;
		await expect(
			page.locator('table tbody tr form[action*="/ui/categories/delete"]')
		).toHaveCount(0);
	}
);

Then(
	'I should not see an "Add A Category" link on the user categories page',
	async function () {
		const page = this.page;
		await expect(
			page.getByRole("link", { name: /add a category/i })
		).toHaveCount(0);
	}
);

Then(
	'I should see a "No category found" message on the user categories page',
	async function () {
		const page = this.page;
		await expect(page.getByText("No category found")).toBeVisible();
	}
);

Then(
	"I should see no category rows in the user table",
	async function () {
		const page = this.page;
		const dataRows = page.locator("table tbody tr td", {
			hasNotText: "No category found",
		});
		await expect(dataRows).toHaveCount(0);
	}
);

Then(
	"each user categories page should show different category IDs",
	async function () {
		const data = this.paginationPageData || [];
		if (data.length <= 1) return; // nothing to compare

		for (let i = 0; i < data.length - 1; i++) {
			const setA = new Set(data[i].ids);
			const setB = new Set(data[i + 1].ids);
			const overlap = [...setA].filter((id) => setB.has(id));
			expect(
				overlap,
				`Overlap between page ${data[i].label} and ${data[i + 1].label}: ${overlap.join(", ")}`
			).toHaveLength(0);
		}
	}
);

Then("I should see the user categories table", async function () {
	const page = this.page;
	await expect(page.locator("table")).toBeVisible();
});

// ---------- CLEANUP (AFTER EACH SCENARIO) ----------

After({ tags: "@user and @category" }, async function () {
	// Delete any categories created via admin API in this scenario
	if (!this.createdCategoryIds || this.createdCategoryIds.length === 0) {
		return;
	}

	const adminContext = await getAdminApiContext();

	for (const categoryId of this.createdCategoryIds) {
		try {
			await adminContext.delete(`/api/categories/${categoryId}`);
		} catch (e) {
			// Ignore failures (already deleted, etc.)
		}
	}
});

