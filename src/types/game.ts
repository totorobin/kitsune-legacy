// Types pour le jeu Kitsune

export interface Tile {
  value: number;
  isSelected: boolean;
  id: number;
}

export type Operator = '+' | '-' | '×' | '÷';

// Types pour les modes de je
export type GameMode = 'auto' | 'manual';

// État des résultats du jeu
export const GameResult = {
  NOT_STARTED: -1,  // Jeu non démarré
  IN_PROGRESS: 0,  // Jeu en cours
  TIME_UP: 1,      // temps écoulé
  EXACT_WIN: 2,    // Victoire avec résultat exact
  BEST_WIN: 3,     // Victoire avec meilleur résultat possible
  LOSS: 4,         // Défaite
} as const;

export type GameResultType = typeof GameResult[keyof typeof GameResult];

// Constantes du jeu
export const MAX_TIME = 40; // Temps maximum en secondes

// Mapping des touches spéciales pour les tuiles avec des valeurs > 10
export const SPECIAL_KEY_MAPPING = {
  'a': 25,  // Touche A pour 25
  'z': 50,  // Touche Z pour 50
  'e': 75,  // Touche E pour 75
  'r': 100   // Touche R pour 100
};
