import cors from "@fastify/cors";
import Fastify from "fastify";
import { sql } from "./db/client.js";
import { runMigrations } from "./db/migrate.js";
import { env } from "./env.js";
import { pomodoroSessionRoutes } from "./routes/pomodoro-sessions.js";
import { settingsRoutes } from "./routes/settings.js";
import { taskRoutes } from "./routes/tasks.js";

const app = Fastify({
  logger: true
});

await app.register(cors, {
  origin: env.WEB_ORIGIN
});

app.get("/health", async (_request, reply) => {
  try {
    await sql`select 1`;
    return { ok: true };
  } catch {
    return reply.status(503).send({ ok: false });
  }
});

await app.register(taskRoutes);
await app.register(settingsRoutes);
await app.register(pomodoroSessionRoutes);

try {
  await runMigrations();
  await app.listen({ port: env.API_PORT, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
