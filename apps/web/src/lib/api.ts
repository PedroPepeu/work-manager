import type {
  CreatePomodoroSessionInput,
  CreateTaskInput,
  PomodoroSession,
  Settings,
  Task,
  UpdateSettingsInput,
  UpdateTaskInput
} from "@work-manager/shared";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || `Request failed with ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<{ ok: boolean }>("/health"),
  tasks: () => request<Task[]>("/tasks"),
  createTask: (input: CreateTaskInput) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(input) }),
  updateTask: (id: string, input: UpdateTaskInput) =>
    request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteTask: (id: string) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
  settings: () => request<Settings>("/settings"),
  updateSettings: (input: UpdateSettingsInput) =>
    request<Settings>("/settings", { method: "PATCH", body: JSON.stringify(input) }),
  sessions: () => request<PomodoroSession[]>("/pomodoro-sessions"),
  createSession: (input: CreatePomodoroSessionInput) =>
    request<PomodoroSession>("/pomodoro-sessions", {
      method: "POST",
      body: JSON.stringify(input)
    })
};

export function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainder = Math.max(0, seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remainder}`;
}
