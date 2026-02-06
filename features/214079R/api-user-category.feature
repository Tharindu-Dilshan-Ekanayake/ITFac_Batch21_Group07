Feature: API User Category Management

    Background:
        Given I have a valid user token 214079R_UserApi

    Scenario: API_USER_Category-01: Get category by valid ID
        When I create a category as admin 214079R_UserApi
        And I get the category by its ID as user 214079R_UserApi
        Then the response status should be 200 214079R_UserApi
        And the response data should have valid category properties 214079R_UserApi
        And I delete the created category as admin 214079R_UserApi

    Scenario: API_USER_Category-02: Get category by invalid ID
        When I get a category by invalid ID 999 214079R_UserApi
        Then the response status should be 404 214079R_UserApi

    Scenario: API_USER_Category-03: Get sub-categories
        When I create a category and a sub-category as admin 214079R_UserApi
        And I get sub-categories as user 214079R_UserApi
        Then the response status should be 200 214079R_UserApi
        And the response should contain sub-category properties 214079R_UserApi

    Scenario: API_USER_Category-04: Search categories with pagination
        When I search categories with pagination parameters as user 214079R_UserApi
        Then the response status should be 200 214079R_UserApi
        And the response should contain pagination properties 214079R_UserApi

    Scenario: API_USER_Category-05: Prevent search categories with invalid pagination
        When I search categories with invalid pagination parameters as user 214079R_UserApi
        Then the response status should be 400 214079R_UserApi
        And the response should contain error message "BAD_REQUEST" 214079R_UserApi
