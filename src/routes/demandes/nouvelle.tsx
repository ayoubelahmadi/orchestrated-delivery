import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Bot,
  Check,
  ChevronRight,
  File,
  FileSpreadsheet,
  FileText,
  Plus,
  Trash2,
  UploadCloud,
  UserRound,
  Workflow,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";

import { FactoryManagerPanel } from "@/components/factory/FactoryManagerPanel";
import { Pill } from "@/components/factory/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useFactory } from "@/lib/factory/store";
import {
  ROLE_LABELS,
  type Priority,
  type ProcessKind,
  type ProjectType,
  type RoleKey,
  type SquadSlot,
} from "@/lib/factory/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/demandes/nouvelle")({
  head: () => ({
    meta: [
      { title: "Nouvelle demande — Factory" },
      { name: "description", content: "Créez une demande, ajoutez son contexte et composez sa squad avec Factory Manager." },
      { property: "og:title", content: "Nouvelle demande — Factory" },
      { property: "og:description", content: "Espace de création de demande et de composition de squad." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NouvelleDemande,
});

const ALL_ROLES: RoleKey[] = ["PO", "PM", "ANALYST", "ARCHITECT", "DESIGNER", "DEV", "QA", "BRAINSTORMING"];
const ROLES_STANDARD: RoleKey[] = ["PO", "PM", "ANALYST", "ARCHITECT", "DESIGNER", "DEV", "QA"];
const ROLES_COURT: RoleKey[] = ["PO", "DESIGNER", "DEV", "QA"];

type Resource = { id: string; name: string; size: number; type: string };
type SquadMode = "ai" | "manual";

const UI = {
  fr: {
    title: "Nouvelle demande",
    intro: "Cadrez le besoin, ajoutez vos documents de contexte et composez la squad qui le portera.",
    need: "01 · Besoin",
    needTitle: "Informations de la demande",
    needHelp: "Les champs marqués d’un astérisque sont nécessaires pour démarrer.",
    titleLabel: "Titre de la demande",
    titlePlaceholder: "Ex. Portail fournisseurs V1",
    description: "Description du besoin",
    descriptionPlaceholder: "Contexte, utilisateurs cibles, résultat attendu, contraintes connues…",
    descriptionHelp: "Précisez le résultat attendu et les principales contraintes.",
    projectType: "Type de projet",
    priority: "Priorité",
    requester: "Demandeur",
    process: "Process",
    standard: "Standard — 5 étapes",
    short: "Court — 4 étapes",
    resources: "02 · Contexte",
    resourcesTitle: "Ressources de la demande",
    optional: "Optionnel",
    resourcesHelp: "Ajoutez des documents de contexte pour aider la Factory à mieux comprendre votre besoin.",
    drop: "Déposez vos fichiers ici",
    browse: "ou parcourir les fichiers",
    formats: "PDF, DOCX, PPTX, XLSX · 20 Mo maximum",
    remove: "Supprimer",
    squad: "03 · Équipe",
    squadTitle: "Composition de la squad",
    squadHelp: "L’IA recommande. Vous validez et ajustez chaque rôle.",
    aiMode: "Assistée par l’IA",
    manualMode: "Manuelle",
    aiAction: "Construire ma squad avec l’IA",
    aiReview: "Demander une optimisation",
    aiCopy: "Factory Manager analyse votre demande et propose la meilleure combinaison de personnes et d’agents IA.",
    manualCopy: "Composez directement votre squad. Vous pourrez demander une relecture à Factory Manager à tout moment.",
    proposed: "Squad proposée par l’IA",
    configured: "Squad configurée",
    agent: "Agent IA",
    person: "Personne",
    unassigned: "Non assigné",
    removeRole: "Retirer ce rôle",
    addRole: "Ajouter un rôle",
    selectRole: "Choisir un rôle",
    ready: "Prête à créer",
    notReady: "À compléter",
    infoComplete: "Informations complètes",
    infoMissing: "Informations à compléter",
    resourcesOptional: "Ressources facultatives",
    squadReady: "Squad configurée",
    squadMissing: "Ajoutez au moins un rôle",
    create: "Créer la demande",
    cancel: "Annuler",
    fileError: "Ce fichier dépasse 20 Mo.",
  },
  en: {
    title: "New request",
    intro: "Frame the need, add context documents and compose the squad that will deliver it.",
    need: "01 · Need",
    needTitle: "Request information",
    needHelp: "Fields marked with an asterisk are required to get started.",
    titleLabel: "Request title",
    titlePlaceholder: "E.g. Supplier portal V1",
    description: "Need description",
    descriptionPlaceholder: "Context, target users, expected outcome, known constraints…",
    descriptionHelp: "Describe the expected outcome and key constraints.",
    projectType: "Project type",
    priority: "Priority",
    requester: "Requester",
    process: "Process",
    standard: "Standard — 5 stages",
    short: "Short — 4 stages",
    resources: "02 · Context",
    resourcesTitle: "Request resources",
    optional: "Optional",
    resourcesHelp: "Add contextual documents to help Factory better understand your request.",
    drop: "Drop your files here",
    browse: "or browse files",
    formats: "PDF, DOCX, PPTX, XLSX · 20 MB maximum",
    remove: "Remove",
    squad: "03 · Team",
    squadTitle: "Squad composition",
    squadHelp: "AI recommends. You validate and adjust every role.",
    aiMode: "AI-assisted",
    manualMode: "Manual",
    aiAction: "Build my squad with AI",
    aiReview: "Ask for optimisation",
    aiCopy: "Factory Manager analyses your request and suggests the best combination of people and AI agents.",
    manualCopy: "Compose your squad directly. You can ask Factory Manager for a review at any time.",
    proposed: "AI-proposed squad",
    configured: "Configured squad",
    agent: "AI agent",
    person: "Person",
    unassigned: "Unassigned",
    removeRole: "Remove this role",
    addRole: "Add role",
    selectRole: "Choose a role",
    ready: "Ready to create",
    notReady: "Incomplete",
    infoComplete: "Information complete",
    infoMissing: "Complete the information",
    resourcesOptional: "Resources optional",
    squadReady: "Squad configured",
    squadMissing: "Add at least one role",
    create: "Create request",
    cancel: "Cancel",
    fileError: "This file is larger than 20 MB.",
  },
} as const;

function useUiLocale() {
  const [locale, setLocale] = useState<"fr" | "en">("fr");
  useEffect(() => {
    const stored = localStorage.getItem("factory-locale");
    const pageLanguage = document.documentElement.lang;
    setLocale(stored === "en" || pageLanguage.startsWith("en") ? "en" : "fr");
  }, []);
  return locale;
}

function NouvelleDemande() {
  const factory = useFactory();
  const navigate = useNavigate();
  const locale = useUiLocale();
  const t = UI[locale];
  const fileInput = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProjectType>("Power Platform");
  const [process, setProcess] = useState<ProcessKind>("Standard");
  const [demandeur, setDemandeur] = useState("Direction des opérations");
  const [priority, setPriority] = useState<Priority>("Normale");
  const [resources, setResources] = useState<Resource[]>([]);
  const [mode, setMode] = useState<SquadMode>("ai");
  const [managerOpen, setManagerOpen] = useState(false);
  const [aiProposed, setAiProposed] = useState(false);
  const [roleToAdd, setRoleToAdd] = useState<RoleKey | "">("");

  const initialSquad = useMemo<SquadSlot[]>(
    () =>
      ROLES_STANDARD.map((role) => ({
        role,
        agentId: factory.agents.find((agent) => agent.role === role)?.id,
        personId: factory.people.find((person) => person.role === role)?.id,
      })),
    [factory.agents, factory.people],
  );
  const [squad, setSquad] = useState<SquadSlot[]>(initialSquad);

  const proposal = useMemo<SquadSlot[]>(() => {
    const roles = process === "Standard" ? ROLES_STANDARD : ROLES_COURT;
    return roles.map((role) => ({
      role,
      agentId: factory.agents.find((agent) => agent.role === role)?.id,
      personId: factory.people.find((person) => person.role === role)?.id,
    }));
  }, [process, factory.agents, factory.people]);

  const infoComplete = title.trim().length > 2 && description.trim().length > 10 && demandeur.trim().length > 1;
  const squadComplete = squad.length > 0;
  const canSubmit = infoComplete && squadComplete;
  const availableRoles = ALL_ROLES.filter((role) => !squad.some((slot) => slot.role === role));

  const addFiles = (files: FileList | File[]) => {
    const incoming = Array.from(files);
    const accepted = incoming.filter((file) => {
      if (file.size <= 20 * 1024 * 1024) return true;
      toast.error(t.fileError, { description: file.name });
      return false;
    });
    setResources((current) => [
      ...current,
      ...accepted.map((file, index) => ({
        id: `${file.name}-${file.lastModified}-${index}`,
        name: file.name,
        size: file.size,
        type: file.name.split(".").pop()?.toUpperCase() ?? "FILE",
      })),
    ]);
  };

  const updateSlot = (role: RoleKey, patch: Partial<SquadSlot>) => {
    setSquad((current) => current.map((slot) => (slot.role === role ? { ...slot, ...patch } : slot)));
    setAiProposed(false);
  };

  return (
    <>
      <main className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-8 sm:py-8">
        <header className="mb-7 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Factory</p>
            <h1 className="mt-1 text-3xl font-semibold">{t.title}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm">{t.intro}</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <ReadinessDot done={infoComplete} label={t.needTitle} />
            <ChevronRight className="text-muted-foreground size-3.5" />
            <ReadinessDot done={squadComplete} label={t.squadTitle} />
          </div>
        </header>

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSubmit) return;
            const id = factory.createDemande({ title: title.trim(), description: description.trim(), type, process, demandeur, priority, squad });
            navigate({ to: "/demandes/$id", params: { id } });
          }}
        >
          <section className="panel overflow-hidden">
            <SectionHeader eyebrow={t.need} title={t.needTitle} help={t.needHelp} />
            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
              <div className="space-y-2 lg:col-span-2">
                <RequiredLabel htmlFor="title">{t.titleLabel}</RequiredLabel>
                <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t.titlePlaceholder} required />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <RequiredLabel htmlFor="description">{t.description}</RequiredLabel>
                <Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder={t.descriptionPlaceholder} className="min-h-28 resize-y" required />
                <p className="text-muted-foreground text-xs">{t.descriptionHelp}</p>
              </div>
              <SelectField label={t.projectType} value={type} onChange={(value) => setType(value as ProjectType)} options={["Power Platform", "RPA", "Fullstack"]} />
              <SelectField label={t.priority} value={priority} onChange={(value) => setPriority(value as Priority)} options={["Basse", "Normale", "Haute", "Critique"]} />
              <div className="space-y-2 lg:col-span-2">
                <RequiredLabel htmlFor="demandeur">{t.requester}</RequiredLabel>
                <Input id="demandeur" value={demandeur} onChange={(event) => setDemandeur(event.target.value)} required />
              </div>
              <fieldset className="space-y-3 lg:col-span-2">
                <legend className="text-sm font-medium">{t.process} <span className="text-primary">*</span></legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["Standard", "Court"] as ProcessKind[]).map((item) => (
                    <Button key={item} type="button" variant="outline" onClick={() => setProcess(item)} aria-pressed={process === item} className={cn("h-auto justify-start px-4 py-3 text-left", process === item && "border-primary bg-primary/5 ring-1 ring-primary/20")}>
                      <span className={cn("grid size-4 place-items-center rounded-full border", process === item && "border-primary")}>
                        {process === item && <span className="bg-primary size-2 rounded-full" />}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{item === "Standard" ? t.standard : t.short}</span>
                        <span className="text-muted-foreground mt-0.5 block text-xs font-normal">{item === "Standard" ? "Intake → Analysis → Design → Dev → Run" : "Intake → Design → Dev → Run"}</span>
                      </span>
                    </Button>
                  ))}
                </div>
              </fieldset>
            </div>
          </section>

          <section className="panel overflow-hidden">
            <SectionHeader eyebrow={t.resources} title={t.resourcesTitle} help={t.resourcesHelp} trailing={<Pill tone="neutral">{t.optional}</Pill>} />
            <div className="p-5 sm:p-6">
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); addFiles(event.dataTransfer.files); }}
                className="border-input bg-muted/20 hover:border-primary/50 hover:bg-primary/3 flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed px-5 py-6 text-center transition-colors"
              >
                <UploadCloud className="text-primary mb-2 size-6" />
                <p className="text-sm font-medium">{t.drop}</p>
                <Button type="button" variant="link" className="h-auto px-1 py-1" onClick={() => fileInput.current?.click()}>{t.browse}</Button>
                <p className="text-muted-foreground text-xs">{t.formats}</p>
                <input ref={fileInput} type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" className="sr-only" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = ""; }} />
              </div>
              {resources.length > 0 && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {resources.map((resource) => (
                    <div key={resource.id} className="flex min-w-0 items-center gap-3 rounded-lg border px-3 py-2.5">
                      <span className="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-lg"><ResourceIcon type={resource.type} /></span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{resource.name}</span><span className="text-muted-foreground text-xs">{resource.type} · {formatSize(resource.size)}</span></span>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon-sm" onClick={() => setResources((items) => items.filter((item) => item.id !== resource.id))}><Trash2 /></Button></TooltipTrigger><TooltipContent>{t.remove}</TooltipContent></Tooltip></TooltipProvider>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="panel overflow-hidden">
            <SectionHeader eyebrow={t.squad} title={t.squadTitle} help={t.squadHelp} />
            <div className="border-b px-5 py-4 sm:px-6">
              <div className="bg-muted inline-flex rounded-lg p-1">
                <Button type="button" size="sm" variant={mode === "ai" ? "secondary" : "ghost"} className={cn(mode === "ai" && "bg-background shadow-sm")} onClick={() => setMode("ai")}><Workflow />{t.aiMode}</Button>
                <Button type="button" size="sm" variant={mode === "manual" ? "secondary" : "ghost"} className={cn(mode === "manual" && "bg-background shadow-sm")} onClick={() => setMode("manual")}><UserRound />{t.manualMode}</Button>
              </div>
              <div className="mt-4 flex flex-col gap-4 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-center">
                <span className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl"><Workflow className="size-5" /></span>
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold">Factory Manager</p><p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">{mode === "ai" ? t.aiCopy : t.manualCopy}</p></div>
                <Button type="button" variant={mode === "ai" ? "default" : "outline"} onClick={() => setManagerOpen(true)} className="shrink-0">{mode === "ai" ? t.aiAction : t.aiReview}</Button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div><p className="text-sm font-semibold">{aiProposed ? t.proposed : t.configured}</p><p className="text-muted-foreground mt-0.5 text-xs">{squad.length} {locale === "fr" ? "rôles" : "roles"}</p></div>
                {aiProposed && <Pill tone="success"><Check className="size-3" /> IA</Pill>}
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {squad.map((slot) => (
                  <SquadCard key={slot.role} slot={slot} agents={factory.agents} people={factory.people} copy={t} onChange={(patch) => updateSlot(slot.role, patch)} onRemove={() => { setSquad((items) => items.filter((item) => item.role !== slot.role)); setAiProposed(false); }} />
                ))}
              </div>
              {availableRoles.length > 0 && (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Select value={roleToAdd} onValueChange={(value) => setRoleToAdd(value as RoleKey)}>
                    <SelectTrigger className="w-full sm:w-64" aria-label={t.selectRole}><SelectValue placeholder={t.selectRole} /></SelectTrigger>
                    <SelectContent>{availableRoles.map((role) => <SelectItem key={role} value={role}>{ROLE_LABELS[role]}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button type="button" variant="outline" disabled={!roleToAdd} onClick={() => { if (!roleToAdd) return; setSquad((items) => [...items, { role: roleToAdd }]); setRoleToAdd(""); setAiProposed(false); }}><Plus />{t.addRole}</Button>
                </div>
              )}
            </div>
          </section>

          <footer className="panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold"><span className={cn("grid size-5 place-items-center rounded-full", canSubmit ? "bg-success/12 text-success" : "bg-muted text-muted-foreground")}>{canSubmit ? <Check className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}</span>{canSubmit ? t.ready : t.notReady}</p>
              <div className="text-muted-foreground mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs"><span>{infoComplete ? t.infoComplete : t.infoMissing}</span><span>{t.resourcesOptional}</span><span>{squadComplete ? t.squadReady : t.squadMissing}</span></div>
            </div>
            <div className="flex items-center gap-2"><Button type="button" variant="ghost" onClick={() => navigate({ to: "/pipeline" })}>{t.cancel}</Button><Button type="submit" disabled={!canSubmit}>{t.create}<ChevronRight /></Button></div>
          </footer>
        </form>
      </main>

      <FactoryManagerPanel
        open={managerOpen}
        onOpenChange={setManagerOpen}
        locale={locale}
        context={{ title, description, process, resourceCount: resources.length, squad }}
        proposal={proposal}
        onApplyProposal={(slots) => { setSquad(slots); setAiProposed(true); }}
      />
    </>
  );
}

function SectionHeader({ eyebrow, title, help, trailing }: { eyebrow: string; title: string; help: string; trailing?: React.ReactNode }) {
  return <div className="flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6"><div><p className="eyebrow text-primary">{eyebrow}</p><h2 className="mt-1 text-base font-semibold">{title}</h2><p className="text-muted-foreground mt-1 text-xs">{help}</p></div>{trailing}</div>;
}

function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return <Label htmlFor={htmlFor}>{children} <span className="text-primary">*</span></Label>;
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <div className="space-y-2"><Label>{label} <span className="text-primary">*</span></Label><Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label}><SelectValue /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>;
}

function SquadCard({ slot, agents, people, copy, onChange, onRemove }: { slot: SquadSlot; agents: ReturnType<typeof useFactory>["agents"]; people: ReturnType<typeof useFactory>["people"]; copy: typeof UI.fr | typeof UI.en; onChange: (patch: Partial<SquadSlot>) => void; onRemove: () => void }) {
  return (
    <article className="relative rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between"><p className="eyebrow">{ROLE_LABELS[slot.role]}</p><TooltipProvider><Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}><X /></Button></TooltipTrigger><TooltipContent>{copy.removeRole}</TooltipContent></Tooltip></TooltipProvider></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5"><Label className="text-xs"><Bot className="text-primary mr-1 inline size-3.5" />{copy.agent}</Label><Select value={slot.agentId ?? "none"} onValueChange={(value) => onChange({ agentId: value === "none" ? undefined : value })}><SelectTrigger aria-label={`${copy.agent} — ${ROLE_LABELS[slot.role]}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">{copy.unassigned}</SelectItem>{agents.map((agent) => <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1.5"><Label className="text-xs"><UserRound className="text-info mr-1 inline size-3.5" />{copy.person}</Label><Select value={slot.personId ?? "none"} onValueChange={(value) => onChange({ personId: value === "none" ? undefined : value })}><SelectTrigger aria-label={`${copy.person} — ${ROLE_LABELS[slot.role]}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">{copy.unassigned}</SelectItem>{people.map((person) => <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>)}</SelectContent></Select></div>
      </div>
    </article>
  );
}

function ReadinessDot({ done, label }: { done: boolean; label: string }) {
  return <span className={cn("flex items-center gap-1.5", done ? "text-foreground" : "text-muted-foreground")}><span className={cn("size-1.5 rounded-full", done ? "bg-success" : "bg-muted-foreground/40")} />{label}</span>;
}

function ResourceIcon({ type }: { type: string }) {
  if (["XLS", "XLSX"].includes(type)) return <FileSpreadsheet className="size-4" />;
  if (["PDF", "DOC", "DOCX"].includes(type)) return <FileText className="size-4" />;
  return <File className="size-4" />;
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}