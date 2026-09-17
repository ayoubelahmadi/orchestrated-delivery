import { createFileRoute } from "@tanstack/react-router";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/factory/bits";
import { useFactory } from "@/lib/factory/store";

export const Route = createFileRoute("/parametres")({
  head: () => ({
    meta: [
      { title: "Paramètres — Factory" },
      {
        name: "description",
        content:
          "Réglages de la Factory : process par défaut, exécution des agents et intégrations Power Platform.",
      },
      { property: "og:title", content: "Paramètres — Factory" },
      {
        property: "og:description",
        content: "Configurez le comportement des agents et des process de delivery.",
      },
    ],
  }),
  component: Parametres,
});

function Row({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b px-5 py-4 last:border-b-0">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
      </div>
      <div className="shrink-0 pt-0.5">{control}</div>
    </div>
  );
}

function Parametres() {
  const { persona } = useFactory();

  return (
    <div className="mx-auto w-full max-w-[880px] px-4 py-8 sm:px-8">
      <p className="eyebrow">Configuration</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Paramètres</h1>

      <section className="panel mt-6 overflow-hidden">
        <div className="bg-muted/40 border-b px-5 py-3">
          <p className="eyebrow">Exécution des agents</p>
        </div>
        <Row
          title="Lancement automatique en début d'étape"
          description="Les tâches en mode Agent démarrent dès que l'étape s'ouvre."
          control={<Switch defaultChecked aria-label="Lancement automatique" />}
        />
        <Row
          title="Validation humaine obligatoire"
          description="Un livrable produit par un agent reste en brouillon jusqu'à validation."
          control={<Switch defaultChecked aria-label="Validation humaine obligatoire" />}
        />
        <Row
          title="Journal d'exécution détaillé"
          description="Conserver chaque étape intermédiaire des exécutions d'agents."
          control={<Switch aria-label="Journal détaillé" />}
        />
      </section>

      <section className="panel mt-6 overflow-hidden">
        <div className="bg-muted/40 border-b px-5 py-3">
          <p className="eyebrow">Process par défaut</p>
        </div>
        <Row
          title="Process appliqué aux nouvelles demandes"
          description="Standard · Intake → Analysis → Design → Dev → Run"
          control={<Pill tone="primary">Standard</Pill>}
        />
        <Row
          title="Seuil d'alerte de blocage"
          description="Nombre de jours dans une étape avant alerte sur le dashboard."
          control={
            <Input
              defaultValue="3"
              inputMode="numeric"
              aria-label="Seuil d'alerte en jours"
              className="w-20 rounded-lg text-center"
            />
          }
        />
      </section>

      <section className="panel mt-6 overflow-hidden">
        <div className="bg-muted/40 border-b px-5 py-3">
          <p className="eyebrow">Intégrations</p>
        </div>
        <Row
          title="Microsoft Dataverse"
          description="Synchronisation des demandes et livrables (à brancher)."
          control={<Pill tone="warning">Non connecté</Pill>}
        />
        <Row
          title="Power Platform CLI"
          description="Export des solutions depuis les environnements de la Factory."
          control={<Pill tone="warning">Non connecté</Pill>}
        />
      </section>

      <section className="panel mt-6 p-5">
        <Label className="text-sm font-medium">Persona de démonstration active</Label>
        <p className="text-muted-foreground mt-1 text-sm">
          Vue actuelle : <span className="text-foreground font-medium">{persona}</span>. Changez-la
          depuis l'en-tête pour démontrer chaque point de vue.
        </p>
      </section>
    </div>
  );
}
