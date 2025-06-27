import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'vitest';
import { findSolutions, getTopSolutions, generateConciseExpression, Solution } from '../../utils/solutionFinder';
import { Tile } from '../../types/game';
import { performOperation } from '../../utils/gameLogic';

// Mock performOperation to avoid side effects
import { vi } from 'vitest';

vi.mock('../../utils/gameLogic', () => ({
  performOperation: vi.fn((a, op, b) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : NaN;
      default: return NaN;
    }
  })
}));

// Variables to store state between steps
let tiles: Tile[] = [];
let targetNumber: number = 0;
let solutions: Solution[] = [];
let expression: string = '';
let startTime: number = 0;
let endTime: number = 0;

// Background
Given('I have a solution finder module', () => {
  // This step is just for readability, no actual implementation needed
});

// Tile setup steps
When('I have tiles with values {int} and {int}', (value1: number, value2: number) => {
  tiles = [
    { id: 1, value: value1, isSelected: false },
    { id: 2, value: value2, isSelected: false }
  ];
});

When('I have tiles with values {int}, {int}, {int}, and {int}', 
  (value1: number, value2: number, value3: number, value4: number) => {
    tiles = [
      { id: 1, value: value1, isSelected: false },
      { id: 2, value: value2, isSelected: false },
      { id: 3, value: value3, isSelected: false },
      { id: 4, value: value4, isSelected: false }
    ];
});

When('I have tiles with values {int}, {int}, {int}, {int}, {int}, and {int}',
  (value1: number, value2: number, value3: number, value4: number, value5: number, value6: number) => {
    tiles = [
      { id: 0, value: value1, isSelected: false },
      { id: 1, value: value2, isSelected: false },
      { id: 2, value: value3, isSelected: false },
      { id: 3, value: value4, isSelected: false },
      { id: 4, value: value5, isSelected: false },
      { id: 5, value: value6, isSelected: false }
    ];
});

When('I set the target number to {int}', (number: number) => {
  targetNumber = number;
});

// Solution finding steps
Then('I should get a list of solutions', () => {
  startTime = performance.now();
  solutions = findSolutions(tiles, targetNumber);
  endTime = performance.now();
  expect(solutions).toBeInstanceOf(Array);
});

Then('the solutions should have the expected structure', () => {
  const firstSolution = solutions[0];
  expect(firstSolution).toHaveProperty('operations');
  expect(firstSolution).toHaveProperty('result');
  expect(firstSolution).toHaveProperty('distance');
  expect(firstSolution).toHaveProperty('expression');
  expect(firstSolution).toHaveProperty('tilesIds');
});

Then('at least one solution should exist', () => {
  expect(solutions.length).toBeGreaterThan(0);
});

Then('at least one solution should have the exact target number', () => {
  expect(solutions.some(s => s.result === targetNumber)).toBe(true);
});

Then('the first solution should have a distance of {int}', (distance: number) => {
  expect(solutions[0].distance).toBe(distance);
});

Then('the first solution should have a distance greater than {int}', (distance: number) => {
  expect(solutions[0].distance).toBeGreaterThan(distance);
});

Then('the first solution should have a distance less than {int}', (distance: number) => {
  expect(solutions[0].distance).toBeLessThan(distance);
});

Then('at least one solution should use {int} or more tiles', (tileCount: number) => {
  const multiTileSolution = solutions.some(s => (s.tilesIds?.length || 0) >= tileCount);
  expect(multiTileSolution).toBe(true);
});

// getTopSolutions steps
Given('I have a list of solutions', () => {
  solutions = [
    {
      operations: ['5 × 2 = 10'],
      result: 10,
      distance: 0,
      tilesUsed: 2,
      tilesIds: [1, 2],
      expression: '5 × 2 = 10'
    },
    {
      operations: ['5 + 2 = 7'],
      result: 7,
      distance: 3,
      tilesUsed: 2,
      tilesIds: [1, 2],
      expression: '5 + 2 = 7'
    },
    {
      operations: ['10 - 3 = 7'],
      result: 7,
      distance: 3,
      tilesUsed: 2,
      tilesIds: [3, 4],
      expression: '10 - 3 = 7'
    }
  ];
});

Given('I have an empty list of solutions', () => {
  solutions = [];
});

Given('I have a list of solutions with duplicates', () => {
  solutions = [
    {
      operations: ['5 × 2 = 10'],
      result: 10,
      distance: 0,
      tilesUsed: 2,
      tilesIds: [1, 2],
      expression: '5 × 2 = 10'
    },
    {
      operations: ['5 + 2 = 7'],
      result: 7,
      distance: 3,
      tilesUsed: 2,
      tilesIds: [1, 2],
      expression: '5 + 2 = 7'
    },
    {
      operations: ['Départ avec 5', '5 × 2 = 10'],
      result: 10,
      distance: 0,
      tilesUsed: 2,
      tilesIds: [1, 2],
      expression: '5 × 2 = 10'
    }
  ];
});

