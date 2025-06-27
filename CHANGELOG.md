# Journal des modifications (Changelog)

## 2025-06-30

### Requêtes effectuées

1. **Réécriture des tests Vitest en utilisant Gherkin avec Cucumber**
   - Ajout de @cucumber/cucumber et ts-node aux dépendances de développement
   - Création d'un fichier de configuration cucumber.js
   - Création d'un fichier de feature solutionFinder.feature avec des scénarios Gherkin
   - Création de step definitions pour les tests de solutionFinder
   - Ajout d'un script test:cucumber dans package.json pour exécuter les tests Cucumber
   - Intégration de Vitest avec Cucumber pour les assertions de test
   - Conservation de la couverture de test existante avec une syntaxe plus lisible et maintenable

## 2025-06-29

### Requêtes effectuées

1. **Ajout de la possibilité de choisir le temps de jeu dans les réglages du mode manuel**
   - Ajout d'un slider pour sélectionner le temps de jeu entre 10 et 120 secondes
   - Mise à jour de l'interface utilisateur pour afficher le temps sélectionné
   - Modification du composant ManualGameSetup pour inclure le temps de jeu dans la configuration
   - Mise à jour du composant GameBoard pour utiliser le temps de jeu personnalisé

2. **Création de scénarios de tests avec des parties complètes jusqu'à la victoire ou la défaite**
   - Ajout d'un scénario de test pour une partie complète se terminant par une victoire
   - Ajout d'un scénario de test pour une partie se terminant par une défaite (temps écoulé)
   - Ajout d'un scénario de test pour vérifier la sélection du temps de jeu personnalisé
   - Mise à jour des step definitions pour supporter les nouveaux scénarios
   - Ajout d'une commande personnalisée pour configurer des parties avec un temps personnalisé

## 2025-06-28

### Requêtes effectuées

1. **Ajout de Cypress avec Cucumber.js pour les tests d'intégration**
   - Installation et configuration de Cypress avec Cucumber.js
   - Création de scénarios de test pour le mode manuel
   - Implémentation de step definitions pour les tests
   - Ajout de commandes personnalisées pour faciliter les tests
   - Mise en place d'une structure de tests maintenable et extensible

2. **Correction de la sélection des tuiles en mode manuel**
   - Correction d'un bug empêchant la sélection des tuiles de 1 à 10 en mode manuel
   - Amélioration de l'accès aux données de sélection dans l'interface utilisateur
   - Optimisation de la cohérence du code pour la gestion des sélections multiples
   - Correction du comportement lors de la désélection d'une tuile sélectionnée deux fois
   - Uniformisation de l'utilisation de la fonction getSelectionCount pour une meilleure cohérence et fiabilité
   - Correction de l'ordre des conditions dans la fonction toggleTile pour résoudre les problèmes de sélection multiple

3. **Correction de l'affichage de l'écran de victoire**
   - Correction d'un bug où l'écran "Gagné" ne s'affichait plus lorsque le joueur trouvait la solution exacte
   - Amélioration du mécanisme de visibilité de l'overlay de victoire pour garantir son affichage dans tous les cas
   - Ajout d'un système de surveillance des changements d'état du jeu pour une meilleure réactivité

4. **Amélioration de la sélection des tuiles en mode manuel**
   - Ajout de la possibilité de sélectionner chaque tuile de 1 à 10 jusqu'à deux fois
   - Ajout d'indicateurs visuels pour montrer combien de fois une tuile a été sélectionnée
   - Amélioration de l'interface utilisateur pour distinguer les tuiles qui peuvent être sélectionnées à nouveau

5. **Amélioration de l'interface des modes de jeu**
   - Correction pour masquer le sélecteur de mode une fois qu'une partie a commencé
   - Amélioration de l'expérience utilisateur en évitant les interruptions pendant le jeu

6. **Ajout de deux modes de jeu**
   - Implémentation d'un mode automatique (comportement original)
   - Ajout d'un mode manuel permettant de choisir les tuiles et le nombre cible
   - Création d'une interface de sélection de mode de jeu
   - Développement d'un composant pour la configuration manuelle des tuiles et du nombre cible
   - Mise à jour de la logique du jeu pour supporter les deux modes

7. **Correction des tests pour solutionFinder.ts**
   - Correction des problèmes de performance dans la fonction `findSolutions`
   - Optimisation de l'algorithme avec mise en cache, limites de profondeur et conditions d'arrêt anticipées
   - Réduction du temps d'exécution de plus de 10 secondes à moins de 3 secondes
   - Correction de la fonction `generateConciseExpression` pour gérer correctement le préfixe "Départ avec X"
   - Ajout de cas spécifiques pour gérer les expressions complexes avec parenthèses imbriquées
   - Correction du traitement des opérateurs dans les expressions mathématiques

8. **Mise à jour du CHANGELOG**
   - Ajout des modifications effectuées pour corriger les tests
   - Documentation des optimisations de performance
   - Documentation des nouveaux modes de jeu
   - Documentation de l'ajout de Cypress avec Cucumber.js pour les tests d'intégration

## 2025-06-27

### Requêtes effectuées

1. **Création des tests pour solutionFinder.ts**
   - Création du fichier `src/utils/solutionFinder.test.ts`
   - Implémentation des tests unitaires pour les fonctions `findSolutions`, `getTopSolutions` et `generateConciseExpression`

2. **Configuration de Vitest**
   - Ajout de Vitest aux dépendances de développement dans le `package.json`
   - Ajout des scripts de test dans le `package.json`
   - Création du fichier de configuration `vitest.config.ts`

3. **Amélioration des tests**
   - Ajout de tests plus représentatifs de l'usage réel du jeu
   - Implémentation de tests avec 6 tuiles et un nombre cible entre 100 et 999
   - Ajout de tests de performance
   - Vérification de la gestion des grands nombres

4. **Création du CHANGELOG**
   - Création de ce fichier pour suivre les modifications apportées au projet

5. **Ajout de tests pour generateConciseExpression**
   - Création de cas de test réels pour la fonction de génération d'expressions concises
   - Validation des expressions mathématiques complexes avec différentes priorités d'opérations
   - Test de cas spécifiques avec des grands nombres
   - Vérification que les expressions générées sont mathématiquement correctes

6. **Modification des fonctions pour supprimer 'Départ avec *'**
   - Refactorisation de `findSolutions` et `generateConciseExpression` pour ne plus utiliser le format "Départ avec X"
   - Mise à jour de tous les tests pour refléter cette modification
   - Simplification du traitement des opérations dans l'historique

7. **Correction des tests pour generateConciseExpression**
   - Correction du traitement des opérations simples
   - Amélioration de la détection du premier nombre dans les opérations
   - Ajout d'un test pour gérer les entrées invalides
   - Correction du traitement des expressions avec une seule opération
