# Orchestrate Hub

Inspire toi bien de ca, c'est exactement ce qu'on voulait creer pour notre app mais de facon bien ameliorer et bcp mieux.. Lovable Prompt — "Factory": AI + People Delivery Orchestration Platform

Paste this whole prompt into Lovable. I'm also attaching screenshots of an early prototype — treat them as the reference for the information architecture and screens, but elevate the visual quality far beyond them.

What to build

Build Factory, a premium internal web application that orchestrates software delivery by combining AI agents and human team members. It's the cockpit where a delivery org runs projects end to end: a request comes in, flows through a staged process, each task is executed by an AI agent, a person, or both, and every step produces a versioned deliverable.

You have full creative freedom on the design — I want something elite, 2026, with modern editorial UX — as long as it stays clean, premium and coherent.

Design direction

Aesthetic: elite 2026 — editorial, minimal, generous whitespace, strong hierarchy, subtle depth. Think Linear × Vercel × premium consulting. Not templated.

Brand accent: coral red #F8475F, used sparingly for key actions, active states and highlights. Neutrals: near-black #17181D, white, soft warm greys.

Typography: Inter or Geist, tight tracking on headings, clear type scale.

Components: rounded cards (12–16px), 1px borders, very soft shadows, no heavy gradients, no clutter.

Light and dark mode, with a toggle in the header (dark mode is a first-class citizen).

Micro-interactions: framer-motion transitions, skeleton loaders, toasts, refined hover/active states, a ⌘K command palette, full keyboard support.

Fully responsive and accessible (WCAG AA).

All UI copy in French.

Stack

Only front with React + TypeScript No backend required: use realistic in-memory mock data and local state, but keep the data layer clean (typed models + a mock service) so it can later be wired to Microsoft Dataverse / Power Platform APIs.

Domain model

Demande (request): title, description, type (Power Platform | RPA | Fullstack), process (Standard · 5 étapes | Court · 4 étapes), demandeur, priorité, statut, squad, progression, dates.

Process → ordered Étapes: Standard = Intake → Analysis → Design → Dev → Run; Court = Intake → Design → Dev → Run.

Étape → Tâches. A Tâche has: title, required role, execution mode (Agent | Personne | Both), assignees (an agent and/or a person), a checklist, a status (À faire | En cours | Bloquée | Terminé), and a linked Livrable.

Squad: for each role, a pairing of an Agent IA + a Personne, composed by the Factory Manager.

Agents (catalog must be easily extensible): Brainstorming, Analyst, Product Manager, UX Designer, Architect, Epic Stories, and "Créateur de tables Dataverse" (Dev stage). Each agent: name, role, short description, status.

Livrable: a markdown document produced by an agent, with versions.

Roles / personas: Le métier (demandeur), Factory Manager, Contributeurs (PO, PM, Architecte, Designer, Dev, QA), Validateur. Add a role switcher in the header so each persona's view can be demoed.

Screens

Dashboard — KPI cards (Demandes actives, Tâches bloquées, Taux d'exécution IA, Délai moyen/étape), an alert panel of blocked tasks needing action, and a table of active demandes (progression dots, squad avatars, statut, last-updated).

Pipeline — Kanban with columns Intake / Analysis / Design / Dev / Run; filter tabs (Tous / Power Platform / RPA / Fullstack); cards show type tag, squad avatars, "X j dans l'étape", and a blocked flag.

Squads — manage squads and their members (agents + people).

Référentiel — catalog of agents and roles.

Paramètres.

Demande detail — a horizontal stepper of the stages; a "Tâches — étape en cours" panel; a Squad panel split into People and Agents IA; an "Avancement du process" list; an "Activité récente" feed.

Processus (full process view) — vertical timeline of every stage with its tasks, "RÔLE REQUIS", assignees (agent + person chips), and statuses.

Tâche detail — description, checklist, an Agent card and a Personne card, an execution-mode badge, and actions: Marquer comme terminée, Réassigner, Bloquer la tâche, plus a "Voir le journal d'exécution" link.

Livrables — document list with statuses (À jour / Brouillon) + a markdown editor with Aperçu / Modifier tabs and live preview.

Nouvelle demande — form (titre, description, type, process, demandeur, priorité) with a "Squad suggérée" panel that auto-proposes an Agent + a Person per role, each swappable.

⭐ The core interaction — run an agent, visible live inside the app

This is the most important feature. When a Factory Manager or contributor opens a task that is "À faire" and clicks "Lancer l'agent" / "Passer à l'agent", the app must show the agent working, live, inside the app:

Open an execution drawer/panel with the agent's identity (avatar, name, role), the task context, and the upstream artifacts it's using.

Stream a realistic execution log, steps appearing one by one with a typing/progress feel — e.g. "Lecture des besoins qualifiés… → Génération de 3 parcours utilisateurs… → Rédaction du document de spécifications…".

Show live status: En cours → Terminé, with a subtle progress indicator.

On completion, display the generated result and create the .md deliverable, which appears in the Livrables tab; the task then moves to validation.

Support the three modes: Agent seul (agent produces, human validates), Personne seule (no AI), Both (agent drafts, the person completes / validates).

There's no real backend, so simulate the agent run convincingly: timed streamed steps + a pre-written but realistic markdown artifact per agent type.

Also, from a persona view (e.g. PO / Factory Manager), the user can see all the processes of the selected project and a to-do list (done vs. what's next); selecting a "to do" activity lets them hand it to the responsible agent, which then runs exactly as described above.

Mock data (seed with these, in French)

Demandes: Portail client V2 (Power Platform, En cours, étape Design), Module reporting RH (Power Platform, Bloquée), Espace collaborateur Fullstack (Fullstack, Bloquée), Automatisation import données (RPA, Bloquée), Correctif urgent facturation (RPA, Terminé), Connecteur ERP Achats (Power Platform, Analysis), Refonte intranet RH (Fullstack, Intake).

People: Sophie Martin (PO), Marc Lefevre (PM), Karim Haddad (Dev), Julien Petit (Dev), Nina Rousseau (QA), Mehdi El Yassir (Delivery Manager).

Agents: Brainstorming, Analyst, Product Manager, UX Designer, Architect, Epic Stories, Créateur de tables Dataverse.

Include a sample deliverable "Spécifications fonctionnelles.md" with real French content.

Quality bar

Production-grade, one consistent design system, real French copy (no lorem ipsum), thoughtful empty / loading / error states, and a polished first impression. It must feel like a shipped 2026 product, not a template.

feel free ! go go go ! je te fais confiance

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6adf9c85-f006-4450-86a2-92d78d4a5bcc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
