import { SEED_DOCS } from "./artifacts";
import type {
  Agent,
  Demande,
  FactoryState,
  Livrable,
  Person,
  StageKey,
  StageState,
  Task,
} from "./types";
import { STAGES_COURT, STAGES_STANDARD } from "./types";

export const people: Person[] = [
  { id: "p-sophie", name: "Sophie Martin", jobTitle: "Product Owner", role: "PO", initials: "SM" },
  { id: "p-marc", name: "Marc Lefevre", jobTitle: "Product Manager", role: "PM", initials: "ML" },
  { id: "p-karim", name: "Karim Haddad", jobTitle: "Développeur", role: "DEV", initials: "KH" },
  { id: "p-julien", name: "Julien Petit", jobTitle: "Développeur", role: "DEV", initials: "JP" },
  { id: "p-nina", name: "Nina Rousseau", jobTitle: "QA", role: "QA", initials: "NR" },
  {
    id: "p-mehdi",
    name: "Mehdi El Yassir",
    jobTitle: "Delivery Manager",
    role: "PM",
    initials: "ME",
  },
];

export const agents: Agent[] = [
  {
    id: "a-brainstorming",
    name: "Agent Brainstorming",
    role: "BRAINSTORMING",
    stage: "Intake",
    description: "Cadre le besoin initial et propose des pistes de solution.",
    status: "Actif",
    steps: [
      "Lecture de la demande et du contexte client",
      "Identification des irritants et des objectifs",
      "Génération de 6 pistes de solution",
      "Priorisation et rédaction du compte-rendu",
    ],
  },
  {
    id: "a-analyst",
    name: "Agent Analyst",
    role: "ANALYST",
    stage: "Analysis",
    description: "Qualifie les besoins et produit l'étude de faisabilité.",
    status: "Actif",
    steps: [
      "Lecture des besoins qualifiés",
      "Analyse des sources de données disponibles",
      "Évaluation de l'effort et des risques",
      "Rédaction de l'étude de faisabilité",
    ],
  },
  {
    id: "a-pm",
    name: "Agent Product Manager",
    role: "PM",
    stage: "Analysis",
    description: "Structure la vision produit et les indicateurs de succès.",
    status: "Actif",
    steps: [
      "Synthèse des objectifs métier",
      "Définition des indicateurs de succès",
      "Rédaction de la note de cadrage",
    ],
  },
  {
    id: "a-ux",
    name: "Agent UX Designer",
    role: "DESIGNER",
    stage: "Design",
    description: "Génère les parcours utilisateurs et les écrans clés.",
    status: "Actif",
    steps: [
      "Lecture des besoins qualifiés en Analysis",
      "Génération de 3 parcours utilisateurs",
      "Esquisse des écrans clés",
      "Rédaction du document de parcours",
    ],
  },
  {
    id: "a-architect",
    name: "Agent Architect",
    role: "ARCHITECT",
    stage: "Design",
    description: "Propose l'architecture applicative et les choix techniques.",
    status: "Actif",
    steps: [
      "Analyse des contraintes techniques",
      "Comparaison des options d'architecture",
      "Rédaction des décisions et des risques",
    ],
  },
  {
    id: "a-epics",
    name: "Agent Epic Stories",
    role: "PO",
    stage: "Design",
    description: "Découpe le besoin en epics et user stories prêtes à développer.",
    status: "Actif",
    steps: [
      "Lecture des spécifications fonctionnelles",
      "Découpage en epics",
      "Rédaction des user stories et critères d'acceptation",
    ],
  },
  {
    id: "a-dataverse",
    name: "Créateur de tables Dataverse",
    role: "DEV",
    stage: "Dev",
    description: "Génère le modèle de données Dataverse et les rôles de sécurité.",
    status: "Actif",
    steps: [
      "Lecture du modèle de données cible",
      "Génération des tables et colonnes",
      "Création des relations",
      "Préparation des rôles de sécurité",
    ],
  },
  {
    id: "a-qa",
    name: "Agent QA",
    role: "QA",
    stage: "Run",
    description: "Construit le plan de recette et les cas de test.",
    status: "Bêta",
    steps: [
      "Lecture des critères d'acceptation",
      "Génération des cas de test",
      "Définition des critères de sortie",
    ],
  },
];

