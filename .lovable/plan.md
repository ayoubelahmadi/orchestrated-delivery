# V2.1 — Raffinement UX de Nouvelle demande

## Objectif
Conserver intégralement l’architecture V2 et affiner uniquement la validation humaine des propositions IA, les états incomplets, la cohérence des modes, la préparation et quelques détails d’interaction.

## Changements prévus
- Factory Manager préparera une proposition sans modifier la squad principale. Un état « Proposition prête » et un bouton « Appliquer cette proposition » déclencheront explicitement l’application, suivie d’une confirmation discrète.
- Si le titre ou la description est incomplet, Factory Manager expliquera d’abord ce qui manque et proposera de revenir au champ concerné. Les questions de contexte ne commenceront qu’une fois le besoin essentiel renseigné.
- Les libellés et badges suivront strictement le mode actif : vocabulaire IA seulement en mode assisté, « Composition de la squad » / « Squad actuelle » en mode manuel, sans jamais réinitialiser la squad.
- L’indicateur supérieur et la barre de préparation utiliseront la même source de vérité et distingueront clairement besoin incomplet, ressources optionnelles et squad à configurer.
- Le menu « Ajouter un rôle » sera mieux ancré, dimensionné, limité aux rôles disponibles et positionné pour éviter la barre inférieure. Une recherche ne sera ajoutée que si la liste le justifie.
- Le panneau Factory Manager conservera exactement ses dimensions et son comportement ; seuls l’espacement de l’en-tête et la séparation entre statut et fermeture seront ajustés.
- Tous les nouveaux textes resteront bilingues FR/EN et tout restera simulé côté interface.

## Vérification
- Tester les parcours incomplet → retour au champ, analyse → proposition prête → application explicite, modes IA/manuel sans perte de squad, ajout de rôle et cohérence des indicateurs.
- Vérifier ordinateur et mobile, modes clair et sombre, sans modifier la palette ni l’architecture V2.
