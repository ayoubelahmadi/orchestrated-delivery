import { MicrosoftCopilotStudioService } from "@/generated/services/MicrosoftCopilotStudioService";
import type { Demande, Task } from "./types";

/**
 * Schema Name officiel de l'agent "Vbd Analyst" dans le Dataverse / Copilot Studio.
 * Le connecteur standard Copilot Studio exige le schemaName (new_AgentAnalyst) dans la route de l'API.
 */
export const VBD_ANALYST_NAME = "new_AgentAnalyst";
export const VBD_ANALYST_GUID = "a7c08e5e-d719-4d87-a48a-6abadcc52bf6";

export interface AnalystRunResult {
  success: boolean;
  content: string;
  source: "copilot-studio" | "simulated";
  errorMessage?: string;
}

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

    // 1. Tableau 'responses' standard de Copilot Studio
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
 * URL directe d'un Cloud Flow Power Automate (AgentFlow) pour Vbd Analyst si configuré.
 * Identique à l'implémentation de Squad Composer (COPILOT_WORKFLOW_ENDPOINT).
 * Peut être renseigné ici ou via la variable d'environnement VITE_VBD_ANALYST_WORKFLOW_ENDPOINT.
 */
export const VBD_ANALYST_WORKFLOW_ENDPOINT: string =
  (import.meta.env?.VITE_VBD_ANALYST_WORKFLOW_ENDPOINT as string) || "";

/**
 * Génère une étude de faisabilité et d'impact contextuelle complète et réaliste
 * adaptée à la demande et à la tâche sélectionnée, en attendant le branchement
 * du workflow synchrone Power Automate.
 */
export function generateContextualAnalystDeliverable(
  task: Task,
  demande: Demande,
): string {
  return `# Étude de faisabilité & Spécifications fonctionnelles — ${demande.title}

## 1. Synthèse du besoin & Objectifs
- **Projet** : ${demande.title}
- **Type de projet** : ${demande.type}
- **Processus métier cible** : ${demande.process}
- **Niveau de priorité** : ${demande.priority}
- **Description métier** : ${demande.description}
- **Tâche analysée** : ${task.title} (${task.description})

### Bénéfices opérationnels attendus
1. **Automatisation & Efficacité** : Réduction drastique des interventions manuelles et des délais de traitement.
2. **Conformité & Traçabilité** : Journalisation systématique des étapes et validation formelle des jalons.
3. **Sécurisation des données** : Isolation et cloisonnement des informations selon les règles de gouvernance de l'organisation.

---

## 2. Analyse de faisabilité technique & fonctionnelle
| Axe d'analyse | Constat & Solution cible | Complexité |
| :--- | :--- | :---: |
| **Données & Modèle** | Tables Dataverse dédiées avec relations 1:N et N:N vers les entités métier de base. Indexation optimisée. | Modéré |
| **Intégrations & Flux** | Flux Power Automate cloud asynchrones et connecteurs certifiés (Graph, Azure DevOps, SharePoint). | Standard |
| **Sécurité & Habilitations** | Rôles de sécurité Dataverse basés sur les Business Units et l'authentification Entra ID (SSO). | Faible |
| **Expérience Utilisateur** | Intégration dans la Factory VbD avec composants Fluent UI / Tailwind réactifs et support mobile. | Modéré |

---

## 3. Matrice des risques et plan d'atténuation
- **Risque 1 : Hétérogénéité des données d'entrée**
  - *Impact* : Élevé | *Probabilité* : Moyenne
  - *Plan d'atténuation* : Schématisation stricte des schémas d'entrée et validation synchrone préalable des charges utiles.
- **Risque 2 : Dépendance aux connecteurs tiers et latence réseau**
  - *Impact* : Moyen | *Probabilité* : Moyenne
  - *Plan d'atténuation* : Gestion de reprise sur erreur (retry policy exponentielle) et files d'attente découplées.
- **Risque 3 : Alignement des profils d'accès et gouvernance Power Platform**
  - *Impact* : Faible | *Probabilité* : Faible
  - *Plan d'atténuation* : Utilisation des comptes de service managés (Service Principal) pour l'exécution des flux critiques.

---

## 4. Recommandations et jalons pour l'étape suivante (Design & Architecture)
- **Charge estimée** : 3 à 5 jours-homme pour la conception détaillée et le prototypage.
- **Actions immédiates requises** :
  1. *Architecte Technique* : Valider le schéma relationnel Dataverse et la stratégie de rétention des données.
  2. *Designer UX* : Établir le wireframe de l'écran principal et la cinématique de validation humaine.
  3. *Lead Dev* : Confirmer les connecteurs et les autorisations applicatives nécessaires dans le tenant Azure/Dataverse.

---
*Livrable généré dans le cadre de la Factory Orchestrated Delivery.*`;
}

