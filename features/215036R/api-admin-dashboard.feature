Feature: Admin Dashboard API

  @api @admin @dashboard
  Scenario: API_ADMIN_DASHBOARD-01: Get category summary
    Given I am an admin with valid API token
    When admin creates 10 categories
    And admin creates 10 sub-categories under the created categories
    And I retrieve category summary via API
    Then the response status should be 200
    And the summary response should have mainCategories property
    And the summary response should have subCategories property

  @api @admin @dashboard
  Scenario: API_ADMIN_DASHBOARD-02: Get all plants
    Given I am an admin with valid API token
    When admin creates a category and sub-category for plants
    And admin creates 10 plants under the sub-category
    And I retrieve all plants via API
    Then the response status should be 200
    And the plants response should be an array
    And the plants response should have items greater than 0
    When admin deletes all created plants

  @api @admin @dashboard
  Scenario: API_ADMIN_DASHBOARD-03: Get plants summary
    Given I am an admin with valid API token
    When admin creates a category and sub-category for plants
    And admin creates 10 plants with varying quantities
    And I retrieve plants summary via API
    Then the response status should be 200
    And the plants summary should have totalPlants property
    And the plants summary should have lowStockPlants property
    When admin deletes all created plants

  @api @admin @dashboard
  Scenario: API_ADMIN_DASHBOARD-04: Get all sales
    Given I am an admin with valid API token
    When admin creates a category and sub-category for sales
    And admin creates 10 plants under the sub-category
    And admin creates 10 sales records from the plants
    And I retrieve all sales via API
    Then the response status should be 200
    And the sales response should be an array
    And the sales response should have items greater than 0
    When admin deletes all created sales and plants

  @api @admin @dashboard
  Scenario: API_ADMIN_DASHBOARD-05: Prevent access without token
    When I try to access categories API without token
    Then the response status should be 401 or 403
    And the response should contain an error message

  @api @admin @dashboard
  Scenario: API_ADMIN_DASHBOARD-06: Prevent access with invalid token
    When I try to access plants API with an invalid token
    Then the response status should be 401
    And the response should contain an error message
