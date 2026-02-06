Feature: User Category - View, Search and Sort

    Background:
        Given I am logged in as a user 214079R_User
        And I am on the User Categories page 214079R_User

    @ui @user @category
    Scenario: UI_USER_Category-01: Verify categories page UI elements
        Then I should see the Categories header 214079R_User
        And I should see the Search input 214079R_User
        And I should see the Parent filter 214079R_User
        And I should see the Search and Reset buttons 214079R_User
        And I should see the Categories table 214079R_User
        And I should see the Categories table headers 214079R_User

    @ui @user @category
    Scenario: UI_USER_Category-02: Search categories by valid category name
        When I search for a valid category name 214079R_User
        Then I should see the category in the table 214079R_User

    @ui @user @category
    Scenario: UI_USER_Category-03: Search categories by invalid category name
        When I search for category "invalid_name_123" 214079R_User
        Then I should see "No category found" text 214079R_User

    @ui @user @category
    Scenario: UI_USER_Category-04: Verify parent category filtering
        When I filter by the first parent category 214079R_User
        Then I should see categories with the selected parent 214079R_User

    @ui @user @category
    Scenario: UI_USER_Category-05: Verify reset button functionality
        When I search for a valid category name 214079R_User
        And I click the Reset button 214079R_User
        Then I should see all categories again 214079R_User

    @ui @user @category
    Scenario: UI_USER_Category-06: Sort categories by ID
        When I sort categories by ID "ascending" 214079R_User
        Then the categories should be sorted by ID "ascending" 214079R_User
        When I sort categories by ID "descending" 214079R_User
        Then the categories should be sorted by ID "descending" 214079R_User

    @ui @user @category
    Scenario: UI_USER_Category-07: Sort categories by Name
        When I sort categories by "Name" "descending" 214079R_User
        Then the categories should be sorted by "Name" "descending" 214079R_User
        When I sort categories by "Name" "ascending" 214079R_User
        Then the categories should be sorted by "Name" "ascending" 214079R_User

    @ui @user @category
    Scenario: UI_USER_Category-08: Sort categories by Parent
        When I sort categories by "Parent" "descending" 214079R_User
        Then the categories should be sorted by "Parent" "descending" 214079R_User
        When I sort categories by "Parent" "ascending" 214079R_User
        Then the categories should be sorted by "Parent" "ascending" 214079R_User