/**
 * Exécute l'agent Vbd Analyst.
 * 1. Si VBD_ANALYST_WORKFLOW_ENDPOINT est configuré (Cloud Flow / AgentFlow), l'appelle en HTTP direct.
 * 2. Tente sinon l'appel direct via ExecuteCopilotAsyncV2 / ExecuteCopilot.
 * 3. En cas d'absence de contenu textuel (caractéristique du connecteur sans webhook récepteur),
 *    génère un livrable contextuel sur mesure et documente la configuration requise.
 */
export async function executeVbdAnalyst(params: {
  task: Task;
  demande: Demande;
}): Promise<AnalystRunResult> {
  const { task, demande } = params;

  const prompt = [
    `Tu es Vbd Analyst, l'agent Business Analyst officiel de la Factory VbD.`,
    `Réalise l'analyse de faisabilité et d'impact pour la tâche suivante :`,
    `- Projet : ${demande.title}`,
    `- Type de projet : ${demande.type}`,
    `- Processus : ${demande.process}`,
    `- Priorité : ${demande.priority}`,
    `- Description du projet : ${demande.description}`,
    `- Titre de la tâche : ${task.title}`,
    `- Description de la tâche : ${task.description}`,
    ``,
    `Rédige un livrable complet en Markdown contenant obligatoirement :`,
    `# Étude de faisabilité & Spécifications fonctionnelles — ${demande.title}`,
    `## 1. Synthèse du besoin & objectifs`,
    `## 2. Analyse de faisabilité (Données, Intégrations, Sécurité, Performance)`,
    `## 3. Matrice des risques et estimation de charge`,
    `## 4. Prérequis et recommandations pour l'étape suivante (Design).`,
  ].join("\n");

  // 1. Si un workflow Power Automate (AgentFlow) direct est configuré, on l'utilise (méthode éprouvée de Squad Composer)
  if (VBD_ANALYST_WORKFLOW_ENDPOINT) {
    try {
      console.log(
        "[Vbd Analyst] Appel du workflow Power Automate :",
        VBD_ANALYST_WORKFLOW_ENDPOINT,
      );
      const wfResp = await fetch(VBD_ANALYST_WORKFLOW_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
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
          `[Vbd Analyst] Erreur HTTP ${wfResp.status} sur le workflow Power Automate`,
        );
      }
    } catch (wfErr) {
      console.warn("[Vbd Analyst] Échec de l'appel au workflow :", wfErr);
    }
  }

  // 2. Appel direct via le connecteur Copilot Studio
  try {
    console.log("[Vbd Analyst] Appel connecteur Copilot Studio :", VBD_ANALYST_NAME);

    // Tentative A : ExecuteCopilotAsyncV2
    try {
      console.log("[Vbd Analyst] Tentative ExecuteCopilotAsyncV2...");
      const v2Result = await MicrosoftCopilotStudioService.ExecuteCopilotAsyncV2(
        VBD_ANALYST_NAME,
        {
          message: prompt,
          notificationUrl: "https://notificationurlplaceholder",
        },
      );
      console.log("[Vbd Analyst] Réponse ExecuteCopilotAsyncV2 :", v2Result);
      const textV2 = extractTextFromAnyResponse(v2Result?.data);
      if (textV2 && textV2.trim().length > 0) {
        return {
          success: true,
          content: textV2.trim(),
          source: "copilot-studio",
        };
      }
    } catch (e2) {
      console.warn("[Vbd Analyst] ExecuteCopilotAsyncV2 non abouti :", e2);
    }

    // Tentative B : ExecuteCopilot synchrone
    console.log("[Vbd Analyst] Tentative ExecuteCopilot...");
    const v1Result = await MicrosoftCopilotStudioService.ExecuteCopilot(
      VBD_ANALYST_NAME,
      {
        message: prompt,
      },
    );
    console.log("[Vbd Analyst] Réponse ExecuteCopilot :", v1Result);
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
      content: generateContextualAnalystDeliverable(task, demande),
      source: "simulated",
      errorMessage: `Le connecteur Copilot Studio (${VBD_ANALYST_NAME}) a bien initié la conversation (${availableKeys}), mais sans flux Power Automate (AgentFlow) intermédiaire, l'API ne retourne pas la réponse textuelle de façon synchrone au navigateur.`,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.warn(
      "[Vbd Analyst] Appel direct Copilot Studio non abouti, bascule en mode contextuel :",
      errorMessage,
    );

    return {
      success: false,
      content: generateContextualAnalystDeliverable(task, demande),
      source: "simulated",
      errorMessage,
    };
  }
}
