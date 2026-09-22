# Ressources de la demande — allègement et rééquilibrage

## Constat (mesuré sur le preview desktop 1280px)
- La section `02 · Ressources` se trouve en bas de la colonne gauche (début ~y910), entièrement **sous** le panneau Squad droit qui se termine vers ~y832.
- Le bloc est assez lourd pour une option : grande zone de dépôt en pointillés pleine largeur (`min-h-20` + icône + 2 lignes), ~214px de haut.
- Effet : la colonne droite se vide sous la squad pendant que Ressources occupe le bas-gauche → déséquilibre et impression « tout en bas ».

## Objectif
Garder Ressources **optionnelle, glisser-déposer + parcours**, mais la rendre plus légère et moins isolée en bas, sans changer la logique ni le thème.

## Changements (desktop et mobile)
1. **État vide compact** — remplacer la grande zone pointillée pleine largeur par une fine ligne d'attachement : un bouton fantôme «＋ Ajouter des fichiers » + un libellé de drop en un trait (toujours droppable, avec le hint formats en gris très discret). Hauteur ~214px → ~90px.
2. **Resserrer la séparation** — `pt-8` → `pt-6` et réduire légèrement le `space-y` interne pour remonter la section de ~40–60px, afin qu'elle chevauche mieux la hauteur du panneau Squad au lieu de se retrouver seule en bas.
3. **Fichiers présents** — conserver les lignes compactes actuelles (icône / nom / taille / suppression) + « Ajouter des fichiers ». Aucun changement de logique.
4. **Rééquilibrage droit (léger)** — donner au panneau Squad `sticky` une hauteur minimale douce (`min-h`) pour réduire le vide à droite sans contenu factice, uniquement sur desktop.

## Ce qui ne change pas
- Champs et logique de création (`factory.createDemande`), comportement mock, FR/EN, thème Factory, structure 2 colonnes, numérotation 01/02/03, `FactoryManagerPanel`.

## Vérification
- `bunx tsgo --noEmit`, `bun run lint`, Playwright desktop 1280 + mobile 458 : état vide, ajout/retrait de fichiers, mode AI/manuel, création finale.
