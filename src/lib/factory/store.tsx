import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { ARTIFACTS_BY_ROLE, DOC_NAME_BY_ROLE } from "./artifacts";
import { seedState } from "./data";
import type {
  Demande,
  FactoryState,
  Livrable,
  Persona,
  Priority,
  ProcessKind,
  ProjectType,
  StageKey,
  Task,
} from "./types";
import { STAGES_COURT, STAGES_STANDARD } from "./types";

export interface NewDemandeInput {
  title: string;
  description: string;
  type: ProjectType;
  process: ProcessKind;
  demandeur: string;
  priority: Priority;
  squad: Demande["squad"];
}

interface FactoryContextValue extends FactoryState {
  persona: Persona;
  setPersona: (p: Persona) => void;
  getDemande: (id: string) => Demande | undefined;
  getTask: (id: string) => Task | undefined;
  tasksOf: (demandeId: string) => Task[];
  livrablesOf: (demandeId: string) => Livrable[];
  activityOf: (demandeId: string) => FactoryState["activity"];
  agentOf: (task: Task) => FactoryState["agents"][number] | undefined;
  personOf: (task: Task) => FactoryState["people"][number] | undefined;
  progressOf: (demandeId: string) => { done: number; total: number };
  toggleChecklist: (taskId: string, itemId: string) => void;
  completeTask: (taskId: string) => void;
  blockTask: (taskId: string, reason: string) => void;
  startTask: (taskId: string) => void;
  reassign: (taskId: string, next: { agentId?: string; personId?: string }) => void;
  finishAgentRun: (taskId: string) => string | undefined;
  updateLivrable: (id: string, content: string) => void;
  createDemande: (input: NewDemandeInput) => string;
}

const FactoryContext = createContext<FactoryContextValue | null>(null);

