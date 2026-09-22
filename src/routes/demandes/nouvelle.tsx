import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  File,
  FileSpreadsheet,
  FileText,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
  UserRound,
  Users,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
      {
        name: "description",
        content:
          "Créez une demande, ajoutez son contexte et composez sa squad avec Factory Manager.",
      },
      { property: "og:title", content: "Nouvelle demande — Factory" },
      {
        property: "og:description",
        content: "Espace de création de demande et de composition de squad.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NouvelleDemande,
});

const ALL_ROLES: RoleKey[] = [
  "PO",
  "PM",
  "ANALYST",
  "ARCHITECT",
  "DESIGNER",
  "DEV",
  "QA",
  "BRAINSTORMING",
];
const ROLES_STANDARD: RoleKey[] = ["PO", "PM", "ANALYST", "ARCHITECT", "DESIGNER", "DEV", "QA"];
const ROLES_COURT: RoleKey[] = ["PO", "DESIGNER", "DEV", "QA"];
type Resource = { id: string; name: string; size: number; type: string };
type SquadMode = "ai" | "manual";

const UI = {
  fr: {
    title: "Nouvelle demande",
    intro: "Cadrez le besoin et composez l’équipe qui le portera.",
    need: "Besoin",
    needTitle: "Informations de la demande",
    needHelp: "Donnez à la Factory les éléments essentiels pour démarrer.",
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
    standardDescription:
      "Parcours complet pour les demandes nécessitant cadrage, analyse et conception.",
    shortDescription: "Parcours resserré pour les demandes déjà cadrées ou à délai court.",
    resources: "Contexte",
    resourcesTitle: "Ressources de la demande",
    optional: "Optionnel",
    resourcesHelp: "Ajoutez des documents pour aider la Factory à mieux comprendre votre besoin.",
    drop: "Glissez vos documents ici ou",
    browse: "parcourez les fichiers",
    addFiles: "Ajouter des fichiers",
    formats: "PDF, DOCX, PPTX, XLSX · 20 Mo max.",
    remove: "Supprimer",
    squad: "Squad workspace",
    squadTitle: "Composition de la squad",
    squadHelp: "L’IA recommande. Vous gardez le dernier mot.",
    aiMode: "Assistée par l’IA",
    manualMode: "Manuelle",
    aiAction: "Construire ma squad avec l’IA",
    aiContinue: "Continuer avec Factory Manager",
    aiReview: "Faire optimiser cette squad",
    aiCopy:
      "Analyse votre demande, son process et ses ressources pour proposer la meilleure combinaison de personnes et d’agents.",
    manualCopy: "Composez directement votre squad, rôle par rôle.",
    waiting: "Aucune squad générée",
    waitingHelp: "Lancez Factory Manager lorsque votre besoin est suffisamment renseigné.",
    proposed: "Squad proposée",
    configured: "Squad actuelle",
    agent: "Agent IA",
    person: "Personne",
    unassigned: "Non assigné",
    removeRole: "Retirer ce rôle",
    editRole: "Modifier ce rôle",
    addRole: "Ajouter un rôle",
    selectRole: "Choisir un rôle",
    requestContext: "Demande",
    resourceContext: "Ressources",
    complete: "Complet",
    incomplete: "À compléter",
    ready: "Prête à créer",
    missingOne: "1 information requise",
    missingMany: "informations requises",
    infoComplete: "Besoin renseigné",
    infoIncomplete: "Besoin à compléter",
    resourcesOptional: "Ressources optionnelles",
    squadReady: "Squad prête",
    squadIncomplete: "Squad à configurer",
    create: "Créer la demande",
    cancel: "Annuler",
    fileError: "Ce fichier dépasse 20 Mo.",
    roles: "rôles",
    noRole: "Commencez par ajouter un rôle à la squad.",
    searchRole: "Rechercher un rôle",
    noMatchingRole: "Aucun rôle disponible",
    proposalApplied: "La proposition a été appliquée. Vous gardez la main sur chaque rôle.",
  },
  en: {
    title: "New request",
    intro: "Frame the need and compose the team that will deliver it.",
    need: "Need",
    needTitle: "Request information",
    needHelp: "Give Factory the essential information it needs to get started.",
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
    short: "Court — 4 stages",
    standardDescription: "Complete path for requests requiring framing, analysis and design.",
    shortDescription: "Focused path for requests already framed or with a short deadline.",
    resources: "Context",
    resourcesTitle: "Request resources",
    optional: "Optional",
    resourcesHelp: "Add documents to help Factory better understand your request.",
    drop: "Drop documents here or",
    browse: "browse files",
    addFiles: "Add files",
    formats: "PDF, DOCX, PPTX, XLSX · 20 MB max.",
    remove: "Remove",
    squad: "Squad workspace",
    squadTitle: "Squad composition",
    squadHelp: "AI recommends. You keep the final say.",
    aiMode: "AI-assisted",
    manualMode: "Manual",
    aiAction: "Build my squad with AI",
    aiContinue: "Continue with Factory Manager",
    aiReview: "Optimise this squad",
    aiCopy:
      "Analyses your request, process and resources to suggest the best combination of people and agents.",
    manualCopy: "Compose your squad directly, role by role.",
    waiting: "No squad generated",
    waitingHelp: "Launch Factory Manager when your request has enough detail.",
    proposed: "Proposed squad",
    configured: "Current squad",
    agent: "AI agent",
    person: "Person",
    unassigned: "Unassigned",
    removeRole: "Remove role",
    editRole: "Edit role",
    addRole: "Add role",
    selectRole: "Choose a role",
    requestContext: "Request",
    resourceContext: "Resources",
    complete: "Complete",
    incomplete: "Incomplete",
    ready: "Ready to create",
    missingOne: "1 required item",
    missingMany: "required items",
    infoComplete: "Need complete",
    infoIncomplete: "Need incomplete",
    resourcesOptional: "Resources optional",
    squadReady: "Squad ready",
    squadIncomplete: "Squad to configure",
    create: "Create request",
    cancel: "Cancel",
    fileError: "This file is larger than 20 MB.",
    roles: "roles",
    noRole: "Start by adding a role to the squad.",
    searchRole: "Search roles",
    noMatchingRole: "No role available",
    proposalApplied: "The proposal has been applied. You remain in control of every role.",
  },
} as const;

