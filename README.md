# Work Manager

A lightweight task manager and auto-cycling Pomodoro timer.

## Stack

- Vite, React, TypeScript, Zustand, TanStack Query, Tailwind CSS
- Fastify, TypeScript, Drizzle ORM
- PostgreSQL through Docker Compose

## Local Development

### Prerequisites

- Node.js 22 or newer
- pnpm
- Docker, for the default PostgreSQL setup

### Run With Docker PostgreSQL

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:migrate
pnpm dev
```

Docker exposes PostgreSQL on host port `5433` to avoid conflicts with a local
PostgreSQL server on `5432`. The migration command retries briefly while the
container finishes PostgreSQL startup.

Frontend: http://localhost:5173

API: http://localhost:3333

The root `pnpm dev` command starts both the Fastify API and the Vite frontend.

### Run With An Existing PostgreSQL Server

If Docker is not available, create a local database and role that match `.env.example`,
or change `DATABASE_URL` in `.env` to match your PostgreSQL setup.

Default connection string:

```bash
postgres://work_manager:work_manager@localhost:5433/work_manager
```

Example setup using `psql` as a PostgreSQL admin user:

```sql
CREATE ROLE work_manager WITH LOGIN PASSWORD 'work_manager';
CREATE DATABASE work_manager OWNER work_manager;
```

Then run:

```bash
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm dev
```

### Useful Commands

```bash
pnpm check       # Type-check all packages
pnpm build       # Build shared package, API, and frontend
pnpm db:generate # Generate a Drizzle migration after schema changes
pnpm db:migrate  # Apply Drizzle migrations
```
# work-manager
