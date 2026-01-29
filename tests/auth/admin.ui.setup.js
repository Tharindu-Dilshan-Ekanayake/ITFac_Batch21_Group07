import { test } from '@playwright/test';
import dotenv from "dotenv";
dotenv.config();

test('Login and save auth state', async ({ page, baseURL }) => {
   await page.goto(`${baseURL}/ui/login`);
    const userName = page.locator('[name="username"]');
    const password = page.locator('[name="password"]');
    const signIn = page.locator('[type="submit"]');

    await userName.fill(process.env.ADMIN_USERNAME);
    await password.fill(process.env.ADMIN_PASSWORD);
    await signIn.click();
  await page.waitForURL(`${baseURL}/ui/dashboard`);

  // Save login session
  await page.context().storageState({ path: 'admin-auth.json' });
});
