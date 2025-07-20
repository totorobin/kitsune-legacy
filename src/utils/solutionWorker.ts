export abstract class Operation {
    abstract value: number
    operator: string | null
    tilesValues: number[]
    transform: '-' | '/' | null

    constructor(tiles: Operation[]) {
        this.operator = null
        this.tilesValues = tiles.flatMap(t => t.tilesValues)
        this.transform = null
    }

    abstract toString(): string

    toNegativeValue() {
        this.transform = this.transform === '-' ? null : '-'
        return this
    }

    isNegatif() {
        return this.transform === '-'
    }

    toDivisor() {
        this.transform = this.transform === '/' ? null : '/'
        return this
    }

    isDivisor() {
        return this.transform === '/'
    }

    weightValue() {
        return (this.isNegatif() ? -1 : 1) * this.value
    }

    abstract clone(): Operation


}

export class Tile extends Operation {
    value: number

    constructor(value: number) {
        super([])
        this.value = value
        this.tilesValues = [value]
    }

    toString() {
        return `${this.tilesValues[0]}`
    }

    weightValue() {
        return (this.isNegatif() ? -1 : 1) * this.value
    }

    clone(): Tile {
        const tile = new Tile(this.value)
        tile.transform = this.transform
        return tile
    }
}

export class Multiplication extends Operation {
    value: number
    tiles: Operation[]

    constructor(tiles: Operation[]) {
        super(tiles)
        this.operator = 'x'
        this.value = tiles.reduce((acc, curr) => acc * curr.value, 1)
        this.tilesValues = tiles.flatMap(t => t.tilesValues)
        this.tiles = tiles.flatMap(t => t instanceof Multiplication ? t.tiles : t).sort((a, b) => b.weightValue() - a.weightValue())
    }

    divide(tile: Operation) {
        this.value /= tile.value
        this.tilesValues.push(...tile.tilesValues)
        this.tiles.push(...(tile instanceof Multiplication ? tile.tiles.map(tile => {
            return tile.clone().toDivisor()
        }) : [tile.clone().toDivisor()]))
        this.tiles.sort((a, b) => b.weightValue() - a.weightValue())
        return this
    }

    toString() {
        return this.tiles.reduce((acc, curr, index) => {
            const s = curr instanceof Tile ? curr.toString() : '(' + curr.toString() + ')'
            if (index === 0) return s
            if (curr.isDivisor())
                return acc + ' / ' + s
            return acc + ' x ' + s
        }, '')
    }

    weightValue() {
        return (this.isNegatif() ? -1 : 1) * this.value + (0.1 * this.tiles.length)
    }

    clone() {
        const tile = new Multiplication(this.tiles)
        tile.transform = this.transform
        return tile
    }
}

export class Addition extends Operation {
    value: number
    tiles: Operation[]

    constructor(tiles: Operation[]) {
        super(tiles)
        this.operator = '+'
        this.value = tiles.reduce((acc, curr) => acc + curr.value, 0)
        this.tilesValues = tiles.flatMap(t => t.tilesValues)
        this.tiles = tiles.flatMap(t => t instanceof Addition ? t.tiles : t).sort((a, b) => b.weightValue() - a.weightValue())
    }

    substract(tile: Operation) {
        this.value -= tile.value
        this.tilesValues.push(...tile.tilesValues)
        this.tiles.push(...(tile instanceof Addition ? tile.tiles.map(tile => {
            return tile.clone().toNegativeValue()
        }) : [tile.clone().toNegativeValue()]))
        this.tiles.sort((a, b) => b.weightValue() - a.weightValue())
        return this
    }

    weightValue() {
        return (this.isNegatif() ? -1 : 1) * this.value + (0.1 * this.tiles.length)
    }

    toString() {
        return this.tiles.reduce((acc, curr, index) => {
            if (index === 0) return curr.toString()
            if (curr.isNegatif())
                return acc + ' - ' + curr.toString()
            return acc + ' + ' + curr.toString()
        }, '')
    }


    clone() {
        const tile = new Addition(this.tiles)
        tile.transform = this.transform
        return tile
    }
}

export interface Solution {
    result: number,
    distance: number,
    operation: string, // une seule opération au format "(a op b) op c op (d op e) = r"
    nbTiles: number // nombre de tuiles utilisées
}

let minDistance = Number.MAX_SAFE_INTEGER;


