Feature: One Word Story

  Scenario: Page loads successfully
    Given the user opens the home page
    Then the connect wallet button is visible
    And the word input is visible
    And the submit button is visible
    And the story section is visible

  Scenario: Submit without wallet shows error
    Given the user opens the home page
    When the user types "hello" in the word input
    And the user clicks submit
    Then the message "Please connect your wallet first." is visible

  Scenario: API returns story words
    Given the API is running
    When the user requests the story
    Then the response status is 200
    And the response contains a words list