Feature: Solution Finder
  As a game developer
  I want to find all possible solutions for a set of tiles and a target number
  So that I can show the player the best solutions at the end of the game

  Background:
    Given I have a solution finder module

  Scenario: Finding solutions with two tiles
    When I have tiles with values 5 and 2
    And I set the target number to 10
    Then I should get a list of solutions
    And the solutions should have the expected structure
    And at least one solution should exist

  Scenario: Finding an exact solution
    When I have tiles with values 5 and 5
    And I set the target number to 25
    Then I should get a list of solutions
    And at least one solution should have the exact target number
    And the first solution should have a distance of 0

  Scenario: Finding the best approximate solution
    When I have tiles with values 1 and 2
    And I set the target number to 100
    Then I should get a list of solutions
    And the first solution should have a distance greater than 0
    And the first solution should have a distance less than 100

  Scenario: Finding solutions with multiple tiles
    When I have tiles with values 5, 5, 2, and 3
    And I set the target number to 40
    Then I should get a list of solutions
    And at least one solution should use 3 or more tiles

  Scenario: Getting top solutions
    Given I have a list of solutions
    When I request the top 1 solution
    Then I should get exactly 1 solution
    And the solution should have a result of 10

  Scenario: Getting top solutions from an empty list
    Given I have an empty list of solutions
    When I request the top solutions
    Then I should get an empty list of solutions

  Scenario: Sorting solutions by distance and tiles used
    Given I have a list of solutions
    When I request the top solutions
    Then the first solution should have a distance of 0
    And the first solution should have a result of 10
    When I add a solution with the same distance but fewer tiles
    Then the first solution should have a distance of 0
    And the first solution should have 1 tile used

  Scenario: Filtering duplicate solutions
    Given I have a list of solutions with duplicates
    When I request the top solutions
    Then I should get a list without duplicates
    And there should be only one solution with result 10 and expression "5 × 2 = 10"

  Scenario: Generating a simple expression
    When I generate a concise expression from ["Départ avec 5", "5 + 3 = 8"]
    Then the expression should be "5 + 3 = 8"

  Scenario: Generating an expression from an empty list
    When I generate a concise expression from an empty list
    Then the expression should be an empty string

  Scenario: Generating an expression from invalid operations
    When I generate a concise expression from ["texte non valide"]
    Then the expression should be an empty string

  Scenario: Generating a complex expression with operation priorities
    When I generate a concise expression from ["5 + 3 = 8", "8 × 2 = 16"]
    Then the expression should be "(5 + 3) × 2 = 16"

  Scenario: Generating a typical game solution expression
    When I generate a concise expression from ["25 × 4 = 100", "100 + 7 = 107"]
    Then the expression should be "25 × 4 + 7 = 107"

  Scenario: Simplifying a series of operations of the same type
    When I generate a concise expression from ["10 + 5 = 15", "15 + 7 = 22", "22 + 3 = 25"]
    Then the expression should be "10 + 5 + 7 + 3 = 25"

  Scenario: Adding parentheses in a complex expression
    When I generate a concise expression from ["6 + 4 = 10", "10 × 7 = 70", "70 - 5 = 65"]
    Then the expression should be "(6 + 4) × 7 - 5 = 65"

  Scenario: Handling consecutive divisions and multiplications
    When I generate a concise expression from ["100 ÷ 25 = 4", "4 × 6 = 24", "24 ÷ 3 = 8"]
    Then the expression should be "100 ÷ 25 × 6 ÷ 3 = 8"

  Scenario: Handling a complex case with multiple operation priorities
    When I generate a concise expression from ["25 + 75 = 100", "100 × 8 = 800", "800 ÷ 4 = 200", "200 - 7 = 193"]
    Then the expression should be "(25 + 75) × 8 ÷ 4 - 7 = 193"

  Scenario: Handling nested parentheses
    When I generate a concise expression from ["4 + 6 = 10", "10 × 5 = 50", "50 + 2 = 52", "52 × 3 = 156"]
    Then the expression should be "((4 + 6) × 5 + 2) × 3 = 156"

  Scenario: Working with large numbers
    When I generate a concise expression from ["50 × 10 = 500", "500 + 75 = 575", "575 - 25 = 550"]
    Then the expression should be "50 × 10 + 75 - 25 = 550"

  Scenario: Working with large numbers and multiple operations
    When I generate a concise expression from ["25 + 25 = 50", "7 + 3 = 10", "50 × 10 = 500", "500 + 75 = 575", "575 - 25 = 550"]
    Then the expression should be "(25 + 25) × (7 + 3) + 75 - 25 = 550"

  Scenario: Generating expressions with correct operation order
    When I generate a concise expression from ["3 + 2 = 5", "5 × 4 = 20", "20 - 6 = 14", "14 ÷ 2 = 7"]
    Then the expression should be "((3 + 2) × 4 - 6) ÷ 2 = 7"
    And the expression should evaluate to 7

  Scenario: Finding solutions for a real game with 6 tiles
    When I have tiles with values 3, 7, 10, 25, 50, and 75
    And I set the target number to 457
    Then I should get a list of solutions
    And the solutions should be sorted by distance
    And the top 5 solutions should be limited to 5 or fewer

  Scenario: Finding an exact solution for a real game
    When I have tiles with values 4, 5, 6, 7, 25, and 50
    And I set the target number to 350
    Then I should get a list of solutions
    And at least one solution should have the exact target number
    And the first solution should have a distance of 0
    And the first solution should have a result of 350

  Scenario: Completing calculation in a reasonable time
    When I have tiles with values 3, 6, 9, 25, 50, and 100
    And I set the target number to 783
    Then I should get a list of solutions
    And the calculation should complete in less than 5 seconds
    And at least one solution should exist

  Scenario: Handling large numbers in calculations
    When I have tiles with values 10, 25, 50, 75, 100, and 100
    And I set the target number to 999
    Then I should get a list of solutions
    And all solutions should have a consistent distance
    And at least one solution should have a result greater than 500

  Scenario: Only allowing integer results in operations
    When I have tiles with values 10 and 3
    And I set the target number to 3
    Then I should get a list of solutions
    And all solutions should have integer results
    And no solution should include the operation "10 ÷ 3"