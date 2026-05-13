import { config } from "dotenv";
import { z } from "zod";

config({ path: new URL("../../../.env", import.meta.url) });

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .default("postgres://work_manager:work_manager@localhost:5432/work_manager"),
  API_PORT: z.coerce.number().int().positive().default(3333),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173")
});

export const env = envSchema.parse(process.env);
