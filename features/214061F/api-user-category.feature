Feature: Category API as user
  As a normal (non-admin) user
  I should not be allowed to manage categories like an admin

  Scenario: API_USER-16: Prevent category creation by unauthorized user
    Given I am an authenticated user via API
    When I try to create a category with name "Unt"
    Then the API response status should be 403 214061F_UserApi
    And the API response body should have status 403 and an error message 214061F_UserApi

  Scenario: API_USER-17: Update category unauthorized
    Given I am an authenticated user via API
    And there is an existing category created by an admin
    When I try to update that category name via API
    Then the API response status should be 403 214061F_UserApi
    And the API response body should have status 403 and an error message 214061F_UserApi

  Scenario: API_USER-18: Delete category unauthorized
    Given I am an authenticated user via API
    And there is an existing category created by an admin
    When I try to delete that category via API
    Then the API response status should be 403 214061F_UserApi
    And the API response body should have status 403 and an error message 214061F_UserApi

  Scenario: API_USER-19: Create category without token
    Given I am not authenticated via API
    When I try to create a category with a valid name via API
    Then the API response status should be 401 214061F_UserApi
    And the API response body should have status 401 and an error message 214061F_UserApi

  Scenario: API_USER-20: Update category without token
    Given I am not authenticated via API
    And there is an existing category created by an admin
    When I try to update that category name via API
    Then the API response status should be 401 214061F_UserApi
    And the API response body should have status 401 and an error message 214061F_UserApi

  Scenario: API_USER-21: Delete category without token
    Given I am not authenticated via API
    And there is an existing category created by an admin
    When I try to delete that category via API
    Then the API response status should be 401 214061F_UserApi
    And the API response body should have status 401 and an error message 214061F_UserApi
