import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  Command as CommandIcon,
  KanbanSquare,
  LayoutGrid,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useFactory } from "@/lib/factory/store";
import type { Persona } from "@/lib/factory/types";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, exact: true },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare, exact: false },
  { to: "/squads", label: "Squads", icon: Users, exact: false },
  { to: "/referentiel", label: "Référentiel", icon: BookOpen, exact: false },
  { to: "/parametres", label: "Paramètres", icon: Settings, exact: false },
] as const;

const PERSONAS: Persona[] = [
  "Factory Manager",
  "Le métier",
  "PO",
  "PM",
  "Dev",
  "QA",
  "Validateur",
];

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("factory-theme");
    const next = stored === "dark";
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  }, []);
  const toggle = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("factory-theme", next ? "dark" : "light");
      return next;
    });
  };
  return { dark, toggle };
}

export function AppShell({ children }: { children: ReactNode }) {
  const { dark, toggle } = useTheme();
  const { persona, setPersona, demandes, tasks } = useFactory();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const blocked = tasks.filter((t) => t.status === "Bloquée").length;

  return (
    <div className="bg-background flex min-h-dvh">
      <aside className="bg-sidebar sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col border-r lg:flex">
        <div className="flex items-center gap-3 px-5 py-6">
          <span className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-xl">
            <Sparkles className="size-4.5" />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-tight">Factory</span>
            <span className="text-muted-foreground block text-xs">Orchestration IA + People</span>
          </span>
        </div>

        <nav className="flex flex-col gap-0.5 px-3">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                <item.icon className={cn("size-4.5", active && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-3">
          <div className="border-sidebar-border bg-surface flex items-center gap-3 rounded-xl border p-3">
            <span className="bg-info/15 text-info grid size-9 place-items-center rounded-full text-xs font-semibold">
              ME
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">Mehdi El Yassir</span>
              <span className="text-muted-foreground block truncate text-xs">{persona}</span>
            </span>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/80 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-md sm:px-6">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg">
              <Sparkles className="size-4" />
            </span>
            <span className="text-sm font-semibold">Factory</span>
          </Link>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="text-muted-foreground hover:bg-muted/60 mx-auto hidden h-10 w-full max-w-md items-center gap-2 rounded-xl border px-3 text-sm transition-colors sm:flex"
          >
            <Search className="size-4" />
            Rechercher une demande, une squad…
            <kbd className="bg-muted ml-auto inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium">
              <CommandIcon className="size-3" />K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden rounded-lg sm:inline-flex">
                  Vue : {persona}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Changer de persona</DropdownMenuLabel>
                {PERSONAS.map((p) => (
                  <DropdownMenuItem key={p} onSelect={() => setPersona(p)}>
                    {p}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              aria-label={dark ? "Activer le thème clair" : "Activer le thème sombre"}
              onClick={toggle}
              className="min-h-10 min-w-10 rounded-lg"
            >
              {dark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="relative min-h-10 min-w-10 rounded-lg"
            >
              <Bell className="size-4.5" />
              {blocked > 0 && (
                <span className="bg-primary absolute top-2 right-2.5 size-2 rounded-full" />
              )}
            </Button>

            <span className="bg-info/15 text-info ml-1 grid size-9 place-items-center rounded-full text-xs font-semibold">
              ME
            </span>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <CommandInput placeholder="Rechercher une demande, une page…" />
        <CommandList>
          <CommandEmpty>Aucun résultat.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {NAV.map((item) => (
              <CommandItem
                key={item.to}
                value={item.label}
                onSelect={() => {
                  setPaletteOpen(false);
                  navigate({ to: item.to });
                }}
              >
                <item.icon className="size-4" />
                {item.label}
              </CommandItem>
            ))}
            <CommandItem
              value="Nouvelle demande"
              onSelect={() => {
                setPaletteOpen(false);
                navigate({ to: "/demandes/nouvelle" });
              }}
            >
              <Sparkles className="size-4" />
              Nouvelle demande
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Demandes">
            {demandes.map((d) => (
              <CommandItem
                key={d.id}
                value={d.title}
                onSelect={() => {
                  setPaletteOpen(false);
                  navigate({ to: "/demandes/$id", params: { id: d.id } });
                }}
              >
                <KanbanSquare className="size-4" />
                {d.title}
                <span className="text-muted-foreground ml-auto text-xs">{d.type}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
