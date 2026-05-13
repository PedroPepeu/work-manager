import type { Task } from "@work-manager/shared";
import { ListTodo } from "lucide-react";
import { useEffect, useState } from "react";
import { formatSeconds } from "../lib/api";
import { useTrackingStore } from "../store/tracking";
import { TaskPanel } from "./TaskPanel";

type TaskSidebarProps = {
  tasks: Task[];
};

function useElapsed(startedAt: string | null) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startedAt) { setElapsed(0); return; }
    const tick = () =>
      setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  return elapsed;
}

export function TaskSidebar({ tasks }: TaskSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const activeTaskId = useTrackingStore((state) => state.activeTaskId);
  const startedAt = useTrackingStore((state) => state.startedAt);

  const pending = tasks.filter((t) => t.status === "todo").length;
  const activeTask = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;
  const elapsed = useElapsed(activeTask ? startedAt : null);

  return (
    <aside className={`task-sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
      {isExpanded ? (
        <TaskPanel tasks={tasks} onCollapse={() => setIsExpanded(false)} />
      ) : (
        <button
          className="collapsed-tasks"
          onClick={() => setIsExpanded(true)}
          aria-label="Expand task sidebar"
        >
          {activeTask ? (
            <>
              <span className="animate-pulse h-2 w-2 rounded-full bg-herb" />
              <div className="vertical-time text-herb">{formatSeconds(elapsed)}</div>
              <div className="vertical-label text-herb">{activeTask.title}</div>
            </>
          ) : (
            <>
              <ListTodo size={20} className="text-herb" />
              <div className="vertical-time">{pending}</div>
              <div className="vertical-label">tasks</div>
            </>
          )}
        </button>
      )}
    </aside>
  );
}