When('I request the top {int} solution', (limit: number) => {
  solutions = getTopSolutions(solutions, limit);
});

When('I request the top solutions', () => {
  solutions = getTopSolutions(solutions);
});

When('I add a solution with the same distance but fewer tiles', () => {
  const extendedSolutions = [
    ...solutions,
    {
      operations: [],
      result: 10,
      distance: 0,
      tilesUsed: 1,
      tilesIds: [5],
      expression: '10'
    }
  ];
  solutions = getTopSolutions(extendedSolutions);
});

Then('I should get exactly {int} solution', (count: number) => {
  expect(solutions.length).toBe(count);
});

Then('the solution should have a result of {int}', (result: number) => {
  expect(solutions[0].result).toBe(result);
});

Then('I should get an empty list of solutions', () => {
  expect(solutions).toEqual([]);
});

Then('the first solution should have a result of {int}', (result: number) => {
  expect(solutions[0].result).toBe(result);
});

Then('the first solution should have {int} tile used', (tileCount: number) => {
  expect(solutions[0].tilesUsed).toBe(tileCount);
});

Then('I should get a list without duplicates', () => {
  // Check that there are no duplicate solutions
  const uniqueSignatures = new Set(solutions.map(s => s.signatureKey));
  expect(uniqueSignatures.size).toBe(solutions.length);
});

Then('there should be only one solution with result {int} and expression {string}', (result: number, expr: string) => {
  const count = solutions.filter(s => s.result === result && s.expression === expr).length;
  expect(count).toBe(1);
});

// generateConciseExpression steps
When('I generate a concise expression from {string}', (operationsStr: string) => {
  try {
    const operations = JSON.parse(operationsStr);
    expression = generateConciseExpression(operations);
  } catch (e) {
    // Handle the case where the string is not valid JSON
    expression = '';
  }
});

When('I generate a concise expression from an empty list', () => {
  expression = generateConciseExpression([]);
});

Then('the expression should be {string}', (expectedExpression: string) => {
  expect(expression).toBe(expectedExpression);
});

Then('the expression should be an empty string', () => {
  expect(expression).toBe('');
});

Then('the expression should evaluate to {int}', (expectedResult: number) => {
  // Extract the expression part (without the '= X' final)
  const expressionPart = expression.split(' = ')[0];

  // Replace the mathematical symbols with JavaScript equivalents
  const jsExpression = expressionPart
    .replace(/×/g, '*')
    .replace(/÷/g, '/');

  // Evaluate the expression and check the result
  // eslint-disable-next-line no-eval
  const result = eval(jsExpression);
  expect(result).toBe(expectedResult);
});

// Real game usage steps
Then('the solutions should be sorted by distance', () => {
  for (let i = 1; i < solutions.length; i++) {
    expect(solutions[i].distance).toBeGreaterThanOrEqual(solutions[i-1].distance);
  }
});

Then('the top {int} solutions should be limited to {int} or fewer', (requestedCount: number, maxCount: number) => {
  const topSolutions = getTopSolutions(solutions, requestedCount);
  expect(topSolutions.length).toBeLessThanOrEqual(maxCount);
});

Then('the first solution should have a result of {int}', (result: number) => {
  expect(solutions[0].result).toBe(result);
});

Then('the calculation should complete in less than {int} seconds', (seconds: number) => {
  const executionTime = endTime - startTime;
  expect(executionTime).toBeLessThan(seconds * 1000);
});

Then('all solutions should have a consistent distance', () => {
  for (const solution of solutions) {
    expect(solution.distance).toBe(Math.abs(solution.result - targetNumber));
  }
});

Then('at least one solution should have a result greater than {int}', (value: number) => {
  const largeValueSolutions = solutions.filter(s => s.result > value);
  expect(largeValueSolutions.length).toBeGreaterThan(0);
});

Then('all solutions should have integer results', () => {
  for (const solution of solutions) {
    solution.operations.forEach(op => {
      const match = op.match(/= (\d+\.?\d*)/);
      if (match) {
        const result = parseFloat(match[1]);
        expect(Number.isInteger(result)).toBe(true);
      }
    });
  }
});

Then('no solution should include the operation {string}', (operation: string) => {
  const hasForbiddenOperation = solutions.some(s => 
    s.operations.some(op => op.includes(operation))
  );
  expect(hasForbiddenOperation).toBe(false);
});
