Feature: API Admin Dashboard - Dashboard Statistics and Data

    @api @admin @dashboard
    Scenario: API_ADMIN_Dashboard-01: Get category summary
        When I create 10 categories and 10 sub-categories 215036R_AdminApi
        Then I get category summary 215036R_AdminApi
        And the response status should be 200 215036R_AdminApi
        And the response should have category summary properties 215036R_AdminApi

    @api @admin @dashboard
    Scenario: API_ADMIN_Dashboard-02: Get all plants
        When I create category, sub-category and 10 plants 215036R_AdminApi
        Then I get all plants 215036R_AdminApi
        And the response status should be 200 215036R_AdminApi
        And the response should contain plants array 215036R_AdminApi
        Then I delete all created plants 215036R_AdminApi

    @api @admin @dashboard
    Scenario: API_ADMIN_Dashboard-03: Get plants summary
        When I create category, sub-category and 10 plants with varying quantities 215036R_AdminApi
        Then I get plants summary 215036R_AdminApi
        And the response status should be 200 215036R_AdminApi
        And the response should have plants summary properties 215036R_AdminApi
        Then I delete all created plants 215036R_AdminApi

    @api @admin @dashboard
    Scenario: API_ADMIN_Dashboard-04: Get all sales
        When I create category, sub-category, 10 plants and 10 sales 215036R_AdminApi
        Then I get all sales 215036R_AdminApi
        And the response status should be 200 215036R_AdminApi
        And the response should contain sales array 215036R_AdminApi
        Then I delete all created sales 215036R_AdminApi

    @api @admin @dashboard
    Scenario: API_ADMIN_Dashboard-05: Prevent access without token
        When I request categories endpoint without token 215036R_AdminApi
        Then the response status should be 401 or 403 215036R_AdminApi
        And the response should have error message 215036R_AdminApi

    @api @admin @dashboard
    Scenario: API_ADMIN_Dashboard-06: Prevent access with invalid token
        When I request plants endpoint with invalid token 215036R_AdminApi
        Then the response status should be 401 215036R_AdminApi
        And the response should have error message 215036R_AdminApi
