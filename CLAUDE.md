# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start everything (API + web in parallel)
pnpm dev

# Start individually
pnpm dev:api       # API on :3333
pnpm dev:web       # Vite on :5173

# Type-check all packages
pnpm check

# Build all
pnpm build

# Database migrations (resilient retry script)
pnpm db:migrate

# Generate new migration after schema changes
pnpm db:generate
```

TypeScript check for a single app:
```bash
cd apps/web && npx tsc --noEmit
cd apps/api && npx tsc --noEmit
```

## Environment

Single `.env` at repo root (shared by API and web via `dotenv`):
```
DATABASE_URL=postgres://work_manager:work_manager@localhost:5433/work_manager
API_PORT=3333
WEB_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:3333
```

## Architecture

**Monorepo** with `pnpm` workspaces:
- `apps/api` — Fastify REST API, runs migrations on startup
- `apps/web` — React 19 + Vite SPA
- `packages/shared` — Zod schemas + inferred TypeScript types shared between both apps

### API (`apps/api/src/`)

- `server.ts` — entry point: registers CORS, routes, runs DB migrations, starts listening
- `db/schema.ts` — Drizzle ORM schema (source of truth for DB shape)
- `db/client.ts` — postgres connection singleton
- `db/migrate.ts` — migration runner
- `routes/` — one file per resource (`tasks.ts`, `settings.ts`, `pomodoro-sessions.ts`)
- `env.ts` — validated env vars

Schema has three tables: `tasks`, `settings` (singleton, id=1), `pomodoro_sessions`. Sessions link to tasks via nullable FK with `SET NULL` on delete.

After editing `schema.ts`, run `pnpm db:generate` then `pnpm db:migrate`.

### Web (`apps/web/src/`)

**Data fetching**: React Query (`@tanstack/react-query`). All API calls go through `lib/api.ts`. Query keys: `["tasks"]`, `["settings"]`, `["sessions"]`.

**State**: Two Zustand stores:
- `store/timer.ts` — Pomodoro timer state (mode, status, countdown, selectedTaskId)
- `store/tracking.ts` — Manual task time-tracking (activeTaskId, startedAt). `stopTask()` returns data needed to POST a session.

**Layout** (`App.tsx`): Three-column fixed-viewport grid (`workspace-layout`):
1. `TaskSidebar` (left, collapsible) — wraps `TaskPanel`
2. `DayAgenda` (center) — 24h time grid with session blocks + live tracking block
3. `PomodoroSidebar` (right, collapsible) — wraps `TimerPanel` + `SettingsPanel` + `SessionHistory`

**Shared types**: Always import types from `@work-manager/shared`, not from API source. The shared package exports Zod schemas and their inferred types (`Task`, `PomodoroSession`, `Settings`, etc.).

**Styling**: Tailwind CSS + custom classes in `styles.css` (`@layer components`). Key custom classes: `panel`, `task-sidebar`, `pomodoro-sidebar`, `collapsed-tasks`, `collapsed-timer`, `agenda-block`, `workspace-layout`.

### Key data flows

- **Pomodoro timer**: `TimerPanel` runs a `setInterval` tick loop, auto-creates sessions via `api.createSession()` on completion/skip/reset, invalidates `["sessions"]`.
- **Manual tracking**: Play button in `TaskPanel` → `trackingStore.startTask(id)` → Stop → `trackingStore.stopTask()` + `api.createSession()` → invalidates `["sessions"]`.
- **DayAgenda blocks**: Filters today's sessions from the `["sessions"]` query; also reads `trackingStore` for the live growing block (updates every second via local interval).
- **Collapsed sidebar active state**: `TaskSidebar` reads `trackingStore` to show pulsing dot + elapsed timer when collapsed with an active task.
