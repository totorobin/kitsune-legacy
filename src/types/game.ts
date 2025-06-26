// Types pour le jeu Kitsune

export interface Tile {
  value: number;
  isSelected: boolean;
  id: number;
}

export type Operator = '+' | '-' | '×' | '÷';

// État des résultats du jeu
export enum GameResult {
  IN_PROGRESS,  // Jeu en cours
  EXACT_WIN,    // Victoire avec résultat exact
  BEST_WIN,     // Victoire avec meilleur résultat possible
  LOSS,         // Défaite
}

// Constantes du jeu
export const MAX_TIME = 40; // Temps maximum en secondes
