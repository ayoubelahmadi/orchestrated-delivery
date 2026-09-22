import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { Check, CircleDot, CornerUpLeft, Workflow, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import type { ProcessKind, SquadSlot } from "@/lib/factory/types";

type ManagerMessage = { id: string; role: "assistant" | "user"; text: string };
type PanelPhase = "idle" | "incomplete" | "analysing" | "question" | "proposed" | "applied";

export interface FactoryManagerContext {
  title: string;
  description: string;
  process: ProcessKind;
  resourceCount: number;
  squad: SquadSlot[];
}

const COPY = {
  fr: {
    subtitle: "Agent IA · Composition de squad",
    context: "Contexte analysé",
    request: "Informations de la demande",
    incomplete: "À compléter",
    process: "Process",
    resources: "ressource(s)",
    currentSquad: "Squad actuelle",
    none: "aucune",
    roles: "rôles",
    intro:
      "Je vais analyser votre besoin, puis vous proposer une combinaison équilibrée de personnes et d’agents IA. Vous gardez la main sur chaque rôle.",
    enough:
      "J’ai analysé votre demande et j’ai suffisamment de contexte pour vous proposer une squad adaptée.",
    question: "Cette solution doit-elle s’intégrer à des systèmes existants ?",
    proposed:
      "Je recommande une squad resserrée autour du cadrage produit, de l’architecture, de l’expérience et de la réalisation. Elle est prête à être validée.",
    missing:
      "Avant d’analyser votre besoin, complétez les informations essentielles de la demande.",
    completeRequest: "Compléter la demande",
    analysing: "Factory Manager analyse le contexte…",
    placeholder: "Répondre ou demander une modification…",
    proposalReady: "Proposition prête",
    apply: "Appliquer cette proposition",
    applied: "Proposition appliquée",
    simulated: "Conversation simulée",
    close: "Fermer Factory Manager",
  },
  en: {
    subtitle: "AI agent · Squad composition",
    context: "Context analysed",
    request: "Request information",
    incomplete: "Incomplete",
    process: "Process",
    resources: "resource(s)",
    currentSquad: "Current squad",
    none: "none",
    roles: "roles",
    intro:
      "I’ll analyse your request, then suggest a balanced combination of people and AI agents. You remain in control of every role.",
    enough: "I’ve analysed your request and have enough context to suggest a suitable squad.",
    question: "Does this solution need to integrate with existing systems?",
    proposed:
      "I recommend a focused squad covering product framing, architecture, experience and delivery. It is ready for your approval.",
    missing: "Before analysing your need, complete the essential request information.",
    completeRequest: "Complete request",
    analysing: "Factory Manager is analysing the context…",
    placeholder: "Reply or request a change…",
    proposalReady: "Proposal ready",
    apply: "Apply this proposal",
    applied: "Proposal applied",
    simulated: "Simulated conversation",
    close: "Close Factory Manager",
  },
} as const;

export function FactoryManagerPanel({
  open,
  onOpenChange,
  context,
  proposal,
  onApplyProposal,
  onCompleteRequest,
  locale,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: FactoryManagerContext;
  proposal: SquadSlot[];
  onApplyProposal: (slots: SquadSlot[]) => void;
  onCompleteRequest: () => void;
  locale: "fr" | "en";
}) {
  const t = COPY[locale];
  const [messages, setMessages] = useState<ManagerMessage[]>([]);
  const [phase, setPhase] = useState<PanelPhase>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const requestComplete = context.title.trim().length > 2 && context.description.trim().length > 10;

  useEffect(() => {
    if (!open) return;
    if (messages.length === 0) {
      setMessages([{ id: "intro", role: "assistant", text: t.intro }]);
    }
    window.setTimeout(() => inputRef.current?.focus(), 160);
  }, [open, messages.length, t.intro]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  const finishProposal = () => {
    setMessages((items) => [
      ...items,
      { id: `enough-${Date.now()}`, role: "assistant", text: t.enough },
      { id: `proposal-${Date.now()}`, role: "assistant", text: t.proposed },
    ]);
    setPhase("proposed");
    window.setTimeout(() => inputRef.current?.focus(), 120);
  };

  const analyse = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!requestComplete) {
      setMessages((items) => {
        if (items.some((message) => message.id === "missing-request")) return items;
        return [...items, { id: "missing-request", role: "assistant", text: t.missing }];
      });
      setPhase("incomplete");
      return;
    }
    setPhase("analysing");
    timers.current.push(
      setTimeout(() => {
        if (context.resourceCount > 0) {
          finishProposal();
        } else {
          setMessages((items) => [
            ...items,
            { id: `question-${Date.now()}`, role: "assistant", text: t.question },
          ]);
          setPhase("question");
          window.setTimeout(() => inputRef.current?.focus(), 120);
        }
      }, 1350),
    );
  };

  useEffect(() => {
    if (open && (phase === "idle" || (phase === "incomplete" && requestComplete))) analyse();
    // The first analysis intentionally starts only once per panel session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, requestComplete]);

  const submit = ({ text }: { text: string }) => {
    const clean = text.trim();
    if (!clean || phase === "analysing" || phase === "incomplete") return;
    setMessages((items) => [...items, { id: `user-${Date.now()}`, role: "user", text: clean }]);
    setPhase("analysing");
    timers.current.push(setTimeout(finishProposal, 1200));
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 lg:bg-transparent lg:backdrop-blur-none" />
        <DialogPrimitive.Content className="bg-background fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l shadow-lift outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-[580px]">
          <header className="border-b px-5 py-4 pr-16 sm:px-6 sm:pr-16">
            <div className="flex min-w-0 items-center gap-3">
              <span className="bg-primary/12 text-primary grid size-10 place-items-center rounded-xl">
                <Workflow className="size-5" />
              </span>
              <div className="min-w-0">
                <DialogPrimitive.Title className="text-base font-semibold">
                  Factory Manager
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-muted-foreground text-xs">
                  {t.subtitle}
                </DialogPrimitive.Description>
              </div>
              <span className="bg-success/10 text-success ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium">
                <CircleDot className="size-3" /> {locale === "fr" ? "En ligne" : "Online"}
              </span>
            </div>
          </header>
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              aria-label={t.close}
            >
              <X />
            </Button>
          </DialogPrimitive.Close>

          <section className="border-b px-5 py-4 sm:px-6">
            <p className="eyebrow mb-3">{t.context}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <ContextLine
                label={t.request}
                value={requestComplete ? "✓" : t.incomplete}
                ok={requestComplete}
              />
              <ContextLine label={t.process} value={context.process} ok />
              <ContextLine
                label={`${context.resourceCount} ${t.resources}`}
                value={context.resourceCount ? "✓" : "—"}
                ok={context.resourceCount > 0}
              />
              <ContextLine
                label={t.currentSquad}
                value={context.squad.length ? `${context.squad.length} ${t.roles}` : t.none}
                ok={context.squad.length > 0}
              />
            </div>
          </section>

          <Conversation className="min-h-0">
            <ConversationContent className="gap-5 px-5 py-6 sm:px-6">
              {messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  {message.role === "assistant" && (
                    <span className="text-muted-foreground flex items-center gap-2 text-[11px] font-medium uppercase">
                      <Workflow className="text-primary size-3.5" /> Factory Manager
                    </span>
                  )}
                  <MessageContent className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground">
                    <MessageResponse>{message.text}</MessageResponse>
                  </MessageContent>
                </Message>
              ))}
              <AnimatePresence initial={false}>
                {phase === "analysing" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Shimmer className="text-sm">{t.analysing}</Shimmer>
                  </motion.div>
                )}
              </AnimatePresence>
              {phase === "incomplete" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => {
                    onOpenChange(false);
                    window.setTimeout(onCompleteRequest, 120);
                  }}
                >
                  <CornerUpLeft />
                  {t.completeRequest}
                </Button>
              )}
              {phase === "proposed" && (
                <div className="border-primary/25 bg-primary/5 flex flex-col items-start gap-3 rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <CircleDot className="text-primary size-4" /> {t.proposalReady}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      onApplyProposal(proposal);
                      setPhase("applied");
                    }}
                  >
                    <Check />
                    {t.apply}
                  </Button>
                </div>
              )}
              {phase === "applied" && (
                <div className="border-success/25 bg-success/5 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium">
                  <Check className="text-success size-4" /> {t.applied}
                </div>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="border-t p-4 sm:px-6">
            <PromptInput onSubmit={submit}>
              <PromptInputTextarea
                ref={inputRef}
                placeholder={t.placeholder}
                className="min-h-20"
              />
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit
                  status={phase === "analysing" ? "submitted" : "ready"}
                  disabled={phase === "analysing" || phase === "incomplete"}
                  aria-label={locale === "fr" ? "Envoyer" : "Send"}
                />
              </PromptInputFooter>
            </PromptInput>
            <p className="text-muted-foreground mt-2 text-center text-[10px]">{t.simulated}</p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function ContextLine({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-2 border-b py-1.5">
      <span className="text-muted-foreground truncate">{label}</span>
      <span className={ok ? "text-success font-medium" : "text-muted-foreground"}>{value}</span>
    </div>
  );
}
