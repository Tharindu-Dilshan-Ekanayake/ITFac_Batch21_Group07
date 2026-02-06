Feature: UI User Dashboard

    Background:
        Given I am logged in as a user 215036R_user
        And I am on the Dashboard page 215036R_user

    @ui @user @dashboard
    Scenario: UI_USER_Dashboard-01: Verify dashboard content and active tab highlight
        Then I should see the Dashboard header 215036R_user
        And the Dashboard tab should be active 215036R_user
        And the sidebar navigation should be visible 215036R_user
        And all dashboard cards should be visible 215036R_user

    @ui @user @dashboard
    Scenario: UI_USER_Dashboard-02: Verify visibility of summary data
        Then all dashboard cards should have non-empty summary data 215036R_user
        And all dashboard cards should have visible action buttons 215036R_user

    @ui @user @dashboard
    Scenario: UI_USER_Dashboard-03: Navigation via Manage Categories button
        When I click the "Manage Categories" button 215036R_user
        Then I should be on the Categories page 215036R_user

    @ui @user @dashboard
    Scenario: UI_USER_Dashboard-04: Navigation via Manage Plants button
        When I click the "Manage Plants" button 215036R_user
        Then I should be on the Plants page 215036R_user

    @ui @user @dashboard
    Scenario: UI_USER_Dashboard-05: Navigation via View Sales button
        When I click the "View Sales" button 215036R_user
        Then I should be on the Sales page 215036R_user

    @ui @user @dashboard
    Scenario: UI_USER_Dashboard-06: Verify categories sidebar navigation and highlights active tab
        When I click the Categories sidebar navigation 215036R_user
        Then I should be on the Categories page 215036R_user
        And the Categories tab should be active 215036R_user

    @ui @user @dashboard
    Scenario: UI_USER_Dashboard-07: Verify plants sidebar navigation and highlights active tab
        When I click the Plants sidebar navigation 215036R_user
        Then I should be on the Plants page 215036R_user
        And the Plants tab should be active 215036R_user

    @ui @user @dashboard
    Scenario: UI_USER_Dashboard-08: Verify sales sidebar navigation and highlights active tab
        When I click the Sales sidebar navigation 215036R_user
        Then I should be on the Sales page 215036R_user
        And the Sales tab should be active 215036R_user
