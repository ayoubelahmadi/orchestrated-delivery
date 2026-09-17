import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, ChevronRight } from "lucide-react";

import { AgentChip, PersonChip, TypeTag } from "@/components/factory/bits";
import { useFactory } from "@/lib/factory/store";
import { ROLE_LABELS } from "@/lib/factory/types";

export const Route = createFileRoute("/squads")({
  head: () => ({
    meta: [
      { title: "Squads — Factory" },
      {
        name: "description",
        content:
          "Composez chaque squad en associant un agent IA et une personne pour chaque rôle du process.",
      },
      { property: "og:title", content: "Squads — Factory" },
      {
        property: "og:description",
        content: "Agents IA et contributeurs humains appairés rôle par rôle.",
      },
    ],
  }),
  component: Squads,
});

function Squads() {
  const { demandes, people, agents } = useFactory();

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-8">
      <p className="eyebrow">Composition des équipes</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Squads</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
        Chaque rôle du process est couvert par un binôme : un agent IA qui produit, une personne qui
        arbitre et valide.
      </p>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {demandes.map((d) => (
          <section key={d.id} className="panel p-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-base font-semibold tracking-tight">{d.title}</h2>
              <TypeTag type={d.type} />
              <Link
                to="/demandes/$id"
                params={{ id: d.id }}
                className="text-muted-foreground hover:text-foreground ml-auto inline-flex items-center gap-1 text-sm"
              >
                Ouvrir
                <ChevronRight className="size-4" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {d.squad.map((slot) => {
                const person = people.find((p) => p.id === slot.personId);
                const agent = agents.find((a) => a.id === slot.agentId);
                return (
                  <div
                    key={slot.role}
                    className="flex flex-wrap items-center gap-3 rounded-lg border px-3 py-3"
                  >
                    <span className="eyebrow w-28">{ROLE_LABELS[slot.role]}</span>
                    {agent ? (
                      <AgentChip agent={agent} />
                    ) : (
                      <span className="text-muted-foreground text-xs">Aucun agent</span>
                    )}
                    {person ? (
                      <PersonChip person={person} />
                    ) : (
                      <span className="text-muted-foreground text-xs">Aucune personne</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <section className="panel mt-8 p-5">
        <h2 className="text-base font-semibold tracking-tight">Contributeurs</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border px-4 py-3">
              <span className="bg-info/15 text-info grid size-10 place-items-center rounded-full text-xs font-semibold">
                {p.initials}
              </span>
              <span>
                <span className="block text-sm font-medium">{p.name}</span>
                <span className="text-muted-foreground block text-xs">{p.jobTitle}</span>
              </span>
            </div>
          ))}
          {agents.slice(0, 3).map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-lg border px-4 py-3">
              <span className="bg-agent/12 text-agent grid size-10 place-items-center rounded-full">
                <Bot className="size-4.5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{a.name}</span>
                <span className="text-muted-foreground block text-xs">Agent IA · {a.stage}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
