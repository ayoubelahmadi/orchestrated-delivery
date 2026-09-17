# Schéma Dataverse pour Factory (mapping 1:1 avec l'UI)

Préfixe éditeur : `dvt_`. Aucune colonne Nom/Titre n'est créée : Dataverse génère la colonne primaire, on indique seulement ce qu'elle doit contenir.

## 1. Tables de référence (listes gérées en données, pas en Choice)

### Rôle — `dvt_role`
| Colonne | Nom logique | Type | Requis |
|---|---|---|---|
| Nom (primaire) | `dvt_name` | Texte 1 ligne | Oui — « Product Owner », « Analyst »… |
| Code | `dvt_code` | Choice `dvt_rolecode` : PO, PM, ANALYST, ARCHITECT, DESIGNER, DEV, QA, BRAINSTORMING | Oui |

### Type de projet — `dvt_projecttype`
Primaire = libellé (Power Platform, RPA, Fullstack). Colonne `dvt_sortorder` (Nombre entier).

### Process — `dvt_process`
| Colonne | Type | Requis |
|---|---|---|
| Nom primaire | Texte — « Standard », « Court » | Oui |
| `dvt_stagecount` | Nombre entier (5 / 4) | Non |

### Modèle d'étape — `dvt_stagetemplate`
Définit l'ordre des étapes par process (Standard : Intake→Analysis→Design→Dev→Run ; Court : Intake→Design→Dev→Run).
| Colonne | Type | Requis |
|---|---|---|
| Nom primaire | Texte — nom d'étape | Oui |
| `dvt_stagekey` | Choice `dvt_stagekey` : Intake, Analysis, Design, Dev, Run | Oui |
| `dvt_process` | Lookup → `dvt_process` | Oui |
| `dvt_order` | Nombre entier | Oui |

## 2. Acteurs

### Personne — `dvt_person`
| Colonne | Type | Requis |
|---|---|---|
| Nom primaire | Texte — nom complet | Oui |
| `dvt_jobtitle` | Texte 1 ligne | Non |
| `dvt_role` | Lookup → `dvt_role` | Oui |
| `dvt_initials` | Texte (4) | Non |
| `dvt_systemuser` | Lookup → Utilisateur (systemuser) | Non |

### Agent — `dvt_agent`
| Colonne | Type | Requis |
|---|---|---|
| Nom primaire | Texte — nom de l'agent | Oui |
| `dvt_role` | Lookup → `dvt_role` | Oui |
| `dvt_description` | Texte multiligne | Non |
| `dvt_defaultstage` | Choice `dvt_stagekey` | Non |
| `dvt_status` | Choice `dvt_agentstatus` : Actif, Bêta, Inactif | Oui |

### Étape d'agent — `dvt_agentstep`
Les étapes de raisonnement affichées dans le panneau d'exécution.
| Colonne | Type | Requis |
|---|---|---|
| Nom primaire | Texte — libellé de l'étape | Oui |
| `dvt_agent` | Lookup → `dvt_agent` | Oui |
| `dvt_order` | Nombre entier | Oui |

## 3. Demande et exécution

### Demande — `dvt_demande`
| Colonne | Type | Requis |
|---|---|---|
| Nom primaire | Texte — titre | Oui |
| `dvt_description` | Texte multiligne | Non |
| `dvt_projecttype` | Lookup → `dvt_projecttype` | Oui |
| `dvt_process` | Lookup → `dvt_process` | Oui |
| `dvt_demandeur` | Texte 1 ligne (ou Lookup Compte/Contact) | Oui |
| `dvt_priority` | Choice `dvt_priority` : Basse, Normale, Haute, Critique | Oui |
| `dvt_status` | Choice `dvt_demandestatus` : Nouvelle, En cours, Bloquée, Terminé | Oui |
| `dvt_currentstage` | Choice `dvt_stagekey` | Non |
| `dvt_squad` | Lookup → `dvt_squad` | Non |
| `dvt_daysinstage` | Nombre entier (calculé possible) | Non |
| `dvt_startedon` | Date seule | Non |

`createdon` / `modifiedon` couvrent createdAt et updatedLabel (le « il y a 2 h » se calcule côté UI).

### Étape de demande — `dvt_demandestage`
Une ligne par étape d'une demande (le stepper).
| Colonne | Type | Requis |
|---|---|---|
| Nom primaire | Texte — nom d'étape | Oui |
| `dvt_demande` | Lookup → `dvt_demande` | Oui |
| `dvt_stagekey` | Choice `dvt_stagekey` | Oui |
| `dvt_status` | Choice `dvt_stagestatus` : À faire, En cours, Terminé | Oui |
| `dvt_order` | Nombre entier | Oui |
| `dvt_startdate` / `dvt_enddate` | Date seule | Non |

