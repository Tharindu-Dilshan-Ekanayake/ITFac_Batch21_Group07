Feature: User Sales Management UI

  Scenario: Verify sales page UI elements
    Given the user is on the sales page
    Then the sales page should show correct UI elements

  Scenario: Verify no sales data available
    Given the user is on the sales page
    Then the sales page should show no sales data message if empty

  Scenario: Paginated data visibility
    Given the user is on the sales page
    Then pagination should be visible only if more than 10 records

  Scenario: Verify default sorting on descending sold date
    Given the user is on the sales page
    Then sales should be sorted by Sold date descending by default

  Scenario Outline: Sort sales table by columns
    Given the user is on the sales page
    Then sales should be sortable by "<column>"
    Examples:
      | column   |
      | Plant    |
      | Quantity |
      | Total    |
      | Sold     |
