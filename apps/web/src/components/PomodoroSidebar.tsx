import type { PomodoroSession, Settings, Task } from "@work-manager/shared";
import { Timer } from "lucide-react";
import { useState } from "react";
import { formatSeconds } from "../lib/api";
import { useTimerStore } from "../store/timer";
import { SessionHistory } from "./SessionHistory";
import { SettingsPanel } from "./SettingsPanel";
import { TimerPanel } from "./TimerPanel";

type PomodoroSidebarProps = {
  settings: Settings;
  tasks: Task[];
  sessions: PomodoroSession[];
};

export function PomodoroSidebar({ settings, tasks, sessions }: PomodoroSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const mode = useTimerStore((state) => state.mode);
  const remainingSeconds = useTimerStore((state) => state.remainingSeconds);
  const status = useTimerStore((state) => state.status);

  return (
    <aside className={`pomodoro-sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
      {isExpanded ? (
        <div className="grid gap-5">
          <TimerPanel settings={settings} tasks={tasks} compact={false} onCollapse={() => setIsExpanded(false)} />
          <SettingsPanel settings={settings} embedded />
          <SessionHistory sessions={sessions} />
        </div>
      ) : (
        <button
          className="collapsed-timer"
          onClick={() => setIsExpanded(true)}
          aria-label="Expand Pomodoro sidebar"
        >
          <Timer size={20} className="text-herb" />
          <div className="vertical-time">{formatSeconds(remainingSeconds)}</div>
          <div className="vertical-label">{mode.replace("_", " ")}</div>
          <span className={`timer-dot ${status}`} />
        </button>
      )}
    </aside>
  );
}
