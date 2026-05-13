import type { FastifyReply } from "fastify";
import type { ZodError } from "zod";

export function badRequest(reply: FastifyReply, error: ZodError) {
  return reply.status(400).send({
    error: "Bad Request",
    issues: error.issues
  });
}

export function toIso(value: Date) {
  return value.toISOString();
}
