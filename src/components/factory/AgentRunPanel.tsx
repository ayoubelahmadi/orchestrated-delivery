import { AnimatePresence, motion } from "motion/react";
import { Bot, Check, FileText, Loader2, Play, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ARTIFACTS_BY_ROLE, DOC_NAME_BY_ROLE } from "@/lib/factory/artifacts";
import { useFactory } from "@/lib/factory/store";
import { Markdown, ModeBadge, Pill } from "@/components/factory/bits";
import { cn } from "@/lib/utils";

export function AgentRunPanel({
  taskId,
  open,
  onOpenChange,
}: {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { getTask, agentOf, personOf, getDemande, livrablesOf, finishAgentRun } = useFactory();
  const [logs, setLogs] = useState<string[]>([]);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const task = taskId ? getTask(taskId) : undefined;
  const agent = task ? agentOf(task) : undefined;
  const person = task ? personOf(task) : undefined;
  const demande = task ? getDemande(task.demandeId) : undefined;
  const upstream = task ? livrablesOf(task.demandeId).slice(0, 3) : [];

  useEffect(() => {
    if (!open) {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setLogs([]);
      setPhase("idle");
    }
  }, [open, taskId]);

  const start = () => {
    if (!task || !agent) return;
    setPhase("running");
    setLogs([]);
    const steps = agent.steps;
    steps.forEach((step, i) => {
      timers.current.push(
        setTimeout(
          () => setLogs((l) => [...l, step]),
          900 + i * 1300,
        ),
      );
    });
    timers.current.push(
      setTimeout(
        () => {
          setPhase("done");
          finishAgentRun(task.id);
        },
        900 + steps.length * 1300,
      ),
    );
  };

  const total = agent?.steps.length ?? 1;
  const pct = phase === "done" ? 100 : Math.round((logs.length / total) * 100);
  const artifact = task ? ARTIFACTS_BY_ROLE[task.role] : "";
  const docName = task ? DOC_NAME_BY_ROLE[task.role] : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[620px]"
        aria-describedby={undefined}
      >
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="flex items-center gap-3 text-base">
            <span className="bg-agent/12 text-agent grid size-10 place-items-center rounded-xl">
              <Bot className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate">{agent?.name ?? "Agent IA"}</span>
              <span className="text-muted-foreground block text-xs font-normal">
                {agent?.description ?? "Exécution automatisée"}
              </span>
            </span>
            <span className="ml-auto">
              {phase === "running" ? (
                <Pill tone="info">
                  <Loader2 className="size-3.5 animate-spin" /> En cours
                </Pill>
              ) : phase === "done" ? (
                <Pill tone="success">
                  <Check className="size-3.5" /> Terminé
                </Pill>
              ) : (
                <Pill tone="neutral">Prêt</Pill>
              )}
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <section className="panel p-4">
            <p className="eyebrow mb-2">Contexte de la tâche</p>
            <p className="text-sm font-medium">{task?.title}</p>
            <p className="text-muted-foreground mt-1 text-sm">{task?.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Pill tone="neutral">{demande?.title}</Pill>
              <Pill tone="neutral">Étape {task?.stage}</Pill>
              {task && <ModeBadge mode={task.mode} />}
              {person && <Pill tone="info">Validation : {person.name}</Pill>}
            </div>
          </section>

          <section>
            <p className="eyebrow mb-2">Artefacts en entrée</p>
            <div className="space-y-1.5">
              {upstream.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Aucun livrable amont — l'agent part de la description de la demande.
                </p>
              )}
              {upstream.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm"
                >
                  <FileText className="text-muted-foreground size-4" />
                  <span className="truncate">{l.name}</span>
                  <span className="text-muted-foreground ml-auto text-xs">{l.stage}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <p className="eyebrow">Journal d'exécution</p>
              <span className="text-muted-foreground text-xs">{pct} %</span>
            </div>
            <Progress value={pct} className="h-1.5" />
            <div className="bg-muted/40 mt-3 min-h-40 space-y-2 rounded-xl border p-4 font-mono text-[13px]">
              {phase === "idle" && (
                <p className="text-muted-foreground font-sans text-sm">
                  Lancez l'agent pour démarrer l'exécution et suivre chaque étape en direct.
                </p>
              )}
              <AnimatePresence initial={false}>
                {logs.map((line, i) => (
                  <motion.p
                    key={line + i}
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2"
                  >
                    <Check className="text-success mt-0.5 size-3.5 shrink-0" strokeWidth={3} />
                    <span>{line}</span>
                  </motion.p>
                ))}
              </AnimatePresence>
              {phase === "running" && logs.length < total && (
                <p className="text-muted-foreground flex items-center gap-2">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span className="animate-pulse">Traitement en cours…</span>
                </p>
              )}
            </div>
          </section>

          {phase === "done" && (
            <motion.section
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              className="panel overflow-hidden"
            >
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <FileText className="text-primary size-4" />
                <span className="text-sm font-medium">{docName}</span>
                <Pill tone="warning" className="ml-auto">
                  Brouillon
                </Pill>
              </div>
              <div className="max-h-72 overflow-y-auto px-4 py-3">
                <Markdown content={artifact} />
              </div>
            </motion.section>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t px-6 py-4">
          {phase !== "done" ? (
            <Button
              onClick={start}
              disabled={phase === "running"}
              className={cn("rounded-lg", phase === "running" && "opacity-70")}
            >
              {phase === "running" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Play className="size-4" />
              )}
              {phase === "running" ? "Exécution en cours…" : "Lancer l'agent"}
            </Button>
          ) : (
            <>
              <Button asChild className="rounded-lg">
                <Link
                  to="/demandes/$id/livrables"
                  params={{ id: task?.demandeId ?? "" }}
                  onClick={() => onOpenChange(false)}
                >
                  <FileText className="size-4" />
                  Ouvrir le livrable
                </Link>
              </Button>
              <Button variant="outline" className="rounded-lg" onClick={() => onOpenChange(false)}>
                Retour à la tâche
              </Button>
            </>
          )}
          <span className="text-muted-foreground ml-auto inline-flex items-center gap-1.5 text-xs">
            <Sparkles className="size-3.5" />
            Exécution simulée
          </span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