function stages(list: StageKey[], currentIndex: number, periods: string[]): StageState[] {
  return list.map((key, i) => ({
    key,
    status: i < currentIndex ? "Terminé" : i === currentIndex ? "En cours" : "À faire",
    period: periods[i] ?? "à venir",
  }));
}

const squadStandard = [
  { role: "PO" as const, agentId: "a-epics", personId: "p-sophie" },
  { role: "PM" as const, agentId: "a-pm", personId: "p-marc" },
  { role: "ANALYST" as const, agentId: "a-analyst", personId: "p-karim" },
  { role: "DEV" as const, agentId: "a-dataverse", personId: "p-julien" },
  { role: "QA" as const, agentId: "a-qa", personId: "p-nina" },
];

export const demandes: Demande[] = [
  {
    id: "d-portail",
    title: "Portail client V2",
    description:
      "Créer un portail permettant aux clients de suivre leurs commandes et factures en libre-service.",
    type: "Power Platform",
    process: "Standard",
    demandeur: "Client A",
    priority: "Haute",
    status: "En cours",
    stages: stages(STAGES_STANDARD, 2, ["01–03 août", "04–10 août", "depuis le 11 août"]),
    squad: squadStandard,
    createdAt: "01/08/2026",
    updatedLabel: "il y a 2 h",
    daysInStage: 4,
  },
  {
    id: "d-reporting",
    title: "Module reporting RH",
    description: "Tableaux de bord RH consolidés pour la direction des ressources humaines.",
    type: "Power Platform",
    process: "Standard",
    demandeur: "Direction RH",
    priority: "Normale",
    status: "Bloquée",
    stages: stages(STAGES_STANDARD, 2, ["02–05 août", "06–12 août", "depuis le 13 août"]),
    squad: squadStandard,
    createdAt: "02/08/2026",
    updatedLabel: "il y a 1 j",
    daysInStage: 1,
  },
  {
    id: "d-collab",
    title: "Espace collaborateur Fullstack",
    description: "Application interne de gestion des demandes collaborateurs.",
    type: "Fullstack",
    process: "Standard",
    demandeur: "Direction interne",
    priority: "Haute",
    status: "Bloquée",
    stages: stages(STAGES_STANDARD, 3, [
      "10–12 juillet",
      "13–20 juillet",
      "21–30 juillet",
      "depuis le 01 août",
    ]),
    squad: [
      { role: "PO", agentId: "a-epics", personId: "p-sophie" },
      { role: "ANALYST", agentId: "a-analyst", personId: "p-karim" },
      { role: "DEV", agentId: "a-dataverse", personId: "p-julien" },
      { role: "QA", agentId: "a-qa", personId: "p-nina" },
    ],
    createdAt: "10/07/2026",
    updatedLabel: "il y a 4 h",
    daysInStage: 6,
  },
  {
    id: "d-import",
    title: "Automatisation import données",
    description: "Robot d'import quotidien des flux fournisseurs dans l'ERP.",
    type: "RPA",
    process: "Court",
    demandeur: "Direction achats",
    priority: "Normale",
    status: "Bloquée",
    stages: stages(STAGES_COURT, 1, ["05–06 août", "depuis le 07 août"]),
    squad: [
      { role: "ANALYST", agentId: "a-analyst", personId: "p-karim" },
      { role: "DEV", agentId: "a-dataverse", personId: "p-julien" },
      { role: "QA", agentId: "a-qa", personId: "p-nina" },
    ],
    createdAt: "05/08/2026",
    updatedLabel: "il y a 6 h",
    daysInStage: 3,
  },
  {
    id: "d-facturation",
    title: "Correctif urgent facturation",
    description: "Correction du calcul de TVA sur les avoirs fournisseurs.",
    type: "RPA",
    process: "Court",
    demandeur: "Direction financière",
    priority: "Critique",
    status: "Terminé",
    stages: stages(STAGES_COURT, 4, ["12 juillet", "13 juillet", "14–16 juillet", "17 juillet"]),
    squad: [
      { role: "DEV", agentId: "a-dataverse", personId: "p-julien" },
      { role: "QA", agentId: "a-qa", personId: "p-nina" },
    ],
    createdAt: "12/07/2026",
    updatedLabel: "il y a 3 j",
    daysInStage: 0,
  },
  {
    id: "d-erp",
    title: "Connecteur ERP Achats",
    description: "Connecteur temps réel entre la plateforme achats et l'ERP groupe.",
    type: "Power Platform",
    process: "Standard",
    demandeur: "Direction achats",
    priority: "Normale",
    status: "En cours",
    stages: stages(STAGES_STANDARD, 1, ["08–09 août", "depuis le 10 août"]),
    squad: squadStandard,
    createdAt: "08/08/2026",
    updatedLabel: "il y a 1 j",
    daysInStage: 2,
  },
  {
    id: "d-intranet",
    title: "Refonte intranet RH",
    description: "Cadrage du besoin et priorisation initiale de la refonte de l'intranet RH.",
    type: "Fullstack",
    process: "Standard",
    demandeur: "Direction RH",
    priority: "Basse",
    status: "Nouvelle",
    stages: stages(STAGES_STANDARD, 0, ["depuis le 14 août"]),
    squad: [
      { role: "PO", agentId: "a-epics", personId: "p-sophie" },
      { role: "ANALYST", agentId: "a-analyst", personId: "p-karim" },
    ],
    createdAt: "14/08/2026",
    updatedLabel: "il y a 1 j",
    daysInStage: 1,
  },
];

