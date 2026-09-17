import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Bot, ChevronLeft, Clock, FileText, Play, ScrollText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AgentRunPanel } from "@/components/factory/AgentRunPanel";
import { Markdown, ModeBadge, Pill, StatusPill } from "@/components/factory/bits";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFactory } from "@/lib/factory/store";
import { ROLE_LABELS } from "@/lib/factory/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/demandes/$id/taches/$taskId")({
  head: () => ({
    meta: [
      { title: "Détail de la tâche — Factory" },
      {
        name: "description",
        content:
          "Checklist, binôme agent + personne, mode d'exécution et actions de validation d'une tâche.",
      },
      { property: "og:title", content: "Détail de la tâche — Factory" },
      {
        property: "og:description",
        content: "Pilotez l'exécution d'une tâche par un agent IA ou une personne.",
      },
    ],
  }),
  component: TacheDetail,
});

function TacheDetail() {
  const { id, taskId } = Route.useParams();
  const factory = useFactory();
  const demande = factory.getDemande(id);
  const task = factory.getTask(taskId);
  const [runOpen, setRunOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [newPerson, setNewPerson] = useState("");

  if (!demande || !task) throw notFound();

  const agent = factory.agentOf(task);
  const person = factory.personOf(task);
  const livrable = factory.livrablesOf(demande.id).find((l) => l.id === task.livrableId);

  return (
    <div className="mx-auto w-full max-w-[1300px] px-4 py-6 sm:px-8">
      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
        <Link
          to="/demandes/$id"
          params={{ id: demande.id }}
          className="hover:text-foreground inline-flex items-center gap-1"
        >
          <ChevronLeft className="size-4" />
          {demande.title}
        </Link>
        <span>/</span>
        <span>{task.stage}</span>
        <span>/</span>
        <span className="text-foreground font-medium">{task.title}</span>
      </div>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{task.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusPill status={task.status} />
        <ModeBadge mode={task.mode} />
        <Pill tone="neutral">Rôle requis · {ROLE_LABELS[task.role]}</Pill>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <section className="panel p-5">
            <h2 className="text-base font-semibold tracking-tight">Description</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{task.description}</p>

            <p className="eyebrow mt-5">Checklist</p>
            <div className="mt-2 space-y-2">
              {task.checklist.map((item) => (
                <label
                  key={item.id}
                  className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm"
                >
                  <Checkbox
                    checked={item.done}
                    onCheckedChange={() => factory.toggleChecklist(task.id, item.id)}
                  />
                  <span className={cn(item.done && "text-muted-foreground line-through")}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            {agent && (
              <section className="panel p-5">
                <div className="flex items-start gap-3">
                  <span className="bg-agent/12 text-agent grid size-10 place-items-center rounded-xl">
                    <Bot className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{agent.name}</p>
                    <p className="text-muted-foreground text-xs">
                      Agent IA · rôle {ROLE_LABELS[agent.role]}
                    </p>
                  </div>
                  <Pill tone="agent" className="ml-auto">
                    {agent.status}
                  </Pill>
                </div>
                <p className="text-muted-foreground mt-3 text-sm">{agent.description}</p>
                <div className="bg-muted/50 mt-3 rounded-lg px-3 py-2.5 font-mono text-xs">
                  → {agent.steps.length} étapes d'exécution · dernier run{" "}
                  {task.livrableId ? "il y a 2 h" : "jamais"}
                </div>
                <Button
                  variant="link"
                  className="mt-2 h-auto px-0"
                  onClick={() => setRunOpen(true)}
                >
                  <ScrollText className="size-4" />
                  Voir le journal d'exécution
                </Button>
              </section>
            )}

            {person && (
              <section className="panel p-5">
                <div className="flex items-start gap-3">
                  <span className="bg-info/15 text-info grid size-10 place-items-center rounded-full text-xs font-semibold">
                    {person.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{person.name}</p>
                    <p className="text-muted-foreground text-xs">
                      Personne · rôle {ROLE_LABELS[person.role]}
                    </p>
                  </div>
                  <StatusPill status={task.status} />
                </div>
                <p className="text-muted-foreground mt-3 text-sm">
                  Relit et complète la production de l'agent, tranche les points d'attention et
                  valide le livrable final.
                </p>
                <p className="text-muted-foreground mt-3 inline-flex items-center gap-1.5 text-xs">
                  <Clock className="size-3.5" />
                  Dernière activité il y a 40 min
                </p>
              </section>
            )}
          </div>

          {livrable && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="panel">
              <div className="flex items-center gap-2 border-b px-5 py-3.5">
                <FileText className="text-primary size-4" />
                <span className="text-sm font-medium">{livrable.name}</span>
                <Pill tone={livrable.status === "À jour" ? "success" : "warning"} className="ml-2">
                  {livrable.status}
                </Pill>
                <Button asChild variant="outline" size="sm" className="ml-auto rounded-lg">
                  <Link to="/demandes/$id/livrables" params={{ id: demande.id }}>
                    Ouvrir dans l'éditeur
                  </Link>
                </Button>
              </div>
              <div className="max-h-80 overflow-y-auto px-5 py-4">
                <Markdown content={livrable.content} />
              </div>
            </motion.section>
          )}

          <section className="panel flex flex-wrap items-center gap-2 p-5">
            {agent && task.status !== "Terminé" && (
              <Button className="rounded-lg" onClick={() => setRunOpen(true)}>
                <Play className="size-4" />
                {task.status === "À faire" ? "Passer à l'agent" : "Relancer l'agent"}
              </Button>
            )}
            <Button
              variant={agent ? "outline" : "default"}
              className="rounded-lg"
              disabled={task.status === "Terminé"}
              onClick={() => factory.completeTask(task.id)}
            >
              Marquer comme terminée
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-lg">
                  Réassigner
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Réassigner la tâche</DialogTitle>
                  <DialogDescription>
                    Choisissez la personne qui prend la main sur cette tâche.
                  </DialogDescription>
                </DialogHeader>
                <Select value={newPerson} onValueChange={setNewPerson}>
                  <SelectTrigger aria-label="Choisir une personne">
                    <SelectValue placeholder="Sélectionner une personne" />
                  </SelectTrigger>
                  <SelectContent>
                    {factory.people.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} · {p.jobTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DialogFooter>
                  <Button
                    disabled={!newPerson}
                    onClick={() => factory.reassign(task.id, { personId: newPerson })}
                  >
                    Confirmer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/8 ml-auto rounded-lg"
                >
                  Bloquer la tâche
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bloquer la tâche</DialogTitle>
                  <DialogDescription>
                    Indiquez le motif : il apparaîtra dans les alertes du dashboard.
                  </DialogDescription>
                </DialogHeader>
                <Input
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Ex. en attente de validation architecture"
                  aria-label="Motif du blocage"
                />
                <DialogFooter>
                  <Button
                    variant="destructive"
                    disabled={!blockReason.trim()}
                    onClick={() => {
                      factory.blockTask(task.id, blockReason.trim());
                      setBlockReason("");
                    }}
                  >
                    Bloquer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </section>
        </div>

        <div className="space-y-6">
          <section className="panel p-5">
            <h2 className="text-base font-semibold tracking-tight">Contexte</h2>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="eyebrow">Demande</dt>
                <dd className="mt-1 text-sm font-medium">{demande.title}</dd>
              </div>
              <div>
                <dt className="eyebrow">Étape</dt>
                <dd className="mt-1 text-sm font-medium">{task.stage}</dd>
              </div>
              <div>
                <dt className="eyebrow">Type d'exécution</dt>
                <dd className="mt-1 text-sm font-medium">
                  {task.mode === "Both"
                    ? "Agent + Personne"
                    : task.mode === "Agent"
                      ? "Agent seul"
                      : "Personne seule"}
                </dd>
              </div>
              {task.blockedReason && (
                <div>
                  <dt className="eyebrow">Motif de blocage</dt>
                  <dd className="text-destructive mt-1 text-sm font-medium">
                    {task.blockedReason}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className="panel p-5">
            <h2 className="text-base font-semibold tracking-tight">Activité</h2>
            <div className="mt-3 space-y-3">
              {factory.activityOf(demande.id).map((a) => (
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
            </div>
            <Button
              variant="link"
              className="mt-2 h-auto px-0"
              onClick={() => toast.info("Historique complet bientôt disponible")}
            >
              Voir tout l'historique
            </Button>
          </section>
        </div>
      </div>

      <AgentRunPanel taskId={task.id} open={runOpen} onOpenChange={setRunOpen} />
    </div>
  );
}
