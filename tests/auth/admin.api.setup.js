import { test, request } from "@playwright/test";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

test("Get admin API token", async ({ baseURL }) => {
  const context = await request.newContext();

  const response = await context.post(`${baseURL}/api/auth/login`, {
    data: {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    },
  });

  const body = await response.json();
  const token = body.token;

  fs.writeFileSync(
    "admin-token.json",
    JSON.stringify({ token }, null, 2)
  );
});
