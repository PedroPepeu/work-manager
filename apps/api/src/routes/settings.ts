import {
  settingsSchema,
  type Settings,
  updateSettingsSchema
} from "@work-manager/shared";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { db } from "../db/client.js";
import { settings } from "../db/schema.js";
import { badRequest } from "./helpers.js";

const SETTINGS_ID = 1;

function mapSettings(row: typeof settings.$inferSelect): Settings {
  return {
    focusMinutes: row.focusMinutes,
    shortBreakMinutes: row.shortBreakMinutes,
    longBreakMinutes: row.longBreakMinutes,
    longBreakEvery: row.longBreakEvery,
    soundEnabled: row.soundEnabled
  };
}

async function ensureSettings() {
  const [row] = await db
    .insert(settings)
    .values({ id: SETTINGS_ID })
    .onConflictDoNothing()
    .returning();

  if (row) return row;

  const [existing] = await db.select().from(settings).where(eq(settings.id, SETTINGS_ID));
  if (!existing) throw new Error("Failed to initialize settings");
  return existing;
}

export async function settingsRoutes(app: FastifyInstance) {
  app.get("/settings", async () => {
    const row = await ensureSettings();
    return settingsSchema.parse(mapSettings(row));
  });

  app.patch("/settings", async (request, reply) => {
    const parsed = updateSettingsSchema.safeParse(request.body);
    if (!parsed.success) return badRequest(reply, parsed.error);

    await ensureSettings();
    const [updated] = await db
      .update(settings)
      .set(parsed.data)
      .where(eq(settings.id, SETTINGS_ID))
      .returning();

    if (!updated) throw new Error("Failed to update settings");
    return mapSettings(updated);
  });
}
