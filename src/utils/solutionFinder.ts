import { Operator, Tile } from '../types/game';
import { performOperation } from './gameLogic';

// Interface pour représenter une solution
export interface Solution {
  operations: string[];
  result: number;
  distance: number; // Distance par rapport à la cible
}

// Fonction pour trouver toutes les solutions possibles
export function findSolutions(tiles: Tile[], targetNumber: number): Solution[] {
  // Stocker toutes les solutions trouvées
  const solutions: Solution[] = [];

  // Opérateurs disponibles
  const operators: Operator[] = ['+', '-', '×', '÷'];

  // Fonction récursive pour explorer toutes les combinaisons possibles
  function findCombinations(
    remainingTiles: Tile[],
    currentResult: number | null,
    operations: string[] = [],
    usedTiles: number[] = []
  ) {
    // Si nous avons utilisé toutes les tuiles ou au moins une et obtenu un résultat
    if (currentResult !== null && (remainingTiles.length === 0 || usedTiles.length > 0)) {
      // Ajouter cette solution
      const distance = Math.abs(currentResult - targetNumber);
      solutions.push({
        operations,
        result: currentResult,
        distance,
        tilesUsed: 0, // Sera calculé plus tard
        tilesIds: [...usedTiles].sort((a, b) => a - b) // Stocker les IDs des tuiles triés
      });
    }

    // Si c'est le premier nombre ou s'il reste des tuiles
    if (currentResult === null || remainingTiles.length > 0) {
      // Si c'est le premier nombre
      if (currentResult === null) {
        // Essayer chaque tuile comme premier nombre
        for (let i = 0; i < remainingTiles.length; i++) {
          const tile = remainingTiles[i];
          const newRemaining = [...remainingTiles];
          newRemaining.splice(i, 1);

          findCombinations(
            newRemaining, 
            tile.value, 
            [`Départ avec ${tile.value}`], 
            [tile.id]
          );
        }
      } else {
        // Essayer toutes les combinaisons avec les tuiles restantes
        for (let i = 0; i < remainingTiles.length; i++) {
          const tile = remainingTiles[i];
          const newRemaining = [...remainingTiles];
          newRemaining.splice(i, 1);

          // Essayer tous les opérateurs
          for (const op of operators) {
            const result = performOperation(currentResult, op, tile.value);

            // Vérifier si l'opération est valide (pas de division par zéro, etc.)
            if (!isNaN(result)) {
              const operationText = `${currentResult} ${op} ${tile.value} = ${result}`;
              findCombinations(
                newRemaining, 
                result, 
                [...operations, operationText], 
                [...usedTiles, tile.id]
              );
            }
          }
        }
      }
    }
  }

  // Démarrer la recherche de combinaisons
  findCombinations([...tiles], null);

  // Filtrer les solutions qui n'utilisent qu'une seule tuile
  const meaningfulSolutions = solutions.filter(s => s.operations.length > 1);

  // Si aucune solution significative n'est trouvée, retourner toutes les solutions
  const solutionsToUse = meaningfulSolutions.length > 0 ? meaningfulSolutions : solutions;

  // Trier les solutions par distance (du plus proche au plus éloigné)
  return solutionsToUse.sort((a, b) => a.distance - b.distance);
}

// Fonction pour filtrer les solutions identiques
function filterDuplicateSolutions(solutions: Solution[]): Solution[] {
  // Créer une signature unique pour chaque solution basée sur:
  // - le résultat final
  // - les ID des tuiles utilisées (déjà triés)
  // - le nombre d'opérations
  solutions.forEach(solution => {
    // Calculer le nombre de tuiles utilisées
    solution.tilesUsed = solution.operations.length > 0 ? solution.operations.length : 1;

    // Créer une clé unique pour cette solution
    solution.signatureKey = `${solution.result}_${solution.tilesIds?.join('.')}_${solution.tilesUsed}`;
  });

  // Utiliser un Map pour garder une seule solution par signature
  const uniqueSolutions = new Map<string, Solution>();

  solutions.forEach(solution => {
    if (!uniqueSolutions.has(solution.signatureKey!)) {
      uniqueSolutions.set(solution.signatureKey!, solution);
    }
  });

  // Convertir le Map en tableau
  return Array.from(uniqueSolutions.values());
}

