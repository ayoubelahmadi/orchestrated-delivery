import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Plus, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarStack, BlockedFlag, EmptyState, TypeTag } from "@/components/factory/bits";
import { currentStage, useFactory } from "@/lib/factory/store";
import type { ProjectType, StageKey } from "@/lib/factory/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline des demandes — Factory" },
      {
        name: "description",
        content:
          "Suivez chaque demande de l'Intake au Run : étapes, squads, temps passé et blocages.",
      },
      { property: "og:title", content: "Pipeline des demandes — Factory" },
      {
        property: "og:description",
        content: "Kanban Intake → Analysis → Design → Dev → Run des demandes de la Factory.",
      },
    ],
  }),
  component: Pipeline,
});

const COLUMNS: StageKey[] = ["Intake", "Analysis", "Design", "Dev", "Run"];
const FILTERS: (ProjectType | "Tous les types")[] = [
  "Tous les types",
  "Power Platform",
  "RPA",
  "Fullstack",
];

function Pipeline() {
  const { demandes, tasks, people, agents } = useFactory();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Tous les types");
  const [query, setQuery] = useState("");

  const visible = demandes.filter(
    (d) =>
      (filter === "Tous les types" || d.type === filter) &&
      d.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Flux de delivery</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Pipeline des demandes</h1>
        </div>
        <Button asChild className="rounded-lg">
          <Link to="/demandes/nouvelle">
            <Plus className="size-4" />
            Nouvelle demande
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="bg-muted/60 inline-flex rounded-xl p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                filter === f
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrer…"
            aria-label="Filtrer les demandes"
            className="rounded-xl pl-9"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Aucune demande ne correspond"
            description="Modifiez le filtre de type de projet ou votre recherche."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 overflow-x-auto pb-4 lg:grid-flow-col lg:auto-cols-[minmax(280px,1fr)]">
          {COLUMNS.map((col) => {
            const items = visible.filter((d) => currentStage(d) === col);
            return (
              <div key={col} className="min-w-[280px]">
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="eyebrow">{col}</span>
                  <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {items.map((d, i) => {
                    const blockedTask = tasks.find(
                      (t) => t.demandeId === d.id && t.status === "Bloquée",
                    );
                    return (
                      <motion.div
                        key={d.id}
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Link
                          to="/demandes/$id"
                          params={{ id: d.id }}
                          className="panel hover:shadow-lift block p-4 transition-shadow"
                        >
                          <p className="font-medium">{d.title}</p>
                          <div className="mt-2">
                            <TypeTag type={d.type} />
                          </div>
                          <p className="text-muted-foreground mt-3 line-clamp-2 text-sm">
                            {d.description}
                          </p>
                          <div className="mt-4 flex items-center justify-between gap-2">
                            <AvatarStack
                              people={d.squad
                                .map((s) => people.find((p) => p.id === s.personId)!)
                                .filter(Boolean)
                                .slice(0, 2)}
                              agents={d.squad
                                .map((s) => agents.find((a) => a.id === s.agentId)!)
                                .filter(Boolean)
                                .slice(0, 1)}
                            />
                            {blockedTask ? (
                              <BlockedFlag>{d.daysInStage} j dans l'étape</BlockedFlag>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                {d.daysInStage} j dans l'étape
                              </span>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                  {items.length === 0 && (
                    <div className="text-muted-foreground rounded-xl border border-dashed px-4 py-8 text-center text-xs">
                      Aucune demande
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
