import { MicrosoftCopilotStudioService } from "@/generated/services/MicrosoftCopilotStudioService";
import type { Demande, Livrable, Task } from "./types";

/**
 * Schema Name officiel de l'agent "VbD Architect" dans le Dataverse / Copilot Studio.
 * Provient de la solution VbD_Architecture (cr27c_VbDArchitecture).
 */
export const VBD_ARCHITECT_NAME = "cr27c_VbDArchitecture";
export const VBD_ARCHITECT_GUID = "bc5b9474-01ad-41a1-8593-8bcb512eb057";

export interface ArchitectRunResult {
  success: boolean;
  content: string;
  source: "copilot-studio" | "simulated";
  errorMessage?: string;
}

/**
 * URL directe d'un Cloud Flow Power Automate si configuré en secours.
 */
export const VBD_ARCHITECT_WORKFLOW_ENDPOINT: string =
  (import.meta.env?.["VITE_VBD_ARCHITECT_WORKFLOW_ENDPOINT"] as string) ||
  "https://e67c6d14db5ee129883d0b1213e570.f8.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/25/workflows/81f9ddaeec55488fabe3791791407688/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=7TVutyqY8t0vLGIpgCKVPFDOeGPZxMolhVVj4me2zOg";

/**
 * Extrait récursivement le texte de la réponse retournée par Copilot Studio.
 * Copilot Studio peut renvoyer du texte dans :
 * - `responses` (tableau de chaînes retourné par ExecuteCopilotAsync)
 * - `response`, `message`, `text`, `content`
 * - `activities` (format Bot Framework)
 */
function extractTextFromAnyResponse(data: unknown): string {
  if (!data) return "";
  if (typeof data === "string") return data.trim();

  if (Array.isArray(data)) {
    return data
      .map(extractTextFromAnyResponse)
      .filter((s) => s.trim().length > 0)
      .join("\n\n");
  }

  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;

    // 1. Tableau 'responses' standard de Copilot Studio (ExecuteCopilotAsyncV2)
    const respList = obj["responses"];
    if (Array.isArray(respList) && respList.length > 0) {
      const joined = respList
        .map((item) => (typeof item === "string" ? item.trim() : extractTextFromAnyResponse(item)))
        .filter((s) => s.length > 0)
        .join("\n\n");
      if (joined.length > 0) return joined;
    }

    // 2. Propriétés textuelles directes
    const candidates = [
      obj["response"],
      obj["message"],
      obj["text"],
      obj["content"],
      obj["output"],
      obj["result"],
      obj["reply"],
    ];

    for (const val of candidates) {
      if (typeof val === "string" && val.trim().length > 0) {
        return val.trim();
      }
      if (Array.isArray(val) && val.length > 0) {
        const text = extractTextFromAnyResponse(val);
        if (text.length > 0) return text;
      }
    }

    // 3. Structure d'activités Bot Framework
    const activities = obj["activities"];
    if (Array.isArray(activities)) {
      const actText = activities
        .map((act) => {
          if (typeof act === "object" && act !== null) {
            const actObj = act as Record<string, unknown>;
            if (typeof actObj["text"] === "string") return actObj["text"].trim();
          }
          return "";
        })
        .filter((s) => s.length > 0)
        .join("\n\n");
      if (actText.length > 0) return actText;
    }

    // 4. Recherche de toute chaîne substantielle non technique
    for (const [key, val] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (
        typeof val === "string" &&
        val.trim().length > 30 &&
        !lowerKey.includes("id") &&
        !lowerKey.includes("url") &&
        !lowerKey.includes("token")
      ) {
        return val.trim();
      }
    }
  }

  return "";
}

/**
 * Génère un document d'architecture technique contextuel complet en Markdown
 * adapté à la demande et à la tâche sélectionnée.
 */
