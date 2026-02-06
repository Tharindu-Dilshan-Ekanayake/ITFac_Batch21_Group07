Feature: UI Admin Dashboard

    Background:
        Given I am logged in as an admin 215036R_admin
        And I am on the Dashboard page 215036R_admin

    @ui @admin @dashboard
    Scenario: UI_ADMIN_Dashboard-01: Verify dashboard content and active tab highlight
        Then I should see the Dashboard header 215036R_admin
        And the Dashboard tab should be active 215036R_admin
        And the sidebar navigation should be visible 215036R_admin
        And all dashboard cards should be visible 215036R_admin

    @ui @admin @dashboard
    Scenario: UI_ADMIN_Dashboard-02: Verify visibility of summary data
        Then all dashboard cards should have non-empty summary data 215036R_admin
        And all dashboard cards should have visible action buttons 215036R_admin

    @ui @admin @dashboard
    Scenario: UI_ADMIN_Dashboard-03: Navigation via Manage Categories button
        When I click the "Manage Categories" button 215036R_admin
        Then I should be on the Categories page 215036R_admin

    @ui @admin @dashboard
    Scenario: UI_ADMIN_Dashboard-04: Navigation via Manage Plants button
        When I click the "Manage Plants" button 215036R_admin
        Then I should be on the Plants page 215036R_admin

    @ui @admin @dashboard
    Scenario: UI_ADMIN_Dashboard-05: Navigation via View Sales button
        When I click the "View Sales" button 215036R_admin
        Then I should be on the Sales page 215036R_admin

    @ui @admin @dashboard
    Scenario: UI_ADMIN_Dashboard-06: Verify categories sidebar navigation and highlights active tab
        When I click the Categories sidebar navigation 215036R_admin
        Then I should be on the Categories page 215036R_admin
        And the Categories tab should be active 215036R_admin

    @ui @admin @dashboard
    Scenario: UI_ADMIN_Dashboard-07: Verify plants sidebar navigation and highlights active tab
        When I click the Plants sidebar navigation 215036R_admin
        Then I should be on the Plants page 215036R_admin
        And the Plants tab should be active 215036R_admin

    @ui @admin @dashboard
    Scenario: UI_ADMIN_Dashboard-08: Verify sales sidebar navigation and highlights active tab
        When I click the Sales sidebar navigation 215036R_admin
        Then I should be on the Sales page 215036R_admin
        And the Sales tab should be active 215036R_admin
