
abstract class Operation {
   abstract value: number
   operator: string | null
   tilesValues: number[]    

   constructor(tiles: Operation[]) {
        this.operator = null
        this.tilesValues = tiles.flatMap(t => t.tilesValues)
    }
    abstract toString() : string
    toNegativeValue() {
        this.value = - this.value
        return this
    }
    abstract clone() : Operation
}

class Tile extends Operation {
    value: number
  
    constructor(value: number) {
        super([])
        this.value = value
        this.tilesValues = [ value ]
    }
    toString() {
        return `${this.tilesValues[0]}`
    }
    clone(): Tile {
       return new Tile(this.value)
    }
}

class Multiplication extends Operation {
    value: number
    tiles: Operation[]

    constructor(tiles: Operation[]) {
        super(tiles)
        this.operator = 'x'
        this.value = tiles.reduce((acc, curr) => acc * curr.value, 1)
        this.tilesValues = tiles.flatMap(t => t.tilesValues)
        this.tiles = tiles.flatMap(t => t instanceof Multiplication ? t.tiles : t ).sort((a, b) => b.value - a.value)
    }
    toString() {
        return this.tiles.reduce((acc, curr , index) => {
            const s = curr instanceof Tile ? curr.toString() : '(' + curr.toString() + ')'
            if(index === 0) return s
            return acc + ' x ' + s
        }, '')
    }
    clone() {
        return new Multiplication(this.tiles)
    }
}

class Addition extends Operation {
    value: number
    tiles: Operation[]

    constructor(tiles: Operation[]) {
        super(tiles)
        this.operator = '+'
        this.value = tiles.reduce((acc, curr) => acc + curr.value, 0)
        this.tilesValues = tiles.flatMap(t => t.tilesValues)
        this.tiles = tiles.flatMap(t => t instanceof Addition ? t.tiles : t ).sort((a, b) => b.value - a.value)
    }
    substract(tile: Operation) {
        this.value -= tile.value
        this.tilesValues.push(...tile.tilesValues)
        this.tiles.push(...(tile instanceof Addition ? tile.tiles.map(tile => {
          return tile.clone().toNegativeValue()
        }) : [tile.clone().toNegativeValue()] ))
        return this
    }
        toString() {
        return this.tiles.reduce((acc, curr , index) => {
            const s = curr instanceof Tile ? curr.toString() : '(' + curr.toString() + ')'
            if(index === 0) return s
            if(curr.value < 0)
                return acc + ' - ' + s
            return acc + ' + ' + s
        }, '')
    }
    clone() {
        return new Addition(this.tiles)
    }
}

class Division extends Operation {
    value: number
    left: Operation
    right: Operation
     constructor(left: Operation, rigth: Operation) {
        super([left, rigth])
        this.operator = '÷'
        this.value = left.value / rigth.value
        this.left = left
        this.right = rigth
    }
    toString(): string {
        return ((this.left instanceof Tile || this.left instanceof Multiplication) ? this.left.toString() : '(' + this.left.toString() + ')') + ' / ' +  (this.right instanceof Tile ? this.right.toString() : '(' + this.right.toString() + ')') 
    }
    clone() {
        return new Division(this.left,this.right)
    }
}


export interface Solution {
    operations : string[], // liste des opérations au format "a op b = r"
    result : number,
    distance : number,
    oneLineOperation : string, // une seule opération au format "(a op b) op c op (d op e) = r"
    nbTiles : number // nombre de tuiles utilisées
}

export function findSolution(tiles: number[], targetNumber: number) : Solution[] {
   const iTiles : Operation[] = tiles.map(tile => new Tile(tile))

   const solutions = iFindSolution(iTiles, targetNumber);

   // formater les solutions dans le format attendu
   return solutions.map(operation => {
       return {
           operations: [],
           result: operation.value,
           distance: Math.abs(operation.value - targetNumber),
           oneLineOperation:  `${operation.toString()} = ${operation.value}`,
           nbTiles: operation.tilesValues.length
       };
   }).sort((a, b) => a.nbTiles - b.nbTiles);
}

function iFindSolution(tiles: Operation[], targetNumber: number) : Operation[] {
    console.log('iFIndSolution', tiles, targetNumber)
    if(tiles.length <= 1) {
        return tiles as Operation[];
    }

    // Trier les tuiles par valeur croissante
    const sortedTiles = [...tiles].sort((a, b) => a.value - b.value);

    const results: Operation[] = [];
    for (let i = 0; i < sortedTiles.length - 1; i++) {
        const a = sortedTiles[i];
        // Pour chaque tuile restante, tuile b
        for (let j = i+1; j < sortedTiles.length; j++) {
            const b = sortedTiles[j];

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
                const newTiles = [operation, ...sortedTiles.filter((_val, index) => index !== i && index !==j )];
                results.push(...iFindSolution(newTiles, targetNumber));
            }
        }
    } 

    return results.reduce<Operation[]>((acc, curr) => {
        // Retourner les résultats avec la distance minimale
        if (acc.length === 0) {
            return [curr];
        }
        const distance = Math.abs(curr.value - targetNumber);
        const minDistance = Math.abs(acc[0].value - targetNumber);
        if (distance < minDistance) {
            return [curr];
        } else if (distance === minDistance) {
            return [...acc, curr];
        } else {
            return acc;
        }
    }, []).reduce<Operation[]>((acc, curr) => {
        // supprimer les doublons
        if (acc.length === 0) {
            return [curr];
        }
        // TODO: tester si doublon déjà présent dans acc et retourner une liste sans curr
        if(acc.some(op => op.toString() === curr.toString()))
            return acc

        // sinon on retourne tout
        return [...acc, curr]
    }, [])
}


function createOperations(a: Operation, b: Operation) : Operation[] {
    const operations : Operation[] = [];

    // a est forcément plus petit (ou égal) que b
    // les opérations possibles sont donc:

    // a + b
    operations.push(new Addition([a, b]))

    // a x b (seulement si a != 1)
    if (a.value !== 1) {
        operations.push(new Multiplication([a, b]))
    }

    // b - a (seulement si a != b)
    if (a.value !== b.value) {
        // la soustraction est une addition avec -a
        operations.push(new Addition([b]).substract(a))
    }

    // b / a (seulement si a != 1 et que le résultat est un nombre entier)
    if (a.value !== 1 && b.value % a.value === 0) {
        operations.push(new Division(b, a));
    }


   // Filter les operations inutiles
    return operations.filter(op => !op.tilesValues.includes(op.value));
}