interface TaskSeed {
  stage: StageKey;
  title: string;
  description: string;
  role: Task["role"];
  mode: Task["mode"];
  status: Task["status"];
  checklist: string[];
  checked?: number | undefined;
  blockedReason?: string | undefined;
  livrableId?: string | undefined;
}

const portailTasks: TaskSeed[] = [
  {
    stage: "Intake",
    title: "Qualifier la demande",
    description: "Recueillir le besoin auprès du demandeur et vérifier l'éligibilité au process.",
    role: "PO",
    mode: "Personne",
    status: "Terminé",
    checklist: ["Entretien demandeur", "Fiche besoin complétée"],
    checked: 2,
  },
  {
    stage: "Intake",
    title: "Brainstorming initial",
    description: "Explorer les pistes de solution et cadrer le périmètre de la V1.",
    role: "BRAINSTORMING",
    mode: "Agent",
    status: "Terminé",
    checklist: ["Pistes générées", "Compte-rendu validé"],
    checked: 2,
    livrableId: "l-intake",
  },
  {
    stage: "Analysis",
    title: "Analyse des besoins",
    description: "Formaliser les besoins fonctionnels et les règles de gestion.",
    role: "ANALYST",
    mode: "Both",
    status: "Terminé",
    checklist: ["Besoins qualifiés", "Règles de gestion validées"],
    checked: 2,
  },
  {
    stage: "Analysis",
    title: "Étude de faisabilité",
    description: "Évaluer la faisabilité technique, l'effort et les risques.",
    role: "ANALYST",
    mode: "Agent",
    status: "Terminé",
    checklist: ["Sources de données vérifiées", "Effort estimé"],
    checked: 2,
    livrableId: "l-faisa",
  },
  {
    stage: "Design",
    title: "Conception fonctionnelle",
    description:
      "Rédiger les spécifications fonctionnelles du portail client : parcours de connexion, tableau de bord des commandes et espace de suivi des factures. Le résultat attendu est un document de spécifications validé par le PO.",
    role: "DESIGNER",
    mode: "Both",
    status: "En cours",
    checklist: [
      "Cartographie des parcours utilisateurs générée",
      "Maquettes basse fidélité des écrans clés",
      "Validation du document par le PO",
    ],
    checked: 1,
    livrableId: "l-spec",
  },
  {
    stage: "Design",
    title: "Conception technique",
    description: "Architecture applicative et choix des composants Power Platform.",
    role: "ARCHITECT",
    mode: "Both",
    status: "À faire",
    checklist: ["Options d'architecture comparées", "Décisions documentées"],
  },
  {
    stage: "Dev",
    title: "Création des tables Dataverse",
    description: "Générer le modèle de données et les rôles de sécurité associés.",
    role: "DEV",
    mode: "Agent",
    status: "À faire",
    checklist: ["Tables créées", "Relations créées", "Rôles de sécurité préparés"],
  },
  {
    stage: "Dev",
    title: "Revue de code",
    description: "Relecture croisée des composants livrés et des flux Power Automate.",
    role: "DEV",
    mode: "Personne",
    status: "À faire",
    checklist: ["Revue effectuée", "Retours traités"],
  },
  {
    stage: "Run",
    title: "Déploiement",
    description: "Déploiement en production et bascule progressive des comptes clients.",
    role: "DEV",
    mode: "Personne",
    status: "À faire",
    checklist: ["Solution exportée", "Déploiement réalisé"],
  },
  {
    stage: "Run",
    title: "Tests de recette",
    description: "Exécuter le plan de recette et statuer sur les critères de sortie.",
    role: "QA",
    mode: "Both",
    status: "À faire",
    checklist: ["Plan de tests généré", "Cas critiques exécutés"],
  },
];

