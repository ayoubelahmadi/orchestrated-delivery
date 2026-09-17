import type { RoleKey } from "./types";

export const SPEC_FONCTIONNELLES = `# Spécifications fonctionnelles — Portail Client V2

## Contexte
Le portail client doit permettre à nos clients de suivre leurs commandes et factures en toute autonomie, sans solliciter le support. La cible est une mise en production progressive, d'abord sur les 20 comptes grands comptes puis sur l'ensemble du parc.

## Parcours utilisateurs
1. Connexion sécurisée (SSO Entra ID)
2. Tableau de bord des commandes en cours
3. Suivi détaillé d'une commande (jalons, transporteur, documents)
4. Téléchargement des factures au format PDF

## Règles de gestion
- Un utilisateur ne voit que les commandes rattachées à son compte client.
- Les factures sont disponibles 24 h après émission dans l'ERP.
- Toute action sensible (annulation) déclenche une notification au chargé de compte.

## Points d'attention
- Compatibilité mobile requise dès le lancement
- Accessibilité RGAA niveau AA
- Temps de chargement du tableau de bord < 2 s

**Validé par** : Sophie Martin (PO)
`;

const ARCHI = `# Architecture technique — Portail Client V2

## Vue d'ensemble
Application Power Platform model-driven adossée à Dataverse, exposée via un portail Power Pages authentifié par Entra ID External.

## Composants
- **Dataverse** : tables Compte, Commande, Ligne de commande, Facture
- **Power Automate** : synchronisation ERP → Dataverse toutes les 15 min
- **Power Pages** : couche de présentation client
- **Azure Key Vault** : secrets des connecteurs ERP

## Décisions
| Sujet | Décision | Raison |
| --- | --- | --- |
| Stockage documents | Azure Blob + lien signé | Volume et coût |
| Authentification | Entra ID External | Conformité groupe |
| Reporting | Power BI embarqué | Réutilisation des jeux existants |

## Risques identifiés
- Fenêtre de synchronisation ERP à valider avec l'équipe intégration
- Charge de pointe en fin de mois sur les factures
`;

const BRAINSTORM = `# Compte-rendu de cadrage

## Besoin exprimé
Réduire les sollicitations du support liées au suivi de commande (≈ 40 % des tickets entrants).

## Idées retenues
- Espace client en libre-service avec statut de commande temps réel
- Notifications proactives aux jalons clés
- Centre de documents (factures, bons de livraison)

## Idées écartées pour la V1
- Chat en direct avec le chargé de compte
- Paiement en ligne des factures

## Prochaine étape
Qualification des besoins et étude de faisabilité par l'Analyst.
`;

const FAISABILITE = `# Étude de faisabilité

## Synthèse
Le besoin est réalisable sur Power Platform sans développement personnalisé lourd. Effort estimé : **28 j/h**.

## Faisabilité par axe
- **Données** : les entités nécessaires existent déjà dans l'ERP — exposition via API REST disponible.
- **Sécurité** : le SSO externe est déjà en place sur un autre portail, réutilisable.
- **Performance** : mise en cache nécessaire sur la liste des commandes.

## Conditions de réussite
1. Accès à un environnement de recette ERP dès la phase Dev
2. Disponibilité du PO pour 2 ateliers de validation
3. Jeu de données anonymisé pour les tests
`;

const EPICS = `# Epics & User Stories

## Epic 1 — Accès et authentification
- En tant que client, je me connecte avec mon compte entreprise afin d'accéder à mon espace.
- En tant qu'administrateur, je révoque un accès afin de sécuriser le portail.

## Epic 2 — Suivi des commandes
- En tant que client, je consulte la liste de mes commandes en cours afin de connaître leur avancement.
- En tant que client, j'ouvre le détail d'une commande afin de voir les jalons de livraison.

## Epic 3 — Factures
- En tant que client, je télécharge une facture PDF afin de la transmettre à ma comptabilité.

**Critères d'acceptation transverses** : RGAA AA, responsive, < 2 s de chargement.
`;

const UX = `# Parcours utilisateurs & maquettes basse fidélité

## Parcours 1 — Première connexion
Écran d'accueil → SSO → Onboarding 2 écrans → Tableau de bord

## Parcours 2 — Suivi d'une commande
Tableau de bord → Carte commande → Détail (timeline de jalons) → Documents associés

## Parcours 3 — Récupération d'une facture
Menu Factures → Filtre par période → Téléchargement PDF

## Principes d'interface
- Hiérarchie claire : une action principale par écran
- États vides explicites et rassurants
- Contrastes conformes RGAA AA
`;

const DATAVERSE = `# Tables Dataverse générées

## fac_commande
| Colonne | Type | Requis |
| --- | --- | --- |
| fac_numero | Texte (20) | Oui |
| fac_compte | Recherche → Compte | Oui |
| fac_statut | Choix (Créée, Expédiée, Livrée) | Oui |
| fac_datelivraison | Date | Non |

## fac_facture
| Colonne | Type | Requis |
| --- | --- | --- |
| fac_numero | Texte (20) | Oui |
| fac_commande | Recherche → fac_commande | Oui |
| fac_montantttc | Devise | Oui |
| fac_document | Fichier | Non |

## Relations
- Compte 1—N fac_commande
- fac_commande 1—N fac_facture

Les rôles de sécurité **Client externe** (lecture sur son compte) et **Support** (lecture globale) ont été préparés.
`;

const TESTS = `# Plan de tests de recette

## Périmètre
Portail client V2 — parcours connexion, suivi de commande, téléchargement de facture.

## Cas de test
1. Connexion avec un compte valide → accès au tableau de bord
2. Connexion avec un compte révoqué → message d'erreur explicite
3. Commande en cours → jalons affichés dans le bon ordre
4. Facture émise il y a moins de 24 h → non visible
5. Navigation mobile 375 px → aucun débordement

## Critères de sortie
- 100 % des cas critiques passés
- Aucune anomalie bloquante ouverte
`;

export const ARTIFACTS_BY_ROLE: Record<RoleKey, string> = {
  BRAINSTORMING: BRAINSTORM,
  ANALYST: FAISABILITE,
  PO: EPICS,
  PM: EPICS,
  DESIGNER: UX,
  ARCHITECT: ARCHI,
  DEV: DATAVERSE,
  QA: TESTS,
};

export const DOC_NAME_BY_ROLE: Record<RoleKey, string> = {
  BRAINSTORMING: "Compte-rendu de cadrage.md",
  ANALYST: "Étude de faisabilité.md",
  PO: "Epics et user stories.md",
  PM: "Note de cadrage produit.md",
  DESIGNER: "Parcours utilisateurs.md",
  ARCHITECT: "Architecture technique.md",
  DEV: "Tables Dataverse.md",
  QA: "Plan de tests de recette.md",
};

export const SEED_DOCS = { SPEC_FONCTIONNELLES, ARCHI, FAISABILITE, BRAINSTORM, TESTS };
