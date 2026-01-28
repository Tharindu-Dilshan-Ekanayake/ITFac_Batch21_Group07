import { test, expect } from "@playwright/test";

test.only("Login to QA Training Application", async ({ page }) => {
  await page.goto("https://ekanayakeb21qa-7794b0a3d0a3.herokuapp.com/ui/login");

  await page.waitForTimeout(5000);
  
  const login = page.locator(".text-center.mb-4");
  await expect(login).toHaveText("Login");

  //  login to page
  await page.locator('//*[@id="loginForm"]/div[1]/input').fill("admin");
  await page.locator('//*[@id="loginForm"]/div[2]/input').fill("admin123");
  await page.locator('//*[@id="loginForm"]/button').click();

  await page.waitForTimeout(5000);

  const afterLogin = page.locator("xpath=/html/body/div/div/div[2]/div[1]/h2");
  await expect(afterLogin).toHaveText("🌸 QA Training Application");
});
