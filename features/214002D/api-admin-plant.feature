Feature: API Admin Plant - Manage Plants 214002D

    @api @admin @plant
    Scenario: API_ADMIN_Plant-01: Create category hierarchy for plants
        When I create a main and sub-category for plants 214002D_AdminApi
        Then the category hierarchy for plants should be created successfully 214002D_AdminApi

    @api @admin @plant
    Scenario: API_ADMIN_Plant-02: Create a new plant with valid category ID
        Given I have a valid plant category hierarchy 214002D_AdminApi
        When I create a new plant with that category 214002D_AdminApi
        Then the plant should be created successfully with an id 214002D_AdminApi

    @api @admin @plant
    Scenario: API_ADMIN_Plant-03: Prevent duplicate plant with same name in same category
        Given I have a valid plant category hierarchy 214002D_AdminApi
        When I create a duplicate plant with the same name in the same category 214002D_AdminApi
        Then the duplicate plant creation should fail with 400 and DUPLICATE_RESOURCE 214002D_AdminApi

    @api @admin @plant
    Scenario: API_ADMIN_Plant-04: Get plants by category ID
        Given I have a created plant and its category 214002D_AdminApi
        When I get plants by that category ID 214002D_AdminApi
        Then the response should contain a non-empty list of plants 214002D_AdminApi

    @api @admin @plant
    Scenario: API_ADMIN_Plant-05: Get plant by valid ID
        Given I have a created plant and its category 214002D_AdminApi
        When I get the plant by its ID 214002D_AdminApi
        Then the plant details should match the created plant 214002D_AdminApi

    @api @admin @plant
    Scenario: API_ADMIN_Plant-06: Update existing plant
        Given I have a created plant and its category 214002D_AdminApi
        When I update the plant details 214002D_AdminApi
        Then the plant should be updated with new details 214002D_AdminApi

    @api @admin @plant
    Scenario: API_ADMIN_Plant-07: Check plant exists by invalid Plant ID
        When I get a plant by an invalid ID 214002D_AdminApi
        Then the response should be 404 with NOT_FOUND error 214002D_AdminApi

    @api @admin @plant
    Scenario: API_ADMIN_Plant-08: Delete existing plant
        Given I have a created plant and its category 214002D_AdminApi
        When I delete the existing plant 214002D_AdminApi
        Then the delete plant response status should be 204 214002D_AdminApi

    @api @admin @plant
    Scenario: API_ADMIN_Plant-09: Delete non-existing plant
        When I delete a non-existing plant 214002D_AdminApi
        Then the delete non-existing plant response status should be 204 214002D_AdminApi
