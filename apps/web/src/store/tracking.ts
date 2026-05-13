import { create } from "zustand";

type TrackingState = {
  activeTaskId: string | null;
  startedAt: string | null;
  startTask: (taskId: string) => void;
  stopTask: () => { taskId: string; startedAt: string } | null;
};

export const useTrackingStore = create<TrackingState>((set, get) => ({
  activeTaskId: null,
  startedAt: null,
  startTask: (taskId) => set({ activeTaskId: taskId, startedAt: new Date().toISOString() }),
  stopTask: () => {
    const { activeTaskId, startedAt } = get();
    if (!activeTaskId || !startedAt) return null;
    set({ activeTaskId: null, startedAt: null });
    return { taskId: activeTaskId, startedAt };
  }
}));
