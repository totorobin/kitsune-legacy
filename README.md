# Kitsune - Legacy

Cette application a pour but de reproduire le jeu kitsune créé en Qt4 dans une version typescript
Je n'arrivai pas à installer l'application sur l'ordinateur de mon père (ubuntu). J'ai donc décidé d'en recréer une pour qu'il puisse continuer à jouer


## Règles du jeu

Le but de ce jeu est d'obtenir un nombre (de 101 à 999) à partir d'opérations élémentaires (Addition "+", Soustraction "−", Multiplication "×", Division "÷") sur des entiers naturels, en partant de nombres tirés au hasard (de 1 à 10, 25, 50, 75 et 100). 
Le jeu comporte vingt-quatre plaques : les nombres de 1 à 10 présents en double exemplaire et les nombres 25, 50, 75 et 100 présents en un seul exemplaire. Sont alors tirées 6 valeurs.

À défaut de trouver le compte exact, il faut tenter de s'en approcher le plus près possible.

Des calculs basiques de dénombrement nous montrent qu'il existe 13 243 tirages possibles distincts ; en particulier :

il y a 71 % de chances d'avoir au moins une tuile 25, 50, 75 ou 100 dans le tirage ;
il y a 52 % de chance de ne pas avoir 2 tuiles identiques dans le tirage.
Exemples
Nombres tirés : 3, 100, 8, 8, 10, 6.
Résultat demandé : 683.


Solution :
6 x 100 = 600
8 x 10 = 80
600 + 80 = 680
680 + 3 = 683

Nombres tirés : 3, 75, 2, 4, 1, 1.
Résultat demandé : 888.


Solution :
75 - 1 = 74
3 x 4 = 12
74 x 12 = 888

Le joueur dispose de 40 secondes pour entrer leur solution sur l'écran. 
Si le joueur trouve le compte exact, ou la meilleure approche possible si le compte est infaisable, il gagne

pour saisir la solution, le joueur dispose des 6 tuiles de numéro tirés ainsi que des boutons "+" , "-" , "x" et "÷"
il peux également saisir les chiffres et signes au clavier

## Expérience de coder sans coder...

Afin de tester la génération de code via IA, j'ai décidé de coder cette application sans écrire une seule ligne de code.
J'utilise Webstorm avec l'assistant version Claude 3.5 Sonnet

Pour l'instant a par lancer la commande `pnpm create vite`, je n'ai utilisé que le chat de l'assistant et n'ai édité aucun autres fichier de celui ci

## Tests

### Tests unitaires avec Vitest

Pour exécuter les tests unitaires avec Vitest :

```bash
pnpm test
```

Pour exécuter les tests en mode non-interactif :

```bash
pnpm test:run
```

### Tests BDD avec Cucumber

Les tests BDD (Behavior-Driven Development) utilisent Cucumber avec la syntaxe Gherkin. Ces tests sont plus lisibles et permettent de décrire le comportement attendu de l'application de manière plus naturelle.

Pour exécuter les tests Cucumber :

```bash
pnpm test:cucumber
```

Les tests Cucumber sont définis dans des fichiers `.feature` dans le répertoire `tests/cucumber/features/` et les step definitions correspondantes se trouvent dans `tests/cucumber/step_definitions/`.

### Tests d'intégration avec Cypress

Pour exécuter les tests d'intégration avec Cypress en mode interactif :

```bash
pnpm cypress:open
```

Pour exécuter les tests Cypress en mode non-interactif :

```bash
pnpm cypress:run
```
