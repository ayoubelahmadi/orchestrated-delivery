import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Bot, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  composeSquadWithCopilot,
  AGENT_GUID_MAP,
} from "@/lib/factory/copilotComposer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pill } from "@/components/factory/bits";
import { useFactory } from "@/lib/factory/store";
import {
  ROLE_LABELS,
  type Priority,
  type ProcessKind,
  type ProjectType,
  type RoleKey,
  type SquadSlot,
} from "@/lib/factory/types";

export const Route = createFileRoute("/demandes/nouvelle")({
  head: () => ({
    meta: [
      { title: "Nouvelle demande — Factory" },
      {
        name: "description",
        content:
          "Décrivez votre besoin : Factory compose automatiquement une squad d'agents IA et de contributeurs.",
      },
      { property: "og:title", content: "Nouvelle demande — Factory" },
      {
        property: "og:description",
        content: "Formulaire de création de demande avec squad suggérée automatiquement.",
      },
    ],
  }),
  component: NouvelleDemande,
});

const ROLES_STANDARD: RoleKey[] = ["PO", "PM", "ANALYST", "ARCHITECT", "DESIGNER", "DEV", "QA"];
const ROLES_COURT: RoleKey[] = ["PO", "DESIGNER", "DEV", "QA"];

function NouvelleDemande() {
  const factory = useFactory();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProjectType>("Power Platform");
  const [process, setProcess] = useState<ProcessKind>("Standard");
  const [demandeur, setDemandeur] = useState("Direction des opérations");
  const [priority, setPriority] = useState<Priority>("Normale");
  const [overrides, setOverrides] = useState<Record<string, Partial<SquadSlot>>>({});
  const [isComposing, setIsComposing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [aiReasons, setAiReasons] = useState<Record<string, string>>({});

  const roles = process === "Standard" ? ROLES_STANDARD : ROLES_COURT;

  const squad = useMemo<SquadSlot[]>(
    () =>
      roles.map((role) => {
        const defaultAgent = factory.agents.find((a) => a.role === role);
        const defaultPerson = factory.people.find((p) => p.role === role);
        const override = overrides[role];

        return {
          role,
          agentId:
            override !== undefined && "agentId" in override
              ? override.agentId
              : defaultAgent?.id,
          personId:
            override !== undefined && "personId" in override
              ? override.personId
              : defaultPerson?.id,
        };
      }),
    [roles, factory.agents, factory.people, overrides],
  );

  const handleComposeSquad = async () => {
    if (!title.trim()) {
      toast.error("Veuillez renseigner au moins un titre pour composer la squad.");
      return;
    }

    setIsComposing(true);
    setAiRecommendation(null);

    try {
      const res = await composeSquadWithCopilot({
        title: title.trim(),
        description: description.trim() || title.trim(),
        type,
        priority,
        process,
        roles,
      });

      if (res.status === "proposal_ready" && res.proposal) {
        const nextOverrides: Record<string, Partial<SquadSlot>> = { ...overrides };
        const nextReasons: Record<string, string> = {};

        for (const item of res.proposal) {
          const role = item.roleBusinessCode as RoleKey;
          const mappedAgentId = item.agentId
            ? (AGENT_GUID_MAP[item.agentId] ?? item.agentId)
            : undefined;

          nextOverrides[role] = {
            agentId: mappedAgentId,
            personId: item.personId ?? undefined,
          };

          if (item.reason) {
            nextReasons[role] = item.reason;
          }
        }

        setOverrides(nextOverrides);
        setAiReasons(nextReasons);
        setAiRecommendation(res.message);
        toast.success("Squad composée par l'agent IA !", {
          description: res.message,
        });
      } else if (res.status === "needs_clarification") {
        toast.info("Précisions requises par l'agent", {
          description: res.message,
        });
        setAiRecommendation(res.message);
      } else {
        const errMsg = res.message || res.reason || "Impossible de proposer une squad.";
        toast.warning("Proposition non disponible", {
          description: errMsg,
        });
        setAiRecommendation(errMsg);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error("Erreur Squad Composer", { description: errorMessage });
      setAiRecommendation(`Erreur : ${errorMessage}`);
    } finally {
      setIsComposing(false);
    }
  };

  const canSubmit = title.trim().length > 2 && description.trim().length > 10;

  return (
    <div className="mx-auto w-full max-w-[1300px] px-4 py-6 sm:px-8">
      <p className="eyebrow">Factory</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Nouvelle demande</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
        Décrivez le besoin métier. Factory sélectionne le process adapté et propose immédiatement
        une squad mixte : un agent IA et une personne par rôle.
      </p>

      <form
        className="mt-7 grid gap-6 lg:grid-cols-[1.5fr_1fr]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          const id = factory.createDemande({
            title: title.trim(),
            description: description.trim(),
            type,
            process,
            demandeur,
            priority,
            squad,
          });
          navigate({ to: "/demandes/$id", params: { id } });
        }}
      >
        <section className="panel space-y-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titre de la demande</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. Portail fournisseurs V1"
              className="rounded-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description du besoin</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contexte, utilisateurs cibles, résultat attendu, contraintes connues…"
              className="min-h-36 rounded-lg"
              required
            />
            <p className="text-muted-foreground text-xs">
              Plus la description est précise, plus la squad proposée est pertinente.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type de projet</Label>
              <Select value={type} onValueChange={(v) => setType(v as ProjectType)}>
                <SelectTrigger className="rounded-lg" aria-label="Type de projet">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Power Platform">Power Platform</SelectItem>
                  <SelectItem value="RPA">RPA</SelectItem>
                  <SelectItem value="Fullstack">Fullstack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="rounded-lg" aria-label="Priorité">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basse">Basse</SelectItem>
                  <SelectItem value="Normale">Normale</SelectItem>
                  <SelectItem value="Haute">Haute</SelectItem>
                  <SelectItem value="Critique">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="demandeur">Demandeur</Label>
            <Input
              id="demandeur"
              value={demandeur}
              onChange={(e) => setDemandeur(e.target.value)}
              className="rounded-lg"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Process</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["Standard", "Court"] as ProcessKind[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setProcess(p);
                    setOverrides({});
                    setAiReasons({});
                    setAiRecommendation(null);
                  }}
                  aria-pressed={process === p}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    process === p ? "border-primary bg-primary/6" : "hover:bg-muted/50"
                  }`}
                >
                  <span className="block text-sm font-semibold">
                    {p === "Standard" ? "Standard — 5 étapes" : "Court — 4 étapes"}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-xs">
                    {p === "Standard"
                      ? "Intake → Analysis → Design → Dev → Run"
                      : "Intake → Design → Dev → Run"}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" className="rounded-lg" disabled={!canSubmit}>
              Créer la demande
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="rounded-lg"
              onClick={() => navigate({ to: "/pipeline" })}
            >
              Annuler
            </Button>
          </div>
        </section>

        <motion.aside
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="panel h-fit p-6"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary size-4" />
              <h2 className="text-base font-semibold tracking-tight">Squad suggérée</h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleComposeSquad}
              disabled={isComposing || !title.trim()}
              className="gap-1.5 rounded-lg border-primary/30 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-all"
            >
              {isComposing ? (
                <>
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  <span>Composition IA…</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5 text-primary" />
                  <span>Squad Composer</span>
                </>
              )}
            </Button>
          </div>

          {aiRecommendation ? (
            <div className="mt-3 rounded-xl border border-primary/25 bg-primary/5 p-3 text-xs leading-relaxed text-foreground animate-in fade-in">
              <p className="mb-1 flex items-center gap-1.5 font-semibold text-primary">
                <Bot className="size-3.5" /> Recommandation Squad Composer
              </p>
              <p>{aiRecommendation}</p>
            </div>
          ) : (
            <p className="text-muted-foreground mt-2 text-sm">
              Composition proposée par le Factory Manager pour un projet {type} en process {process}.
              Cliquez sur <strong>Squad Composer</strong> pour composer avec l'agent IA.
            </p>
          )}

          <div className="mt-4 space-y-3">
            {squad.map((slot) => {
              const agent = factory.agents.find((a) => a.id === slot.agentId);
              const person = factory.people.find((p) => p.id === slot.personId);
              const altAgents = factory.agents.filter((a) => a.role === slot.role);
              const reason = aiReasons[slot.role];

              return (
                <div key={slot.role} className="rounded-xl border p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="eyebrow">{ROLE_LABELS[slot.role]}</p>
                    {altAgents.length > 1 && (
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
                        onClick={() => {
                          const idx = altAgents.findIndex((a) => a.id === slot.agentId);
                          const next = altAgents[(idx + 1) % altAgents.length];
                          setOverrides((o) => ({
                            ...o,
                            [slot.role]: { ...o[slot.role], agentId: next?.id },
                          }));
                        }}
                      >
                        <RefreshCw className="size-3" />
                        Changer
                      </button>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Bot className="text-agent size-4" />
                    <span className="truncate">{agent?.name ?? "Aucun agent disponible"}</span>
                    {agent?.status === "Bêta" && (
                      <Pill tone="warning" className="ml-auto">
                        Bêta
                      </Pill>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="bg-info/15 text-info grid size-5 place-items-center rounded-full text-[10px] font-semibold">
                      {person?.initials ?? "—"}
                    </span>
                    <select
                      aria-label={`Personne pour le rôle ${ROLE_LABELS[slot.role]}`}
                      value={slot.personId ?? ""}
                      onChange={(e) =>
                        setOverrides((o) => ({
                          ...o,
                          [slot.role]: {
                            ...o[slot.role],
                            personId: e.target.value || undefined,
                          },
                        }))
                      }
                      className="bg-transparent text-sm outline-none"
                    >
                      <option value="">Non assigné</option>
                      {factory.people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {reason && (
                    <div className="mt-2.5 rounded-lg border border-border/60 bg-muted/40 p-2 text-[11px] leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground">Justification IA : </span>
                      {reason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.aside>
      </form>
    </div>
  );
}
