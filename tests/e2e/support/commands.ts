// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Declare the Cypress namespace to add custom commands
declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select the manual game mode
     * @example cy.selectManualMode()
     */
    selectManualMode(): Chainable<Element>;

    /**
     * Custom command to set up a manual game with specific tiles and target
     * @param targetNumber - The target number to set
     * @param tiles - Array of tile values to select (must be 6 tiles)
     * @example cy.setupManualGame(100, [1, 2, 3, 4, 5, 6])
     */
    setupManualGame(targetNumber: number, tiles: number[]): Chainable<Element>;

    /**
     * Custom command to set up a manual game with specific tiles, target, and game time
     * @param targetNumber - The target number to set
     * @param tiles - Array of tile values to select (must be 6 tiles)
     * @param gameTime - The game time in seconds
     * @example cy.setupManualGameWithTime(100, [1, 2, 3, 4, 5, 6], 30)
     */
    setupManualGameWithTime(targetNumber: number, tiles: number[], gameTime: number): Chainable<Element>;

    /**
     * Custom command to perform an operation in the game
     * @param firstTile - The value of the first tile
     * @param operator - The operator to use (+, -, ×, ÷)
     * @param secondTile - The value of the second tile
     * @example cy.performOperation(5, '+', 3)
     */
    performOperation(firstTile: number, operator: string, secondTile: number): Chainable<Element>;
  }
}

// Select the manual game mode
Cypress.Commands.add('selectManualMode', () => {
  // Click on the Manual mode option
  cy.contains('.mode-option', 'Mode Manuel').click();
});

// Set up a manual game with specific tiles and target
Cypress.Commands.add('setupManualGame', (targetNumber: number, tiles: number[]) => {
  // Verify we have exactly 6 tiles
  if (tiles.length !== 6) {
    throw new Error('You must provide exactly 6 tiles');
  }

  // Set the target number
  cy.get('.target-input input').clear().type(targetNumber.toString());

  // Select each tile
  tiles.forEach(tile => {
    // Find and click on the tile
    cy.get('.tile-option').contains(tile.toString()).click();
  });

  // Start the game
  cy.get('.start-game-btn').click();
});

// Perform an operation in the game
Cypress.Commands.add('performOperation', (firstTile: number, operator: string, secondTile: number) => {
  // Click on the first tile
  cy.get('.tile').contains(firstTile.toString()).click();

  // Click on the operator
  cy.get('.operator-button').contains(operator).click();

  // Click on the second tile
  cy.get('.tile').contains(secondTile.toString()).click();
});

// Set up a manual game with specific tiles, target, and game time
Cypress.Commands.add('setupManualGameWithTime', (targetNumber: number, tiles: number[], gameTime: number) => {
  // Verify we have exactly 6 tiles
  if (tiles.length !== 6) {
    throw new Error('You must provide exactly 6 tiles');
  }

  // Set the target number
  cy.get('.target-input input').clear().type(targetNumber.toString());

  // Select each tile
  tiles.forEach(tile => {
    // Find and click on the tile
    cy.get('.tile-option').contains(tile.toString()).click();
  });

  // Set the game time
  cy.get('.time-input input[type="range"]').invoke('val', gameTime).trigger('input');

  // Start the game
  cy.get('.start-game-btn').click();
});