// Fonction pour limiter le nombre de solutions à afficher et les trier par nombre de tuiles utilisées
export function getTopSolutions(solutions: Solution[], limit: number = 5): Solution[] {
  // Si aucune solution, retourner un tableau vide
  if (solutions.length === 0) {
    return [];
  }

  // Filtrer les solutions identiques
  const uniqueSolutions = filterDuplicateSolutions(solutions);

  // Trier par distance d'abord
  uniqueSolutions.sort((a, b) => a.distance - b.distance);

  // Trouver la distance minimale
  const minDistance = uniqueSolutions[0].distance;

  // Filtrer les solutions avec la distance minimale
  let bestSolutions = uniqueSolutions.filter(s => s.distance === minDistance);

  // Trier les solutions par nombre de tuiles utilisées (du moins au plus)
  bestSolutions.sort((a, b) => a.tilesUsed - b.tilesUsed);

  // Si nous avons un résultat exact ou assez de solutions optimales, les retourner
  if (minDistance === 0 || bestSolutions.length >= limit) {
    return bestSolutions.slice(0, limit);
  }

  // Sinon, trier tous les résultats uniques par nombre de tuiles utilisées
  uniqueSolutions.sort((a, b) => {
    // D'abord par distance
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }
    // Ensuite par nombre de tuiles
    return a.tilesUsed - b.tilesUsed;
  });

  return uniqueSolutions.slice(0, limit);
}

// Fonction pour générer une expression mathématique concise à partir des opérations
export function generateConciseExpression(operations: string[]): string {
  if (operations.length === 0) return '';

  // Ignorer le premier élément "Départ avec X"
  const firstValueMatch = operations[0].match(/Départ avec (\d+)/);
  if (!firstValueMatch) return '';

  let firstValue = firstValueMatch[1];
  let currentResult = firstValue;

  // Structure pour stocker les termes et opérateurs
  type Term = {
    value: string;
    // 1: haute priorité (× et ÷), 0: basse priorité (+ et -)
    priority: number;
    operator?: string;
  };

  let terms: Term[] = [{ value: firstValue, priority: 0 }];
  let lastOperator = '';

  // Parcourir les opérations pour construire l'expression
  for (let i = 1; i < operations.length; i++) {
    const op = operations[i];
    const match = op.match(/(\d+\.?\d*) ([+\-×÷]) (\d+\.?\d*) = (\d+\.?\d*)/);
    if (!match) continue;

    // Extraire les parties de l'opération
    const operator = match[2];
    const operand = match[3];
    currentResult = match[4];

    // Déterminer la priorité de l'opérateur
    const priority = (operator === '×' || operator === '÷') ? 1 : 0;

    // Si nous avons besoin de parenthèses
    const needsParentheses = terms.length > 1 && (
      // Si l'opérateur actuel est de priorité supérieure à l'opérateur précédent
      (lastOperator && priority > (operator === '×' || operator === '÷' ? 1 : 0)) ||
      // Ou si nous changeons de type d'opération avec les mêmes priorités
      (lastOperator && priority === 0 && (lastOperator === '+' || lastOperator === '-') && (operator === '-')) ||
      // Ou si nous passons d'une opération de haute priorité à une opération de basse priorité
      (lastOperator && (lastOperator === '×' || lastOperator === '÷') && (operator === '+' || operator === '-'))
    );

    // Mise à jour des termes
    if (needsParentheses) {
      // Créer une expression avec parenthèses
      let innerExpr = terms.map(t => t.value + (t.operator || '')).join('');
      // Supprimer le dernier opérateur s'il existe
      innerExpr = innerExpr.replace(/[+\-×÷]$/, '');

      // Réinitialiser les termes avec l'expression parenthésée
      terms = [{ 
        value: `(${innerExpr})`, 
        priority: priority,
        operator: operator
      }];
    } else {
      // Mettre à jour l'opérateur du dernier terme
      if (terms.length > 0) {
        terms[terms.length - 1].operator = operator;
      }
    }

    // Ajouter le nouveau terme
    terms.push({
      value: operand,
      priority: priority
    });

    lastOperator = operator;
  }

  // Construire l'expression finale
  const finalExpression = terms.map(t => t.value + (t.operator || '')).join('');
  // Supprimer le dernier opérateur s'il existe
  const cleanExpression = finalExpression.replace(/[+\-×÷]$/, '');

  // Retourner l'expression complète avec le résultat
  return `${cleanExpression} = ${currentResult}`;
}
