import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock3,
  Plus,
  Sparkles,
} from "lucide-react";

import { AvatarStack, StatusPill, TypeTag } from "@/components/factory/bits";
import { Button } from "@/components/ui/button";
import { currentStage, useFactory } from "@/lib/factory/store";
import type { StageKey } from "@/lib/factory/types";
import { cn } from "@/lib/utils";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const STAGE_LABELS: StageKey[] = ["Intake", "Analysis", "Design", "Dev", "Run"];

function AiGauge({ rate }: { rate: number }) {
  const circumference = 2 * Math.PI * 46;
  const offset = circumference * (1 - rate / 100);

  return (
    <div className="relative grid size-28 shrink-0 place-items-center sm:size-36">
      <svg className="size-full -rotate-90" viewBox="0 0 112 112" aria-hidden="true">
        <circle cx="56" cy="56" r="46" fill="none" stroke="currentColor" strokeWidth="5" className="text-background/12" />
        <motion.circle
          cx="56"
          cy="56"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          className="text-primary"
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <div className="absolute text-center">
        <span className="block text-2xl font-semibold sm:text-3xl">{rate}%</span>
        <span className="text-background/55 mt-1 block text-[10px] font-semibold uppercase">Exécution IA</span>
      </div>
    </div>
  );
}

