import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { SessionHistory } from "./components/SessionHistory";
import { SettingsPanel } from "./components/SettingsPanel";
import { TaskPanel } from "./components/TaskPanel";
import { TimerPanel } from "./components/TimerPanel";
import { api } from "./lib/api";

export function App() {
  const tasks = useQuery({ queryKey: ["tasks"], queryFn: api.tasks });
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  const sessions = useQuery({ queryKey: ["sessions"], queryFn: api.sessions });
  const health = useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    retry: false,
    refetchInterval: 15000
  });

  const isLoading = tasks.isLoading || settings.isLoading || sessions.isLoading;
  const hasError = tasks.isError || settings.isError || sessions.isError || health.isError;

  return (
    <main className="min-h-screen bg-paper px-4 py-5 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-normal text-ink">Work Manager</h1>
            <p className="text-sm text-ink/60">
              Simple tasks with an auto-cycling Pomodoro timer.
            </p>
          </div>
          <div
            className={`flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-sm ${
              health.isError
                ? "border-tomato/40 bg-tomato/10 text-tomato"
                : "border-herb/30 bg-herb/10 text-herb"
            }`}
          >
            <Activity size={15} />
            {health.isError ? "API offline" : "API online"}
          </div>
        </header>

        {hasError ? (
          <div className="rounded-md border border-tomato/30 bg-tomato/10 px-4 py-3 text-sm text-tomato">
            Could not load app data. Confirm PostgreSQL is running, migrations are applied,
            and the API is available on port 3333.
          </div>
        ) : null}

        {isLoading || !tasks.data || !settings.data || !sessions.data ? (
          <div className="panel min-h-80 animate-pulse text-sm text-ink/55">Loading workspace</div>
        ) : (
          <div className="grid min-h-[calc(100vh-170px)] gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <TaskPanel tasks={tasks.data} />
            <div className="grid min-h-0 gap-5">
              <TimerPanel settings={settings.data} tasks={tasks.data} />
              <div className="grid gap-5 xl:grid-cols-2">
                <SettingsPanel settings={settings.data} />
                <SessionHistory sessions={sessions.data} />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
