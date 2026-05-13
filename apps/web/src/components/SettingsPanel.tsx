import type { Settings } from "@work-manager/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Volume2 } from "lucide-react";
import { api } from "../lib/api";

type SettingsPanelProps = {
  settings: Settings;
  embedded?: boolean;
};

export function SettingsPanel({ settings, embedded = false }: SettingsPanelProps) {
  const queryClient = useQueryClient();
  const updateSettings = useMutation({
    mutationFn: api.updateSettings,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["settings"] })
  });

  function setNumber(key: keyof Settings, value: number) {
    updateSettings.mutate({ [key]: value });
  }

  return (
    <section className={embedded ? "panel settings-panel-embedded" : "panel"}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Settings</h2>
        <button
          className={`icon-button ${settings.soundEnabled ? "bg-herb text-white" : "bg-white"}`}
          onClick={() => updateSettings.mutate({ soundEnabled: !settings.soundEnabled })}
        >
          <Volume2 size={17} />
        </button>
      </div>
      <div className="grid gap-3">
        <label className="setting-row">
          Focus
          <input
            type="number"
            min={1}
            max={180}
            value={settings.focusMinutes}
            onChange={(event) => setNumber("focusMinutes", Number(event.target.value))}
          />
        </label>
        <label className="setting-row">
          Short break
          <input
            type="number"
            min={1}
            max={60}
            value={settings.shortBreakMinutes}
            onChange={(event) => setNumber("shortBreakMinutes", Number(event.target.value))}
          />
        </label>
        <label className="setting-row">
          Long break
          <input
            type="number"
            min={1}
            max={120}
            value={settings.longBreakMinutes}
            onChange={(event) => setNumber("longBreakMinutes", Number(event.target.value))}
          />
        </label>
        <label className="setting-row">
          Long break every
          <input
            type="number"
            min={2}
            max={12}
            value={settings.longBreakEvery}
            onChange={(event) => setNumber("longBreakEvery", Number(event.target.value))}
          />
        </label>
      </div>
    </section>
  );
}
