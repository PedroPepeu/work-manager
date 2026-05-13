import {
  createPomodoroSessionSchema,
  type PomodoroSession
} from "@work-manager/shared";
import { desc } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { db } from "../db/client.js";
import { pomodoroSessions } from "../db/schema.js";
import { badRequest, toIso } from "./helpers.js";

function mapSession(row: typeof pomodoroSessions.$inferSelect): PomodoroSession {
  return {
    id: row.id,
    taskId: row.taskId,
    mode: row.mode,
    plannedSeconds: row.plannedSeconds,
    actualSeconds: row.actualSeconds,
    status: row.status,
    startedAt: toIso(row.startedAt),
    endedAt: toIso(row.endedAt)
  };
}

export async function pomodoroSessionRoutes(app: FastifyInstance) {
  app.get("/pomodoro-sessions", async () => {
    const rows = await db
      .select()
      .from(pomodoroSessions)
      .orderBy(desc(pomodoroSessions.startedAt))
      .limit(30);

    return rows.map(mapSession);
  });

  app.post("/pomodoro-sessions", async (request, reply) => {
    const parsed = createPomodoroSessionSchema.safeParse(request.body);
    if (!parsed.success) return badRequest(reply, parsed.error);

    const [created] = await db
      .insert(pomodoroSessions)
      .values({
        ...parsed.data,
        startedAt: new Date(parsed.data.startedAt),
        endedAt: new Date(parsed.data.endedAt)
      })
      .returning();

    if (!created) throw new Error("Failed to create Pomodoro session");
    return reply.status(201).send(mapSession(created));
  });
}
