import { Bot, Check, Flag } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type {
  Agent,
  DemandeStatus,
  ExecutionMode,
  Person,
  ProjectType,
  TaskStatus,
} from "@/lib/factory/types";

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "agent" | "primary";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-muted text-muted-foreground",
    success: "bg-success/12 text-success",
    warning: "bg-warning/18 text-warning",
    danger: "bg-destructive/12 text-destructive",
    info: "bg-info/12 text-info",
    agent: "bg-agent/12 text-agent",
    primary: "bg-primary/12 text-primary",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function TypeTag({ type }: { type: ProjectType }) {
  const tone = type === "Power Platform" ? "warning" : type === "RPA" ? "success" : "agent";
  return <Pill tone={tone}>{type}</Pill>;
}

export function StatusPill({ status }: { status: TaskStatus | DemandeStatus }) {
  const map: Record<string, "neutral" | "info" | "danger" | "success" | "primary"> = {
    "À faire": "neutral",
    "En cours": "info",
    Bloquée: "danger",
    Terminé: "success",
    Nouvelle: "primary",
  };
  return <Pill tone={map[status] ?? "neutral"}>{status}</Pill>;
}

export function ModeBadge({ mode }: { mode: ExecutionMode }) {
  const label =
    mode === "Agent" ? "Agent seul" : mode === "Personne" ? "Personne seule" : "Agent + Personne";
  return (
    <Pill tone={mode === "Personne" ? "neutral" : "agent"}>
      {mode !== "Personne" && <Bot className="size-3.5" />}
      {label}
    </Pill>
  );
}

export function PersonChip({ person, muted }: { person: Person; muted?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1 pr-3 pl-1 text-xs font-medium",
        muted && "opacity-70",
      )}
    >
      <span className="bg-info/15 text-info grid size-6 place-items-center rounded-full text-[10px] font-semibold">
        {person.initials}
      </span>
      {person.name}
    </span>
  );
}

export function AgentChip({ agent }: { agent: Agent }) {
  return (
    <span className="border-agent/25 bg-agent/8 text-agent inline-flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-xs font-medium">
      <span className="bg-agent/15 grid size-6 place-items-center rounded-full">
        <Bot className="size-3.5" />
      </span>
      {agent.name}
    </span>
  );
}

export function AvatarStack({
  people,
  agents = [],
  max = 4,
}: {
  people: Person[];
  agents?: Agent[];
  max?: number;
}) {
  const items = [
    ...people.map((p) => ({ key: p.id, label: p.initials, agent: false, title: p.name })),
    ...agents.map((a) => ({ key: a.id, label: "IA", agent: true, title: a.name })),
  ].slice(0, max);
  return (
    <div className="flex -space-x-1.5">
      {items.map((it) => (
        <span
          key={it.key}
          title={it.title}
          className={cn(
            "border-surface grid size-7 place-items-center rounded-full border-2 text-[10px] font-semibold",
            it.agent ? "bg-agent/15 text-agent" : "bg-info/15 text-info",
          )}
        >
          {it.agent ? <Bot className="size-3.5" /> : it.label}
        </span>
      ))}
    </div>
  );
}

export function ProgressDots({ done, total }: { done: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "grid size-4 place-items-center rounded-full border",
            i < done
              ? "border-success bg-success text-success-foreground"
              : i === done
                ? "border-info border-2 bg-transparent"
                : "border-border bg-transparent",
          )}
        >
          {i < done && <Check className="size-2.5" strokeWidth={3} />}
        </span>
      ))}
    </div>
  );
}

export function BlockedFlag({ children }: { children?: ReactNode }) {
  return (
    <span className="text-destructive inline-flex items-center gap-1.5 text-xs font-semibold">
      <Flag className="size-3.5" />
      {children ?? "Bloquée"}
    </span>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-base font-semibold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
      {icon && <div className="text-muted-foreground mb-3">{icon}</div>}
      <p className="font-medium">{title}</p>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Rendu markdown minimal (titres, listes, tableaux, gras, code). */
export function Markdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let ordered = false;
  let table: string[][] = [];

  const inline = (text: string): ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
    return parts.map((part, i) => {
      if (part.startsWith("**"))
        return (
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      if (part.startsWith("`"))
        return (
          <code key={i} className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]">
            {part.slice(1, -1)}
          </code>
        );
      return <span key={i}>{part}</span>;
    });
  };

  const flushList = () => {
    if (!list.length) return;
    const Tag = ordered ? "ol" : "ul";
    blocks.push(
      <Tag
        key={`l${blocks.length}`}
        className={cn(
          "text-muted-foreground my-3 space-y-1.5 pl-5 text-sm",
          ordered ? "list-decimal" : "list-disc",
        )}
      >
        {list.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </Tag>,
    );
    list = [];
  };

  const flushTable = () => {
    if (!table.length) return;
    const [head, ...rows] = table;
    blocks.push(
      <div key={`t${blocks.length}`} className="my-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              {head!.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left font-semibold">
                  {inline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                {r.map((c, j) => (
                  <td key={j} className="text-muted-foreground px-3 py-2">
                    {inline(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    table = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\|(.+)\|$/.test(line)) {
      const cells = line.slice(1, -1).split("|").map((c) => c.trim());
      if (cells.every((c) => /^-{2,}$/.test(c))) continue;
      flushList();
      table.push(cells);
      continue;
    }
    flushTable();
    if (/^#{1,3} /.test(line)) {
      flushList();
      const level = line.match(/^#+/)![0].length;
      const text = line.replace(/^#+ /, "");
      blocks.push(
        level === 1 ? (
          <h1 key={blocks.length} className="mt-1 mb-3 text-xl font-semibold tracking-tight">
            {inline(text)}
          </h1>
        ) : level === 2 ? (
          <h2 key={blocks.length} className="mt-6 mb-2 text-base font-semibold tracking-tight">
            {inline(text)}
          </h2>
        ) : (
          <h3 key={blocks.length} className="mt-4 mb-1.5 text-sm font-semibold">
            {inline(text)}
          </h3>
        ),
      );
    } else if (/^[-*] /.test(line)) {
      if (ordered) flushList();
      ordered = false;
      list.push(line.slice(2));
    } else if (/^\d+\. /.test(line)) {
      if (!ordered) flushList();
      ordered = true;
      list.push(line.replace(/^\d+\.\s/, ""));
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      blocks.push(
        <p key={blocks.length} className="text-muted-foreground my-2 text-sm leading-relaxed">
          {inline(line)}
        </p>,
      );
    }
  }
  flushList();
  flushTable();

  return <div className="max-w-none">{blocks}</div>;
}
