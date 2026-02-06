Feature: Admin Category - Add Category button

  Background:
    Given I am logged in as an admin
    And I am on the Categories page

  @ui @admin @category
  Scenario: UI_ADMIN_Category-10: Add Category button should be visible and enabled
    Then I should see the Add Category button
    And the Add Category button should be enabled

  @ui @admin @category
  Scenario: UI_ADMIN_Category-11: Navigate to Add Category page when Add Category button is clicked
    When I click the Add Category button
    Then I should be on the Add Category page
    And the Add Category page title should be "QA Training App | Add A Category"

  @ui @admin @category
  Scenario: UI_ADMIN_Category-12: Show validation when category name is empty
    When I go to the Add Category page from Categories
    And I leave the category name empty and save
    Then I should see a "Category name is required" validation message
    And I should still be on the Add Category page

  @ui @admin @category
  Scenario: ADMIN_Category-13: Show error when category name is less than 3 characters
    When I am on the Add Category page
    And I enter a category name "ab" and save
    Then I should see a "Category name must be between 3 and 10 characters" validation message
    And the category name field should be invalid
    And I should still be on the Add Category page

  @ui @admin @category
  Scenario: UI_ADMIN_Category-14: Create a main category when parent category is left as Main Category
    When I am on the Add Category page
    And I enter a main category name "MAI1N" and save
    Then I should see a "Category created successfully" success message
    And I should see the category "MAI1N" as a main category in the table
    And I delete the category "MAI1N" as admin

  @ui @admin @category
  Scenario: UI_ADMIN_Category-15: Create main category and then create sub-category under it
    When I am on the Add Category page
    And I enter a main category name "PARENT" and save
    Then I should see a "Category created successfully" success message
    And I should see the category "PARENT" as a main category in the table
    When I create a sub-category "CHILD" under parent "PARENT"
    Then I should see a "Category created successfully" success message
    And I should see the category "CHILD" with parent "PARENT" in the table
    And I delete the sub-category "CHILD" and parent "PARENT" as admin

  @ui @admin @category
  Scenario: UI_ADMIN_Category-16: Discard changes and navigate back when Cancel is clicked
    When I am on the Add Category page
    And I type a temporary category name "TEMP"
    And I click Cancel on the Add Category form
    Then I should be on the Categories page
    And the category "TEMP" should not exist in the table

  @ui @admin @category
  Scenario: UI_ADMIN_Category-17: Display Edit button for created category
    When I am on the Add Category page
    And I enter a main category name "EDitVis" and save
    Then I should see a "Category created successfully" success message
    And I should see an Edit button for category "EDitVis"
    And I delete the category "EDitVis" as admin

  @ui @admin @category
  Scenario: UI_ADMIN_Category-18: Show validation error when category name is empty on edit
    When I am on the Add Category page
    And I enter a main category name "EDITtest" and save
    And I open the edit page for category "EDITtest"
    And I clear the category name and save
    Then I should see a "Category name is required" validation message
    And I should still be on the Edit Category page
    And I delete the category "EDITtest" as admin

  @ui @admin @category
  Scenario: UI_ADMIN_Category-19: Edit category name and keep parent category default
    When I am on the Add Category page
    And I enter a main category name "EDITPass" and save
    And I open the edit page for category "EDITPass"
    And I change the category name to "EditedName" and save
    Then the category "EditedName" should have the same parent as before
    And I delete the category "EditedName" as admin

  @ui @admin @category
  Scenario: UI_ADMIN_Category-20: Show length validation when editing category name with less than 3 characters
    When I am on the Add Category page
    And I enter a main category name "EDITtest1" and save
    And I open the edit page for category "EDITtest1"
    And I change the category name to "ab" and save
    Then I should see a "Category name must be between 3 and 10 characters" validation message
    And I should still be on the Edit Category page
    And I delete the category "EDITtest1" as admin

  @ui @admin @category
  Scenario: UI_ADMIN_Category-22: Discard changes when clicking Cancel on Edit Category
    When I am on the Add Category page
    And I enter a main category name "CANCEL" and save
    And I open the edit page for category "CANCEL"
    And I change the category name to "CheckCancel" but do not save
    And I click Cancel on the Edit Category page
    Then I should be on the Categories page
    And the category "CANCEL" should exist in the table
    And the category "CheckCancel" should not exist in the table
    And I delete the category "CANCEL" as admin

  @ui @admin @category
  Scenario: UI_ADMIN_Category-23: Show confirm dialog and delete category on OK
    When I am on the Add Category page
    And I enter a main category name "DEL-Test" and save
    Then I should see a "Category created successfully" success message
    And I delete the category "DEL-Test" as admin