export function findSolution(tiles: Operation[], targetNumber: number) {

    if (tiles.length === 1) {
        const distance = Math.abs(tiles[0].value - targetNumber)
        if( distance <= minDistance) {
            minDistance = distance
            self.postMessage({
                type: 'partial',
                solution: {
                    result: tiles[0].value,
                    distance,
                    operation: `${tiles[0].toString()} = ${tiles[0].value}`,
                    nbTiles: tiles[0].tilesValues.length
                }
            })
        }
        return
    }

    // Trier les tuiles par valeur croissante
    const sortedTiles = [...tiles].sort((a, b) => a.value - b.value);

    for (let i = 0; i < sortedTiles.length - 1; i++) {
        const a = sortedTiles[i];
        // Pour chaque tuile restante, tuile b
        for (let j = i + 1; j < sortedTiles.length; j++) {
            const b = sortedTiles[j];

            // Créer une liste d'opérations possibles avec a et b
            const operations = createOperations(a, b);

            // Vérifier si une des solutions correspond au targetNumber
            const exactMatch = operations.find(op => op.value === targetNumber);
            if (exactMatch) {
                minDistance = 0;
                self.postMessage({
                    type: 'partial',
                    solution: {
                        result: exactMatch.value,
                        distance: 0,
                        operation: `${exactMatch.toString()} = ${exactMatch.value}`,
                        nbTiles:exactMatch.tilesValues.length
                    }
                })
                return
            }

            // Pour chaque tuile opération
            for (const operation of operations) {
                // Appeler la fonction iFindSolution avec une nouvelle liste de tuiles
                const newTiles = [operation, ...sortedTiles.filter((_val, index) => index !== i && index !== j)];
                findSolution(newTiles, targetNumber);
            }

            // si la tuile suivante a la même valeur, on la passe
            if (j + 1 < sortedTiles.length && b.value === sortedTiles[j + 1].value) {
                j++;
            }
        }
    }
}


function createOperations(a: Operation, b: Operation): Operation[] {
    const operations: Operation[] = [];

    // a est forcément plus petit (ou égal) que b
    // les opérations possibles sont donc:

    // a + b
    if ((b instanceof Addition && b.tiles.some(t => t.isNegatif() && t.value === a.value)) ||
        (a instanceof Addition && a.tiles.some(t => t.isNegatif() && t.value === b.value))) {
        // on ne fait pas une addition si on déjà soustrait la même valeur
    } else {
        operations.push(new Addition([a, b]))
    }

    // a x b (seulement si a != 1)
    if (a.value !== 1) {
        operations.push(new Multiplication([a, b]))
    }

    // b - a (seulement si a != b)
    if (a.value !== b.value) {
        if (b instanceof Addition && b.tiles.some(t => !t.isNegatif() && t.value === a.value)) {
            // on ne fait pas une soustraction si on déjà ajouté la même valeur
        } else {
            // la soustraction est une addition avec -a
            operations.push(new Addition([b]).substract(a))
        }
    }

    // b / a (seulement si a != 1 et que le résultat est un nombre entier)
    if (a.value !== 1 && b.value % a.value === 0) {
        if (b instanceof Multiplication && b.tiles.some(t => t.value === a.value)) {
            // on ne divise pas par a si on déjà a multiplié par a
        } else {
            // la division est une multiplication avec a comme diviseur
            operations.push(new Multiplication([b]).divide(a));
        }
    }


    // Filter les operations inutiles
    return operations.filter(op => !op.tilesValues.includes(op.value));
}


// Define the message types for communication with the worker
export interface WorkerRequest {
    tiles: number[]
    targetNumber: number
}

export interface WorkerResponse {
    type: 'partial' | 'complete' | 'error'
    solution?: Solution
    error?: string
}


// Listen for messages from the main thread
self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
    const { tiles, targetNumber } = event.data;

    try {
        console.log('Calculating solutions...');
        minDistance = Number.MAX_SAFE_INTEGER;
        const myTiles = tiles.map((tile : number) => new Tile(tile))
        // @ts-ignore - findSolution will be injected into the worker scope
        findSolution(myTiles, targetNumber);

        // Send the solutions back to the main thread
        self.postMessage({
            type: 'complete'
        });
    } catch (error) {
        console.error('Error in solution worker:', error);
        self.postMessage({
            type: 'error',
            solutions: [],
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
