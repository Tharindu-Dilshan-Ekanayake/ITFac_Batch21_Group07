import fs from "fs";
import { request } from "@playwright/test";

export async function getUserApiContext() {
  const { token } = JSON.parse(fs.readFileSync("user-token.json", "utf-8"));

  return await request.newContext({
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    baseURL: process.env.BASE_URL,
  });
}