function Dashboard() {
  const { demandes, tasks, people, agents, progressOf } = useFactory();
  const blocked = tasks.filter((task) => task.status === "Bloquée");
  const active = demandes.filter((demande) => demande.status !== "Terminé");
  const completed = tasks.filter((task) => task.status === "Terminé").length;
  const agentTasks = tasks.filter((task) => task.mode !== "Personne");
  const rate = Math.round((agentTasks.length / Math.max(tasks.length, 1)) * 100);
  const totalProgress = Math.round(
    active.reduce((sum, demande) => {
      const progress = progressOf(demande.id);
      return sum + progress.done / Math.max(progress.total, 1);
    }, 0) / Math.max(active.length, 1) * 100,
  );

  const stageCounts = STAGE_LABELS.map((stage) => ({
    stage,
    count: active.filter((demande) => currentStage(demande) === stage).length,
  }));

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-7 sm:py-7 xl:px-10">
      <motion.header
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        className="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-5 duration-500 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="max-w-3xl">
          <p className="eyebrow flex items-center gap-2"><span className="bg-primary size-1.5 rounded-full" /> Jeudi · Vue Factory Manager</p>
          <h1 className="mt-2 text-3xl font-semibold leading-[1.08] sm:text-4xl xl:text-5xl">
            Bonjour Mehdi.<br />
            <span className="text-muted-foreground">La Factory avance.</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="rounded-lg">
            <Link to="/pipeline">Ouvrir le pipeline <ArrowUpRight className="size-4" /></Link>
          </Button>
          <Button asChild className="rounded-lg">
            <Link to="/demandes/nouvelle"><Plus className="size-4" /> Nouvelle demande</Link>
          </Button>
        </div>
      </motion.header>

      <section className="mt-7 grid gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-[1.4fr_0.85fr]">
        <div className="bg-foreground text-background relative min-h-[340px] overflow-hidden p-5 sm:p-7">
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center justify-between gap-4">
              <p className="text-background/55 text-xs font-semibold uppercase">Signal de production</p>
              <span className="border-background/15 text-background/65 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs">
                <span className="bg-success size-1.5 rounded-full" /> En direct
              </span>
            </div>

            <div className="mt-7 flex flex-1 flex-col justify-between gap-7 sm:flex-row sm:items-center">
              <div className="max-w-md">
                <p className="text-primary text-6xl font-semibold sm:text-7xl">{totalProgress}%</p>
                <h2 className="mt-3 text-xl font-medium sm:text-2xl">du portefeuille a franchi son étape en cours.</h2>
                <p className="text-background/55 mt-2 max-w-sm text-sm leading-relaxed">
                  {completed} tâches terminées. Le rythme progresse, mais {blocked.length} points demandent votre arbitrage.
                </p>
              </div>
              <AiGauge rate={rate} />
            </div>

            <div className="border-background/15 mt-7 grid grid-cols-5 border-t pt-4">
              {stageCounts.map(({ stage, count }) => (
                <div key={stage} className="border-background/10 border-r px-2 first:pl-0 last:border-r-0">
                  <span className="text-background/45 block text-[10px] uppercase">{stage}</span>
                  <span className={cn("mt-1 block text-xl font-medium", count > 0 && "text-primary")}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">À arbitrer aujourd’hui</p>
              <h2 className="mt-2 text-2xl font-semibold">{blocked.length} blocages</h2>
            </div>
            <span className="bg-destructive/10 text-destructive grid size-10 place-items-center rounded-full">
              <AlertTriangle className="size-4" />
            </span>
          </div>

          <div className="mt-5 divide-y">
            {blocked.slice(0, 3).map((task, index) => {
              const demande = demandes.find((item) => item.id === task.demandeId);
              return (
                <Link
                  key={task.id}
                  to="/demandes/$id/taches/$taskId"
                  params={{ id: task.demandeId, taskId: task.id }}
                  className="group grid grid-cols-[2rem_1fr_auto] gap-3 py-4 first:pt-0"
                >
                  <span className="text-muted-foreground font-mono text-xs">0{index + 1}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{task.title}</span>
                    <span className="text-muted-foreground mt-1 block truncate text-xs">{demande?.title}</span>
                    <span className="text-destructive mt-2 block text-xs">{task.blockedReason ?? "Action requise"}</span>
                  </span>
                  <ArrowRight className="text-muted-foreground group-hover:text-primary mt-0.5 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-px grid border-x border-b bg-surface sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Sparkles, value: active.length, label: "demandes actives", note: "+3 ce mois" },
          { icon: Bot, value: `${rate}%`, label: "prises en charge IA", note: "Agent ou hybride" },
          { icon: Clock3, value: "2,4 j", label: "par étape", note: "−0,3 j ce mois" },
          { icon: CheckCircle2, value: completed, label: "tâches livrées", note: "Sur la période" },
        ].map((metric, index) => (
          <div key={metric.label} className={cn("border-b p-4 sm:p-5 lg:border-b-0", index < 3 && "lg:border-r", index % 2 === 0 && "sm:border-r")}>
            <metric.icon className="text-muted-foreground size-4" />
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold">{metric.value}</span>
              <span className="text-muted-foreground text-xs">{metric.label}</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">{metric.note}</p>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4 border-b pb-4">
          <div>
            <p className="eyebrow">Portefeuille vivant</p>
            <h2 className="mt-2 text-xl font-semibold sm:text-2xl">Ce qui bouge maintenant</h2>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-lg">
            <Link to="/pipeline">Tout voir <ArrowRight className="size-4" /></Link>
          </Button>
        </div>

        <div className="divide-y">
          {active.slice(0, 5).map((demande, index) => {
            const progress = progressOf(demande.id);
            const percent = Math.round(progress.done / Math.max(progress.total, 1) * 100);
            const squadPeople = demande.squad
              .map((slot) => people.find((person) => person.id === slot.personId))
              .filter((person) => person !== undefined);
            const squadAgents = demande.squad
              .map((slot) => agents.find((agent) => agent.id === slot.agentId))
              .filter((agent) => agent !== undefined)
              .slice(0, 1);

            return (
              <motion.div key={demande.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                <Link
                  to="/demandes/$id"
                  params={{ id: demande.id }}
                  className="group grid gap-4 py-4 transition-colors sm:grid-cols-[2.5rem_minmax(0,1.2fr)_minmax(180px,0.8fr)_auto] sm:items-center"
                >
                  <span className="text-muted-foreground font-mono text-xs">0{index + 1}</span>
                  <div className="min-w-0">
                    <h3 className="group-hover:text-primary truncate text-base font-semibold transition-colors">{demande.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2"><TypeTag type={demande.type} /><StatusPill status={demande.status} /></div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-medium">{currentStage(demande)}</span>
                      <span className="text-muted-foreground">{percent}%</span>
                    </div>
                    <progress
                      className="dashboard-progress mt-2 block h-1 w-full overflow-hidden rounded-full"
                      value={percent}
                      max={100}
                      aria-label={`${percent}% terminé`}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <AvatarStack people={squadPeople} agents={squadAgents} />
                    <span className="text-muted-foreground hidden text-xs xl:block">{demande.updatedLabel}</span>
                    <ArrowUpRight className="text-muted-foreground group-hover:text-primary size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}