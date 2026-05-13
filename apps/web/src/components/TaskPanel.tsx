import type { Task } from "@work-manager/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Check, ChevronLeft, Play, Plus, Square, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { api } from "../lib/api";
import { useTimerStore } from "../store/timer";
import { useTrackingStore } from "../store/tracking";

type TaskPanelProps = {
  tasks: Task[];
  onCollapse?: () => void;
};

export function TaskPanel({ tasks, onCollapse }: TaskPanelProps) {
  const queryClient = useQueryClient();
  const selectedTaskId = useTimerStore((state) => state.selectedTaskId);
  const selectTask = useTimerStore((state) => state.selectTask);
  const activeTaskId = useTrackingStore((state) => state.activeTaskId);
  const startTask = useTrackingStore((state) => state.startTask);
  const stopTask = useTrackingStore((state) => state.stopTask);
  const [title, setTitle] = useState("");

  const createTask = useMutation({
    mutationFn: api.createTask,
    onSuccess: () => {
      setTitle("");
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

  const updateTask = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Task["status"] }) =>
      api.updateTask(id, { status }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["tasks"] })
  });

  const deleteTask = useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["tasks"] })
  });

  const createSession = useMutation({
    mutationFn: api.createSession,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["sessions"] })
  });

  function handlePlayStop(event: React.MouseEvent, task: Task) {
    event.stopPropagation();
    if (activeTaskId === task.id) {
      const result = stopTask();
      if (!result) return;
      const endedAt = new Date().toISOString();
      const actualSeconds = Math.round(
        (new Date(endedAt).getTime() - new Date(result.startedAt).getTime()) / 1000
      );
      createSession.mutate({
        taskId: result.taskId,
        mode: "focus",
        plannedSeconds: actualSeconds,
        actualSeconds,
        status: "completed",
        startedAt: result.startedAt,
        endedAt
      });
    } else {
      startTask(task.id);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    createTask.mutate({ title, priority: "medium", notes: "", dueDate: null });
  }

  return (
    <section className="panel flex h-full min-h-0 flex-col">
      <div className="mb-5 flex items-center gap-3">
        {onCollapse ? (
          <button className="icon-button shrink-0" onClick={onCollapse} aria-label="Collapse task sidebar">
            <ChevronLeft size={18} />
          </button>
        ) : (
          <div className="w-10 shrink-0" />
        )}
        <div>
          <h2 className="text-lg font-semibold text-ink">Tasks</h2>
          <p className="text-sm text-ink/60">{tasks.length} total</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-auto pr-1">
        {tasks.map((task) => (
          <article
            key={task.id}
            className={`task-row ${selectedTaskId === task.id ? "ring-2 ring-herb" : ""}`}
            onClick={() => selectTask(task)}
          >
            <button
              className={`icon-button h-8 w-8 ${
                task.status === "done" ? "bg-herb text-white" : "bg-white text-ink"
              }`}
              onClick={(event) => {
                event.stopPropagation();
                updateTask.mutate({
                  id: task.id,
                  status: task.status === "done" ? "todo" : "done"
                });
              }}
            >
              <Check size={16} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3
                  className={`truncate text-sm font-semibold ${
                    task.status === "done" ? "text-ink/45 line-through" : "text-ink"
                  }`}
                >
                  {task.title}
                </h3>
              </div>
              {task.dueDate ? (
                <p className="mt-1 flex items-center gap-1 text-xs text-ink/55">
                  <Calendar size={12} />
                  {task.dueDate}
                </p>
              ) : null}
            </div>
            <button
              className={`icon-button h-8 w-8 ${
                activeTaskId === task.id
                  ? "bg-tomato/10 text-tomato"
                  : "bg-white text-ink/40 hover:text-herb"
              }`}
              onClick={(e) => handlePlayStop(e, task)}
              aria-label={activeTaskId === task.id ? "Stop tracking" : "Start tracking"}
            >
              {activeTaskId === task.id ? <Square size={14} /> : <Play size={14} />}
            </button>
            <button
              className="icon-button h-8 w-8 bg-white text-ink/60 hover:text-tomato"
              onClick={(event) => {
                event.stopPropagation();
                deleteTask.mutate(task.id);
              }}
            >
              <Trash2 size={15} />
            </button>
          </article>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-5 grid gap-2">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Add a task"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <button className="icon-button bg-herb text-white" type="submit" disabled={!title.trim()}>
            <Plus size={18} />
          </button>
        </div>
      </form>
    </section>
  );
}
