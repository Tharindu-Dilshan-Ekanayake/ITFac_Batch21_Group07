Feature: Admin Plant - Add, Validate, Update and Delete

    Background:
        Given I am logged in as an admin 214002D_Admin
        And I have created test categories 214002D_Admin

    @ui @admin @plant
    Scenario: UI_ADMIN_Plant-01: Navigate to Add Plant page
        When I go to the Admin Plants page 214002D_Admin
        And I click on the Add A Plant link 214002D_Admin
        Then I should see the plant form 214002D_Admin

    @ui @admin @plant
    Scenario: UI_ADMIN_Plant-02: Validate Plant Name is required
        When I am on the Add Plant page 214002D_Admin
        And I fill the plant form with name "", category "Test", price "100", and quantity "10" 214002D_Admin
        And I click the Save button 214002D_Admin
        Then I should see a validation error "Plant name is required" for field "#name" 214002D_Admin

    @ui @admin @plant
    Scenario: UI_ADMIN_Plant-03: Validate Plant Name length
        When I am on the Add Plant page 214002D_Admin
        And I fill the plant form with name "AB", category "Test", price "100", and quantity "10" 214002D_Admin
        And I click the Save button 214002D_Admin
        Then I should see a validation error "Plant name must be" for field "#name" 214002D_Admin
        When I fill the plant form with name "TooLongNameExceedingTwentyFiveChars", category "Test", price "100", and quantity "10" 214002D_Admin
        And I click the Save button 214002D_Admin
        Then I should see a validation error "Plant name must be" for field "#name" 214002D_Admin

    @ui @admin @plant
    Scenario: UI_ADMIN_Plant-04: Validate Category is required
        When I am on the Add Plant page 214002D_Admin
        And I fill the plant form with name "Valid Plant", category "", price "100", and quantity "10" 214002D_Admin
        And I click the Save button 214002D_Admin
        Then I should see a validation error "Category is required" for field "#categoryId" 214002D_Admin

    @ui @admin @plant
    Scenario: UI_ADMIN_Plant-05: Validate Price is required
        When I am on the Add Plant page 214002D_Admin
        And I fill the plant form with name "Valid Plant", category "Test", price "", and quantity "10" 214002D_Admin
        And I click the Save button 214002D_Admin
        Then I should see a validation error "Price is required" for field "#price" 214002D_Admin

    @ui @admin @plant
    Scenario: UI_ADMIN_Plant-06: Validate Price cannot be 0 or negative
        When I am on the Add Plant page 214002D_Admin
        And I fill the plant form with name "Valid Plant", category "Test", price "-10", and quantity "10" 214002D_Admin
        And I click the Save button 214002D_Admin
        Then I should see a validation error "Price must be greater than 0" for field "#price" 214002D_Admin

    @ui @admin @plant
    Scenario: UI_ADMIN_Plant-07: Validate Quantity is required
        When I am on the Add Plant page 214002D_Admin
        And I fill the plant form with name "Valid Plant", category "Test", price "100", and quantity "" 214002D_Admin
        And I click the Save button 214002D_Admin
        Then I should see a validation error "Quantity is required" for field "#quantity" 214002D_Admin

    @ui @admin @plant
    Scenario: UI_ADMIN_Plant-08: Validate Quantity cannot be 0 or negative
        When I am on the Add Plant page 214002D_Admin
        And I fill the plant form with name "Valid Plant", category "Test", price "100", and quantity "-5" 214002D_Admin
        And I click the Save button 214002D_Admin
        Then I should see a validation error "Quantity cannot be negative" for field "#quantity" 214002D_Admin

    @ui @admin @plant
    Scenario: UI_ADMIN_Plant-10: Create plant and verify LOW badge
        When I am on the Add Plant page 214002D_Admin
        And I create a plant with low stock 214002D_Admin
        Then I should see a success message "Plant added successfully" 214002D_Admin
        And the plant should have a "Low" badge in the table 214002D_Admin

    @ui @admin @plant
    Scenario: UI_ADMIN_Plant-11: Cancel button on Add Plant
        When I am on the Add Plant page 214002D_Admin
        And I fill the plant form with valid data 214002D_Admin
        And I click the Cancel link 214002D_Admin
        Then I should be redirected to the Admin Plants page 214002D_Admin

    @ui @admin @plant
    Scenario: UI_ADMIN_Plant-12: Create plant then update it
        When I create a plant with low stock 214002D_Admin
        And I edit the plant to increase quantity 214002D_Admin
        Then the plant quantity should be updated in the table 214002D_Admin

    @ui @admin @plant
    Scenario: UI_ADMIN_Plant-13: Create plant then delete it
        When I create a plant 214002D_Admin
        And I delete the plant 214002D_Admin
        Then I should see a success message "Plant deleted successfully" 214002D_Admin
        And the plant should not be in the table 214002D_Admin