export function generateContextualArchitectDeliverable(
  task: Task,
  demande: Demande,
  upstreamLivrables: Livrable[] = [],
): string {
  const prdOrAnalysis = upstreamLivrables.find(
    (l) => l.name.toLowerCase().includes("faisabilit") || l.name.toLowerCase().includes("spécification"),
  );

  return `# Architecture Technique — ${demande.title}

## 1. Vue d'ensemble de la solution
- **Projet** : ${demande.title}
- **Type de solution cible** : ${demande.type} (Power Platform / Azure)
- **Processus métier** : ${demande.process}
- **Criticité & Priorité** : ${demande.priority}
- **Objectif de l'architecture** : Définir le socle technique, les composants d'intégration et les règles de gouvernance pour l'implémentation de la solution.

${prdOrAnalysis ? `> **Alignement amont** : Cette architecture s'appuie sur le livrable « ${prdOrAnalysis.name} » validé lors de la phase précédente.` : ""}

---

## 2. Cartographie des composants cibles
| Composant | Technologie retenue | Rôle fonctionnel & technique |
| :--- | :--- | :--- |
| **Couche Présentation** | Power Apps (Model-Driven / Canvas) | Interface utilisateur réactive pour les opérationnels et validateurs |
| **Couche Données** | Microsoft Dataverse | Stockage relationnel sécurisé, audit trail et règles métier natives |
| **Couche Intégration** | Power Automate Cloud Flows | Orchestration asynchrone des flux de données et déclencheurs automatisés |
| **Sécurité & IAM** | Microsoft Entra ID + Rôles Dataverse | Authentification unique (SSO) et contrôle d'accès granulaire (RBAC) |
| **Gouvernance & ALM** | Solutions gérées Dataverse + GitHub/Azure DevOps | Gestion du cycle de vie des applications et pipelines de déploiement |

---

## 3. Modèle de données & Tables Dataverse
### Entités principales et relations
1. **Entité principale du projet** (\`dvt_${demande.title.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 15)}\`)
   - Identifiant unique (Primary Key, GUID)
   - Statut métier (OptionSet / Choice)
   - Propriétaire de la demande (Lookup SystemUser / Team)
   - Horodatage et traçabilité de révision
2. **Entités secondaires & référentiels associés**
   - Tables de correspondance pour la catégorisation
   - Relations 1:N pour l'historique des actions et commentaires
   - Stockage des pièces jointes via la table native Annotations ou SharePoint Document Library

---

## 4. Stratégie d'intégration et Connecteurs
- **Connecteurs standards mobilisés** :
  - *Microsoft Dataverse* (déclencheurs sur ajout/modification/suppression)
  - *Office 365 Outlook* pour les notifications contextuelles et rappels d'échéance
  - *SharePoint* pour la gestion et l'archivage documentaire
- **Gestion des flux asynchrones & robustesse** :
  - Politique de retry exponentielle sur les flux Power Automate
  - Gestion centralisée des exceptions avec notification des administrateurs
  - Utilisation de connexions avec Principal de service (Service Principal)

---

## 5. Matrice des décisions d'architecture (ADR)
| Sujet | Décision adoptée | Rationale & Bénéfice |
| :--- | :--- | :--- |
| **Stockage principal** | Dataverse standard | Cohérence avec le tenant et sécurité au niveau ligne native |
| **Exposition des API** | Connecteurs personnalisés sécurisés OAuth 2.0 | Pas de secrets codés en dur, conformité Entra ID |
| **Environnement cible** | Solution Power Platform managée | Déploiement automatisé sans altération manuelle en production |

---

## 6. Prérequis et consignes pour l'étape Développement (Makers)
1. **Provisionnement des tables** : Créer les entités Dataverse avec le préfixe de solution validé.
2. **Habilitations** : Déployer le rôle de sécurité de base avant le début de la configuration des formulaires.
3. **Composants d'interface** : Respecter les conventions de nommage et le guide de style Fluent UI.

---
*Document d'architecture généré par l'agent Solution Architect VbD Factory.*`;
}

/**
 * Exécute l'agent VbD Architect via Copilot Studio (ExecuteCopilotAsyncV2).
 * 1. Si VBD_ARCHITECT_WORKFLOW_ENDPOINT est configuré (Cloud Flow / AgentFlow), l'appelle en HTTP direct.
 * 2. Tente sinon l'appel direct via ExecuteCopilotAsyncV2 / ExecuteCopilot.
 * 3. En cas d'absence de contenu textuel (caractéristique du connecteur sans webhook récepteur),
 *    génère un livrable contextuel sur mesure et documente la configuration requise.
 */
export async function executeVbdArchitect(params: {
  task: Task;
  demande: Demande;
  upstreamLivrables?: Livrable[];
}): Promise<ArchitectRunResult> {
  const { task, demande, upstreamLivrables = [] } = params;

  // Préparation du contexte amont (ex: spécifications ou étude de faisabilité préalable)
  const prdOrAnalysis = upstreamLivrables.find(
    (l) => l.name.toLowerCase().includes("faisabilit") || l.name.toLowerCase().includes("spécification"),
  );
  const upstreamContext = prdOrAnalysis
    ? `Livrable d'analyse amont (« ${prdOrAnalysis.name} ») :\n${prdOrAnalysis.content.slice(0, 1500)}`
    : "";

  const prompt = [
    `Tu es VbD Architect, l'agent Solution Architect officiel de la Factory VbD.`,
    `Génère directement le document d'architecture technique complet en Markdown pour le projet suivant, en un seul message, sans poser de question préalable ni demander de confirmation :`,
    `- Projet : ${demande.title}`,
    `- Type de projet : ${demande.type}`,
    `- Processus : ${demande.process}`,
    `- Priorité : ${demande.priority}`,
    `- Description du besoin : ${demande.description}`,
    `- Titre de la tâche : ${task.title}`,
    `- Description de la tâche : ${task.description}`,
    upstreamContext ? `\n${upstreamContext}` : "",
    ``,
    `Rédige un document d'architecture technique complet et structuré en Markdown contenant :`,
    `# Architecture Technique & Spécifications — ${demande.title}`,
    `## 1. Vue d'ensemble de la solution & composants cibles (Power Apps, Dataverse, Power Automate)`,
    `## 2. Modèle de données & stockage (Tables Dataverse, Entités, Relations)`,
    `## 3. Stratégie d'intégration & Connecteurs (Flux Power Automate, API, Sécurité)`,
    `## 4. Sécurité, Habilitations & Authentification (Entra ID, Rôles Dataverse)`,
    `## 5. Décisions d'architecture (ADR) et matrice des risques techniques`,
    `## 6. Prérequis et recommandations pour l'étape Développement (Makers).`,
  ].filter(Boolean).join("\n");

  // 1. Si un endpoint de workflow spécifique est configuré (Power Automate AgentFlow)
  if (VBD_ARCHITECT_WORKFLOW_ENDPOINT) {
    try {
      console.log(
        "[VbD Architect] Appel via le workflow Power Automate :",
        VBD_ARCHITECT_WORKFLOW_ENDPOINT,
      );
      const wfResp = await fetch(VBD_ARCHITECT_WORKFLOW_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: VBD_ARCHITECT_NAME,
          message: prompt,
          prompt,
          text: prompt,
        }),
      });

      if (wfResp.ok) {
        const raw = await wfResp.text();
        let extracted = "";
        try {
          const json = JSON.parse(raw);
          extracted =
            extractTextFromAnyResponse(json) ||
            (typeof json === "string" ? json : "");
        } catch {
          extracted = raw;
        }
        if (extracted.trim().length > 0) {
          return {
            success: true,
            content: extracted.trim(),
            source: "copilot-studio",
          };
        }
      } else {
        console.warn(
          `[VbD Architect] Erreur HTTP ${wfResp.status} sur le workflow Power Automate`,
        );
      }
    } catch (wfErr) {
      console.warn("[VbD Architect] Échec du workflow :", wfErr);
    }
  }

  // 2. Appel direct via le connecteur Copilot Studio
  try {
    console.log("[VbD Architect] Appel connecteur Copilot Studio :", VBD_ARCHITECT_NAME);

    // Tentative A : ExecuteCopilotAsyncV2
    try {
      console.log("[VbD Architect] Tentative ExecuteCopilotAsyncV2...");
      const v2Result = await MicrosoftCopilotStudioService.ExecuteCopilotAsyncV2(
        VBD_ARCHITECT_NAME,
        {
          message: prompt,
          notificationUrl: "https://notificationurlplaceholder",
        },
      );
      console.log("[VbD Architect] Réponse ExecuteCopilotAsyncV2 :", v2Result);
      console.log(
        "[VbD Architect] Structure complète v2Result.data:",
        JSON.stringify(v2Result?.data, null, 2),
      );
      const textV2 = extractTextFromAnyResponse(v2Result?.data);
      if (textV2 && textV2.trim().length > 0) {
        return {
          success: true,
          content: textV2.trim(),
          source: "copilot-studio",
        };
      }
    } catch (e2) {
      console.warn("[VbD Architect] ExecuteCopilotAsyncV2 non abouti :", e2);
    }

    // Tentative B : ExecuteCopilot synchrone
    console.log("[VbD Architect] Tentative ExecuteCopilot...");
    const v1Result = await MicrosoftCopilotStudioService.ExecuteCopilot(
      VBD_ARCHITECT_NAME,
      {
        message: prompt,
      },
    );
    console.log("[VbD Architect] Réponse ExecuteCopilot :", v1Result);
    console.log(
      "[VbD Architect] Structure complète v1Result.data:",
      JSON.stringify(v1Result?.data, null, 2),
    );
    const textV1 = extractTextFromAnyResponse(v1Result?.data);
    if (textV1 && textV1.trim().length > 0) {
      return {
        success: true,
        content: textV1.trim(),
        source: "copilot-studio",
      };
    }

    // Le connecteur direct a répondu (ex: ConversationId), mais l'API Copilot Studio
    // ne renvoie pas le texte du bot dans la réponse HTTP sans callback webhook (AgentFlow).
    const availableKeys =
      v1Result && v1Result.data ? Object.keys(v1Result.data).join(", ") : "aucun";

    return {
      success: false,
      content: generateContextualArchitectDeliverable(task, demande, upstreamLivrables),
      source: "simulated",
      errorMessage: `Le connecteur Copilot Studio (${VBD_ARCHITECT_NAME}) a bien initié la conversation (${availableKeys}), mais sans flux Power Automate (AgentFlow) intermédiaire, l'API ne retourne pas la réponse textuelle de façon synchrone au navigateur.`,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.warn(
      "[VbD Architect] Appel direct Copilot Studio non abouti, bascule en mode contextuel :",
      errorMessage,
    );

    return {
      success: false,
      content: generateContextualArchitectDeliverable(task, demande, upstreamLivrables),
      source: "simulated",
      errorMessage,
    };
  }
}
