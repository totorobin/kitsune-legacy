/**
 * NOTE: Ce fichier a été converti pour utiliser la syntaxe Gherkin avec Cucumber.
 * Les nouveaux tests se trouvent dans:
 * - tests/cucumber/features/solutionFinder.feature (définition des scénarios)
 * - tests/cucumber/step_definitions/solutionFinder.steps.ts (implémentation des étapes)
 * 
 * Ce fichier est conservé temporairement pour référence, mais il est recommandé
 * d'utiliser les tests Cucumber à la place.
 */

import { describe, expect, it } from 'vitest';
import { findSolution } from '../../src/utils/solutionFinder3';

describe('solutionFinder', () => {
  describe('findSolutions', () => {
    // Test pour trouver des solutions simples
    it('devrait trouver des solutions simples avec deux tuiles', () => {

      const solutions = findSolution([5, 2], 10);

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

      const targetNumber = 25;
      const solutions = findSolution([5, 5], targetNumber);

      expect(solutions.some(s => s.result === targetNumber)).toBe(true);
      expect(solutions[0].distance).toBe(0);
    });

    // Test pour le cas avec soustraction
    it('devrait trouver la solution exacte quand elle existe', () => {

      const targetNumber = 25;
      const solutions = findSolution([75, 50], targetNumber);

      expect(solutions.some(s => s.result === targetNumber)).toBe(true);
      expect(solutions[0].distance).toBe(0);
    });

    // Test pour le cas où aucune solution exacte n'est possible
    it('devrait retourner la meilleure solution approximative', () => {

      const targetNumber = 100;
      const solutions = findSolution([1, 2], targetNumber);

      expect(solutions).toBeInstanceOf(Array);
      expect(solutions.length).toBeGreaterThan(0);
      expect(solutions[0].distance).toBeGreaterThan(0);
      expect(solutions[0].distance).toBeLessThan(100); // La meilleure solution devrait être plus proche que 100
    });

    // Test pour les solutions avec plus de tuiles
    it('devrait trouver des solutions avec plusieurs tuiles', () => {

      const targetNumber = 40;
      const solutions = findSolution([5,5,2,3], targetNumber);

      // Devrait avoir au moins une solution qui utilise 3 tuiles ou plus
      const multiTileSolution = solutions.some(s => (s.nbTiles || 0) >= 3);
      expect(multiTileSolution).toBe(true);
    });

    // Test qui simule une partie réelle avec 6 tuiles et un nombre cible entre 100 et 999
    it('devrait trouver des solutions pour une partie réelle avec 6 tuiles', () => {

      const targetNumber = 457; // Nombre cible dans la plage 100-999

      // Trouver toutes les solutions
      const solutions = findSolution([3,4,10,25,50,75], targetNumber);

      // Vérifier qu'il y a des solutions
      expect(solutions).toBeInstanceOf(Array);
      expect(solutions.length).toBeGreaterThan(0);

      // Vérifier que les solutions sont triées par distance
      for (let i = 1; i < solutions.length; i++) {
        expect(solutions[i].distance).toBeGreaterThanOrEqual(solutions[i-1].distance);
      }

    });

    // Test pour vérifier que l'algorithme peut trouver des solutions exactes
    it('devrait trouver une solution exacte quand elle existe pour une partie réelle', () => {
      // Configuration spécifique où une solution exacte est connue

      // Le nombre cible est intentionnellement choisi pour avoir une solution exacte
      // (4 + 6) × (7 × 5) = 350
      const targetNumber = 350;

      const solutions = findSolution([4,5,6,7,25,50], targetNumber);

      // Vérifier qu'il y a au moins une solution exacte
      expect(solutions.some(s => s.distance === 0)).toBe(true);

      // La première solution devrait être exacte
      expect(solutions[0].distance).toBe(0);
      expect(solutions[0].result).toBe(targetNumber);
    });

    // Test de performance pour vérifier que l'algorithme termine dans un temps raisonnable
    it('devrait compléter le calcul des solutions dans un temps raisonnable', () => {
      // Cas plus complexe avec des tuiles de valeurs variées

      const targetNumber = 783; // Nombre cible difficile

      // Mesurer le temps d'exécution
      const startTime = performance.now();
      const solutions = findSolution([3,6,9,25,50,100], targetNumber);
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
      console.log(`Meilleure solution trouvée: ${bestSolution.oneLineOperation} (distance: ${bestSolution.distance})`);
    });

    // Test pour vérifier le comportement avec des grands nombres
    it('devrait gérer correctement les grands nombres dans les calculs', () => {

      const targetNumber = 999; // Le plus grand nombre cible possible

      const solutions = findSolution([10,25,50,75,100,100], targetNumber);

      // Vérifier que les solutions avec de grands nombres sont correctes
      for (const solution of solutions) {
        // Toutes les solutions devraient avoir un résultat et une distance cohérente
        expect(solution.distance).toBe(Math.abs(solution.result - targetNumber));
      }

      // Vérifier également les solutions avec des multiplications/divisions produisant de grands nombres
      const largeValueSolutions = solutions.filter(s => s.result > 500);
      expect(largeValueSolutions.length).toBeGreaterThan(0);
    });
  });
});