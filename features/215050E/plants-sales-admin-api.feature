Feature: Admin Plants and Sales API

  Background:
    Given the admin API context is initialized

  Scenario: Get plants by category ID
    When the admin requests plants by category id 3
    Then the response status should be 200
    And the response should be an array of plants

  Scenario: Get plant summary
    When the admin requests plant summary
    Then the response status should be 200
    And the response should contain totalPlants

  Scenario: Search plants with pagination
    When the admin searches plants with pagination
    Then the response status should be 200
    And the response should contain paged plant content

  Scenario: Sell plant and update stock
    Given a main category, sub category and plant exist
    When the admin sells 1 quantity of the plant
    Then the response status should be 201

  Scenario: Prevent sale with invalid quantity
    When the admin sells plant with invalid quantity
    Then the response status should be 400

  Scenario: Get all sales
    Given a sale exists
    When the admin requests all sales
    Then the response status should be 200
    And the response should be a list of sales

  Scenario: Get sale by valid sale ID
    Given a sale exists
    When the admin requests sale by ID
    Then the response status should be 200
    And the sale details should be correct

  Scenario: Get sale by invalid sale ID
    When the admin requests sale by invalid ID
    Then the response status should be 404

  Scenario: Delete sale authorized
    Given a sale exists
    When the admin deletes the sale
    Then the response status should be 204
