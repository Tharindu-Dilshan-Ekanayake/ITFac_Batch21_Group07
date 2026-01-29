This is a Playwright test project for the ITQA module for the QA Training Application.

Before running the tests, make sure to have the following:
- Node.js installed on your system
- Playwright installed as a dependency in your project
- The QA Training Application running on your local machine

To run the setup files, use the following command:

    npx playwright test --project=user-ui-setup
    npx playwright test --project=admin-ui-setup
    npx playwright test --project=user-api-setup
    npx playwright test --project=admin-api-setup

To run the tests, use the following command:

    npx playwright test <file that you want to run>

Happy Testing!!

