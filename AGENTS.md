# Repository Guidelines

## Project Structure & Module Organization

This is a pnpm workspace for a task manager and Pomodoro app.

- `apps/web`: Vite, React, TypeScript frontend.
- `apps/api`: Fastify API, Drizzle config, database schema, and routes.
- `packages/shared`: shared Zod schemas and TypeScript types used by both apps.
- `apps/api/drizzle`: generated SQL migrations and Drizzle metadata.
- `docker-compose.yml`: local PostgreSQL service, exposed on host port `5433`.

Keep cross-boundary request/response types in `packages/shared/src`. Keep API-only database concerns inside `apps/api/src`.

## Build, Test, and Development Commands

Run commands from the repository root:

```bash
pnpm install        # Install workspace dependencies
docker compose up -d # Start PostgreSQL on localhost:5433
pnpm db:migrate    # Apply Drizzle migrations
pnpm dev           # Start API and frontend in parallel
pnpm dev:api       # Start only the Fastify API
pnpm dev:web       # Start only the Vite frontend
pnpm check         # Type-check all packages
pnpm build         # Build shared package, API, and frontend
pnpm db:generate   # Generate a migration after schema changes
```

Frontend runs at `http://localhost:5173`; API runs at `http://localhost:3333`.

## Coding Style & Naming Conventions

Use TypeScript with strict settings. Prefer explicit shared schemas over duplicated local types. Use two-space indentation, semicolons, named exports, and descriptive camelCase identifiers. React components use PascalCase file and function names, for example `TimerPanel.tsx`. API route modules should be grouped by resource, for example `routes/tasks.ts`.

Do not commit generated build output, `node_modules`, or local `.env` files.

## Testing Guidelines

There is no dedicated test runner yet. For now, `pnpm check` and `pnpm build` are required before handing off changes. When adding tests, place them near the code they cover and use `*.test.ts` or `*.test.tsx`. Prioritize coverage for API validation, task CRUD, timer auto-cycle behavior, and settings updates.

## Commit & Pull Request Guidelines

The repository currently has only an initial commit, so no detailed convention exists. Use short imperative commit messages, for example `Add timer session persistence`. Pull requests should include a concise summary, validation commands run, database migration notes when relevant, and screenshots for visible frontend changes.

## Security & Configuration Tips

Copy `.env.example` to `.env` for local development. The Docker database URL is:

```bash
DATABASE_URL=postgres://work_manager:work_manager@localhost:5433/work_manager
```

Never commit real secrets. If changing ports or database credentials, update `.env.example`, `docker-compose.yml`, and `README.md` together.
