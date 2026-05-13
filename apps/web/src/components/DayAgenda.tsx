import type { PomodoroSession, Task } from "@work-manager/shared";
import { CalendarDays } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatSeconds } from "../lib/api";
import { useTrackingStore } from "../store/tracking";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const START_HOUR = 0;
const END_HOUR = 24;
const SLOT_HEIGHT = 48; // px per 30-min slot → 96px per hour
const PX_PER_MINUTE = SLOT_HEIGHT / 30;

function formatHour(hour: number) {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

function minutesSinceMidnight(iso: string) {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}

function getCurrentTopPx() {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins * PX_PER_MINUTE;
}

function todayDateStr() {
  return new Date().toISOString().slice(0, 10);
}

type DayAgendaProps = {
  sessions?: PomodoroSession[];
  tasks?: Task[];
};

export function DayAgenda({ sessions = [], tasks = [] }: DayAgendaProps) {
  const today = new Date();
  const dayName = DAY_NAMES[today.getDay()];
  const monthName = MONTH_NAMES[today.getMonth()];
  const dateLabel = `${dayName}, ${monthName} ${today.getDate()}`;

  const [nowTop, setNowTop] = useState(getCurrentTopPx);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeTaskId = useTrackingStore((state) => state.activeTaskId);
  const startedAt = useTrackingStore((state) => state.startedAt);

  useEffect(() => {
    const tick = () => setNowTop(getCurrentTopPx());
    const id = window.setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!activeTaskId) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [activeTaskId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, nowTop - 120);
    }
  }, []);

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  const totalHeight = hours.length * SLOT_HEIGHT * 2;

  const todaySessions = sessions.filter(
    (s) => s.taskId && s.startedAt.startsWith(todayDateStr())
  );

  function taskTitle(taskId: string | null) {
    if (!taskId) return null;
    return tasks.find((t) => t.id === taskId)?.title ?? null;
  }

  function blockTop(iso: string) {
    return minutesSinceMidnight(iso) * PX_PER_MINUTE;
  }

  function blockHeight(seconds: number) {
    return Math.max(24, (seconds / 60) * PX_PER_MINUTE);
  }

  const liveTop = startedAt ? blockTop(startedAt) : null;
  const liveHeight = startedAt
    ? blockHeight((nowMs - new Date(startedAt).getTime()) / 1000)
    : null;

  return (
    <section className="panel flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Agenda</h2>
          <p className="text-sm text-ink/60">{dateLabel}</p>
        </div>
        <CalendarDays size={20} className="text-ink/30" />
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="relative" style={{ height: totalHeight }}>
          {hours.map((hour) => {
            const topHour = (hour - START_HOUR) * SLOT_HEIGHT * 2;
            const topHalf = topHour + SLOT_HEIGHT;
            return (
              <div key={hour}>
                <div className="agenda-row" style={{ top: topHour }}>
                  <span className="agenda-time">{formatHour(hour)}</span>
                  <div className="agenda-line" />
                </div>
                <div className="agenda-row agenda-row-half" style={{ top: topHalf }}>
                  <span className="agenda-time" />
                  <div className="agenda-line agenda-line-half" />
                </div>
              </div>
            );
          })}

          {todaySessions.map((session) => (
            <div
              key={session.id}
              className="agenda-block"
              style={{ top: blockTop(session.startedAt), height: blockHeight(session.actualSeconds) }}
            >
              <span className="truncate font-semibold">{taskTitle(session.taskId)}</span>
              <span className="text-ink/50">{formatSeconds(session.actualSeconds)}</span>
            </div>
          ))}

          {activeTaskId && liveTop !== null && liveHeight !== null && (
            <div
              className="agenda-block agenda-block-live"
              style={{ top: liveTop, height: liveHeight }}
            >
              <span className="truncate font-semibold">{taskTitle(activeTaskId)}</span>
              <span className="text-ink/50 animate-pulse">● rec</span>
            </div>
          )}

          <div className="agenda-now" style={{ top: nowTop }}>
            <div className="agenda-now-dot" />
            <div className="agenda-now-line" />
          </div>
        </div>
      </div>
    </section>
  );
}
