// Types pour le jeu Kitsune

export interface Tile {
  value: number;
  isSelected: boolean;
  isUsed: boolean;
  id: number;
  parentIds?: number[];
}

export type Operator = '+' | '-' | '×' | '÷';

// Types pour les modes de je
export type GameMode = 'auto' | 'manual';

// État des résultats du jeu
export const GameStates = {
  NOT_STARTED: -1,  // Jeu non démarré
  IN_PROGRESS: 0,  // Jeu en cours
  TIME_UP: 1,      // temps écoulé
  EXACT_WIN: 2,    // Victoire avec résultat exact
  BEST_WIN: 3,     // Victoire avec meilleur résultat possible
  LOSS: 4,         // Défaite
} as const;

export type GameStatesType = typeof GameStates[keyof typeof GameStates];

// Constantes du jeu
export const DEFAULT_GAME_TIME = 40; // Temps maximum en secondes
