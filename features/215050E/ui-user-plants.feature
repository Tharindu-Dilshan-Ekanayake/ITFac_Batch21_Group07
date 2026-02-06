Feature: User Plants Management

	Scenario: Search plants by valid plant name
		Given the user is on the plants page
		When the user searches for a plant with name "Test"
		Then plants matching "Test" should be shown

	Scenario: Search plants by invalid plant name
		Given the user is on the plants page
		When the user searches for a plant with name "InvalidPlantName12345"
		Then no plants should be found

	Scenario: Filter plants by category
		Given the user is on the plants page
		When the user filters by category "Sub131"
		Then plants in category "Sub131" should be shown

	Scenario: Sort plants by Name descending
		Given the user is on the plants page
		When the user sorts plants by Name
		Then plants should be sorted by Name "desc"
		Then the Name column should show "↓" arrow

	Scenario: Sort plants by Name ascending
		Given the user is on the plants page
		When the user sorts plants by Name
		When the user sorts plants by Name
		Then plants should be sorted by Name "asc"
		Then the Name column should show "↑" arrow

	Scenario: Sort plants by Price ascending
		Given the user is on the plants page
		When the user sorts plants by Price
		Then plants should be sorted by Price "asc"

	Scenario: Sort plants by Price descending
		Given the user is on the plants page
		When the user sorts plants by Price
		When the user sorts plants by Price
		Then plants should be sorted by Price "desc"

	Scenario: Sort plants by Stock ascending
		Given the user is on the plants page
		When the user sorts plants by Stock
		Then plants should be sorted by Stock "asc"

	Scenario: Sort plants by Stock descending
		Given the user is on the plants page
		When the user sorts plants by Stock
		When the user sorts plants by Stock
		Then plants should be sorted by Stock "desc"

	Scenario: Display Low badge when quantity is below 5
		Given the user is on the plants page
		Then Low badge should be shown for stock below 5
