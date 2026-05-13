import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "done"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high"]);

export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  notes: z.string(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  dueDate: z.string().date().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable()
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(180),
  notes: z.string().max(4000).optional().default(""),
  priority: taskPrioritySchema.optional().default("medium"),
  dueDate: z.string().date().nullable().optional().default(null)
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(180).optional(),
    notes: z.string().max(4000).optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    dueDate: z.string().date().nullable().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one task field is required"
  });

export const settingsSchema = z.object({
  focusMinutes: z.number().int().min(1).max(180),
  shortBreakMinutes: z.number().int().min(1).max(60),
  longBreakMinutes: z.number().int().min(1).max(120),
  longBreakEvery: z.number().int().min(2).max(12),
  soundEnabled: z.boolean()
});

export const updateSettingsSchema = settingsSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one settings field is required" }
);

export const pomodoroModeSchema = z.enum(["focus", "short_break", "long_break"]);
export const pomodoroStatusSchema = z.enum(["completed", "cancelled"]);

export const pomodoroSessionSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid().nullable(),
  mode: pomodoroModeSchema,
  plannedSeconds: z.number().int().positive(),
  actualSeconds: z.number().int().nonnegative(),
  status: pomodoroStatusSchema,
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime()
});

export const createPomodoroSessionSchema = z.object({
  taskId: z.string().uuid().nullable().optional().default(null),
  mode: pomodoroModeSchema,
  plannedSeconds: z.number().int().positive(),
  actualSeconds: z.number().int().nonnegative(),
  status: pomodoroStatusSchema,
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime()
});

export type Task = z.infer<typeof taskSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type PomodoroMode = z.infer<typeof pomodoroModeSchema>;
export type PomodoroStatus = z.infer<typeof pomodoroStatusSchema>;
export type PomodoroSession = z.infer<typeof pomodoroSessionSchema>;
export type CreatePomodoroSessionInput = z.infer<typeof createPomodoroSessionSchema>;
