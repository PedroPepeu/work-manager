import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";

export const taskStatus = pgEnum("task_status", ["todo", "done"]);
export const taskPriority = pgEnum("task_priority", ["low", "medium", "high"]);
export const pomodoroMode = pgEnum("pomodoro_mode", [
  "focus",
  "short_break",
  "long_break"
]);
export const pomodoroStatus = pgEnum("pomodoro_status", ["completed", "cancelled"]);

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  notes: text("notes").notNull().default(""),
  status: taskStatus("status").notNull().default("todo"),
  priority: taskPriority("priority").notNull().default("medium"),
  dueDate: date("due_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true })
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  focusMinutes: integer("focus_minutes").notNull().default(25),
  shortBreakMinutes: integer("short_break_minutes").notNull().default(5),
  longBreakMinutes: integer("long_break_minutes").notNull().default(15),
  longBreakEvery: integer("long_break_every").notNull().default(4),
  soundEnabled: boolean("sound_enabled").notNull().default(true)
});

export const pomodoroSessions = pgTable("pomodoro_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "set null" }),
  mode: pomodoroMode("mode").notNull(),
  plannedSeconds: integer("planned_seconds").notNull(),
  actualSeconds: integer("actual_seconds").notNull(),
  status: pomodoroStatus("status").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }).notNull()
});

export const taskRelations = relations(tasks, ({ many }) => ({
  sessions: many(pomodoroSessions)
}));

export const pomodoroSessionRelations = relations(pomodoroSessions, ({ one }) => ({
  task: one(tasks, {
    fields: [pomodoroSessions.taskId],
    references: [tasks.id]
  })
}));
