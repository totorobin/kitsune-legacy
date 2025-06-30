

interface Tile {
    value : number,
    origin: Operation | null
}

interface Operation extends Tile {
    left: Tile
    right: Tile
    operator: string
}

interface Solution {
    operations : string[], // liste des opérations au format "a op b = r"
    result : number,
    distance : number,
    oneLineOperation : string, // une seule opération au format "(a op b) op c op (d op e) = r"
}

export function findSolution(tiles: number[], targetNumber: number) : Solution[] {
   const iTiles : Tile[] = tiles.map(tile => ({ value : tile, origin: null}))

   const solutions = iFindSolution(iTiles, targetNumber);

   // formater les solutions dans le format attendu
   return solutions.map(operation => {
       const operationsList: string[] = [];
       const usedOperations = new Set<string>();

       // Fonction récursive pour extraire les opérations
       function extractOperations(op: Operation) {
           if (op.origin) {
               extractOperations(op.origin);
           }

           if (op.left && op.right) {
               const operationText = `${op.left.value} ${op.operator} ${op.right.value} = ${op.value}`;
               if (!usedOperations.has(operationText)) {
                   operationsList.push(operationText);
                   usedOperations.add(operationText);
               }

               if (op.left.origin) {
                   extractOperations(op.left.origin);
               }

               if (op.right.origin) {
                   extractOperations(op.right.origin);
               }
           }
       }

       extractOperations(operation);

       // Générer l'expression en une ligne
       function generateOneLineOperation(op: Operation): string {
           if (!op.left || !op.right) {
               return op.value.toString();
           }

           const leftExpr = op.left.origin ? `(${generateOneLineOperation(op.left.origin)})` : op.left.value.toString();
           const rightExpr = op.right.origin ? `(${generateOneLineOperation(op.right.origin)})` : op.right.value.toString();

           return `${leftExpr} ${op.operator} ${rightExpr}`;
       }

       const oneLineOp = `${generateOneLineOperation(operation)} = ${operation.value}`;

       return {
           operations: operationsList,
           result: operation.value,
           distance: Math.abs(operation.value - targetNumber),
           oneLineOperation: oneLineOp
       };
   });
}

function iFindSolution(tiles: Tile[], targetNumber: number) : Operation[] {
    // Trier les tuiles par valeur croissante
    const sortedTiles = [...tiles].sort((a, b) => a.value - b.value);

    if (sortedTiles.length === 0) {
        return [];
    }

    const results: Operation[] = [];

    // Extraire la première tuile (la plus petite), tuile a
    const a = sortedTiles[0];
    const tilesWithoutA = sortedTiles.slice(1);

    // Pour chaque tuile restante, tuile b
    for (let i = 0; i < tilesWithoutA.length; i++) {
        const b = tilesWithoutA[i];
        const remainingTiles = [...tilesWithoutA];
        remainingTiles.splice(i, 1);

        // Créer une liste d'opérations possibles avec a et b
        const operations = createOperations(a, b);

        // Vérifier si une des solutions correspond au targetNumber
        const exactMatch = operations.find(op => op.value === targetNumber);
        if (exactMatch) {
            return [exactMatch];
        }

        // Pour chaque tuile opération
        for (const operation of operations) {
            // Appeler la fonction iFindSolution avec une nouvelle liste de tuiles
            const newTiles = [operation, ...remainingTiles];
            const subResults = iFindSolution(newTiles, targetNumber);
            results.push(...subResults);
        }
    }

    // Appeler la fonction iFindSolution avec une nouvelle liste de tuiles sans a
    const subResults = iFindSolution(tilesWithoutA, targetNumber);
    results.push(...subResults);

    // Filtrer la liste des résultats pour ne garder que les résultats les plus proches du targetNumber
    if (results.length === 0) {
        return [];
    }

    // Trouver la distance minimale
    const minDistance = Math.min(...results.map(r => Math.abs(r.value - targetNumber)));

    // Retourner les résultats avec la distance minimale
    return results.filter(r => Math.abs(r.value - targetNumber) === minDistance);
}

function createOperations(a: Tile, b: Tile) : Operation[] {
    const operations : Operation[] = [];

    // a est forcément plus petit (ou égal) que b
    // les opérations possibles sont donc:

    // a + b
    operations.push({
        value: a.value + b.value,
        origin: null,
        left: a,
        right: b,
        operator: '+'
    });

    // a x b (seulement si a != 1)
    if (a.value !== 1) {
        operations.push({
            value: a.value * b.value,
            origin: null,
            left: a,
            right: b,
            operator: '×'
        });
    }

    // b - a (seulement si a != b)
    if (a.value !== b.value) {
        operations.push({
            value: b.value - a.value,
            origin: null,
            left: b,
            right: a,
            operator: '-'
        });
    }

    // b / a (seulement si a != 1 et que le résultat est un nombre entier)
    if (a.value !== 1 && b.value % a.value === 0) {
        operations.push({
            value: b.value / a.value,
            origin: null,
            left: b,
            right: a,
            operator: '÷'
        });
    }

    return operations;
}
