import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AgentChip, PersonChip, StatusPill, TypeTag } from "@/components/factory/bits";
import { useFactory } from "@/lib/factory/store";
import { ROLE_LABELS } from "@/lib/factory/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/demandes/$id/processus")({
  head: () => ({
    meta: [
      { title: "Processus de la demande — Factory" },
      {
        name: "description",
        content:
          "Vue complète du process : chaque étape, ses tâches, les rôles requis et les binômes agent + personne.",
      },
      { property: "og:title", content: "Processus de la demande — Factory" },
      {
        property: "og:description",
        content: "Timeline verticale de toutes les étapes et tâches d'une demande.",
      },
    ],
  }),
  component: Processus,
});

function Processus() {
  const { id } = Route.useParams();
  const factory = useFactory();
  const demande = factory.getDemande(id);
  if (!demande) throw notFound();

  const tasks = factory.tasksOf(demande.id);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-8">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Link
          to="/demandes/$id"
          params={{ id: demande.id }}
          className="hover:text-foreground inline-flex items-center gap-1"
        >
          <ChevronLeft className="size-4" />
          {demande.title}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Processus</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Processus — {demande.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <TypeTag type={demande.type} />
            <span className="text-muted-foreground text-sm">
              Process {demande.process} · {demande.stages.length} étapes ·{" "}
              {demande.stages.map((s) => s.key).join(" → ")}
            </span>
          </div>
        </div>
        <Button asChild variant="outline" className="rounded-lg">
          <Link to="/demandes/$id" params={{ id: demande.id }}>
            Voir la fiche demande
          </Link>
        </Button>
      </div>

      <div className="mt-8 space-y-8">
        {demande.stages.map((stage) => {
          const stageTasks = tasks.filter((t) => t.stage === stage.key);
          const done = stage.status === "Terminé";
          const active = stage.status === "En cours";
          return (
            <section key={stage.key} className="relative pl-12">
              <span
                className={cn(
                  "absolute top-1 left-0 grid size-9 place-items-center rounded-full border-2",
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
                  "absolute top-11 bottom-[-2rem] left-[1.05rem] w-0.5",
                  done ? "bg-success" : "bg-border",
                )}
              />
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-semibold tracking-tight">{stage.key}</h2>
                <StatusPill status={done ? "Terminé" : active ? "En cours" : "À faire"} />
                <span className="text-muted-foreground text-sm">{stage.period}</span>
              </div>

              <div className="panel mt-3 divide-y overflow-hidden">
                {stageTasks.length === 0 && (
                  <p className="text-muted-foreground px-4 py-5 text-sm">
                    Les tâches de cette étape seront générées à son ouverture.
                  </p>
                )}
                {stageTasks.map((t) => {
                  const agent = factory.agentOf(t);
                  const person = factory.personOf(t);
                  return (
                    <div
                      key={t.id}
                      className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:flex-nowrap"
                    >
                      <div className="min-w-[180px] flex-1">
                        <Link
                          to="/demandes/$id/taches/$taskId"
                          params={{ id: demande.id, taskId: t.id }}
                          className="text-sm font-medium hover:underline"
                        >
                          {t.title}
                        </Link>
                        <p className="eyebrow mt-1">Rôle requis · {ROLE_LABELS[t.role]}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {agent && <AgentChip agent={agent} />}
                        {person && <PersonChip person={person} />}
                      </div>
                      <div className="ml-auto">
                        <StatusPill status={t.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
