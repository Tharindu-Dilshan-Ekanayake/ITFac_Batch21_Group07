Feature: User Dashboard API

  @api @user @dashboard
  Scenario: API_USER_DASHBOARD-01: Get all categories
    Given I am a user with valid API token
    When admin creates 10 categories
    And I retrieve all categories via API
    Then the response status should be 200
    And the categories response should have id property
    And the categories response should have name property
    And the categories response should have parentName property
    When admin deletes all created categories

  @api @user @dashboard
  Scenario: API_USER_DASHBOARD-02: Get category summary
    Given I am a user with valid API token
    When admin creates 10 categories
    And admin creates 10 sub-categories under the created categories
    And I retrieve category summary via API
    Then the response status should be 200
    And the summary response should have mainCategories property
    And the summary response should have subCategories property
    When admin deletes created sub-categories and main categories

  @api @user @dashboard
  Scenario: API_USER_DASHBOARD-03: Get all plants
    Given I am a user with valid API token
    When admin creates a category and sub-category for plants
    And admin creates 10 plants under the sub-category
    And I retrieve all plants via API
    Then the response status should be 200
    And the plants response should be an array
    And the plants response should have items greater than 0
    When admin deletes all created plants
    When admin deletes created sub-categories and main categories

  @api @user @dashboard
  Scenario: API_USER_DASHBOARD-04: Get plants summary
    Given I am a user with valid API token
    When admin creates a category and sub-category for plants
    And admin creates 10 plants with varying quantities
    And I retrieve plants summary via API
    Then the response status should be 200
    And the plants summary should have totalPlants property
    And the plants summary should have lowStockPlants property
    When admin deletes all created plants
    When admin deletes created sub-categories and main categories

  @api @user @dashboard
  Scenario: API_USER_DASHBOARD-05: Get all sales
    Given I am a user with valid API token
    When admin creates a category and sub-category for sales
    And admin creates 10 plants under the sub-category
    And admin creates 10 sales records from the plants
    And I retrieve all sales via API
    Then the response status should be 200
    And the sales response should be an array
    And the sales response should have items greater than 0
    When admin deletes all created sales and plants

  @api @user @dashboard
  Scenario: API_USER_DASHBOARD-06: Prevent access without token
    When I try to access categories API without token
    Then the response status should be 401 or 403
    And the response should contain an error message

  @api @user @dashboard
  Scenario: API_USER_DASHBOARD-07: Prevent access with invalid token
    When I try to access plants API with an invalid token
    Then the response status should be 401
    And the response should contain an error message
