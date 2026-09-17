export type ProjectType = "Power Platform" | "RPA" | "Fullstack";
export type ProcessKind = "Standard" | "Court";
export type StageKey = "Intake" | "Analysis" | "Design" | "Dev" | "Run";
export type StageStatus = "À faire" | "En cours" | "Terminé";
export type TaskStatus = "À faire" | "En cours" | "Bloquée" | "Terminé";
export type ExecutionMode = "Agent" | "Personne" | "Both";
export type DemandeStatus = "En cours" | "Bloquée" | "Terminé" | "Nouvelle";
export type Priority = "Basse" | "Normale" | "Haute" | "Critique";
export type RoleKey =
  | "PO"
  | "PM"
  | "ANALYST"
  | "ARCHITECT"
  | "DESIGNER"
  | "DEV"
  | "QA"
  | "BRAINSTORMING";

export type Persona =
  | "Factory Manager"
  | "Le métier"
  | "PO"
  | "PM"
  | "Dev"
  | "QA"
  | "Validateur";

export interface Person {
  id: string;
  name: string;
  jobTitle: string;
  role: RoleKey;
  initials: string;
}

export interface Agent {
  id: string;
  name: string;
  role: RoleKey;
  description: string;
  stage: StageKey;
  status: "Actif" | "Bêta" | "Inactif";
  steps: string[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface Task {
  id: string;
  demandeId: string;
  stage: StageKey;
  title: string;
  description: string;
  role: RoleKey;
  mode: ExecutionMode;
  agentId?: string | undefined;
  personId?: string | undefined;
  checklist: ChecklistItem[];
  status: TaskStatus;
  blockedReason?: string | undefined;
  livrableId?: string | undefined;
}

export interface StageState {
  key: StageKey;
  status: StageStatus;
  period: string;
}

export interface SquadSlot {
  role: RoleKey;
  agentId?: string | undefined;
  personId?: string | undefined;
}

export interface Demande {
  id: string;
  title: string;
  description: string;
  type: ProjectType;
  process: ProcessKind;
  demandeur: string;
  priority: Priority;
  status: DemandeStatus;
  stages: StageState[];
  squad: SquadSlot[];
  createdAt: string;
  updatedLabel: string;
  daysInStage: number;
}

export interface LivrableVersion {
  version: number;
  at: string;
  by: string;
  content: string;
}

export interface Livrable {
  id: string;
  demandeId: string;
  name: string;
  stage: StageKey;
  status: "À jour" | "Brouillon";
  content: string;
  updatedLabel: string;
  updatedBy: string;
  versions: LivrableVersion[];
}

export interface ActivityItem {
  id: string;
  demandeId: string;
  text: string;
  at: string;
  kind: "agent" | "person" | "system";
}

export interface FactoryState {
  people: Person[];
  agents: Agent[];
  demandes: Demande[];
  tasks: Task[];
  livrables: Livrable[];
  activity: ActivityItem[];
}

export const STAGES_STANDARD: StageKey[] = ["Intake", "Analysis", "Design", "Dev", "Run"];
export const STAGES_COURT: StageKey[] = ["Intake", "Design", "Dev", "Run"];

export const ROLE_LABELS: Record<RoleKey, string> = {
  PO: "Product Owner",
  PM: "Product Manager",
  ANALYST: "Analyst",
  ARCHITECT: "Architecte",
  DESIGNER: "UX Designer",
  DEV: "Dev",
  QA: "QA",
  BRAINSTORMING: "Brainstorming",
};
