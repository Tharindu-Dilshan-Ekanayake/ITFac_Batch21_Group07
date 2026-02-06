Feature: User Plants and Sales API

  Scenario: Get plants by category ID
    Given an admin has created a main category, sub category, and plant
    When the user requests plants by category id
    Then the user response status should be 200
    And the user response should be an array of plants
    And the user plant category id should match

  Scenario: Selling plant unauthorized
    Given an admin has created a main category, sub category, and plant
    When the user tries to sell the plant
    Then the user response status should be 403

  Scenario: Get sale by sale ID
    Given an admin has created a main category, sub category, and plant
    And the admin has created a sale for the plant
    When the user requests sale by ID
    Then the user response status should be 200
    And the user sale details should be correct

  Scenario: Get sale by invalid sale ID
    When the user requests sale by invalid ID
    Then the user response status should be 404

  Scenario: Delete sale unauthorized
    Given an admin has created a main category, sub category, and plant
    And the admin has created a sale for the plant
    When the user tries to delete the sale
    Then the user response status should be 403