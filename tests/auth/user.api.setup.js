import { test, request } from "@playwright/test";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

test("Get user API token", async ({ baseURL }) => {
  const context = await request.newContext();

  const response = await context.post(`${baseURL}/api/auth/login`, {
    data: {
      username: process.env.USER_USERNAME,
      password: process.env.USER_PASSWORD,
    },
  });

  const body = await response.json();
  const token = body.token;

  fs.writeFileSync(
    "user-token.json",
    JSON.stringify({ token }, null, 2)
  );
});
