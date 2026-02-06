Feature: Category API as user
  As a normal (non-admin) user
  I should not be allowed to create categories

  Scenario: API_USER-16: Prevent category creation by unauthorized user
    Given I am an authenticated user via API
    When I try to create a category with name "Unt"
    Then the API response status should be 403
    And the API response body should have status 403 and an error message
