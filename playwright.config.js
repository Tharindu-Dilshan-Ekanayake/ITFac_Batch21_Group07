// @ts-check
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL,
    browserName: "chromium",
    trace: 'on-first-retry',
    headless: false,
  },

  projects: [
  // UI SETUP
  {
    name: "admin-ui-setup",
    testMatch: /admin\.ui\.setup\.js/,
  },
  {
    name: "user-ui-setup",
    testMatch: /user\.ui\.setup\.js/,
  },

  // API SETUP
  {
    name: "admin-api-setup",
    testMatch: /admin\.api\.setup\.js/,
  },
  {
    name: "user-api-setup",
    testMatch: /user\.api\.setup\.js/,
  },

  // ADMIN UI TESTS
  {
    name: "admin-ui-tests",
    dependencies: ["admin-ui-setup"],
    testMatch: /ui.*-admin-.*\.spec\.js/,
    use: {
      storageState: "admin-auth.json",
    },
  },

  // ADMIN API TESTS
  {
    name: "admin-api-tests",
    dependencies: ["admin-api-setup"],
    testMatch: /api.*-admin-.*\.spec\.js/,
  },

  // USER UI TESTS
  {
    name: "user-ui-tests",
    dependencies: ["user-ui-setup"],
    testMatch: /ui.*-user-.*\.spec\.js/,
    use: {
      storageState: "user-auth.json",
    },
  },

  // USER API TESTS
  {
    name: "user-api-tests",
    dependencies: ["user-api-setup", "admin-api-setup"],
    testMatch: /api.*-user-.*\.spec\.js/,
  },
]

});

