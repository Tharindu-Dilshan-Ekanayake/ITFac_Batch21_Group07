Feature: Admin Plants UI - List, search and sort

	@ui @admin @plants
	Scenario: UI_ADMIN_Plant-23 Verify no plants data available
		Given I am logged in as an admin user 215050E_PlantsUI
		When I navigate to the admin plants page 215050E_PlantsUI
		Then I should see the "No plants found" message 215050E_PlantsUI

	@ui @admin @plants
	Scenario: UI_ADMIN_Plant-24 Search plants by valid plant name
		Given I am logged in as an admin user 215050E_PlantsUI
		And I am on the admin plants page 215050E_PlantsUI
		When I search plants by name "Rose" 215050E_PlantsUI
		Then I should see at least one plant row in the admin table 215050E_PlantsUI
		And all visible plant rows should contain the text "Rose" in the name column 215050E_PlantsUI

	@ui @admin @plants
	Scenario: UI_ADMIN_Plant-25 Search plants by invalid plant name
		Given I am logged in as an admin user 215050E_PlantsUI
		And I am on the admin plants page 215050E_PlantsUI
		When I search plants by name "InvalidPlantName12345" 215050E_PlantsUI
		Then I should see the "No plants found" message 215050E_PlantsUI

	@ui @admin @plants
	Scenario: UI_ADMIN_Plant-27 Verify reset button functionality
		Given I am logged in as an admin user 215050E_PlantsUI
		And I am on the admin plants page 215050E_PlantsUI
		When I search plants by name "Rose" 215050E_PlantsUI
		And I select the category "Orchid" in the admin plants page 215050E_PlantsUI
		And I apply the plants search filter 215050E_PlantsUI
		And I click the reset link in the admin plants page 215050E_PlantsUI
		Then the plants search input should be empty 215050E_PlantsUI
		And I should see at least one plant row in the admin table 215050E_PlantsUI

	@ui @admin @plants
	Scenario: UI_ADMIN_Plant-28 Sort plants by Name
		Given I am logged in as an admin user 215050E_PlantsUI
		And I am on the admin plants page 215050E_PlantsUI
		When I sort plants by name in descending order 215050E_PlantsUI
		Then the admin plants table should be sorted by name descending with down arrow 215050E_PlantsUI
		When I sort plants by name in ascending order 215050E_PlantsUI
		Then the admin plants table should be sorted by name ascending with up arrow 215050E_PlantsUI

	@ui @admin @plants
	Scenario: UI_ADMIN_Plant-30 Sort plants by Price
		Given I am logged in as an admin user 215050E_PlantsUI
		And I am on the admin plants page 215050E_PlantsUI
		When I sort plants by price ascending then descending 215050E_PlantsUI
		Then the admin plants table prices should be correctly sorted for both directions 215050E_PlantsUI

	@ui @admin @plants
	Scenario: UI_ADMIN_Plant-31 Sort plants by Stock
		Given I am logged in as an admin user 215050E_PlantsUI
		And I am on the admin plants page 215050E_PlantsUI
		When I sort plants by stock ascending then descending 215050E_PlantsUI
		Then the admin plants table stock values should be correctly sorted for both directions 215050E_PlantsUI

	@ui @admin @plants
	Scenario: UI_ADMIN_Plant-32 Display Low badge when quantity is below 5
		Given I am logged in as an admin user 215050E_PlantsUI
		And I am on the admin plants page 215050E_PlantsUI
		Then any plant with quantity below 5 should display a Low badge 215050E_PlantsUI