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

// Mapping des touches spéciales pour les tuiles avec des valeurs > 10
export const SPECIAL_KEY_MAPPING = {
  'a': 25,  // Touche A pour 25
  'z': 50,  // Touche Z pour 50
  'e': 75,  // Touche E pour 75
  'r': 100   // Touche R pour 100
};
