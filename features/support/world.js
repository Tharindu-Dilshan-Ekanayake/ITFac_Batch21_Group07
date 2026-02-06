const { setWorldConstructor, Before, After, setDefaultTimeout } = require("@cucumber/cucumber");
const { chromium } = require("playwright");
const dotenv = require("dotenv");

dotenv.config();

class CustomWorld {
  constructor() {
    this.baseUrl = process.env.BASE_URL || "http://localhost:8080";
    this.browser = null;
    this.context = null;
    this.page = null;
    this.parentBefore = null;
  }
}

setWorldConstructor(CustomWorld);

// Increase default timeout so Playwright navigation/login has time to complete
setDefaultTimeout(60 * 1000);

Before(async function () {
  this.browser = await chromium.launch({ headless: false });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

After(async function () {
  if (this.page) await this.page.close();
  if (this.context) await this.context.close();
  if (this.browser) await this.browser.close();
});
