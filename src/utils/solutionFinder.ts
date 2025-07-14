import {type Solution, type WorkerResponse} from "./solutionFinder3.ts";
import {computed, reactive} from "vue";
import SolutionWorker from './solutionFinder3?worker';

// Worker for solution finding
const solutionWorker = new SolutionWorker();

const state = reactive({
   workerState: 'available',
   solutions: [] as Solution[],
   targetValue: 0,
   minDistance: Number.MAX_SAFE_INTEGER,
    callbackFunction: () => {},
    timeStart: 0
})

export const useSolutionFinder = () => {

    // Configurer le gestionnaire de messages pour recevoir les solutions
    solutionWorker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const {type, solution, error} = event.data;
        switch (type) {
            case 'error':
                console.error('Error from solution worker:', error);
                state.workerState = 'available'
                return;
            case 'complete':

                console.log(`Search Completed in ${Date.now() - state.timeStart} ms` );
                state.workerState = 'available'
                state.callbackFunction()
                return
            case "partial":
                console.log('Partial solutions received from worker:', solution?.operation);
                if (solution) { //should always be true
                    state.minDistance = Math.min(state.minDistance, solution.distance)
                    if(!state.solutions.some(s => s.operation === solution.operation))
                        state.solutions.push(solution)
                }
        }
    }

    solutionWorker.onerror = (event: ErrorEvent) => {
        console.error('Error from solution worker:', event.message);
    }

    const search = (tiles: number[], targetNumber: number, callback?: () => void) => {

        // Envoyer les données au worker pour commencer la recherche
        if (state.workerState === 'available') {
            state.timeStart = Date.now()
            console.log('start Searching Solution for ', tiles, ' with target ', targetNumber, '')
            state.workerState = 'calculating'
            state.minDistance = Number.MAX_SAFE_INTEGER
            state.solutions = []
            solutionWorker.postMessage({
                tiles: tiles,
                targetNumber: targetNumber
            });
            state.callbackFunction = callback ?? (() => {})
        } else {
            console.log('solutionWorker not available : Search already in progress')
        }
    }

    const foundSolutions = computed(() => [ ...state.solutions].filter(solution => solution.distance === state.minDistance).sort((a, b) => a.nbTiles - b.nbTiles))

    return {
        search,
        foundSolutions,
        isSearching: computed(() => state.workerState === 'calculating'),
    }
}