### Tâche — `dvt_task`
| Colonne | Type | Requis |
|---|---|---|
| Nom primaire | Texte — titre | Oui |
| `dvt_demande` | Lookup → `dvt_demande` | Oui |
| `dvt_demandestage` | Lookup → `dvt_demandestage` | Non |
| `dvt_stagekey` | Choice `dvt_stagekey` | Oui |
| `dvt_description` | Texte multiligne | Non |
| `dvt_role` | Lookup → `dvt_role` (rôle requis) | Oui |
| `dvt_mode` | Choice `dvt_executionmode` : Agent, Personne, Both | Oui |
| `dvt_agent` | Lookup → `dvt_agent` | Non |
| `dvt_person` | Lookup → `dvt_person` | Non |
| `dvt_status` | Choice `dvt_taskstatus` : À faire, En cours, Bloquée, Terminé | Oui |
| `dvt_blockedreason` | Texte multiligne | Non |
| `dvt_livrable` | Lookup → `dvt_livrable` | Non |
| `dvt_order` | Nombre entier | Non |

### Élément de checklist — `dvt_checklistitem`
| Colonne | Type | Requis |
|---|---|---|
| Nom primaire | Texte — libellé | Oui |
| `dvt_task` | Lookup → `dvt_task` | Oui |
| `dvt_done` | Oui/Non | Oui (défaut Non) |
| `dvt_order` | Nombre entier | Non |

## 4. Squad

### Squad — `dvt_squad`
Primaire = nom de la squad. `dvt_demande` Lookup → `dvt_demande` (optionnel si squad réutilisable).

### Membre de squad — `dvt_squadmember` (table d'association enrichie)
| Colonne | Type | Requis |
|---|---|---|
| Nom primaire | Texte — auto « Rôle – Personne » | Oui |
| `dvt_squad` | Lookup → `dvt_squad` | Oui |
| `dvt_role` | Lookup → `dvt_role` | Oui |
| `dvt_person` | Lookup → `dvt_person` | Non |
| `dvt_agent` | Lookup → `dvt_agent` | Non |

Chaque slot porte un rôle + un agent + une personne : une N:N pure ne suffit pas, d'où cette table intermédiaire.

## 5. Livrables

### Livrable — `dvt_livrable`
| Colonne | Type | Requis |
|---|---|---|
| Nom primaire | Texte — nom du fichier .md | Oui |
| `dvt_demande` | Lookup → `dvt_demande` | Oui |
| `dvt_stagekey` | Choice `dvt_stagekey` | Non |
| `dvt_status` | Choice `dvt_livrablestatus` : À jour, Brouillon | Oui |
| `dvt_content` | Texte multiligne (max 100 000) | Non |
| `dvt_file` | Fichier (export .md optionnel) | Non |
| `dvt_currentversion` | Nombre entier | Non |

### Version de livrable — `dvt_livrableversion`
| Colonne | Type | Requis |
|---|---|---|
| Nom primaire | Texte — « v1 », « v2 » | Oui |
| `dvt_livrable` | Lookup → `dvt_livrable` | Oui |
| `dvt_versionnumber` | Nombre entier | Oui |
| `dvt_content` | Texte multiligne | Non |
| `dvt_authorperson` / `dvt_authoragent` | Lookup | Non |

## 6. Exécution d'agent (panneau live)

### Exécution d'agent — `dvt_agentrun`
| Colonne | Type | Requis |
|---|---|---|
| Nom primaire | Texte — auto « Agent – Tâche – horodatage » | Oui |
| `dvt_task` | Lookup → `dvt_task` | Oui |
| `dvt_agent` | Lookup → `dvt_agent` | Oui |
| `dvt_status` | Choice `dvt_runstatus` : En file, En cours, Terminé, Échec | Oui |
| `dvt_startedon` / `dvt_completedon` | Date et heure | Non |
| `dvt_progress` | Nombre entier 0–100 | Non |
| `dvt_result` | Texte multiligne (markdown produit) | Non |
| `dvt_livrable` | Lookup → `dvt_livrable` (créé à la fin) | Non |
| `dvt_triggeredby` | Lookup → `dvt_person` | Non |

### Étape de journal — `dvt_agentrunlog`
| Colonne | Type | Requis |
|---|---|---|
| Nom primaire | Texte — ligne du journal | Oui |
| `dvt_agentrun` | Lookup → `dvt_agentrun` | Oui |
| `dvt_order` | Nombre entier | Oui |
| `dvt_status` | Choice `dvt_logstatus` : En attente, En cours, Terminé | Oui |
| `dvt_timestamp` | Date et heure | Non |

### Activité — `dvt_activity`
| Colonne | Type | Requis |
|---|---|---|
| Nom primaire | Texte — texte de l'activité | Oui |
| `dvt_demande` | Lookup → `dvt_demande` | Oui |
| `dvt_kind` | Choice `dvt_activitykind` : agent, person, system | Oui |
| `dvt_occurredon` | Date et heure | Oui |

