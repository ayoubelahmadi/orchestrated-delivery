export interface SquadProposalItem {
  roleId: string;
  roleBusinessCode: string;
  agentId: string | null;
  personId: string | null;
  reason: string;
}

export interface SquadComposerResponse {
  status: "proposal_ready" | "needs_clarification" | "cannot_propose" | "error";
  message: string;
  proposal?: SquadProposalItem[];
  questions?: Array<{ id: string; question: string }>;
  reason?: string;
}

export const COPILOT_WORKFLOW_ENDPOINT =
  "https://e67c6d14db5ee129883d0b1213e570.f8.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/00/workflows/d78eec91dead4d29a91412b5544f6234/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=0pbZlgYiPwALjLrfjkdNHBgRuGTC73ZkZiM6tms9-ag";

/**
 * Mapping between Dataverse Agent GUIDs and local agent IDs.
 */
export const AGENT_GUID_MAP: Record<string, string> = {
  "c97e50c8-66b3-f111-aaac-7ced8d8527dd": "a-pm",
  "cc7e50c8-66b3-f111-aaac-7ced8d8527dd": "a-epics",
  "c77e50c8-66b3-f111-aaac-7ced8d8527dd": "a-analyst",
  "a7c08e5e-d719-4d87-a48a-6abadcc52bf6": "a-analyst",
  "ce7e50c8-66b3-f111-aaac-7ced8d8527dd": "a-ux",
  "d27e50c8-66b3-f111-aaac-7ced8d8527dd": "a-qa",
  "d57e50c8-66b3-f111-aaac-7ced8d8527dd": "a-dataverse",
  "bc5b9474-01ad-41a1-8593-8bcb512eb057": "a-architect",
  "a-architect": "a-architect",
};

/**
 * Appelle l'agent Squad Composer de Copilot Studio via le workflow Power Automate.
 */
export async function composeSquadWithCopilot(params: {
  title: string;
  description: string;
  type: string;
  priority: string;
  process: string;
  roles: string[];
}): Promise<SquadComposerResponse> {
  const prompt = `Compose a squad for request: Title: ${params.title}, Description: ${params.description}, Project type: ${params.type}, Priority: ${params.priority}. Selected process: ${params.process}. Required roles: ${params.roles.join(", ")}.`;

  const response = await fetch(COPILOT_WORKFLOW_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: prompt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status} retournée par le workflow.`);
  }

  const rawText = await response.text();
  try {
    return JSON.parse(rawText) as SquadComposerResponse;
  } catch {
    return {
      status: "error",
      message: rawText || "Réponse non parsable retournée par le workflow.",
    };
  }
}
