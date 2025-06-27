/**
 * NOTE: Ce fichier a été converti pour utiliser la syntaxe Gherkin avec Cucumber.
 * Les nouveaux tests se trouvent dans:
 * - tests/cucumber/features/solutionFinder.feature (définition des scénarios)
 * - tests/cucumber/step_definitions/solutionFinder.steps.ts (implémentation des étapes)
 * 
 * Ce fichier est conservé temporairement pour référence, mais il est recommandé
 * d'utiliser les tests Cucumber à la place.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { findSolutions, getTopSolutions, generateConciseExpression, Solution } from '../../src/utils/solutionFinder';
import { Tile } from '../../src/types/game';
import { performOperation } from '../../src/utils/gameLogic';

// Mock de performOperation pour éviter les effets secondaires
vi.mock('../../src/utils/gameLogic', () => ({
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

describe('solutionFinder', () => {
  describe('findSolutions', () => {
    // Test pour trouver des solutions simples
    it('devrait trouver des solutions simples avec deux tuiles', () => {
      const tiles: Tile[] = [
        { id: 1, value: 5, isSelected: false },
        { id: 2, value: 2, isSelected: false }
      ];
      const targetNumber = 10;
      const solutions = findSolutions(tiles, targetNumber);

      expect(solutions).toBeInstanceOf(Array);
      expect(solutions.length).toBeGreaterThan(0);

      // Vérifier que chaque solution a la structure attendue
      const firstSolution = solutions[0];
      expect(firstSolution).toHaveProperty('operations');
      expect(firstSolution).toHaveProperty('result');
      expect(firstSolution).toHaveProperty('distance');
      expect(firstSolution).toHaveProperty('expression');
      expect(firstSolution).toHaveProperty('tilesIds');
    });

    // Test pour le cas où une solution exacte existe
    it('devrait trouver la solution exacte quand elle existe', () => {
      const tiles: Tile[] = [
        { id: 1, value: 5, isSelected: false },
        { id: 2, value: 5, isSelected: false }
      ];
      const targetNumber = 25;
      const solutions = findSolutions(tiles, targetNumber);

      expect(solutions.some(s => s.result === targetNumber)).toBe(true);
      expect(solutions[0].distance).toBe(0);
    });

    // Test pour le cas où aucune solution exacte n'est possible
    it('devrait retourner la meilleure solution approximative', () => {
      const tiles: Tile[] = [
        { id: 1, value: 1, isSelected: false },
        { id: 2, value: 2, isSelected: false }
      ];
      const targetNumber = 100;
      const solutions = findSolutions(tiles, targetNumber);

      expect(solutions).toBeInstanceOf(Array);
      expect(solutions.length).toBeGreaterThan(0);
      expect(solutions[0].distance).toBeGreaterThan(0);
      expect(solutions[0].distance).toBeLessThan(100); // La meilleure solution devrait être plus proche que 100
    });

    // Test pour les solutions avec plus de tuiles
    it('devrait trouver des solutions avec plusieurs tuiles', () => {
      const tiles: Tile[] = [
        { id: 1, value: 5, isSelected: false },
        { id: 2, value: 5, isSelected: false },
        { id: 3, value: 2, isSelected: false },
        { id: 4, value: 3, isSelected: false }
      ];
      const targetNumber = 40;
      const solutions = findSolutions(tiles, targetNumber);

      // Devrait avoir au moins une solution qui utilise 3 tuiles ou plus
      const multiTileSolution = solutions.some(s => (s.tilesIds?.length || 0) >= 3);
      expect(multiTileSolution).toBe(true);
    });
  });

  describe('getTopSolutions', () => {
    let solutions: Solution[];

    beforeEach(() => {
      // Préparer un jeu de solutions pour les tests
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

    // Test pour limiter le nombre de solutions
    it('devrait retourner le nombre demandé de solutions', () => {
      const topSolutions = getTopSolutions(solutions, 1);
      expect(topSolutions.length).toBe(1);
      expect(topSolutions[0].result).toBe(10);
    });

    // Test pour le cas d'entrée vide
    it('devrait retourner un tableau vide si aucune solution n\'est fournie', () => {
      const emptySolutions: Solution[] = [];
      const topSolutions = getTopSolutions(emptySolutions);
      expect(topSolutions).toEqual([]);
    });

    // Test pour le tri des solutions
    it('devrait trier les solutions par distance puis par nombre de tuiles', () => {
      const topSolutions = getTopSolutions(solutions);
      expect(topSolutions[0].distance).toBe(0);
      expect(topSolutions[0].result).toBe(10);

      // Ajouter une solution avec la même distance mais moins de tuiles
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

      const topExtendedSolutions = getTopSolutions(extendedSolutions);
      expect(topExtendedSolutions[0].distance).toBe(0);
      expect(topExtendedSolutions[0].tilesUsed).toBe(1);
    });

    // Test pour la déduplication des solutions
    it('devrait filtrer les solutions en double', () => {
      const duplicatedSolutions = [
        ...solutions,
        {
          operations: ['Départ avec 5', '5 × 2 = 10'],
          result: 10,
          distance: 0,
          tilesUsed: 2,
          tilesIds: [1, 2],
          expression: '5 × 2 = 10'
        }
      ];

      const topSolutions = getTopSolutions(duplicatedSolutions);
      // Devrait filtrer les doublons et ne garder qu'une seule instance de la solution
      const count = topSolutions.filter(s => s.result === 10 && s.expression === '5 × 2 = 10').length;
      expect(count).toBe(1);
    });
  });

  describe('generateConciseExpression', () => {
    // Test pour une expression simple
    it('devrait générer une expression simple correctement', () => {
      const operations = ['Départ avec 5', '5 + 3 = 8'];
      const expression = generateConciseExpression(operations);
      expect(expression).toBe('5 + 3 = 8');
    });

    // Test pour une expression vide
    it('devrait retourner une chaîne vide pour un tableau d\'opérations vide', () => {
      const expression = generateConciseExpression([]);
      expect(expression).toBe('');
    });

    // Test pour des entrées invalides
    it('devrait retourner une chaîne vide pour des opérations invalides', () => {
      const expression = generateConciseExpression(['texte non valide']);
      expect(expression).toBe('');
    });


    // Test pour une expression avec plusieurs opérations
    it('devrait générer une expression complexe avec priorités d\'opérations', () => {
      const operations = [
        '5 + 3 = 8',
        '8 × 2 = 16'
      ];
      const expression = generateConciseExpression(operations);
      // Devrait respecter la priorité des opérations
      expect(expression).toBe('(5 + 3) × 2 = 16');
    });

    // Cas réels pour le jeu des chiffres et des lettres

    // Test avec une solution typique pour atteindre un nombre cible
    it('devrait gérer correctement une solution typique de jeu', () => {
      const operations = [
        '25 × 4 = 100',
        '100 + 7 = 107'
      ];
      const expression = generateConciseExpression(operations);
      expect(expression).toBe('25 × 4 + 7 = 107');
    });

    // Test avec une série d'opérations de même type
    it('devrait simplifier une série d\'opérations de même type', () => {
      const operations = [
        '10 + 5 = 15',
        '15 + 7 = 22',
        '22 + 3 = 25'
      ];
      const expression = generateConciseExpression(operations);
      expect(expression).toBe('10 + 5 + 7 + 3 = 25');
    });

    // Test avec un mélange d'opérations nécessitant des parenthèses
    it('devrait ajouter des parenthèses aux bonnes positions dans une expression complexe', () => {
      const operations = [
        '6 + 4 = 10',
        '10 × 7 = 70',
        '70 - 5 = 65'
      ];
      const expression = generateConciseExpression(operations);
      expect(expression).toBe('(6 + 4) × 7 - 5 = 65');
    });

    // Test avec des divisions et multiplications consécutives
    it('devrait gérer correctement des divisions et multiplications consécutives', () => {
      const operations = [
        '100 ÷ 25 = 4',
        '4 × 6 = 24',
        '24 ÷ 3 = 8'
      ];
      const expression = generateConciseExpression(operations);
      expect(expression).toBe('100 ÷ 25 × 6 ÷ 3 = 8');
    });

    // Test avec une opération complexe typique du jeu
    it('devrait gérer un cas complexe avec de multiples priorités d\'opérations', () => {
      const operations = [
        '25 + 75 = 100',
        '100 × 8 = 800',
        '800 ÷ 4 = 200',
        '200 - 7 = 193'
      ];
      const expression = generateConciseExpression(operations);
      expect(expression).toBe('(25 + 75) × 8 ÷ 4 - 7 = 193');
    });

    // Test avec un cas réel où des parenthèses imbriquées seraient nécessaires
    it('devrait gérer correctement des cas nécessitant des parenthèses imbriquées', () => {
      const operations = [
        '4 + 6 = 10',
        '10 × 5 = 50',
        '50 + 2 = 52',
        '52 × 3 = 156'
      ];
      const expression = generateConciseExpression(operations);
      expect(expression).toBe('((4 + 6) × 5 + 2) × 3 = 156');
    });

    // Test avec des grands nombres comme dans une partie réelle
    it('devrait fonctionner avec des grands nombres comme dans une partie réelle', () => {
      const operations = [
        '50 × 10 = 500',
        '500 + 75 = 575',
        '575 - 25 = 550'
      ];
      const expression = generateConciseExpression(operations);
      expect(expression).toBe('50 × 10 + 75 - 25 = 550');
    });
    // Test avec des grands nombres comme dans une partie réelle
    it('devrait fonctionner avec des grands nombres comme dans une partie réelle', () => {
      const operations = [
        '25 + 25 = 50',
        '7 + 3 = 10',
        '50 × 10 = 500',
        '500 + 75 = 575',
        '575 - 25 = 550'
      ];
      const expression = generateConciseExpression(operations);
      expect(expression).toBe('(25 + 25) × (7 + 3) + 75 - 25 = 550');
    });

    // Test pour vérifier que les expressions générées sont valides mathématiquement
    it('devrait générer des expressions qui respectent l\'ordre correct des opérations', () => {
      // Une expression où l'ordre des opérations est crucial
      const operations = [
        '3 + 2 = 5',
        '5 × 4 = 20',
        '20 - 6 = 14',
        '14 ÷ 2 = 7'
      ];
      const expression = generateConciseExpression(operations);

      // Extraire la partie expression (sans le '= 7' final)
      const expressionPart = expression.split(' = ')[0];

      // Remplacer les symboles mathématiques par leurs équivalents JavaScript
      const jsExpression = expressionPart
        .replace(/×/g, '*')
        .replace(/÷/g, '/');

      // Évaluer l'expression et vérifier qu'elle donne le bon résultat
      // eslint-disable-next-line no-eval
      const result = eval(jsExpression);
      expect(result).toBe(7);
    });
  });

  describe('tests d\'usage réel du jeu', () => {
    // Test qui simule une partie réelle avec 6 tuiles et un nombre cible entre 100 et 999
    it('devrait trouver des solutions pour une partie réelle avec 6 tuiles', () => {
      // Génération de 6 tuiles comme dans un vrai jeu
      const tiles: Tile[] = [
        { id: 0, value: 3, isSelected: false },
        { id: 1, value: 7, isSelected: false },
        { id: 2, value: 10, isSelected: false },
        { id: 3, value: 25, isSelected: false },
        { id: 4, value: 50, isSelected: false },
        { id: 5, value: 75, isSelected: false }
      ];

      const targetNumber = 457; // Nombre cible dans la plage 100-999

      // Trouver toutes les solutions
      const solutions = findSolutions(tiles, targetNumber);

      // Vérifier qu'il y a des solutions
      expect(solutions).toBeInstanceOf(Array);
      expect(solutions.length).toBeGreaterThan(0);

      // Vérifier que les solutions sont triées par distance
      for (let i = 1; i < solutions.length; i++) {
        expect(solutions[i].distance).toBeGreaterThanOrEqual(solutions[i-1].distance);
      }

      // Tester getTopSolutions avec ces solutions
      const topSolutions = getTopSolutions(solutions, 5);
      expect(topSolutions.length).toBeLessThanOrEqual(5);
    });

    // Test pour vérifier que l'algorithme peut trouver des solutions exactes
    it('devrait trouver une solution exacte quand elle existe pour une partie réelle', () => {
      // Configuration spécifique où une solution exacte est connue
      const tiles: Tile[] = [
        { id: 0, value: 4, isSelected: false },
        { id: 1, value: 5, isSelected: false },
        { id: 2, value: 6, isSelected: false },
        { id: 3, value: 7, isSelected: false },
        { id: 4, value: 25, isSelected: false },
        { id: 5, value: 50, isSelected: false }
      ];

      // Le nombre cible est intentionnellement choisi pour avoir une solution exacte
      // (4 + 6) × (7 × 5) = 350
      const targetNumber = 350;

      const solutions = findSolutions(tiles, targetNumber);

      // Vérifier qu'il y a au moins une solution exacte
      expect(solutions.some(s => s.distance === 0)).toBe(true);

      // La première solution devrait être exacte
      expect(solutions[0].distance).toBe(0);
      expect(solutions[0].result).toBe(targetNumber);
    });

    // Test de performance pour vérifier que l'algorithme termine dans un temps raisonnable
    it('devrait compléter le calcul des solutions dans un temps raisonnable', () => {
      // Cas plus complexe avec des tuiles de valeurs variées
      const tiles: Tile[] = [
        { id: 0, value: 3, isSelected: false },
        { id: 1, value: 6, isSelected: false },
        { id: 2, value: 9, isSelected: false },
        { id: 3, value: 25, isSelected: false },
        { id: 4, value: 50, isSelected: false },
        { id: 5, value: 100, isSelected: false }
      ];

      const targetNumber = 783; // Nombre cible difficile

      // Mesurer le temps d'exécution
      const startTime = performance.now();
      const solutions = findSolutions(tiles, targetNumber);
      const endTime = performance.now();

      // Le temps d'exécution ne devrait pas dépasser 5 secondes pour être viable en production
      // Note: cette valeur peut être ajustée selon les performances de la machine
      const executionTime = endTime - startTime;
      console.log(`Temps d'exécution pour trouver les solutions: ${executionTime}ms`);
      expect(executionTime).toBeLessThan(5000);

      // Vérifier que des solutions ont été trouvées
      expect(solutions.length).toBeGreaterThan(0);

      // Vérifier la meilleure solution trouvée
      const bestSolution = solutions[0];
      console.log(`Meilleure solution trouvée: ${bestSolution.expression} (distance: ${bestSolution.distance})`);
    });

    // Test pour vérifier le comportement avec des grands nombres
    it('devrait gérer correctement les grands nombres dans les calculs', () => {
      const tiles: Tile[] = [
        { id: 0, value: 10, isSelected: false },
        { id: 1, value: 25, isSelected: false },
        { id: 2, value: 50, isSelected: false },
        { id: 3, value: 75, isSelected: false },
        { id: 4, value: 100, isSelected: false },
        { id: 5, value: 100, isSelected: false }
      ];

      const targetNumber = 999; // Le plus grand nombre cible possible

      const solutions = findSolutions(tiles, targetNumber);

      // Vérifier que les solutions avec de grands nombres sont correctes
      for (const solution of solutions) {
        // Toutes les solutions devraient avoir un résultat et une distance cohérente
        expect(solution.distance).toBe(Math.abs(solution.result - targetNumber));
      }

      // Vérifier également les solutions avec des multiplications/divisions produisant de grands nombres
      const largeValueSolutions = solutions.filter(s => s.result > 500);
      expect(largeValueSolutions.length).toBeGreaterThan(0);
    });

    // Test pour vérifier que seuls les résultats entiers sont autorisés
    it('ne devrait pas permettre des résultats non entiers dans les opérations', () => {
      const tiles: Tile[] = [
        { id: 0, value: 10, isSelected: false },
        { id: 1, value: 3, isSelected: false }
      ];

      const targetNumber = 3; // Un nombre qui pourrait être atteint par 10 ÷ 3 = 3.333...

      const solutions = findSolutions(tiles, targetNumber);

      // Vérifier qu'aucune solution n'utilise la division 10 ÷ 3
      for (const solution of solutions) {
        // Vérifier que chaque opération dans la solution a un résultat entier
        solution.operations.forEach(op => {
          const match = op.match(/= (\d+\.?\d*)/);
          if (match) {
            const result = parseFloat(match[1]);
            expect(Number.isInteger(result)).toBe(true);
          }
        });
      }

      // Vérifier spécifiquement qu'il n'y a pas d'opération "10 ÷ 3"
      const hasDivisionBy3 = solutions.some(s => 
        s.operations.some(op => op.includes('10 ÷ 3'))
      );
      expect(hasDivisionBy3).toBe(false);
    });
  });
});