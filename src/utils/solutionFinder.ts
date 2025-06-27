import { Operator, Tile } from '../types/game';
import { performOperation } from './gameLogic';

// Interface pour représenter une solution
export interface Solution {
  operations: string[];
  result: number;
  distance: number; // Distance par rapport à la cible
  expression?: string; // Expression mathématique formatée avec parenthèses
  tilesUsed?: number;
  tilesIds?: number[];
  signatureKey?: string;
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
    usedTiles: number[] = [],
    parentExpression: string = ''
  ) {
    // Si nous avons utilisé toutes les tuiles ou au moins une et obtenu un résultat
    if (currentResult !== null && (remainingTiles.length === 0 || usedTiles.length > 0)) {
      // Ajouter cette solution
      const distance = Math.abs(currentResult - targetNumber);
      // Formatage de l'expression pour qu'elle soit plus lisible
      const formattedExpression = parentExpression ? parentExpression.trim() : String(currentResult);

      solutions.push({
        operations,
        result: currentResult,
        distance,
        tilesUsed: 0, // Sera calculé plus tard
        tilesIds: [...usedTiles].sort((a, b) => a - b), // Stocker les IDs des tuiles triés
        expression: formattedExpression
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
            [tile.id],
            String(tile.value)
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
              // Assurer un formatage cohérent pour l'expression
              const newExpression = parentExpression ? `${parentExpression.trim()} ${op} ${tile.value}` : `${currentResult} ${op} ${tile.value}`;
              findCombinations(
                newRemaining, 
                result, 
                [...operations, operationText], 
                [...usedTiles, tile.id],
                newExpression
              );
            }
          }
        }

        // Explorer les combinaisons qui combinent des résultats intermédiaires
        // C'est la partie qui manquait pour trouver des solutions comme (((50×2)+4)×7)-8
        if (remainingTiles.length >= 2) {
          // Créer des sous-groupes de tuiles pour explorer les parenthèses imbriquées
          for (let i = 1; i < remainingTiles.length; i++) {
            const subgroup = remainingTiles.slice(0, i);
            const restOfTiles = remainingTiles.slice(i);

            // Récursivement explorer toutes les combinaisons possibles dans ce sous-groupe
            const subResults: { result: number, ops: string[], used: number[], expr: string }[] = [];

            // Fonction récursive pour trouver les résultats intermédiaires
            function findSubResults(
              subTiles: Tile[],
              subResult: number | null,
              subOps: string[] = [],
              subUsed: number[] = [],
              subExpr: string = ''
            ) {
              if (subResult !== null && subUsed.length > 0) {
                subResults.push({
                  result: subResult,
                  ops: subOps,
                  used: subUsed,
                  expr: subExpr
                });
              }

              if (subResult === null) {
                for (let j = 0; j < subTiles.length; j++) {
                  const tile = subTiles[j];
                  const newSubTiles = [...subTiles];
                  newSubTiles.splice(j, 1);
                  findSubResults(newSubTiles, tile.value, [`Départ avec ${tile.value}`], [tile.id], String(tile.value));
                }
              } else if (subTiles.length > 0) {
                for (let j = 0; j < subTiles.length; j++) {
                  const tile = subTiles[j];
                  const newSubTiles = [...subTiles];
                  newSubTiles.splice(j, 1);

                  for (const op of operators) {
                    const r = performOperation(subResult, op, tile.value);
                    if (!isNaN(r)) {
                      const opText = `${subResult} ${op} ${tile.value} = ${r}`;
                      const newSubExpr = `${subExpr} ${op} ${tile.value}`;
                      findSubResults(newSubTiles, r, [...subOps, opText], [...subUsed, tile.id], newSubExpr);
                    }
                  }
                }
              }
            }

            findSubResults([...subgroup], null);

            // Utiliser chaque résultat intermédiaire avec le reste des tuiles
            for (const subResult of subResults) {
              // Vérifier que ce sous-résultat utilise au moins 2 tuiles
              if (subResult.used.length >= 2) {
                const newRemaining = [...restOfTiles];
                const allUsedIds = new Set([...usedTiles, ...subResult.used]);

                // Essayer tous les opérateurs avec ce résultat intermédiaire
                for (const op of operators) {
                  const combinedResult = performOperation(currentResult, op, subResult.result);

                  if (!isNaN(combinedResult)) {
                    // Formater proprement l'expression avec parenthèses
                    const subExprFormatted = subResult.expr.trim();
                    const combinedOpText = `${currentResult} ${op} (${subExprFormatted}) = ${combinedResult}`;
                    const newExpr = parentExpression ? `${parentExpression.trim()} ${op} (${subExprFormatted})` : `${currentResult} ${op} (${subExprFormatted})`;

                    findCombinations(
                      newRemaining,
                      combinedResult,
                      [...operations, combinedOpText, ...subResult.ops],
                      Array.from(allUsedIds),
                      newExpr
                    );
                  }
                }
              }
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
  // - l'expression mathématique (pour capturer les différentes façons d'atteindre le même résultat)
  solutions.forEach(solution => {
    // Calculer le nombre de tuiles utilisées correctement à partir des IDs de tuiles
    solution.tilesUsed = solution.tilesIds?.length || 0;

    // Créer une clé unique pour cette solution
    // Inclure l'expression pour différencier les solutions utilisant les mêmes tuiles
    // mais avec différentes configurations de parenthèses
    solution.signatureKey = `${solution.result}_${solution.tilesIds?.join('.')}_${solution.expression}`;
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

// Fonction pour valider qu'une expression mathématique est correcte
function validateMathExpression(expression: string, expectedResult: number): boolean {
  try {
    // Remplacer les symboles × et ÷ par * et / pour l'évaluation
    const evalReady = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/');

    // Évaluer l'expression (attention: eval est utilisé ici pour la validation uniquement)
    const result = eval(evalReady);

    // Arrondir à 2 décimales pour gérer les imprécisions de calcul flottant
    const roundedResult = Math.round(result * 100) / 100;
    const roundedExpected = Math.round(expectedResult * 100) / 100;

    return roundedResult === roundedExpected;
  } catch (e) {
    // En cas d'erreur, l'expression est considérée comme invalide
    console.error("Erreur de validation d'expression:", expression, e);
    return false;
  }
}

// Fonction pour générer une expression mathématique concise à partir des opérations
export function generateConciseExpression(operations: string[]): string {
  if (operations.length === 0) return '';

  // Ignorer le premier élément "Départ avec X"
  const firstValueMatch = operations[0].match(/Départ avec (\d+)/);
  if (!firstValueMatch) return '';

  // Extraire les opérations et leurs résultats dans un format plus structuré
  type Operation = {
    leftOperand: number;
    operator: string;
    rightOperand: number;
    result: number;
  };

  const parsedOperations: Operation[] = [];

  // Analyser chaque opération
  for (let i = 1; i < operations.length; i++) {
    const op = operations[i];
    const match = op.match(/(\d+\.?\d*) ([+\-×÷]) (\d+\.?\d*) = (\d+\.?\d*)/);
    if (!match) continue;

    parsedOperations.push({
      leftOperand: parseFloat(match[1]),
      operator: match[2],
      rightOperand: parseFloat(match[3]),
      result: parseFloat(match[4])
    });
  }

  // Si aucune opération valide n'a été trouvée, retourner juste la valeur initiale
  if (parsedOperations.length === 0) {
    return firstValueMatch[1];
  }

  // Analyser la séquence d'opérations pour déterminer les priorités et groupements
  // Structure de données pour représenter un nœud dans l'arbre d'expression
  type ExprNode = {
    value: number | ExprNode[];
    operator?: string;
    isGrouped?: boolean;
  };

  // Construire un arbre d'opérations pour représenter l'expression
  let root: ExprNode = { value: parseFloat(firstValueMatch[1]) };

  // Parcourir toutes les opérations pour construire l'arbre
  for (const op of parsedOperations) {
    const isHighPriority = op.operator === '×' || op.operator === '÷';

    // Si l'opération actuelle est de haute priorité (× ou ÷)
    if (isHighPriority) {
      // Si le nœud racine est un nombre simple
      if (typeof root.value === 'number') {
        root = {
          value: [root, { value: op.rightOperand }],
          operator: op.operator
        };
      } 
      // Si le nœud racine est déjà un groupe
      else {
        // Vérifier l'opérateur du groupe actuel
        if (root.operator === '+' || root.operator === '-') {
          // Grouper l'expression précédente et créer une nouvelle racine
          root = {
            value: [{ value: root.value, operator: root.operator, isGrouped: true }, { value: op.rightOperand }],
            operator: op.operator
          };
        } else {
          // Ajouter au groupe existant de même priorité
          (root.value as ExprNode[]).push({ value: op.rightOperand });
          root.operator = op.operator;
        }
      }
    }
    // Si l'opération actuelle est de basse priorité (+ ou -)
    else {
      // Si le nœud racine est un nombre simple
      if (typeof root.value === 'number') {
        root = {
          value: [root, { value: op.rightOperand }],
          operator: op.operator
        };
      }
      // Si le nœud racine est déjà un groupe
      else {
        // Si l'opérateur actuel a la même priorité que l'opérateur du groupe
        if (root.operator === '+' || root.operator === '-') {
          // Ajouter au groupe existant
          (root.value as ExprNode[]).push({ value: op.rightOperand });
          root.operator = op.operator;
        } else {
          // Créer un nouveau groupe avec l'expression précédente comme premier élément
          root = {
            value: [root, { value: op.rightOperand }],
            operator: op.operator
          };
        }
      }
    }
  }

  // Fonction récursive pour convertir l'arbre d'expression en chaîne de caractères
  function nodeToString(node: ExprNode): string {
    if (typeof node.value === 'number') {
      return node.value.toString();
    }

    // Pour un groupe d'expressions
    const expressions = (node.value as ExprNode[]).map(n => nodeToString(n));
    let result = expressions.join(` ${node.operator} `);

    // Ajouter des parenthèses si nécessaire
    if (node.isGrouped) {
      result = `(${result})`;
    }

    return result;
  }

  // Générer une expression à partir de l'arbre
  let expression = nodeToString(root);

  // Pour les expressions complexes, analyser s'il faut ajouter des parenthèses
  // supplémentaires pour les opérations de multiplication et division
  if (parsedOperations.length >= 2) {
    // Trouver les séquences d'opérations de même priorité
    let hasAddSubSequence = false;
    let hasMultDivAfterAddSub = false;

    for (let i = 0; i < parsedOperations.length - 1; i++) {
      const op = parsedOperations[i];
      const nextOp = parsedOperations[i + 1];

      // Séquence d'additions/soustractions suivie par multiplication/division
      if ((op.operator === '+' || op.operator === '-') && 
          (nextOp.operator === '×' || nextOp.operator === '÷')) {
        hasAddSubSequence = true;
        hasMultDivAfterAddSub = true;
      }
    }

    // Si nous avons une séquence add/sub suivie de mult/div, nous devons regrouper
    // les opérations add/sub avec des parenthèses
    if (hasAddSubSequence && hasMultDivAfterAddSub) {
      // Chercher où commencent les opérations de multiplication/division
      let multDivIndex = -1;
      for (let i = 0; i < parsedOperations.length; i++) {
        if (parsedOperations[i].operator === '×' || parsedOperations[i].operator === '÷') {
          multDivIndex = i;
          break;
        }
      }

      // Si nous avons trouvé une telle séquence, reconstruire l'expression
      if (multDivIndex > 0) {
        // Première partie: opérations d'addition/soustraction
        let leftPart = firstValueMatch[1];
        for (let i = 0; i < multDivIndex; i++) {
          leftPart += ` ${parsedOperations[i].operator} ${parsedOperations[i].rightOperand}`;
        }

        // Construire la partie droite (mult/div et après)
        let rightPart = '';
        for (let i = multDivIndex; i < parsedOperations.length; i++) {
          if (i === multDivIndex) {
            rightPart = `${parsedOperations[i].operator} ${parsedOperations[i].rightOperand}`;
          } else {
            rightPart += ` ${parsedOperations[i].operator} ${parsedOperations[i].rightOperand}`;
          }
        }

        // Combinaison avec parenthèses appropriées
        expression = `(${leftPart}) ${rightPart}`;
      }
    }
  }

  // Retourner l'expression avec le résultat final
  const finalResult = parsedOperations.length > 0 ? 
    parsedOperations[parsedOperations.length - 1].result : 
    parseFloat(firstValueMatch[1]);

  return `${expression} = ${finalResult}`;
}
