import type { PomodoroMode, Settings, Task } from "@work-manager/shared";
import { create } from "zustand";

type TimerState = {
  mode: PomodoroMode;
  status: "idle" | "running" | "paused";
  selectedTaskId: string | null;
  plannedSeconds: number;
  remainingSeconds: number;
  startedAt: string | null;
  completedFocusCount: number;
  selectTask: (task: Task | null) => void;
  start: (settings: Settings) => void;
  pause: () => void;
  resume: () => void;
  reset: (settings: Settings) => void;
  skipToNext: (settings: Settings) => void;
  tick: (settings: Settings) => void;
  advance: (settings: Settings) => void;
};

function secondsForMode(settings: Settings, mode: PomodoroMode) {
  if (mode === "focus") return settings.focusMinutes * 60;
  if (mode === "short_break") return settings.shortBreakMinutes * 60;
  return settings.longBreakMinutes * 60;
}

function nextMode(settings: Settings, mode: PomodoroMode, completedFocusCount: number) {
  if (mode !== "focus") return "focus";
  return completedFocusCount % settings.longBreakEvery === 0
    ? "long_break"
    : "short_break";
}

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: "focus",
  status: "idle",
  selectedTaskId: null,
  plannedSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  startedAt: null,
  completedFocusCount: 0,
  selectTask: (task) => set({ selectedTaskId: task?.id ?? null }),
  start: (settings) => {
    const plannedSeconds = secondsForMode(settings, get().mode);
    set({
      status: "running",
      plannedSeconds,
      remainingSeconds: plannedSeconds,
      startedAt: new Date().toISOString()
    });
  },
  pause: () => set({ status: "paused" }),
  resume: () => set({ status: "running" }),
  reset: (settings) => {
    const plannedSeconds = secondsForMode(settings, get().mode);
    set({
      status: "idle",
      plannedSeconds,
      remainingSeconds: plannedSeconds,
      startedAt: null
    });
  },
  skipToNext: (settings) => {
    get().advance(settings);
  },
  tick: (settings) => {
    const state = get();
    if (state.status !== "running") return;
    if (state.remainingSeconds <= 1) {
      get().advance(settings);
      return;
    }
    set({ remainingSeconds: state.remainingSeconds - 1 });
  },
  advance: (settings) => {
    const state = get();
    const completedFocusCount =
      state.mode === "focus" ? state.completedFocusCount + 1 : state.completedFocusCount;
    const mode = nextMode(settings, state.mode, completedFocusCount);
    const plannedSeconds = secondsForMode(settings, mode);
    set({
      mode,
      status: "running",
      completedFocusCount,
      plannedSeconds,
      remainingSeconds: plannedSeconds,
      startedAt: new Date().toISOString()
    });
  }
}));
