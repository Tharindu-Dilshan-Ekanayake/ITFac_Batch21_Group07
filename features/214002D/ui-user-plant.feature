Feature: User Plant - View and Verify UI Elements

    Background:
        Given I am logged in as a user 214002D_User
        And I am on the User Plants page 214002D_User

    @ui @user @plant
    Scenario: UI_User_Plants-01: Verify plants page UI elements availability
        Then I should see the search plant input 214002D_User
        And I should see the category filter 214002D_User
        And I should see the Search and Reset buttons 214002D_User
        And I should see the Plants table 214002D_User
        And I should see the Plants table headers 214002D_User

    @ui @user @plant
    Scenario: UI_User_Plants-02: Ensure there is no plants data available
        When I search for plant "invalid_name_999" 214002D_User
        Then I should see "No plants found" text 214002D_User

    @ui @user @plant
    Scenario: UI_User_Plants-04: Verify Low badge when quantity below 5
        Then I should see the Low badge for low stock plants 214002D_User

    @ui @user @plant
    Scenario: UI_User_Plants-05: Verify Edit button is NOT displayed
        Then I should not see the Edit button 214002D_User

    @ui @user @plant
    Scenario: UI_User_Plants-06: Verify Delete button is NOT displayed
        Then I should not see the Delete button 214002D_User
