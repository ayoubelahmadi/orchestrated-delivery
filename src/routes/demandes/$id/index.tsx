import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Bot, Check, ChevronLeft, FileText, ListTodo, Play, Workflow } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { AgentRunPanel } from "@/components/factory/AgentRunPanel";
import {
  EmptyState,
  ModeBadge,
  Pill,
  StatusPill,
  TypeTag,
} from "@/components/factory/bits";
import { currentStage, useFactory } from "@/lib/factory/store";
import { ROLE_LABELS } from "@/lib/factory/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/demandes/$id/")({
  head: () => ({
    meta: [
      { title: "Détail de la demande — Factory" },
      {
        name: "description",
        content:
          "Étapes, tâches en cours, squad IA + humaine et activité récente d'une demande de la Factory.",
      },
      { property: "og:title", content: "Détail de la demande — Factory" },
      {
        property: "og:description",
        content: "Suivi complet d'une demande, étape par étape.",
      },
    ],
  }),
  component: DemandeDetail,
});

function DemandeDetail() {
  const { id } = Route.useParams();
  const factory = useFactory();
  const demande = factory.getDemande(id);
  const [runTask, setRunTask] = useState<string | null>(null);

  if (!demande) throw notFound();

  const stage = currentStage(demande);
  const tasks = factory.tasksOf(demande.id);
  const stageTasks = tasks.filter((t) => t.stage === stage);
  const todo = tasks.filter((t) => t.status !== "Terminé");
  const activity = factory.activityOf(demande.id);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-8">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Link to="/pipeline" className="hover:text-foreground inline-flex items-center gap-1">
          <ChevronLeft className="size-4" />
          Pipeline
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{demande.title}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{demande.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <TypeTag type={demande.type} />
            <StatusPill status={demande.status} />
            <span className="text-muted-foreground text-sm">
              Demandeur : {demande.demandeur} · créée le {demande.createdAt} · priorité{" "}
              {demande.priority.toLowerCase()}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-lg">
            <Link to="/demandes/$id/processus" params={{ id: demande.id }}>
              <Workflow className="size-4" />
              Voir le processus
            </Link>
          </Button>
          <Button asChild className="rounded-lg">
            <Link to="/demandes/$id/livrables" params={{ id: demande.id }}>
              <FileText className="size-4" />
              Livrables
            </Link>
          </Button>
        </div>
      </div>

      <section className="panel mt-6 px-6 py-7">
        <ol className="flex flex-wrap items-start gap-y-6">
          {demande.stages.map((s, i) => {
            const done = s.status === "Terminé";
            const active = s.status === "En cours";
            return (
              <li key={s.key} className="flex flex-1 basis-40 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <span
                    className={cn(
                      "h-0.5 flex-1",
                      i === 0 ? "bg-transparent" : done || active ? "bg-success" : "bg-border",
                    )}
                  />
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full border-2",
                      done
                        ? "border-success bg-success text-success-foreground"
                        : active
                          ? "border-info bg-surface"
                          : "border-border bg-surface",
                    )}
                  >
                    {done ? (
                      <Check className="size-4" strokeWidth={3} />
                    ) : active ? (
                      <span className="bg-info size-2.5 rounded-full" />
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "h-0.5 flex-1",
                      i === demande.stages.length - 1
                        ? "bg-transparent"
                        : done
                          ? "bg-success"
                          : "bg-border",
                    )}
                  />
                </div>
                <span className="mt-2.5 text-sm font-medium">{s.key}</span>
                <span className="text-muted-foreground text-xs">{s.period}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <section className="panel p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold tracking-tight">Tâches — étape {stage}</h2>
              <StatusPill status={demande.status === "Terminé" ? "Terminé" : "En cours"} />
            </div>
            <div className="mt-4 space-y-3">
              {stageTasks.length === 0 && (
                <EmptyState
                  title="Aucune tâche sur cette étape"
                  description="Les tâches apparaîtront dès l'ouverture de l'étape."
                />
              )}
              {stageTasks.map((t) => {
                const agent = factory.agentOf(t);
                const person = factory.personOf(t);
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link
                          to="/demandes/$id/taches/$taskId"
                          params={{ id: demande.id, taskId: t.id }}
                          className="text-sm font-medium hover:underline"
                        >
                          {t.title}
                        </Link>
                        <p className="text-muted-foreground mt-1 text-sm">{t.description}</p>
                      </div>
                      <StatusPill status={t.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <ModeBadge mode={t.mode} />
                      {agent && (
                        <Pill tone="agent">
                          <Bot className="size-3.5" />
                          {agent.name}
                        </Pill>
                      )}
                      {person && (
                        <Pill tone="info">
                          {person.name} · {ROLE_LABELS[person.role]}
                        </Pill>
                      )}
                      {agent && t.status !== "Terminé" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-auto rounded-lg"
                          onClick={() => setRunTask(t.id)}
                        >
                          <Play className="size-3.5" />
                          Lancer l'agent
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="text-base font-semibold tracking-tight">Avancement du process</h2>
            <div className="mt-3 divide-y">
              {demande.stages.map((s) => (
                <div key={s.key} className="flex items-center gap-3 py-3">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      s.status === "Terminé"
                        ? "bg-success"
                        : s.status === "En cours"
                          ? "bg-info"
                          : "bg-border",
                    )}
                  />
                  <span className="text-sm font-medium">{s.key}</span>
                  <span className="text-muted-foreground ml-auto text-xs">{s.period}</span>
                  <StatusPill status={s.status === "À faire" ? "À faire" : s.status} />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="panel p-5">
            <h2 className="text-base font-semibold tracking-tight">Squad</h2>
            <p className="eyebrow mt-4">People</p>
            <div className="mt-2 space-y-2">
              {demande.squad.map((slot) => {
                const person = factory.people.find((p) => p.id === slot.personId);
                if (!person) return null;
                return (
                  <div key={`p-${slot.role}`} className="flex items-center gap-3">
                    <span className="bg-info/15 text-info grid size-8 place-items-center rounded-full text-[11px] font-semibold">
                      {person.initials}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{person.name}</span>
                      <span className="text-muted-foreground block text-xs">
                        {ROLE_LABELS[slot.role]}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="eyebrow mt-5">Agents IA</p>
            <div className="mt-2 space-y-2">
              {demande.squad.map((slot) => {
                const agent = factory.agents.find((a) => a.id === slot.agentId);
                if (!agent) return null;
                return (
                  <div key={`a-${slot.role}`} className="flex items-center gap-3">
                    <span className="bg-agent/12 text-agent grid size-8 place-items-center rounded-full">
                      <Bot className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{agent.name}</span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {agent.description}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <ListTodo className="text-primary size-4" />
              Ma to-do — vue {factory.persona}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {tasks.filter((t) => t.status === "Terminé").length} activité(s) terminée(s) ·{" "}
              {todo.length} à venir
            </p>
            <div className="mt-3 space-y-2">
              {todo.slice(0, 5).map((t) => {
                const agent = factory.agentOf(t);
                return (
                  <div key={t.id} className="rounded-lg border px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{t.title}</span>
                      <span className="text-muted-foreground ml-auto text-xs">{t.stage}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <StatusPill status={t.status} />
                      {agent && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-auto h-8 rounded-lg"
                          onClick={() => setRunTask(t.id)}
                        >
                          <Play className="size-3.5" />
                          Confier à l'agent
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              {todo.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Tout est traité sur cette demande. 🎉
                </p>
              )}
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="text-base font-semibold tracking-tight">Activité récente</h2>
            <div className="mt-3 space-y-3">
              {activity.map((a) => (
                <div key={a.id} className="flex gap-3">
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      a.kind === "agent"
                        ? "bg-agent"
                        : a.kind === "person"
                          ? "bg-info"
                          : "bg-muted-foreground/40",
                    )}
                  />
                  <span>
                    <span className="block text-sm">{a.text}</span>
                    <span className="text-muted-foreground block text-xs">{a.at}</span>
                  </span>
                </div>
              ))}
              {activity.length === 0 && (
                <p className="text-muted-foreground text-sm">Aucune activité pour l'instant.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <AgentRunPanel
        taskId={runTask}
        open={runTask !== null}
        onOpenChange={(o) => !o && setRunTask(null)}
      />
    </div>
  );
}