function useUiLocale() {
  const [locale, setLocale] = useState<"fr" | "en">("fr");
  useEffect(() => {
    const stored = localStorage.getItem("factory-locale");
    setLocale(stored === "en" || document.documentElement.lang.startsWith("en") ? "en" : "fr");
  }, []);
  return locale;
}

function NouvelleDemande() {
  const factory = useFactory();
  const navigate = useNavigate();
  const locale = useUiLocale();
  const t = UI[locale];
  const fileInput = useRef<HTMLInputElement | null>(null);
  const titleInput = useRef<HTMLInputElement | null>(null);
  const descriptionInput = useRef<HTMLTextAreaElement | null>(null);
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
  const [squad, setSquad] = useState<SquadSlot[]>([]);
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");

  const proposal = useMemo<SquadSlot[]>(() => {
    const roles = process === "Standard" ? ROLES_STANDARD : ROLES_COURT;
    return roles.map((role) => ({
      role,
      agentId: factory.agents.find((agent) => agent.role === role)?.id,
      personId: factory.people.find((person) => person.role === role)?.id,
    }));
  }, [process, factory.agents, factory.people]);

  const infoComplete =
    title.trim().length > 2 && description.trim().length > 10 && demandeur.trim().length > 1;
  const squadComplete = squad.length > 0;
  const canSubmit = infoComplete && squadComplete;
  const missingCount = Number(!infoComplete) + Number(!squadComplete);
  const availableRoles = ALL_ROLES.filter((role) => !squad.some((slot) => slot.role === role));
  const visibleRoles = availableRoles.filter((role) =>
    ROLE_LABELS[role].toLocaleLowerCase(locale).includes(roleSearch.trim().toLocaleLowerCase(locale)),
  );
  const processStages =
    process === "Standard"
      ? "Intake → Analysis → Design → Dev → Run"
      : "Intake → Design → Dev → Run";

  const addFiles = (files: FileList | File[]) => {
    const accepted = Array.from(files).filter((file) => {
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

  const addRole = (role: RoleKey) => {
    setSquad((current) => [
      ...current,
      {
        role,
        agentId: factory.agents.find((agent) => agent.role === role)?.id,
        personId: factory.people.find((person) => person.role === role)?.id,
      },
    ]);
    setAiProposed(false);
    setAddRoleOpen(false);
    setRoleSearch("");
  };

  return (
    <>
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-7 sm:pt-7">
        <header className="mb-7 border-b pb-5">
          <p className="eyebrow">Factory / {t.need}</p>
          <div className="mt-1 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold sm:text-3xl">{t.title}</h1>
              <p className="text-muted-foreground mt-1.5 text-sm">{t.intro}</p>
            </div>
            <span
              className={cn(
                "hidden items-center gap-2 text-xs sm:flex",
                canSubmit ? "text-success" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  canSubmit ? "bg-success" : "bg-muted-foreground/40",
                )}
              />
              {canSubmit
                ? t.ready
                : `${missingCount} ${missingCount === 1 ? t.missingOne.replace("1 ", "") : t.missingMany}`}
            </span>
          </div>
        </header>

        <form
          onSubmit={(event) => {
            event.preventDefault();
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
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(390px,0.88fr)] xl:gap-12">
            <div className="min-w-0 space-y-8">
              <section>
                <SectionHeading
                  number="01"
                  eyebrow={t.need}
                  title={t.needTitle}
                  help={t.needHelp}
                />
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <RequiredLabel htmlFor="title">{t.titleLabel}</RequiredLabel>
                    <Input
                      ref={titleInput}
                      id="title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder={t.titlePlaceholder}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <RequiredLabel htmlFor="description">{t.description}</RequiredLabel>
                    <Textarea
                      ref={descriptionInput}
                      id="description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder={t.descriptionPlaceholder}
                      className="min-h-28 resize-y"
                      required
                    />
                    <p className="text-muted-foreground text-xs">{t.descriptionHelp}</p>
                  </div>
                  <SelectField
                    label={t.projectType}
                    value={type}
                    onChange={(value) => setType(value as ProjectType)}
                    options={["Power Platform", "RPA", "Fullstack"]}
                  />
                  <SelectField
                    label={t.priority}
                    value={priority}
                    onChange={(value) => setPriority(value as Priority)}
                    options={["Basse", "Normale", "Haute", "Critique"]}
                  />
                  <div className="space-y-2 sm:col-span-2">
                    <RequiredLabel htmlFor="demandeur">{t.requester}</RequiredLabel>
                    <Input
                      id="demandeur"
                      value={demandeur}
                      onChange={(event) => setDemandeur(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>
                      {t.process} <span className="text-primary">*</span>
                    </Label>
                    <Select
                      value={process}
                      onValueChange={(value) => setProcess(value as ProcessKind)}
                    >
                      <SelectTrigger aria-label={t.process}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standard">{t.standard}</SelectItem>
                        <SelectItem value="Court">{t.short}</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="bg-muted/45 rounded-lg px-3.5 py-2.5">
                      <p className="text-xs leading-relaxed">
                        {process === "Standard" ? t.standardDescription : t.shortDescription}
                      </p>
                      <p className="text-muted-foreground mt-1 text-[11px]">{processStages}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="border-t pt-6">
                <SectionHeading
                  number="02"
                  eyebrow={t.resources}
                  title={t.resourcesTitle}
                  help={t.resourcesHelp}
                  trailing={<Pill tone="neutral">{t.optional}</Pill>}
                />
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  className="sr-only"
                  onChange={(event) => {
                    if (event.target.files) addFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
                {resources.length === 0 ? (
                  <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event: DragEvent<HTMLDivElement>) => {
                      event.preventDefault();
                      addFiles(event.dataTransfer.files);
                    }}
                    className="border-input hover:border-primary/50 mt-4 flex items-center gap-2.5 rounded-lg border border-dashed px-3 py-2 transition-colors"
                  >
                    <UploadCloud className="text-muted-foreground size-4 shrink-0" />
                    <p className="text-muted-foreground min-w-0 truncate text-xs">
                      {t.drop}{" "}
                      <button
                        type="button"
                        className="text-primary underline-offset-4 hover:underline"
                        onClick={() => fileInput.current?.click()}
                      >
                        {t.browse}
                      </button>
                    </p>
                    <span className="text-border hidden shrink-0 sm:inline">·</span>
                    <span className="text-muted-foreground hidden shrink-0 text-[11px] sm:inline">
                      {t.formats}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-auto shrink-0"
                      onClick={() => fileInput.current?.click()}
                    >
                      <Plus />
                      {t.addFiles}
                    </Button>
                  </div>
                ) : (
                  <div className="mt-5 space-y-2">
                    {resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b py-2.5"
                      >
                        <span className="bg-muted text-muted-foreground grid size-8 shrink-0 place-items-center rounded-md">
                          <ResourceIcon type={resource.type} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {resource.name}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {resource.type} · {formatSize(resource.size)}
                          </span>
                        </span>
                        <IconTooltip label={t.remove}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              setResources((items) =>
                                items.filter((item) => item.id !== resource.id),
                              )
                            }
                          >
                            <Trash2 />
                          </Button>
                        </IconTooltip>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-1"
                      onClick={() => fileInput.current?.click()}
                    >
                      <Plus />
                      {t.addFiles}
                    </Button>
                  </div>
                )}
              </section>
            </div>

            <aside className="panel min-w-0 overflow-hidden lg:sticky lg:top-5">
              <div className="border-b px-5 py-4">
                <p className="eyebrow text-primary">03 · {t.squad}</p>
                <div className="mt-1 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold">{t.squadTitle}</h2>
                    <p className="text-muted-foreground mt-0.5 text-xs">{t.squadHelp}</p>
                  </div>
                  {mode === "ai" && aiProposed && (
                    <Pill tone="success">
                      <Check className="size-3" />
                      IA
                    </Pill>
                  )}
                </div>
                <div className="bg-muted mt-4 grid grid-cols-2 rounded-lg p-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={mode === "ai" ? "secondary" : "ghost"}
                    className={cn("w-full", mode === "ai" && "bg-background shadow-sm")}
                    onClick={() => setMode("ai")}
                  >
                    <Workflow />
                    {t.aiMode}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={mode === "manual" ? "secondary" : "ghost"}
                    className={cn("w-full", mode === "manual" && "bg-background shadow-sm")}
                    onClick={() => setMode("manual")}
                  >
                    <UserRound />
                    {t.manualMode}
                  </Button>
                </div>
              </div>

              <div className="px-5 py-4">
                <div className="bg-muted/40 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-lg">
                      <Workflow className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">Factory Manager</p>
                        {mode === "ai" && aiProposed && (
                          <span className="text-success text-[11px] font-medium">{t.proposed}</span>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        {mode === "ai" ? t.aiCopy : t.manualCopy}
                      </p>
                    </div>
                  </div>
                  {mode === "ai" && !aiProposed && (
                    <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3 text-[11px]">
                      <ContextState
                        label={t.requestContext}
                        value={infoComplete ? t.complete : t.incomplete}
                        done={infoComplete}
                      />
                      <ContextState label={t.process} value={process} done />
                      <ContextState
                        label={t.resourceContext}
                        value={String(resources.length)}
                        done={resources.length > 0}
                        neutral
                      />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant={mode === "ai" && !aiProposed ? "default" : "outline"}
                    className="mt-4 w-full"
                    onClick={() => setManagerOpen(true)}
                  >
                    <Workflow />
                    {mode === "manual" ? t.aiReview : aiProposed ? t.aiContinue : t.aiAction}
                  </Button>
                </div>
              </div>

              <div className="border-t">
                {mode === "ai" && !aiProposed && squad.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <span className="bg-muted text-muted-foreground mx-auto grid size-10 place-items-center rounded-full">
                      <Users className="size-4" />
                    </span>
                    <p className="mt-3 text-sm font-medium">{t.waiting}</p>
                    <p className="text-muted-foreground mx-auto mt-1 max-w-xs text-xs leading-relaxed">
                      {t.waitingHelp}
                    </p>
                  </div>
                ) : (
                  <div className="px-5 py-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold">
                        {mode === "ai" && aiProposed ? t.proposed : t.configured}
                      </p>
                      <span className="text-muted-foreground text-xs">
                        {squad.length} {t.roles}
                      </span>
                    </div>
                    {squad.length === 0 ? (
                      <p className="text-muted-foreground py-6 text-center text-xs">{t.noRole}</p>
                    ) : (
                      <div className="divide-y">
                        {squad.map((slot) => (
                          <SquadRow
                            key={slot.role}
                            slot={slot}
                            agents={factory.agents}
                            people={factory.people}
                            copy={t}
                            expandedByDefault={mode === "manual" && squad.length <= 2}
                            onChange={(patch) => {
                              setSquad((items) =>
                                items.map((item) =>
                                  item.role === slot.role ? { ...item, ...patch } : item,
                                ),
                              );
                              setAiProposed(false);
                            }}
                            onRemove={() => {
                              setSquad((items) => items.filter((item) => item.role !== slot.role));
                              setAiProposed(false);
                            }}
                          />
                        ))}
                      </div>
                    )}
                    {availableRoles.length > 0 && (
                      <Popover
                        open={addRoleOpen}
                        onOpenChange={(open) => {
                          setAddRoleOpen(open);
                          if (!open) setRoleSearch("");
                        }}
                      >
                        <PopoverTrigger asChild>
                          <Button type="button" variant="ghost" size="sm" className="mt-3">
                            <Plus />
                            {t.addRole}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          side="top"
                          sideOffset={8}
                          className="w-72 p-2"
                        >
                          <p className="text-muted-foreground px-2 pb-2 pt-1 text-xs">
                            {t.selectRole}
                          </p>
                          {availableRoles.length > 5 && (
                            <Input
                              value={roleSearch}
                              onChange={(event) => setRoleSearch(event.target.value)}
                              placeholder={t.searchRole}
                              aria-label={t.searchRole}
                              className="mb-2 h-9"
                            />
                          )}
                          <div className="max-h-64 space-y-0.5 overflow-y-auto">
                            {visibleRoles.length ? (
                              visibleRoles.map((role) => (
                                <Button
                                  key={role}
                                  type="button"
                                  variant="ghost"
                                  className="w-full justify-start"
                                  onClick={() => addRole(role)}
                                >
                                  {ROLE_LABELS[role]}
                                </Button>
                              ))
                            ) : (
                              <p className="text-muted-foreground px-2 py-3 text-xs">
                                {t.noMatchingRole}
                              </p>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                )}
              </div>
            </aside>
          </div>

          <footer className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky bottom-0 z-20 mt-10 flex flex-col gap-3 border-t py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <ReadyItem done={infoComplete} label={infoComplete ? t.infoComplete : t.infoIncomplete} />
              <ReadyItem done={false} label={t.resourcesOptional} muted />
              <ReadyItem done={squadComplete} label={squadComplete ? t.squadReady : t.squadIncomplete} />
            </div>
            <div className="flex shrink-0 justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => navigate({ to: "/pipeline" })}>
                {t.cancel}
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {t.create}
                <ChevronRight />
              </Button>
            </div>
          </footer>
        </form>
      </main>

      <FactoryManagerPanel
        open={managerOpen}
        onOpenChange={setManagerOpen}
        locale={locale}
        context={{ title, description, process, resourceCount: resources.length, squad }}
        proposal={proposal}
        onApplyProposal={(slots) => {
          setSquad(slots);
          setAiProposed(true);
          toast.success(t.proposalApplied);
        }}
        onCompleteRequest={() => {
          const target = title.trim().length <= 2 ? titleInput.current : descriptionInput.current;
          target?.scrollIntoView({ behavior: "smooth", block: "center" });
          window.setTimeout(() => target?.focus(), 240);
        }}
      />
    </>
  );
}

function SectionHeading({
  number,
  eyebrow,
  title,
  help,
  trailing,
}: {
  number: string;
  eyebrow: string;
  title: string;
  help: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
      <span className="text-primary mt-0.5 text-xs font-semibold">{number}</span>
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-1 text-base font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-1 text-xs">{help}</p>
      </div>
      {trailing}
    </div>
  );
}

function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <Label htmlFor={htmlFor}>
      {children} <span className="text-primary">*</span>
    </Label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label} <span className="text-primary">*</span>
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SquadRow({
  slot,
  agents,
  people,
  copy,
  expandedByDefault,
  onChange,
  onRemove,
}: {
  slot: SquadSlot;
  agents: ReturnType<typeof useFactory>["agents"];
  people: ReturnType<typeof useFactory>["people"];
  copy: typeof UI.fr | typeof UI.en;
  expandedByDefault: boolean;
  onChange: (patch: Partial<SquadSlot>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(expandedByDefault);
  const agent = agents.find((item) => item.id === slot.agentId);
  const person = people.find((item) => item.id === slot.personId);
  return (
    <article className="py-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <p className="eyebrow truncate">{ROLE_LABELS[slot.role]}</p>
          <div className="mt-1 flex min-w-0 items-center gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-1.5">
              <Bot className="text-primary size-3.5 shrink-0" />
              <span className="truncate">{agent?.name ?? copy.unassigned}</span>
            </span>
            <span className="text-border">/</span>
            <span className="flex min-w-0 items-center gap-1.5">
              <UserRound className="text-info size-3.5 shrink-0" />
              <span className="truncate">{person?.name ?? copy.unassigned}</span>
            </span>
          </div>
        </div>
        <IconTooltip label={copy.editRole}>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? <ChevronDown /> : <Pencil />}
          </Button>
        </IconTooltip>
      </div>
      {expanded && (
        <div className="bg-muted/40 mt-3 rounded-lg p-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <AssignmentSelect
              label={copy.agent}
              icon={<Bot className="text-primary size-3.5" />}
              value={slot.agentId}
              options={agents.map((item) => ({ id: item.id, name: item.name }))}
              unassigned={copy.unassigned}
              onChange={(value) => onChange({ agentId: value })}
            />
            <AssignmentSelect
              label={copy.person}
              icon={<UserRound className="text-info size-3.5" />}
              value={slot.personId}
              options={people.map((item) => ({ id: item.id, name: item.name }))}
              unassigned={copy.unassigned}
              onChange={(value) => onChange({ personId: value })}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive mt-2"
            onClick={onRemove}
          >
            <X />
            {copy.removeRole}
          </Button>
        </div>
      )}
    </article>
  );
}

function AssignmentSelect({
  label,
  icon,
  value,
  options,
  unassigned,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: string | undefined;
  options: { id: string; name: string }[];
  unassigned: string;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs">
        {icon}
        {label}
      </Label>
      <Select
        value={value ?? "none"}
        onValueChange={(next) => onChange(next === "none" ? undefined : next)}
      >
        <SelectTrigger aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">{unassigned}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ContextState({
  label,
  value,
  done,
  neutral,
}: {
  label: string;
  value: string;
  done: boolean;
  neutral?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-muted-foreground truncate">{label}</p>
      <p
        className={cn(
          "mt-0.5 truncate font-medium",
          done ? "text-foreground" : neutral ? "text-muted-foreground" : "text-primary",
        )}
      >
        {done && !neutral && <Check className="mr-1 inline size-3" />}
        {value}
      </p>
    </div>
  );
}
function ReadyItem({ done, label, muted }: { done: boolean; label: string; muted?: boolean }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5",
        done && !muted ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "grid size-4 place-items-center rounded-full",
          done && !muted ? "bg-success/12 text-success" : "bg-muted",
        )}
      >
        {done ? (
          <Check className="size-2.5" />
        ) : (
          <span className="size-1 rounded-full bg-current" />
        )}
      </span>
      {label}
    </span>
  );
}
function IconTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
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
