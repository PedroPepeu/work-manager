import type { PomodoroSession } from "@work-manager/shared";
import { Clock3 } from "lucide-react";
import { formatSeconds } from "../lib/api";

type SessionHistoryProps = {
  sessions: PomodoroSession[];
};

export function SessionHistory({ sessions }: SessionHistoryProps) {
  return (
    <section className="panel min-h-0">
      <div className="mb-4 flex items-center gap-2">
        <Clock3 size={18} className="text-herb" />
        <h2 className="text-lg font-semibold text-ink">Recent sessions</h2>
      </div>
      <div className="max-h-72 space-y-2 overflow-auto pr-1">
        {sessions.length === 0 ? (
          <p className="text-sm text-ink/55">Completed intervals will appear here.</p>
        ) : (
          sessions.map((session) => (
            <article key={session.id} className="session-row">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  {session.mode.replace("_", " ")}
                </h3>
                <p className="text-xs text-ink/55">
                  {new Date(session.startedAt).toLocaleString()}
                </p>
              </div>
              <span className={session.status === "completed" ? "text-herb" : "text-tomato"}>
                {formatSeconds(session.actualSeconds)}
              </span>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