function tasksFor(demandeId: string, seeds: TaskSeed[]): Task[] {
  const demande = demandes.find((d) => d.id === demandeId)!;
  return seeds.map((seed, i) => {
    const slot = demande.squad.find((s) => s.role === seed.role);
    return {
      id: `${demandeId}-t${i + 1}`,
      demandeId,
      stage: seed.stage,
      title: seed.title,
      description: seed.description,
      role: seed.role,
      mode: seed.mode,
      agentId:
        seed.mode === "Personne"
          ? undefined
          : (slot?.agentId ?? agents.find((a) => a.role === seed.role)?.id),
      personId:
        seed.mode === "Agent"
          ? undefined
          : (slot?.personId ?? people.find((p) => p.role === seed.role)?.id),
      checklist: seed.checklist.map((label, j) => ({
        id: `${demandeId}-t${i + 1}-c${j + 1}`,
        label,
        done: j < (seed.checked ?? 0),
      })),
      status: seed.status,
      blockedReason: seed.blockedReason,
      livrableId: seed.livrableId,
    };
  });
}

function genericSeeds(
  current: StageKey,
  blocked?: { title: string; reason: string },
  done: StageKey[] = [],
): TaskSeed[] {
  const base: Record<StageKey, TaskSeed[]> = {
    Intake: [
      {
        stage: "Intake",
        title: "Qualifier la demande",
        description: "Recueillir le besoin et cadrer le périmètre initial.",
        role: "PO",
        mode: "Personne",
        status: "À faire",
        checklist: ["Entretien demandeur", "Fiche besoin complétée"],
      },
      {
        stage: "Intake",
        title: "Brainstorming initial",
        description: "Explorer les pistes de solution avec l'agent dédié.",
        role: "BRAINSTORMING",
        mode: "Agent",
        status: "À faire",
        checklist: ["Pistes générées", "Compte-rendu partagé"],
      },
    ],
    Analysis: [
      {
        stage: "Analysis",
        title: "Étude de faisabilité",
        description: "Évaluer la faisabilité, l'effort et les risques du besoin.",
        role: "ANALYST",
        mode: "Agent",
        status: "À faire",
        checklist: ["Sources de données vérifiées", "Effort estimé"],
      },
    ],
    Design: [
      {
        stage: "Design",
        title: "Conception fonctionnelle",
        description: "Rédiger les spécifications fonctionnelles attendues.",
        role: "DESIGNER",
        mode: "Both",
        status: "À faire",
        checklist: ["Parcours générés", "Document validé"],
      },
      {
        stage: "Design",
        title: "Conception technique",
        description: "Définir l'architecture et les composants retenus.",
        role: "ARCHITECT",
        mode: "Both",
        status: "À faire",
        checklist: ["Architecture arbitrée", "Risques documentés"],
      },
    ],
    Dev: [
      {
        stage: "Dev",
        title: "Développement",
        description: "Réaliser les composants et les flux de la solution.",
        role: "DEV",
        mode: "Both",
        status: "À faire",
        checklist: ["Composants livrés", "Tests unitaires passés"],
      },
      {
        stage: "Dev",
        title: "Revue de code",
        description: "Relecture croisée avant passage en Run.",
        role: "DEV",
        mode: "Personne",
        status: "À faire",
        checklist: ["Revue effectuée", "Retours traités"],
      },
    ],
    Run: [
      {
        stage: "Run",
        title: "Déploiement",
        description: "Mise en production et surveillance initiale.",
        role: "DEV",
        mode: "Personne",
        status: "À faire",
        checklist: ["Déploiement réalisé", "Supervision active"],
      },
      {
        stage: "Run",
        title: "Tests de recette",
        description: "Exécuter le plan de recette et statuer sur la sortie.",
        role: "QA",
        mode: "Both",
        status: "À faire",
        checklist: ["Plan de tests généré", "Cas critiques exécutés"],
      },
    ],
  };

  const order: StageKey[] = ["Intake", "Analysis", "Design", "Dev", "Run"];
  const seeds: TaskSeed[] = [];
  for (const stage of order) {
    if (stage !== current && !done.includes(stage)) continue;
    for (const seed of base[stage]) {
      const isDone = done.includes(stage);
      seeds.push({
        ...seed,
        status: isDone
          ? "Terminé"
          : blocked && seed.title === blocked.title
            ? "Bloquée"
            : seed.status,
        checked: isDone ? seed.checklist.length : 0,
        blockedReason: blocked && seed.title === blocked.title ? blocked.reason : undefined,
      });
    }
  }
  return seeds;
}

