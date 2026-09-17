import { createFileRoute } from "@tanstack/react-router";
import { Bot, Users } from "lucide-react";

import { Pill } from "@/components/factory/bits";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFactory } from "@/lib/factory/store";
import { ROLE_LABELS, type RoleKey } from "@/lib/factory/types";

export const Route = createFileRoute("/referentiel")({
  head: () => ({
    meta: [
      { title: "Référentiel des agents et rôles — Factory" },
      {
        name: "description",
        content:
          "Catalogue extensible des agents IA de la Factory et des rôles humains du process de delivery.",
      },
      { property: "og:title", content: "Référentiel — Factory" },
      {
        property: "og:description",
        content: "Agents IA, rôles et responsabilités du process de delivery.",
      },
    ],
  }),
  component: Referentiel,
});

const ROLE_DESCRIPTIONS: Record<RoleKey, string> = {
  PO: "Porte la valeur métier, arbitre le périmètre et valide les livrables fonctionnels.",
  PM: "Cadre la vision produit, les indicateurs et la trajectoire de livraison.",
  ANALYST: "Qualifie les besoins, évalue la faisabilité et documente les règles de gestion.",
  ARCHITECT: "Arbitre les choix techniques et garantit la cohérence de la plateforme.",
  DESIGNER: "Conçoit les parcours utilisateurs et les écrans clés.",
  DEV: "Réalise, teste et déploie les composants de la solution.",
  QA: "Construit la recette et statue sur les critères de sortie.",
  BRAINSTORMING: "Ouvre le champ des possibles au démarrage d'une demande.",
};

function Referentiel() {
  const { agents } = useFactory();

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-8">
      <p className="eyebrow">Catalogue</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Référentiel</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
        Les agents IA disponibles dans la Factory et les rôles humains qui les accompagnent. Le
        catalogue est extensible : chaque nouvel agent hérite du même cycle d'exécution.
      </p>

      <Tabs defaultValue="agents" className="mt-6">
        <TabsList className="rounded-xl">
          <TabsTrigger value="agents" className="rounded-lg">
            <Bot className="size-4" />
            Agents IA
          </TabsTrigger>
          <TabsTrigger value="roles" className="rounded-lg">
            <Users className="size-4" />
            Rôles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="mt-5 grid gap-4 md:grid-cols-2">
          {agents.map((a) => (
            <article key={a.id} className="panel p-5">
              <div className="flex items-start gap-3">
                <span className="bg-agent/12 text-agent grid size-10 shrink-0 place-items-center rounded-xl">
                  <Bot className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold">{a.name}</h2>
                  <p className="text-muted-foreground mt-1 text-sm">{a.description}</p>
                </div>
                <Pill tone={a.status === "Actif" ? "success" : "warning"} className="ml-auto">
                  {a.status}
                </Pill>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Pill tone="neutral">Rôle · {ROLE_LABELS[a.role]}</Pill>
                <Pill tone="neutral">Étape · {a.stage}</Pill>
                <Pill tone="agent">{a.steps.length} étapes d'exécution</Pill>
              </div>
            </article>
          ))}
        </TabsContent>

        <TabsContent value="roles" className="mt-5 grid gap-4 md:grid-cols-2">
          {(Object.keys(ROLE_DESCRIPTIONS) as RoleKey[]).map((role) => (
            <article key={role} className="panel p-5">
              <h2 className="text-sm font-semibold">{ROLE_LABELS[role]}</h2>
              <p className="text-muted-foreground mt-1.5 text-sm">{ROLE_DESCRIPTIONS[role]}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {agents
                  .filter((a) => a.role === role)
                  .map((a) => (
                    <Pill key={a.id} tone="agent">
                      <Bot className="size-3.5" />
                      {a.name}
                    </Pill>
                  ))}
              </div>
            </article>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
