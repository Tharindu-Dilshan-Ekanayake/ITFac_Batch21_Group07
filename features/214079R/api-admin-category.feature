Feature: API Admin Category - Manage Categories

    @api @admin @category
    Scenario: API_ADMIN_Category-01: Get category by valid ID
        When I create a category with random name 214079R_AdminApi
        Then the creation response status should be 201 214079R_AdminApi
        When I get the category by its ID 214079R_AdminApi
        Then the response status should be 200 214079R_AdminApi
        And the response data should have valid category properties 214079R_AdminApi
        Then I delete the created category 214079R_AdminApi
        And the deletion response status should be 204 214079R_AdminApi

    @api @admin @category
    Scenario: API_ADMIN_Category-02: Get category by invalid ID
        When I get a category by invalid ID 999 214079R_AdminApi
        Then the response status should be 404 214079R_AdminApi

    @api @admin @category
    Scenario: API_ADMIN_Category-03: Get sub-categories
        When I create a category and a sub-category 214079R_AdminApi
        When I get sub-categories 214079R_AdminApi
        Then the response status should be 200 214079R_AdminApi
        And the response should contain sub-category properties 214079R_AdminApi

    @api @admin @category
    Scenario: API_ADMIN_Category-04: Search categories with pagination
        When I search categories with pagination parameters 214079R_AdminApi
        Then the response status should be 200 214079R_AdminApi
        And the response should contain pagination properties 214079R_AdminApi
        And the content should have category properties 214079R_AdminApi

    @api @admin @category
    Scenario: API_ADMIN_Category-05: Get all categories
        When I create 10 categories 214079R_AdminApi
        And I get all categories 214079R_AdminApi
        Then the response status should be 200 214079R_AdminApi
        And the response should contain category objects 214079R_AdminApi
        Then I delete all created categories 214079R_AdminApi
