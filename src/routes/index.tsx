import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AlertTriangle, ArrowUpRight, ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AvatarStack,
  ProgressDots,
  SectionTitle,
  StatusPill,
  TypeTag,
} from "@/components/factory/bits";
import { currentStage, useFactory } from "@/lib/factory/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Factory, orchestration IA + People" },
      {
        name: "description",
        content:
          "Pilotez vos demandes, vos squads IA + humaines et vos tâches bloquées depuis le cockpit Factory.",
      },
      { property: "og:title", content: "Dashboard — Factory" },
      {
        property: "og:description",
        content: "Le cockpit de delivery qui combine agents IA et équipes humaines.",
      },
    ],
  }),
  component: Dashboard,
});

function Kpi({
  label,
  value,
  hint,
  tone,
  index,
}: {
  label: string;
  value: string;
  hint: string;
  tone: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="panel p-5"
    >
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight">{value}</p>
      <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
        {hint}
      </span>
    </motion.div>
  );
}

function Dashboard() {
  const { demandes, tasks, people, agents, progressOf } = useFactory();

  const blocked = tasks.filter((t) => t.status === "Bloquée");
  const active = demandes.filter((d) => d.status !== "Terminé");
  const agentTasks = tasks.filter((t) => t.mode !== "Personne");
  const rate = Math.round((agentTasks.length / Math.max(tasks.length, 1)) * 100);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Cockpit delivery</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <Button asChild className="rounded-lg">
          <Link to="/demandes/nouvelle">
            <Plus className="size-4" />
            Nouvelle demande
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          index={0}
          label="Demandes actives"
          value={String(active.length)}
          hint="+3 ce mois-ci"
          tone="bg-muted text-muted-foreground"
        />
        <Kpi
          index={1}
          label="Tâches bloquées"
          value={String(blocked.length)}
          hint="nécessitent une action"
          tone="bg-destructive/12 text-destructive"
        />
        <Kpi
          index={2}
          label="Taux d'exécution IA"
          value={`${rate}%`}
          hint="tâches prises en charge par un agent"
          tone="bg-agent/12 text-agent"
        />
        <Kpi
          index={3}
          label="Délai moyen / étape"
          value="2,4 j"
          hint="-0,3 j vs mois dernier"
          tone="bg-success/12 text-success"
        />
      </div>

      {blocked.length > 0 && (
        <section className="border-destructive/25 bg-destructive/6 mt-6 rounded-xl border p-5">
          <p className="text-destructive flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="size-4" />
            {blocked.length} tâche{blocked.length > 1 ? "s" : ""} bloquée
            {blocked.length > 1 ? "s" : ""} nécessite{blocked.length > 1 ? "nt" : ""} une action
          </p>
          <div className="mt-4 space-y-2">
            {blocked.map((t) => {
              const demande = demandes.find((d) => d.id === t.demandeId);
              return (
                <Link
                  key={t.id}
                  to="/demandes/$id/taches/$taskId"
                  params={{ id: t.demandeId, taskId: t.id }}
                  className="bg-surface hover:shadow-lift group flex items-center gap-4 rounded-lg border px-4 py-3 transition-shadow"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{t.title} bloquée</span>
                    <span className="text-muted-foreground block truncate text-sm">
                      {demande?.title} · {t.blockedReason ?? "action requise"}
                    </span>
                  </span>
                  <span className="text-muted-foreground ml-auto hidden text-xs sm:block">
                    {demande?.updatedLabel}
                  </span>
                  <ChevronRight className="text-muted-foreground group-hover:text-foreground size-4 shrink-0" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="panel mt-6 overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <SectionTitle>Demandes actives</SectionTitle>
          <Button asChild variant="outline" size="sm" className="rounded-lg">
            <Link to="/pipeline">
              Voir le pipeline
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="overflow-x-auto border-t">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="text-muted-foreground bg-muted/40 text-left text-[11px] tracking-wider uppercase">
                <th className="px-5 py-3 font-semibold">Demande</th>
                <th className="px-5 py-3 font-semibold">Progression</th>
                <th className="px-5 py-3 font-semibold">Squad</th>
                <th className="px-5 py-3 font-semibold">Étape</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3 font-semibold">Mis à jour</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {demandes.map((d) => {
                const p = progressOf(d.id);
                return (
                  <tr key={d.id} className="hover:bg-muted/40 border-t transition-colors">
                    <td className="px-5 py-4">
                      <Link
                        to="/demandes/$id"
                        params={{ id: d.id }}
                        className="font-medium hover:underline"
                      >
                        {d.title}
                      </Link>
                      <div className="mt-1.5">
                        <TypeTag type={d.type} />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <ProgressDots done={p.done} total={Math.max(p.total, 1)} />
                    </td>
                    <td className="px-5 py-4">
                      <AvatarStack
                        people={d.squad
                          .map((s) => people.find((p2) => p2.id === s.personId)!)
                          .filter(Boolean)}
                        agents={d.squad
                          .map((s) => agents.find((a) => a.id === s.agentId)!)
                          .filter(Boolean)
                          .slice(0, 1)}
                      />
                    </td>
                    <td className="text-muted-foreground px-5 py-4">{currentStage(d)}</td>
                    <td className="px-5 py-4">
                      <StatusPill status={d.status} />
                    </td>
                    <td className="text-muted-foreground px-5 py-4">{d.updatedLabel}</td>
                    <td className="px-5 py-4">
                      <Link
                        to="/demandes/$id"
                        params={{ id: d.id }}
                        aria-label={`Ouvrir ${d.title}`}
                        className="text-muted-foreground hover:text-foreground inline-flex"
                      >
                        <ChevronRight className="size-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