let seq = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${seq++}`;

export function FactoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FactoryState>(() => seedState());
  const [persona, setPersona] = useState<Persona>("Factory Manager");

  const patchTask = useCallback((taskId: string, patch: (t: Task) => Task) => {
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === taskId ? patch(t) : t)) }));
  }, []);

  const pushActivity = useCallback(
    (demandeId: string, text: string, kind: "agent" | "person" | "system") => {
      setState((s) => ({
        ...s,
        activity: [{ id: uid("act"), demandeId, text, at: "à l'instant", kind }, ...s.activity],
        demandes: s.demandes.map((d) =>
          d.id === demandeId ? { ...d, updatedLabel: "à l'instant" } : d,
        ),
      }));
    },
    [],
  );

  const value = useMemo<FactoryContextValue>(() => {
    const getTask = (id: string) => state.tasks.find((t) => t.id === id);

    return {
      ...state,
      persona,
      setPersona,
      getDemande: (id) => state.demandes.find((d) => d.id === id),
      getTask,
      tasksOf: (demandeId) => state.tasks.filter((t) => t.demandeId === demandeId),
      livrablesOf: (demandeId) => state.livrables.filter((l) => l.demandeId === demandeId),
      activityOf: (demandeId) => state.activity.filter((a) => a.demandeId === demandeId),
      agentOf: (task) => state.agents.find((a) => a.id === task.agentId),
      personOf: (task) => state.people.find((p) => p.id === task.personId),
      progressOf: (demandeId) => {
        const list = state.tasks.filter((t) => t.demandeId === demandeId);
        return { done: list.filter((t) => t.status === "Terminé").length, total: list.length };
      },
      toggleChecklist: (taskId, itemId) =>
        patchTask(taskId, (t) => ({
          ...t,
          checklist: t.checklist.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c)),
        })),
      startTask: (taskId) => patchTask(taskId, (t) => ({ ...t, status: "En cours" })),
      completeTask: (taskId) => {
        const task = getTask(taskId);
        patchTask(taskId, (t) => ({
          ...t,
          status: "Terminé",
          blockedReason: undefined,
          checklist: t.checklist.map((c) => ({ ...c, done: true })),
        }));
        if (task) {
          pushActivity(task.demandeId, `Tâche « ${task.title} » marquée terminée.`, "person");
          toast.success("Tâche terminée", { description: task.title });
        }
      },
      blockTask: (taskId, reason) => {
        const task = getTask(taskId);
        patchTask(taskId, (t) => ({ ...t, status: "Bloquée", blockedReason: reason }));
        if (task) {
          pushActivity(task.demandeId, `Tâche « ${task.title} » bloquée : ${reason}`, "person");
          toast.warning("Tâche bloquée", { description: reason });
        }
      },
      reassign: (taskId, next) => {
        patchTask(taskId, (t) => ({
          ...t,
          agentId: next.agentId === undefined ? t.agentId : next.agentId,
          personId: next.personId === undefined ? t.personId : next.personId,
        }));
        toast.success("Tâche réassignée");
      },
      finishAgentRun: (taskId) => {
        const task = getTask(taskId);
        if (!task) return undefined;
        const agent = state.agents.find((a) => a.id === task.agentId);
        const content = ARTIFACTS_BY_ROLE[task.role];
        const name = DOC_NAME_BY_ROLE[task.role];
        const existing = state.livrables.find(
          (l) => l.demandeId === task.demandeId && l.name === name,
        );
        const livrableId = existing?.id ?? uid("l");

        setState((s) => {
          const livrable: Livrable = existing
            ? {
                ...existing,
                content,
                status: "Brouillon",
                updatedLabel: "à l'instant",
                updatedBy: agent?.name ?? "Agent IA",
                versions: [
                  {
                    version: existing.versions.length + 1,
                    at: "à l'instant",
                    by: agent?.name ?? "Agent IA",
                    content: existing.content,
                  },
                  ...existing.versions,
                ],
              }
            : {
                id: livrableId,
                demandeId: task.demandeId,
                name,
                stage: task.stage,
                status: "Brouillon",
                content,
                updatedLabel: "à l'instant",
                updatedBy: agent?.name ?? "Agent IA",
                versions: [],
              };

          return {
            ...s,
            livrables: existing
              ? s.livrables.map((l) => (l.id === existing.id ? livrable : l))
              : [livrable, ...s.livrables],
            tasks: s.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    status: t.mode === "Agent" ? "En cours" : "En cours",
                    livrableId,
                    checklist: t.checklist.map((c, i) =>
                      i < t.checklist.length - 1 ? { ...c, done: true } : c,
                    ),
                  }
                : t,
            ),
            activity: [
              {
                id: uid("act"),
                demandeId: task.demandeId,
                text: `${agent?.name ?? "Agent IA"} a produit « ${name} » pour la tâche « ${task.title} ».`,
                at: "à l'instant",
                kind: "agent" as const,
              },
              ...s.activity,
            ],
          };
        });
        return livrableId;
      },
      updateLivrable: (id, content) => {
        setState((s) => ({
          ...s,
          livrables: s.livrables.map((l) =>
            l.id === id
              ? {
                  ...l,
                  content,
                  status: "À jour",
                  updatedLabel: "à l'instant",
                  versions: [
                    {
                      version: l.versions.length + 1,
                      at: "à l'instant",
                      by: l.updatedBy,
                      content: l.content,
                    },
                    ...l.versions,
                  ],
                }
              : l,
          ),
        }));
        toast.success("Livrable enregistré");
      },
      createDemande: (input) => {
        const id = uid("d");
        const stageKeys: StageKey[] = input.process === "Standard" ? STAGES_STANDARD : STAGES_COURT;
        const demande: Demande = {
          id,
          title: input.title,
          description: input.description,
          type: input.type,
          process: input.process,
          demandeur: input.demandeur,
          priority: input.priority,
          status: "Nouvelle",
          stages: stageKeys.map((key, i) => ({
            key,
            status: i === 0 ? "En cours" : "À faire",
            period: i === 0 ? "démarrée aujourd'hui" : "à venir",
          })),
          squad: input.squad,
          createdAt: new Date().toLocaleDateString("fr-FR"),
          updatedLabel: "à l'instant",
          daysInStage: 0,
        };
        const po = input.squad.find((s) => s.role === "PO");
        const newTasks: Task[] = [
          {
            id: uid("t"),
            demandeId: id,
            stage: "Intake",
            title: "Qualifier la demande",
            description: "Recueillir le besoin auprès du demandeur et cadrer le périmètre.",
            role: "PO",
            mode: "Personne",
            personId: po?.personId,
            checklist: [
              { id: uid("c"), label: "Entretien demandeur", done: false },
              { id: uid("c"), label: "Fiche besoin complétée", done: false },
            ],
            status: "À faire",
          },
          {
            id: uid("t"),
            demandeId: id,
            stage: "Intake",
            title: "Brainstorming initial",
            description: "Explorer les pistes de solution avec l'agent dédié.",
            role: "BRAINSTORMING",
            mode: "Agent",
            agentId: "a-brainstorming",
            checklist: [
              { id: uid("c"), label: "Pistes générées", done: false },
              { id: uid("c"), label: "Compte-rendu partagé", done: false },
            ],
            status: "À faire",
          },
        ];
        setState((s) => ({
          ...s,
          demandes: [demande, ...s.demandes],
          tasks: [...s.tasks, ...newTasks],
          activity: [
            {
              id: uid("act"),
              demandeId: id,
              text: `Demande « ${input.title} » créée.`,
              at: "à l'instant",
              kind: "system" as const,
            },
            ...s.activity,
          ],
        }));
        return id;
      },
    };
  }, [state, persona, patchTask, pushActivity]);

  return <FactoryContext.Provider value={value}>{children}</FactoryContext.Provider>;
}

export function useFactory() {
  const ctx = useContext(FactoryContext);
  if (!ctx) throw new Error("useFactory doit être utilisé dans FactoryProvider");
  return ctx;
}

export function currentStage(demande: Demande): StageKey {
  return (demande.stages.find((s) => s.status === "En cours") ?? demande.stages.at(-1)!).key;
}
