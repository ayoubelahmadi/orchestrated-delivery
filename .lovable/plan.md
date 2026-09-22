# Nouvelle demande — espace de composition agentique

## Objectif
Faire évoluer la page existante en un espace de création unique, clair et compact : besoin, ressources facultatives, composition de squad, puis création.

## Expérience proposée
- Conserver les champs et la logique de création actuels, en améliorant uniquement leur hiérarchie et leur regroupement.
- Ajouter une zone « Ressources de la demande » avec glisser-déposer, sélection locale, liste des fichiers, taille et suppression. Aucun fichier réel ne sera envoyé ni conservé.
- Ajouter un choix persistant « Assistée par l’IA / Manuelle » qui ne réinitialise jamais la squad.
- Remplacer la squad statique par des cartes de rôles éditables : personne, agent IA, retrait et ajout de rôle.
- Ajouter un résumé discret de préparation avant le bouton « Créer la demande ».
- Créer un panneau droit Factory Manager dédié, inspiré du langage visuel existant mais plus léger sur ordinateur et plein écran sur mobile.
- Utiliser une seule conversation pour les cas avec ou sans contexte : analyse simulée, question de clarification, réponse utilisateur, recommandation et application de la squad sur la page principale.
- Permettre à une squad manuelle d’être relue et optimisée par Factory Manager.

## Détails techniques
- État React local uniquement pour les ressources, la conversation, les temporisations et la composition.
- AI Elements pour la conversation, les messages, le champ de saisie et l’état d’analyse.
- Aucun changement de schéma, d’intégration, d’API, de persistance ou de logique métier de création.
- Tous les nouveaux libellés seront définis en français et en anglais, sans traduire les valeurs métier existantes.
- Vérification finale des interactions, de l’affichage ordinateur/mobile et du mode sombre.
