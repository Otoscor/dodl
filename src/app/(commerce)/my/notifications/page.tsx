"use client";

import { useEffect, useState } from "react";
import { BackHeader } from "@/components/layout/BackHeader";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { MOCK_NOTIFICATION_SETTINGS } from "../mock";

const STORAGE_KEY = "dodl_notification_settings";

export default function MyNotificationsPage() {
  // 기본값
  const [settings, setSettings] = useState<Record<string, boolean>>(() =>
    MOCK_NOTIFICATION_SETTINGS.reduce((acc, s) => {
      acc[s.id] = s.defaultOn;
      return acc;
    }, {} as Record<string, boolean>)
  );

  // localStorage 복원
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSettings((prev) => ({ ...prev, ...JSON.parse(raw) }));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const toggle = (id: string, on: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, [id]: on };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <BackHeader title="알림 설정" />

      <div className="divide-y divide-border-subtle">
        {MOCK_NOTIFICATION_SETTINGS.map((s) => (
          <div key={s.id} className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[15px] text-text-primary">{s.label}</p>
              <p className="text-[13px] text-text-tertiary mt-0.5 leading-relaxed">{s.description}</p>
            </div>
            <ToggleSwitch on={!!settings[s.id]} onChange={(v) => toggle(s.id, v)} aria-label={s.label} />
          </div>
        ))}
      </div>
    </div>
  );
}
