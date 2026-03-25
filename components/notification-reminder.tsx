"use client";

/**
 * NotificationReminder
 *
 * Registered once in the root layout. Responsibilities:
 *  1. Register the service worker (/sw.js)
 *  2. When reminders are enabled, fetch the meal plan and schedule
 *     notifications via the SW for today's upcoming meals.
 *  3. Re-schedule whenever the page regains focus (handles day rollover
 *     and the case where the app was opened at different times).
 */

import { useEffect } from "react";

const REMINDERS_KEY = "meal-reminders-enabled";

interface MealConfig {
  type: string;
  label: string;
  emoji: string;
  startTime: string; // "HH:MM" 24-h
}

function msUntilTime(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  const now = new Date();
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  return target.getTime() - now.getTime();
}

async function scheduleMealReminders(configs: MealConfig[]) {
  if (!("serviceWorker" in navigator)) return;
  if (Notification.permission !== "granted") return;

  const reg = await navigator.serviceWorker.ready;
  if (!reg.active) return;

  const meals = configs
    .map((c) => ({
      type: c.type,
      label: c.label,
      emoji: c.emoji,
      msUntil: msUntilTime(c.startTime),
    }))
    .filter((m) => m.msUntil > 0 && m.msUntil < 24 * 60 * 60 * 1000);

  reg.active.postMessage({ type: "SCHEDULE_REMINDERS", meals });
}

export function NotificationReminder() {
  useEffect(() => {
    // 1. Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }

    // 2. Schedule (or re-schedule) if reminders are on
    async function trySchedule() {
      const enabled = localStorage.getItem(REMINDERS_KEY) === "true";
      if (!enabled) return;
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      try {
        const res = await fetch("/api/plan");
        const data = await res.json();
        if (data.configs) {
          await scheduleMealReminders(data.configs);
        }
      } catch {
        // Non-critical — silently fail
      }
    }

    trySchedule();

    // Re-schedule when the user returns to the app tab / PWA
    const handleFocus = () => trySchedule();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") trySchedule();
    });

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return null;
}
