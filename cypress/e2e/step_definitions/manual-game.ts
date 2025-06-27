import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Background steps
Given('I am on the game page', () => {
  cy.visit('/');
});

When('I select the manual game mode', () => {
  cy.selectManualMode();
});

// Scenario: Setting up a manual game
When('I set the target number to {int}', (targetNumber: number) => {
  cy.get('.target-input input').clear().type(targetNumber.toString());
});

When('I select the following tiles: {int}, {int}, {int}, {int}, {int}, {int}', 
  (tile1: number, tile2: number, tile3: number, tile4: number, tile5: number, tile6: number) => {
    const tiles = [tile1, tile2, tile3, tile4, tile5, tile6];
    tiles.forEach(tile => {
      cy.get('.tile-option').contains(tile.toString()).click();
    });
});

When('I start the game', () => {
  cy.get('.start-game-btn').click();
});

Then('I should see the game board with my selected tiles', () => {
  cy.get('.tiles-grid').should('be.visible');
  cy.get('.tile').should('have.length.at.least', 6);
});

Then('I should see the target number {int}', (targetNumber: number) => {
  cy.get('.target-number').should('contain', targetNumber);
});

// Scenario: Playing a manual game with exact solution
When('I perform the operation {int} {word} {int}', (firstTile: number, operator: string, secondTile: number) => {
  // Click on the first tile
  cy.get('.tile').contains(firstTile.toString()).click();

  // Click on the operator
  cy.get('.operator-button').contains(operator).click();

  // Click on the second tile
  cy.get('.tile').contains(secondTile.toString()).click();
});

Then('I should see the result {int}', (result: number) => {
  // The result should appear as a new tile
  cy.get('.tile').contains(result.toString()).should('be.visible');
});

Then('I should see the {string} message', (message: string) => {
  cy.get('.victory-text').should('contain', message);
});

Then('I should not see the {string} message', (message: string) => {
  cy.get('.victory-text').should('not.exist');
});

// Scenario: Selecting tiles with values 1-10 twice
When('I select the tile with value {int} twice', (tileValue: number) => {
  // Click the tile twice
  cy.get('.tile-option').contains(tileValue.toString()).click();
  cy.get('.tile-option').contains(tileValue.toString()).click();
});

Then('I should see two tiles with value {int}', (tileValue: number) => {
  // Count the tiles with the given value
  cy.get('.tile').contains(tileValue.toString()).should('have.length', 2);
});

// Scenario: Using result tiles in operations
Then('I should see the operations history', () => {
  cy.get('.operations-history').should('be.visible');
  cy.get('.operations-history').find('li').should('have.length.at.least', 1);
});

// Scenario: Setting custom game time
When('I set the game time to {int} seconds', (gameTime: number) => {
  // Use the range input to set the game time
  cy.get('.time-input input[type="range"]').invoke('val', gameTime).trigger('input');
});

Then('I should see the game timer set to {int} seconds', (gameTime: number) => {
  // Check that the timer displays the correct time
  cy.get('.timer').should('contain', gameTime);
});

// Scenario: Complete game until defeat by timeout
Then('I should see the game timer expire', () => {
  // Wait for the timer to expire (should be 1 second in the test)
  cy.get('.timer', { timeout: 5000 }).should('contain', '0');
});

Then('I should see the solutions display', () => {
  // Check that the solutions display is visible after the game ends
  cy.get('.solutions-display', { timeout: 10000 }).should('be.visible');
});

Then('I should see {string} as a solution', (solutionText: string) => {
  // Check that the specific solution text is displayed in one of the concise-expression elements
  cy.get('.concise-expression', { timeout: 10000 }).should('contain', solutionText);
});
