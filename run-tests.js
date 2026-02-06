import { exec } from 'child_process';
import { promisify } from 'util';

const run = promisify(exec);

// List test files in order
const testFiles = [
  'tests/215036R/ui-user-dashboard.spec.js',
  'tests/215036R/ui-admin-dashboard.spec.js',
  'tests/215036R/api-admin-dashboard.spec.js',
  'tests/215036R/api-user-dashboard.spec.js',

  'tests/214079R/ui-admin-category.spec.js',
  'tests/214079R/ui-user-category.spec.js',
  'tests/214079R/api-admin-category.spec.js',
  'tests/214079R/api-user-category.spec.js',

  'tests/214061F/ui-category-admin-214061F.spec.js',
  'tests/214061F/ui-category-user-214061F.spec.js',
  'tests/214061F/api-admin-category-214061F.spec.js',
  'tests/214061F/api-user-category-214061F.spec.js',

  'tests/214002D/UI/ui-admin-plant.spec.js',
  'tests/214002D/UI/ui-user-plant.spec.js',
  'tests/214002D/API/api-admin-plant.spec.js',
  'tests/214002D/API/api-user-plant.spec.js',

  'tests/215050E/ui/plants-admin-ui.spec.js',
  'tests/215050E/ui/plants-user-ui.spec.js',
  'tests/215050E/ui/sales-user-ui.spec.js',
  'tests/215050E/api/plants-sales-admin-api.spec.js',
  'tests/215050E/api/plants-sales-user-api.spec.js',
];

async function runTestsSequentially() {
  for (const file of testFiles) {
    console.log(`\n==== Running ${file} ====`);
    try {
      await run(`npx playwright test ${file} --reporter=allure-playwright`);
    } catch (err) {
      console.error(`Error running ${file}`, err.stdout || err);
    }
  }

  console.log('\n==== Generating Allure report ====');
  try {
    await run('npx allure generate ./allure-results -o ./allure-report --clean');
    console.log('Allure report generated at ./allure-report');
  } catch (err) {
    console.error('Error generating Allure report', err.stdout || err);
  }
}

runTestsSequentially();
