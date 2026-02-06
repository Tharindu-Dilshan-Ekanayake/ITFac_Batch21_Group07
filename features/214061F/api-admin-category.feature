Feature: API Admin Category - Additional validations 214061F

	@api @admin @category
	Scenario: API_ADMIN-11: Create main category (no parent)
		When I create a main category without parent 214061F_AdminApi
		Then the creation response status should be 201 214061F_AdminApi
		And the created category should have no parent 214061F_AdminApi
		Then I delete the created category 214061F_AdminApi
		And the deletion response status should be 204 214061F_AdminApi

	@api @admin @category
	Scenario: API_ADMIN-12: Create parent then sub-category using parent object
		When I create a parent and sub-category using parent object 214061F_AdminApi
		Then the parent and sub-category should be created successfully 214061F_AdminApi
		And the sub-category should be linked to the parent 214061F_AdminApi
		Then I delete the created parent and sub-category categories 214061F_AdminApi

	@api @admin @category
	Scenario: API_ADMIN-13: Prevent duplicate main category
		When I create a main category for duplicate test 214061F_AdminApi
		And I try to create another main category with the same name 214061F_AdminApi
		Then the duplicate main category creation should fail with 400 214061F_AdminApi
		Then I delete the first created main category for duplicate test 214061F_AdminApi

	@api @admin @category
	Scenario: API_ADMIN-14: Prevent duplicate sub-category under same parent
		When I create a parent category and a sub-category 214061F_AdminApi
		And I try to create a duplicate sub-category under the same parent 214061F_AdminApi
		Then the duplicate sub-category creation should fail with 400 and validation message 214061F_AdminApi
		Then I delete the created sub-category and parent 214061F_AdminApi

	@api @admin @category
	Scenario: API_ADMIN-15: Prevent main category creation with empty name
		When I try to create a main category with empty name 214061F_AdminApi
		Then the main category creation with empty name should fail with 400 and validation details 214061F_AdminApi

	@api @admin @category
	Scenario: API_ADMIN-16: Prevent sub-category creation with empty name
		When I create a valid parent category for empty sub-category test 214061F_AdminApi
		And I try to create a sub-category with empty name under that parent 214061F_AdminApi
		Then the sub-category creation with empty name should fail with 400 and validation details 214061F_AdminApi
		Then I delete the parent category used for empty sub-category test 214061F_AdminApi

	@api @admin @category
	Scenario: API_ADMIN-17: Update category (create then update name)
		When I create a main category for update 214061F_AdminApi
		And I update the category name 214061F_AdminApi
		Then the category should be updated successfully 214061F_AdminApi
		When I get the updated category by ID 214061F_AdminApi
		Then the fetched category should have the updated name 214061F_AdminApi
		Then I delete the updated category 214061F_AdminApi

	@api @admin @category
	Scenario: API_ADMIN-18: Should return 404 when updating non-existing category
		When I try to update a non existing category 214061F_AdminApi
		Then the update should return 404 not found 214061F_AdminApi

	@api @admin @category
	Scenario: API_ADMIN-19: Delete category by ID (create then delete)
		When I create a category for delete 214061F_AdminApi
		Then the creation response status should be 201 214061F_AdminApi
		When I delete the created category by ID 214061F_AdminApi
		Then the deletion response status should be 204 214061F_AdminApi
		And the deleted category should not be found 214061F_AdminApi

