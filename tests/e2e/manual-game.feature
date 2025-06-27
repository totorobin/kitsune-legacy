Feature: Manual Game Mode
  As a user
  I want to play the game in manual mode
  So that I can choose my own tiles and target number

  Background:
    Given I am on the game page
    When I select the manual game mode

  Scenario: Setting up a manual game
    When I set the target number to 100
    And I select the following tiles: 1, 2, 3, 4, 5, 6
    And I start the game
    Then I should see the game board with my selected tiles
    And I should see the target number 100

  Scenario: Playing a manual game with exact solution
    When I set the target number to 10
    And I select the following tiles: 1, 2, 3, 4, 5, 6
    And I start the game
    And I perform the operation 5 + 5
    Then I should see the result 10
    And I should see the "GAGNÉ" message

  Scenario: Playing a manual game with approximate solution
    When I set the target number to 100
    And I select the following tiles: 5, 10, 25, 3, 7, 9
    And I start the game
    And I perform the operation 5 × 25
    Then I should see the result 125
    And I should not see the "GAGNÉ" message

  Scenario: Selecting tiles with values 1-10 twice
    When I set the target number to 50
    And I select the tile with value 5 twice
    And I select the following tiles: 10, 25, 3, 7
    And I start the game
    Then I should see two tiles with value 5
    And I should see the target number 50

  Scenario: Using result tiles in operations
    When I set the target number to 100
    And I select the following tiles: 5, 10, 25, 3, 7, 9
    And I start the game
    And I perform the operation 5 × 10
    And I perform the operation 50 + 25
    Then I should see the result 75
    And I should see the operations history

  Scenario: Setting custom game time
    When I set the target number to 100
    And I select the following tiles: 1, 2, 3, 4, 5, 6
    And I set the game time to 30 seconds
    And I start the game
    Then I should see the game timer set to 30 seconds

  Scenario: Complete game until victory
    When I set the target number to 24
    And I select the following tiles: 3, 4, 8, 6, 7, 2
    And I set the game time to 60 seconds
    And I start the game
    And I perform the operation 3 × 8
    And I perform the operation 24 + 0
    Then I should see the result 24
    And I should see the "GAGNÉ" message

  Scenario: Complete game until defeat by timeout
    When I set the target number to 100
    And I select the following tiles: 5, 10, 25, 3, 7, 9
    And I set the game time to 1 seconds
    And I start the game
    Then I should see the game timer expire
    And I should see the solutions display
    And I should see "(3 + 7) x 10 = 100" as a solution