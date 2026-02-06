Feature: Admin Dashboard UI

  Background:
    Given I am logged in as an admin
    And I am on the Dashboard page

  @ui @admin @dashboard
  Scenario: UI_ADMIN_DASHBOARD-01: Verify dashboard content and active tab highlight
    Then I should see the Dashboard heading
    And the Dashboard tab should be visible
    And the Dashboard tab should have the active class
    And the logo should be visible
    And I should see the Categories card
    And I should see the Plants card
    And I should see the Sales card
    And the Categories sidebar navigation should be visible
    And the Plants sidebar navigation should be visible
    And the Sales sidebar navigation should be visible
    And the Logout button should be visible

  @ui @admin @dashboard
  Scenario: UI_ADMIN_DASHBOARD-02: Verify visibility of summary data
    Then the Categories card should display summary numbers
    And the Plants card should display summary numbers
    And the Sales card should display summary numbers
    And the Categories card should have a button
    And the Plants card should have a button
    And the Sales card should have a button

  @ui @admin @dashboard
  Scenario: UI_ADMIN_DASHBOARD-03: Navigation via Manage Categories button
    When I click the Manage Categories button
    Then I should be navigated to the Categories page
    And the Categories heading should be visible

  @ui @admin @dashboard
  Scenario: UI_ADMIN_DASHBOARD-04: Navigation via Manage Plants button
    When I click the Manage Plants button
    Then I should be navigated to the Plants page
    And the Plants heading should be visible

  @ui @admin @dashboard
  Scenario: UI_ADMIN_DASHBOARD-05: Navigation via View Sales button
    When I click the View Sales button
    Then I should be navigated to the Sales page
    And the Sales heading should be visible

  @ui @admin @dashboard
  Scenario: UI_ADMIN_DASHBOARD-06: Verify categories sidebar navigation and highlights active tab
    When I click on Categories from the sidebar
    Then I should be navigated to the Categories page
    And the Categories tab should have the active class

  @ui @admin @dashboard
  Scenario: UI_ADMIN_DASHBOARD-07: Verify plants sidebar navigation and highlights active tab
    When I click on Plants from the sidebar
    Then I should be navigated to the Plants page
    And the Plants tab should have the active class

  @ui @admin @dashboard
  Scenario: UI_ADMIN_DASHBOARD-08: Verify sales sidebar navigation and highlights active tab
    When I click on Sales from the sidebar
    Then I should be navigated to the Sales page
    And the Sales tab should have the active class
