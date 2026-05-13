import {
  createTaskSchema,
  type Task,
  updateTaskSchema
} from "@work-manager/shared";
import { and, asc, desc, eq, sql as drizzleSql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { db } from "../db/client.js";
import { tasks } from "../db/schema.js";
import { badRequest, toIso } from "./helpers.js";

function mapTask(row: typeof tasks.$inferSelect): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    status: row.status,
    priority: row.priority,
    dueDate: row.dueDate,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    completedAt: row.completedAt ? toIso(row.completedAt) : null
  };
}

export async function taskRoutes(app: FastifyInstance) {
  app.get("/tasks", async () => {
    const rows = await db
      .select()
      .from(tasks)
      .orderBy(asc(tasks.status), desc(tasks.createdAt));

    return rows.map(mapTask);
  });

  app.post("/tasks", async (request, reply) => {
    const parsed = createTaskSchema.safeParse(request.body);
    if (!parsed.success) return badRequest(reply, parsed.error);

    const [created] = await db.insert(tasks).values(parsed.data).returning();
    if (!created) throw new Error("Failed to create task");
    return reply.status(201).send(mapTask(created));
  });

  app.patch<{ Params: { id: string } }>("/tasks/:id", async (request, reply) => {
    const parsed = updateTaskSchema.safeParse(request.body);
    if (!parsed.success) return badRequest(reply, parsed.error);

    const statusChange = parsed.data.status;
    const completedAt =
      statusChange === "done" ? new Date() : statusChange === "todo" ? null : undefined;

    const [updated] = await db
      .update(tasks)
      .set({
        ...parsed.data,
        ...(completedAt !== undefined ? { completedAt } : {}),
        updatedAt: new Date()
      })
      .where(eq(tasks.id, request.params.id))
      .returning();

    if (!updated) return reply.status(404).send({ error: "Task not found" });
    return mapTask(updated);
  });

  app.delete<{ Params: { id: string } }>("/tasks/:id", async (request, reply) => {
    const [deleted] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, request.params.id), drizzleSql`true`))
      .returning({ id: tasks.id });

    if (!deleted) return reply.status(404).send({ error: "Task not found" });
    return reply.status(204).send();
  });
}
