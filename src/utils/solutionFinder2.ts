

interface Tile {
    value : number,
}

interface Operation extends Tile {
    left: Tile
    right: Tile
    operator: string
}

export interface Solution {
    operations : string[], // liste des opérations au format "a op b = r"
    result : number,
    distance : number,
    oneLineOperation : string, // une seule opération au format "(a op b) op c op (d op e) = r"
    nbTiles : number // nombre de tuiles utilisées
}

export function findSolution(tiles: number[], targetNumber: number) : Solution[] {
   const iTiles : Tile[] = tiles.map(tile => ({ value : tile, origin: null}))

   const solutions = iFindSolution(iTiles, targetNumber);

   console.log('Solutions:', solutions);
   // formater les solutions dans le format attendu
   return solutions.map(operation => {
       const listInstructions = operationToListInstructions(operation);
       return {
           operations: listInstructions,
           result: operation.value,
           distance: Math.abs(operation.value - targetNumber),
           oneLineOperation:  `${operationToString(operation)} = ${operation.value}`,
           nbTiles: listInstructions.length + 1
       };
   }).sort((a, b) => a.nbTiles - b.nbTiles);
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
        left: a,
        right: b,
        operator: '+'
    });

    // a x b (seulement si a != 1)
    if (a.value !== 1) {
        operations.push({
            value: a.value * b.value,
            left: a,
            right: b,
            operator: '×'
        });
    }

    // b - a (seulement si a != b)
    if (a.value !== b.value) {
        operations.push({
            value: b.value - a.value,
            left: b,
            right: a,
            operator: '-'
        });
    }

    // b / a (seulement si a != 1 et que le résultat est un nombre entier)
    if (a.value !== 1 && b.value % a.value === 0) {
        operations.push({
            value: b.value / a.value,

            left: b,
            right: a,
            operator: '÷'
        });
    }

    return operations;
}


function operationToListInstructions(operation: Operation) : string[] {
    const listInstructions = [];
    if(operation.left && operation.right) {
        listInstructions.push(operationToListInstructions(operation.left as Operation));
        listInstructions.push(operationToListInstructions(operation.right as Operation));
        listInstructions.push(`${operation.left.value} ${operation.operator} ${operation.right.value} = ${operation.value}`);
    }
    return listInstructions;
}

function operationToString(operation: Operation) : string {
    if(!operation.left || !operation.right) {
        return operation.value.toString();
    }
    let valueLeft = operationToString(operation.left as Operation);
    let valueRight = operationToString(operation.right as Operation);
    if(operation.operator === '×') {
        if((valueLeft as unknown as Operation).operator === '+' || (valueLeft as unknown as Operation).operator === '-') {
            valueLeft = `(${valueLeft})`;
        }
        if((valueRight as unknown as Operation).operator === '+' || (valueRight as unknown as Operation).operator === '-') {
            valueRight = `(${valueLeft})`;
        }
    } else if(operation.operator === '÷') {
        if((valueLeft as unknown as Operation) && (valueLeft as unknown as Operation).operator !== 'x') {
            valueLeft = `(${valueLeft})`;
        }
        if((valueRight as unknown as Operation).operator) {
            valueRight = `(${valueLeft})`;
        }
    }
    return `${valueLeft} ${operation.operator} ${valueRight}`;

}