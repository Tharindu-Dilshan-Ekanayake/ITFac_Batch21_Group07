const {test} = require('@playwright/test');

test('First Playwright test', async  () =>
{
    //playwright code
});

test.only("Page01Test2", async ({ page }) => {
  await page.goto("https://example.com");
  await page.title();
  //  css
  await page.locator("#nonexistent").type("Hello"); // Old version: await page.fill("#nonexistent", "Hello");
  await page.locator("#nonexistent").fill("Hello");
  await page.locator("[type='password']").fill("world");
  await page.locator("#submit").click();
  // wait until this locator shows up page
  console.log(await page.locator("[style*='block']").textContent());
  await expect(page.locator("[style*='block']")).toContainText("Incorrect");
});