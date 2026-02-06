Feature: User Category UI - restrictions for normal users
	As a normal (non-admin) user
	I should not be able to manage categories like an admin

	Background:
		Given I am logged in as a normal user
		And I am on the User Categories page

	@ui @user @category
	Scenario: UI_User_Categories-11: Edit button should not be visible for user
		Given there is a category "EDITBT" created by an admin
		Then I should see the category "EDITBT" in the user table
		And I should not see any Edit buttons in the user categories table
		And I should not see an "Add A Category" link on the user categories page

	@ui @user @category
	Scenario: UI_User_Categories-12: Delete button should not be visible for user
		Given there is a category "DELTEST" created by an admin
		Then I should see the category "DELTEST" in the user table
		And I should not see any Delete controls in the user categories table
		And I should not see an "Add A Category" link on the user categories page

	@ui @user @category
	Scenario: UI_User_Categories-13: should show "No category found" when no categories exist
		Given there are no categories in the system
		Then I should see a "No category found" message on the user categories page
		And I should see no category rows in the user table

	@ui @user @category
	Scenario: UI_User_Categories-14: pagination works and each page has different data
		Given there are at least 12 categories created by an admin
		When I browse through the user categories pages using pagination
		Then each user categories page should show different category IDs

	@ui @user @category
	Scenario: UI_User_Categories-15: Add Category button should not be visible for user
		Then I should not see an "Add A Category" link on the user categories page
		And I should see the user categories table

