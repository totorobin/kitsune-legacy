import { Tile, Operator } from '../types/game';

// Génération des nombres aléatoires
export const generateRandomTiles = (): Tile[] => {
  const possibleTiles = [
    ...[...Array(10)].map((_, i) => i + 1),
    ...[...Array(10)].map((_, i) => i + 1),
    25, 50, 75, 100
  ];

  const selectedTiles: Tile[] = [];
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * possibleTiles.length);
    selectedTiles.push({
      value: possibleTiles[randomIndex],
      isSelected: false,
      id: i
    });
    possibleTiles.splice(randomIndex, 1);
  }
  return selectedTiles;
};

// Génération du nombre cible
export const generateTargetNumber = (): number => {
  return Math.floor(Math.random() * 899) + 101; // Nombre entre 101 et 999
};

// Effectuer une opération mathématique
export const performOperation = (a: number, op: Operator, b: number): number => {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      return b !== 0 ? a / b : NaN;
    default:
      return NaN;
  }
};
