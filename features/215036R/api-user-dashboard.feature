Feature: API User Dashboard

    Background:
        Given I have a valid user token 215036R_UserApi

    Scenario: API_USER_Dashboard-01: Get all categories
        When I create 10 categories as admin 215036R_UserApi
        And I get all categories as user 215036R_UserApi
        Then the response status should be 200 215036R_UserApi
        And the response should have valid category list properties 215036R_UserApi
        And I delete all created categories as admin 215036R_UserApi

    Scenario: API_USER_Dashboard-02: Get category summary
        When I create 10 categories and sub-categories as admin 215036R_UserApi
        And I get category summary as user 215036R_UserApi
        Then the response status should be 200 215036R_UserApi
        And the response should have category summary properties 215036R_UserApi

    Scenario: API_USER_Dashboard-03: Get all plants
        When I create category, sub-category, and 10 plants as admin 215036R_UserApi
        And I get all plants as user 215036R_UserApi
        Then the response status should be 200 215036R_UserApi
        And the response should be a valid plants array 215036R_UserApi
        And I delete all created plants as admin 215036R_UserApi

    Scenario: API_USER_Dashboard-04: Get plants summary
        When I create category, sub-category, and plants with varying stock as admin 215036R_UserApi
        And I get plants summary as user 215036R_UserApi
        Then the response status should be 200 215036R_UserApi
        And the response should have plants summary properties 215036R_UserApi
        And I delete all created plants as admin 215036R_UserApi

    Scenario: API_USER_Dashboard-05: Get all sales
        When I create category, sub-category, plants, and 10 sales as admin 215036R_UserApi
        And I get all sales as user 215036R_UserApi
        Then the response status should be 200 215036R_UserApi
        And the response should be a valid sales array 215036R_UserApi
        And I delete all created sales as admin 215036R_UserApi

    Scenario: API_USER_Dashboard-06: Prevent access without token
        When I try to get categories without token 215036R_UserApi
        Then the response status should be 401 or 403 215036R_UserApi
        And the response should contain an error message 215036R_UserApi

    Scenario: API_USER_Dashboard-07: Prevent access with invalid token
        When I try to get plants with invalid token 215036R_UserApi
        Then the response status should be 401 215036R_UserApi
        And the response should contain an error message 215036R_UserApi
