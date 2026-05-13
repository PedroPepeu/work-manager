import type { Task, TaskPriority } from "@work-manager/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Check, Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { api } from "../lib/api";
import { useTimerStore } from "../store/timer";

type TaskPanelProps = {
  tasks: Task[];
};

const priorities: TaskPriority[] = ["low", "medium", "high"];

export function TaskPanel({ tasks }: TaskPanelProps) {
  const queryClient = useQueryClient();
  const selectedTaskId = useTimerStore((state) => state.selectedTaskId);
  const selectTask = useTimerStore((state) => state.selectTask);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");

  const createTask = useMutation({
    mutationFn: api.createTask,
    onSuccess: () => {
      setTitle("");
      setDueDate("");
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

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    createTask.mutate({ title, priority, notes: "", dueDate: dueDate || null });
  }

  return (
    <section className="panel flex min-h-0 flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Tasks</h2>
          <p className="text-sm text-ink/60">{tasks.length} total</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mb-5 grid gap-2 sm:grid-cols-[1fr_8rem_10rem_2.5rem]">
        <input
          className="input"
          placeholder="Add a task"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <select
          className="input w-28"
          value={priority}
          onChange={(event) => setPriority(event.target.value as TaskPriority)}
        >
          {priorities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input
          className="input"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
        <button className="icon-button bg-herb text-white" type="submit" disabled={!title.trim()}>
          <Plus size={18} />
        </button>
      </form>

      <div className="min-h-0 space-y-2 overflow-auto pr-1">
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
                <span className={`priority priority-${task.priority}`}>{task.priority}</span>
              </div>
              {task.dueDate ? (
                <p className="mt-1 flex items-center gap-1 text-xs text-ink/55">
                  <Calendar size={12} />
                  {task.dueDate}
                </p>
              ) : null}
            </div>
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
    </section>
  );
}
