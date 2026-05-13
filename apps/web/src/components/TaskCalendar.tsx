import type { Task } from "@work-manager/shared";
import { CalendarDays } from "lucide-react";
import { useMemo } from "react";

type TaskCalendarProps = {
  tasks: Task[];
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date(`${date}T00:00:00`));
}

export function TaskCalendar({ tasks }: TaskCalendarProps) {
  const groupedTasks = useMemo(() => {
    const entries = [...tasks]
      .filter((task): task is Task & { dueDate: string } => Boolean(task.dueDate))
      .sort((left, right) => left.dueDate.localeCompare(right.dueDate));

    return entries.reduce<Array<{ date: string; tasks: Task[] }>>((groups, task) => {
      const date = task.dueDate;
      const current = groups.at(-1);
      if (current?.date === date) {
        current.tasks.push(task);
      } else {
        groups.push({ date, tasks: [task] });
      }
      return groups;
    }, []);
  }, [tasks]);

  return (
    <section className="panel min-h-0">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays size={18} className="text-herb" />
        <h2 className="text-lg font-semibold text-ink">Calendar</h2>
      </div>

      {groupedTasks.length === 0 ? (
        <p className="text-sm text-ink/55">Tasks with end dates will appear here.</p>
      ) : (
        <div className="max-h-72 space-y-3 overflow-auto pr-1">
          {groupedTasks.map((group) => (
            <article key={group.date} className="calendar-day">
              <div className="calendar-date">
                <strong>{formatDate(group.date)}</strong>
                <span>{group.date}</span>
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                {group.tasks.map((task) => (
                  <div key={task.id} className="calendar-task">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        task.status === "done" ? "bg-herb/50" : "bg-amber"
                      }`}
                    />
                    <span className={task.status === "done" ? "line-through opacity-50" : ""}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
