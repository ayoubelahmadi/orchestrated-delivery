import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft, Download, FileText, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, Markdown, Pill } from "@/components/factory/bits";
import { useFactory } from "@/lib/factory/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/demandes/$id/livrables")({
  head: () => ({
    meta: [
      { title: "Livrables de la demande — Factory" },
      {
        name: "description",
        content:
          "Documents markdown produits par les agents et les contributeurs, avec édition et aperçu en direct.",
      },
      { property: "og:title", content: "Livrables — Factory" },
      {
        property: "og:description",
        content: "Édition markdown des livrables avec aperçu instantané et versions.",
      },
    ],
  }),
  component: Livrables,
});

function Livrables() {
  const { id } = Route.useParams();
  const factory = useFactory();
  const demande = factory.getDemande(id);
  if (!demande) throw notFound();

  const docs = factory.livrablesOf(demande.id);
  const [selectedId, setSelectedId] = useState(docs[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const selected = docs.find((d) => d.id === selectedId) ?? docs[0];
  const [draft, setDraft] = useState(selected?.content ?? "");

  useEffect(() => {
    setDraft(selected?.content ?? "");
  }, [selected?.id, selected?.content]);

  const filtered = useMemo(
    () => docs.filter((d) => d.name.toLowerCase().includes(query.toLowerCase())),
    [docs, query],
  );

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-8">
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
        <span className="text-foreground font-medium">Livrables</span>
      </div>

      {docs.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<FileText className="size-8" />}
            title="Aucun livrable pour l'instant"
            description="Lancez un agent depuis une tâche : le document produit apparaîtra ici."
            action={
              <Button asChild className="rounded-lg">
                <Link to="/demandes/$id" params={{ id: demande.id }}>
                  Revenir à la demande
                </Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="panel h-fit p-4">
            <h2 className="text-base font-semibold tracking-tight">Livrables</h2>
            <div className="relative mt-3">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un document…"
                aria-label="Rechercher un document"
                className="rounded-lg pl-9"
              />
            </div>
            <div className="mt-3 space-y-1.5">
              {filtered.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedId(d.id)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                    d.id === selected?.id
                      ? "border-primary/30 bg-primary/6"
                      : "hover:bg-muted/60 border-transparent",
                  )}
                >
                  <span className="flex items-start gap-2">
                    <FileText className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{d.name}</span>
                      <span className="text-muted-foreground block text-xs">
                        {d.stage} · {d.updatedLabel}
                      </span>
                    </span>
                  </span>
                  <span className="mt-2 inline-block">
                    <Pill tone={d.status === "À jour" ? "success" : "warning"}>{d.status}</Pill>
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-muted-foreground px-1 py-3 text-sm">Aucun document trouvé.</p>
              )}
            </div>
          </aside>

          {selected && (
            <section className="panel overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 border-b px-5 py-4">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold tracking-tight">
                    {selected.name}
                  </h2>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Modifié par {selected.updatedBy} · {selected.updatedLabel} · étape{" "}
                    {selected.stage}
                    {selected.versions.length > 0 && ` · v${selected.versions.length + 1}`}
                  </p>
                </div>
                <div className="ml-auto flex gap-2">
                  <Button
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => toast.success("Téléchargement du document lancé")}
                  >
                    <Download className="size-4" />
                    Télécharger
                  </Button>
                  <Button
                    className="rounded-lg"
                    disabled={draft === selected.content}
                    onClick={() => factory.updateLivrable(selected.id, draft)}
                  >
                    Enregistrer les modifications
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="apercu">
                <div className="border-b px-5 pt-3">
                  <TabsList className="rounded-lg">
                    <TabsTrigger value="apercu" className="rounded-md">
                      Aperçu
                    </TabsTrigger>
                    <TabsTrigger value="modifier" className="rounded-md">
                      Modifier
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="apercu" className="px-6 py-5">
                  <Markdown content={draft} />
                </TabsContent>
                <TabsContent value="modifier" className="grid gap-0 lg:grid-cols-2">
                  <div className="border-r p-4">
                    <p className="eyebrow mb-2">Markdown</p>
                    <Textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      aria-label="Contenu markdown"
                      className="min-h-[520px] resize-none rounded-lg font-mono text-[13px] leading-relaxed"
                    />
                  </div>
                  <div className="p-4">
                    <p className="eyebrow mb-2">Aperçu</p>
                    <div className="max-h-[520px] overflow-y-auto pr-2">
                      <Markdown content={draft} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
