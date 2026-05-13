import type { PomodoroMode, Settings, Task } from "@work-manager/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { api, formatSeconds } from "../lib/api";
import { playIntervalSound } from "../lib/sound";
import { useTimerStore } from "../store/timer";

type TimerPanelProps = {
  settings: Settings;
  tasks: Task[];
  compact?: boolean;
  onCollapse?: () => void;
};

const modeLabel: Record<PomodoroMode, string> = {
  focus: "Focus",
  short_break: "Short break",
  long_break: "Long break"
};

export function TimerPanel({ settings, tasks, compact = false, onCollapse }: TimerPanelProps) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<number | null>(null);
  const timer = useTimerStore();
  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === timer.selectedTaskId) ?? null,
    [tasks, timer.selectedTaskId]
  );

  const createSession = useMutation({
    mutationFn: api.createSession,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["sessions"] })
  });

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      const state = useTimerStore.getState();
      if (state.status !== "running") return;

      if (state.remainingSeconds <= 1) {
        createSession.mutate({
          taskId: state.mode === "focus" ? state.selectedTaskId : null,
          mode: state.mode,
          plannedSeconds: state.plannedSeconds,
          actualSeconds: state.plannedSeconds,
          status: "completed",
          startedAt: state.startedAt ?? new Date().toISOString(),
          endedAt: new Date().toISOString()
        });
        if (settings.soundEnabled) playIntervalSound();
        state.advance(settings);
        return;
      }

      state.tick(settings);
    }, 1000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [createSession, settings]);

  function recordSession(status: "completed" | "cancelled") {
    const startedAt = timer.startedAt ?? new Date().toISOString();
    const actualSeconds =
      status === "completed"
        ? timer.plannedSeconds
        : Math.max(0, timer.plannedSeconds - timer.remainingSeconds);

    createSession.mutate({
      taskId: timer.mode === "focus" ? timer.selectedTaskId : null,
      mode: timer.mode,
      plannedSeconds: timer.plannedSeconds,
      actualSeconds,
      status,
      startedAt,
      endedAt: new Date().toISOString()
    });
  }

  function onSkip() {
    if (timer.status !== "idle") recordSession("cancelled");
    timer.skipToNext(settings);
    if (settings.soundEnabled) playIntervalSound();
  }

  function onReset() {
    if (timer.status !== "idle") recordSession("cancelled");
    timer.reset(settings);
  }

  return (
    <section
      className={`panel flex flex-col items-center justify-center text-center ${
        compact ? "timer-panel-compact" : ""
      }`}
    >
      <div className="mb-4 flex w-full items-center justify-between">
        <div className="w-10" />
        <div className="rounded-full border border-line bg-white px-4 py-1 text-sm font-semibold text-herb">
          {modeLabel[timer.mode]}
        </div>
        {onCollapse ? (
          <button className="icon-button w-10" onClick={onCollapse} aria-label="Collapse Pomodoro sidebar">
            <ChevronRight size={18} />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>
      <div className="timer-face">
        <span>{formatSeconds(timer.remainingSeconds)}</span>
      </div>
      <p className="mt-4 min-h-6 text-sm text-ink/60">
        {selectedTask ? `Linked to ${selectedTask.title}` : "No task linked"}
      </p>

      <div className="mt-8 flex items-center gap-3">
        {timer.status === "running" ? (
          <button className="control-button" onClick={timer.pause}>
            <Pause size={20} />
          </button>
        ) : (
          <button
            className="control-button primary"
            onClick={() => (timer.status === "paused" ? timer.resume() : timer.start(settings))}
          >
            <Play size={20} />
          </button>
        )}
        <button className="control-button" onClick={onSkip}>
          <SkipForward size={20} />
        </button>
        <button className="control-button" onClick={onReset}>
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="mt-6 grid w-full grid-cols-3 gap-2 text-xs text-ink/60">
        <div className="stat">
          <strong>{settings.focusMinutes}</strong>
          focus
        </div>
        <div className="stat">
          <strong>{settings.shortBreakMinutes}</strong>
          short
        </div>
        <div className="stat">
          <strong>{settings.longBreakMinutes}</strong>
          long
        </div>
      </div>
    </section>
  );
}