export const livrables: Livrable[] = [
  {
    id: "l-spec",
    demandeId: "d-portail",
    name: "Spécifications fonctionnelles.md",
    stage: "Design",
    status: "À jour",
    content: SEED_DOCS.SPEC_FONCTIONNELLES,
    updatedLabel: "il y a 2 h",
    updatedBy: "Sophie Martin",
    versions: [
      {
        version: 1,
        at: "il y a 1 j",
        by: "Agent UX Designer",
        content: SEED_DOCS.SPEC_FONCTIONNELLES,
      },
    ],
  },
  {
    id: "l-archi",
    demandeId: "d-portail",
    name: "Architecture technique.md",
    stage: "Design",
    status: "Brouillon",
    content: SEED_DOCS.ARCHI,
    updatedLabel: "il y a 1 j",
    updatedBy: "Agent Architect",
    versions: [],
  },
  {
    id: "l-faisa",
    demandeId: "d-portail",
    name: "Étude de faisabilité.md",
    stage: "Analysis",
    status: "À jour",
    content: SEED_DOCS.FAISABILITE,
    updatedLabel: "il y a 2 sem.",
    updatedBy: "Agent Analyst",
    versions: [],
  },
  {
    id: "l-intake",
    demandeId: "d-portail",
    name: "Compte-rendu Intake.md",
    stage: "Intake",
    status: "À jour",
    content: SEED_DOCS.BRAINSTORM,
    updatedLabel: "il y a 3 sem.",
    updatedBy: "Agent Brainstorming",
    versions: [],
  },
  {
    id: "l-tests",
    demandeId: "d-portail",
    name: "Plan de tests de recette.md",
    stage: "Run",
    status: "Brouillon",
    content: SEED_DOCS.TESTS,
    updatedLabel: "il y a 5 j",
    updatedBy: "Agent QA",
    versions: [],
  },
];

export const tasks: Task[] = [
  ...tasksFor("d-portail", portailTasks),
  ...tasksFor(
    "d-reporting",
    genericSeeds(
      "Design",
      { title: "Conception technique", reason: "En attente de validation architecture" },
      ["Intake", "Analysis"],
    ),
  ),
  ...tasksFor(
    "d-collab",
    genericSeeds("Dev", { title: "Développement", reason: "Accès environnement de prod manquant" }, [
      "Intake",
      "Analysis",
      "Design",
    ]),
  ),
  ...tasksFor(
    "d-import",
    genericSeeds("Design", { title: "Conception fonctionnelle", reason: "En attente de retour QA" }, [
      "Intake",
    ]),
  ),
  ...tasksFor("d-facturation", genericSeeds("Run", undefined, ["Intake", "Design", "Dev", "Run"])),
  ...tasksFor("d-erp", genericSeeds("Analysis", undefined, ["Intake"])),
  ...tasksFor("d-intranet", genericSeeds("Intake")),
];

export const activity: FactoryState["activity"] = [
  {
    id: "act-1",
    demandeId: "d-portail",
    text: "Étape Design démarrée.",
    at: "il y a 1 j",
    kind: "system",
  },
  {
    id: "act-2",
    demandeId: "d-portail",
    text: "Tâche « Étude de faisabilité » terminée par Agent Analyst.",
    at: "il y a 1 j",
    kind: "agent",
  },
  {
    id: "act-3",
    demandeId: "d-portail",
    text: "Étape Analysis marquée terminée par Sophie Martin.",
    at: "il y a 4 j",
    kind: "person",
  },
];

export function seedState(): FactoryState {
  return {
    people,
    agents,
    demandes: structuredClone(demandes),
    tasks: structuredClone(tasks),
    livrables: structuredClone(livrables),
    activity: structuredClone(activity),
  };
}
