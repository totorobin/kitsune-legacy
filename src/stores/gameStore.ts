import {DEFAULT_GAME_TIME, GameStates, type GameStatesType, type Operator, type Tile} from "../types/game";
import {computed, reactive} from "vue";
import {generateRandomTiles, generateTargetNumber, performOperation} from "../utils/gameLogic";
import {useSolutionFinder} from "../utils/solutionFinder";

interface GameState {
    state: GameStatesType;
    tiles: Tile[];
    targetNumber: number;
    timeLeft: number;
    totalTime: number;
    timer: number;
    operator: string | null;
    nextId: number;
    operationsHistory: string[];
    bestPlayerResult: number;
}

const initialState: GameState = {
    state: GameStates.NOT_STARTED,
    tiles: [],
    targetNumber: 0,
    timeLeft: DEFAULT_GAME_TIME,
    totalTime: DEFAULT_GAME_TIME,
    timer: 0,
    operator: null,
    nextId: 6,
    operationsHistory: [],
    bestPlayerResult: 0
}

const state = reactive({...initialState})
const solutionFinder = useSolutionFinder()

export const useGameStore = () => {

    // Worker for solution finding
    clearInterval(state.timer);

    const newGame = (config: { targetNumber?: number, tiles?: Tile[], time?: number }, resolve = false) => {
        Object.assign(state, initialState)
        state.targetNumber = config.targetNumber || generateTargetNumber();
        state.tiles = config.tiles || generateRandomTiles();
        console.log('new game', state.tiles, state.targetNumber)
        if (config.time) {
            state.timeLeft = config.time
            state.totalTime = config.time
        }
        state.state = GameStates.IN_PROGRESS;
        if (!resolve)
            startTimer();
        solutionFinder.search([ ...state.tiles.map((t: Tile) => t.value)], state.targetNumber, () => {
            if (state.state === GameStates.TIME_UP && !resolve)
                calculateWin()
        })
    }

    // Gestion du timer
    const startTimer = () => {
        if (state.timer) clearInterval(state.timer);
        state.timer = setInterval(() => {
            if (state.timeLeft > 0) {
                state.timeLeft--;
            } else {
                if (state.timer) clearInterval(state.timer);
                if (!solutionFinder.isSearching)
                    calculateWin()
                else if (state.state === GameStates.IN_PROGRESS)
                    state.state = GameStates.TIME_UP;
            }
        }, 1000);
    };

    const calculateWin = () => {
        // Vérifier si le joueur a trouvé le meilleur résultat possible
        const lastTile = state.tiles.find((t: Tile) => t.isSelected) as Tile;
        if (lastTile !== null) {
            const bestPossibleDistance = solutionFinder.foundSolutions.value[0].distance;
            const playerDistance = Math.abs(lastTile.value - state.targetNumber);

            if (playerDistance === 0) {
                // Le joueur a trouvé le résultat exact
                state.state = GameStates.EXACT_WIN;
            } else if (playerDistance === bestPossibleDistance) {
                // Le joueur a trouvé le meilleur résultat possible (pas exact)
                state.state = GameStates.BEST_WIN;
            } else {
                // Le joueur n'a pas trouvé le meilleur résultat
                state.state = GameStates.LOSS;
            }
        } else {
            // Le joueur n'a pas obtenu de résultat
            state.state = GameStates.LOSS;
        }
    }

    const selectTile = (tile: Tile) => {
        if (state.operator) { // Opérateur sélectionné on fait le calcul
            const firstTile = state.tiles.find((t: Tile) => t.isSelected) as Tile;
            tile.isSelected = true;

            const result = performOperation(firstTile.value, state.operator as Operator, tile.value);

            if (!isNaN(result)) {

                // Créer une entrée d'historique pour cette opération
                const operationText = `${firstTile.value} ${state.operator} ${tile.value} = ${result}`;
                state.operationsHistory.push(operationText);

                // désélection et désactivation des tuiles utilisées
                state.tiles.filter(t => t.isSelected).forEach(t => {
                    t.isSelected = false;
                    t.isUsed = true;
                });
                state.operator = null;

                // Ajouter la nouvelle tuile sans supprimer les anciennes
                state.tiles.push({
                    id: state.nextId++,
                    value: result,
                    isSelected: true,
                    isUsed: false,
                    parentIds: [firstTile.id, tile.id]
                } as Tile);


                // Vérifier si le joueur a gagné
                if (result === state.targetNumber && state.state === GameStates.IN_PROGRESS) {
                    state.state = GameStates.EXACT_WIN;
                    if (state.timer) clearInterval(state.timer)
                }

                // Mettre à jour le meilleur résultat obtenu par le joueur
                const distance = Math.abs(result - state.targetNumber);
                if (distance < Math.abs(state.bestPlayerResult - state.targetNumber)) {
                    state.bestPlayerResult = result;
                }
            }
        } else { //si une tuile est selectionnée, on la remplace
            state.tiles.filter((t: Tile) => t.isSelected).forEach((t: Tile) => t.isSelected = false);
            tile.isSelected = true;
        }
    }

    const resetGame = () => {
        Object.assign(state, {
            tiles: state.tiles.filter((t: Tile) => t.id < 6).map((t: Tile) => ({
                ...t,
                isUsed: false,
                isSelected: false
            })),
            operator: null,
            nextId: 6,
            operationsHistory: [],
            bestPlayerResult: 0
        })
    }

    const undo = () => {
        if (state.operator != null || state.tiles.some((t: Tile) => t.isSelected)) {
            state.tiles.filter((t: Tile) => t.isSelected).forEach((t: Tile) => t.isSelected = false);
            state.operator = null;
        } else if (state.operationsHistory.length > 0) {
            state.operationsHistory.pop();
            const deletedTile = state.tiles.pop();
            state.tiles.filter((t: Tile) => deletedTile?.parentIds?.includes(t.id)).forEach((t: Tile) => t.isUsed = false);
        }
    }

    const selectOperator = (operator: string) => {
        state.operator = operator;
    }

    return {
        newGame,
        selectTile,
        selectOperator,
        resetGame,
        undo,
        state: computed(() => state.state),
        tiles: computed(() => state.tiles),
        targetNumber: computed(() => state.targetNumber),
        timeLeft: computed(() => state.timeLeft),
        totalTime: computed(() => state.totalTime),
        operator: computed(() => state.operator),
        operationsHistory: computed(() => state.operationsHistory),
        bestPlayerResult: computed(() => state.bestPlayerResult),
        isSearching: solutionFinder.isSearching,
        foundSolutions: solutionFinder.foundSolutions
    }
}