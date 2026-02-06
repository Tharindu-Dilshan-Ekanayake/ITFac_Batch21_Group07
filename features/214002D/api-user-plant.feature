Feature: API User Plant Management

    Background:
        Given I have a valid user token 214002D_UserApi

    Scenario: API_USER_Plant-01: Create category and plant as admin
        When I create a category as admin 214002D_UserApi
        Then the response status should be 201 214002D_UserApi
        When I create a plant as admin 214002D_UserApi
        Then the response status should be 201 214002D_UserApi

    Scenario: API_USER_Plant-02: Prevent user from creating a plant
        When I attempt to create a plant as user 214002D_UserApi
        Then the response status should be 403 214002D_UserApi

    Scenario: API_USER_Plant-03: Get plant by ID as user
        When I get the plant by its ID as user 214002D_UserApi
        Then the response status should be 200 214002D_UserApi
        And the response data should have valid plant properties 214002D_UserApi

    Scenario: API_USER_Plant-04: Get plants by category ID as user
        When I get plants by category ID as user 214002D_UserApi
        Then the response status should be 200 214002D_UserApi
        And the response should contain the created plant 214002D_UserApi

    Scenario: API_USER_Plant-05: Get plant by invalid ID as user
        When I get a plant by invalid ID as user 214002D_UserApi
        Then the response status should be 404 214002D_UserApi
        And the response error should be "NOT_FOUND" 214002D_UserApi

    Scenario: API_USER_Plant-06: Prevent user from updating a plant
        When I attempt to update a plant as user 214002D_UserApi
        Then the response status should be 403 214002D_UserApi

    Scenario: API_USER_Plant-07: Prevent user from deleting a plant
        When I attempt to delete a plant as user 214002D_UserApi
        Then the response status should be 403 214002D_UserApi

    Scenario: API_USER_Plant-08: Admin cleanup plant and category
        When I delete the created plant as admin 214002D_UserApi
        Then the response status should be 204 214002D_UserApi
        And I delete the created categories as admin 214002D_UserApi
        Then the response status should be 204 214002D_UserApi