## 7. Relations (sens du lookup)

| Parent (1) | Enfant (N) — porte le lookup |
|---|---|
| `dvt_process` | `dvt_stagetemplate`, `dvt_demande` |
| `dvt_projecttype` | `dvt_demande` |
| `dvt_demande` | `dvt_demandestage`, `dvt_task`, `dvt_livrable`, `dvt_activity`, `dvt_squad` |
| `dvt_demandestage` | `dvt_task` |
| `dvt_task` | `dvt_checklistitem`, `dvt_agentrun` |
| `dvt_livrable` | `dvt_livrableversion`, `dvt_task` (lookup sur la tâche) |
| `dvt_agent` | `dvt_agentstep`, `dvt_agentrun`, `dvt_task`, `dvt_squadmember` |
| `dvt_person` | `dvt_task`, `dvt_squadmember`, `dvt_agentrun` |
| `dvt_role` | `dvt_person`, `dvt_agent`, `dvt_task`, `dvt_squadmember` |
| `dvt_squad` | `dvt_squadmember` |
| `dvt_agentrun` | `dvt_agentrunlog` |

N:N nécessaires : aucune pure. Personne↔Squad et Agent↔Squad passent par `dvt_squadmember` (rôle porté par le lien). Si vous voulez plus tard « parties prenantes » sur une demande, ce sera une vraie N:N `dvt_demande` ↔ `dvt_person`.

## 8. Mapping TypeScript → Dataverse

| Modèle TS | Champ | Table / colonne |
|---|---|---|
| Person | id / name / jobTitle / role / initials | `dvt_person` : id GUID / primaire / `dvt_jobtitle` / `dvt_role` / `dvt_initials` |
| Agent | id / name / role / description / stage / status / steps | `dvt_agent` : GUID / primaire / `dvt_role` / `dvt_description` / `dvt_defaultstage` / `dvt_status` / lignes `dvt_agentstep` |
| Demande | title / description / type / process / demandeur / priority / status / stages / squad / createdAt / updatedLabel / daysInStage | `dvt_demande` primaire / `dvt_description` / `dvt_projecttype` / `dvt_process` / `dvt_demandeur` / `dvt_priority` / `dvt_status` / lignes `dvt_demandestage` / `dvt_squad` / `createdon` / `modifiedon` / `dvt_daysinstage` |
| StageState | key / status / period | `dvt_demandestage` : `dvt_stagekey` / `dvt_status` / dérivé de `dvt_startdate`+`dvt_enddate` |
| Task | tous champs | `dvt_task` (voir §3) |
| ChecklistItem | label / done | `dvt_checklistitem` primaire / `dvt_done` |
| SquadSlot | role / agentId / personId | `dvt_squadmember` |
| Livrable | name / stage / status / content / updatedBy / versions | `dvt_livrable` + `dvt_livrableversion` |
| ActivityItem | text / at / kind | `dvt_activity` |

## 9. Champs front-end qui ne se modélisent pas tels quels

1. `updatedLabel` (« il y a 2 h ») et `StageState.period` (« 04–10 août ») : libellés d'affichage. À calculer dans l'UI depuis `modifiedon` / les dates d'étape, pas à stocker.
2. `daysInStage` : mieux en colonne calculée ou en calcul UI qu'en valeur figée.
3. `Persona` (Factory Manager, Le métier, PO…) : c'est un mode d'affichage, pas une donnée métier. Soit rôles de sécurité Dataverse, soit préférence utilisateur locale.
4. `Agent.steps` (tableau) : Dataverse n'a pas de colonne liste → table enfant `dvt_agentstep`.
5. `progressOf` / taux d'exécution IA / KPI du dashboard : agrégats calculés, pas des colonnes.
6. Contenu markdown des livrables : Texte multiligne (limite 100 000 caractères) ; au-delà, passer en colonne Fichier.
7. `initials` : dérivable du nom — gardé seulement pour l'affichage.
8. `blockedReason` libre : à transformer en Choice si vous voulez des statistiques de blocage.

## 10. Ordre de création dans le portail maker

1. Choices globaux (`dvt_stagekey`, `dvt_taskstatus`, `dvt_executionmode`, `dvt_priority`, `dvt_demandestatus`, `dvt_stagestatus`, `dvt_agentstatus`, `dvt_runstatus`, `dvt_logstatus`, `dvt_livrablestatus`, `dvt_activitykind`, `dvt_rolecode`)
2. Référentiels : Rôle, Type de projet, Process, Modèle d'étape
3. Acteurs : Personne, Agent, Étape d'agent
4. Squad, puis Membre de squad
5. Demande, Étape de demande, Livrable, Version de livrable
6. Tâche, Élément de checklist
7. Exécution d'agent, Étape de journal, Activité

Ce plan est un document de conception : aucune modification de code n'est prévue.
