This is a Playwright test project for the ITQA module for the QA Training Application.

Before running the tests, make sure to have the following:
- Node.js installed on your system
- Playwright installed as a dependency in your project
- The QA Training Application running on your local machine

To run the tests, use the following command:

    npx playwright test <file that you want to run>

To generate the report, use the following command:

    npx playwright test --reporter=line,allure-playwright

To open the report, use the following command:

    npx allure open ./allure-report

To run all the tests, use the following command:

    node run-tests.js

Happy Testing!!

