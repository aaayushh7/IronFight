"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Bell,
  Database,
  RefreshCw,
  Heart,
  ExternalLink,
  ChevronRight,
  Info,
  Moon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTodayString, formatTime } from "@/lib/meal-schedule";
import { MealConfig } from "@/lib/types";

const REMINDERS_KEY = "meal-reminders-enabled";

export default function SettingsPage() {
  const [configs, setConfigs] = useState<MealConfig[]>([]);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(REMINDERS_KEY);
    setRemindersEnabled(saved === "true");

    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }

    fetch("/api/plan")
      .then((r) => r.json())
      .then((d) => {
        if (d.configs) setConfigs(d.configs);
      })
      .catch(() => {});
  }, []);

  const scheduleRemindersViaSW = useCallback(
    async (mealConfigs: MealConfig[]) => {
      if (!("serviceWorker" in navigator)) return;
      if (Notification.permission !== "granted") return;
      try {
        const reg = await navigator.serviceWorker.ready;
        if (!reg.active) return;
        const now = new Date();
        const meals = mealConfigs
          .map((c) => {
            const [h, m] = c.startTime.split(":").map(Number);
            const target = new Date(now);
            target.setHours(h, m, 0, 0);
            return {
              type: c.type,
              label: c.label,
              emoji: c.emoji,
              msUntil: target.getTime() - now.getTime(),
            };
          })
          .filter((m) => m.msUntil > 0 && m.msUntil < 24 * 60 * 60 * 1000);
        reg.active.postMessage({ type: "SCHEDULE_REMINDERS", meals });
      } catch {
        // Non-critical
      }
    },
    []
  );

  const toggleReminders = async () => {
    if (!remindersEnabled) {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        setNotifPermission(permission);
        if (permission === "granted") {
          setRemindersEnabled(true);
          localStorage.setItem(REMINDERS_KEY, "true");
          toast.success("Reminders enabled! 🌸");
          await scheduleRemindersViaSW(configs);
        } else {
          toast.error("Permission denied. Enable in iOS Settings → Safari.");
          return;
        }
      } else {
        toast.error("Notifications not supported in this browser.");
        return;
      }
    } else {
      setRemindersEnabled(false);
      localStorage.setItem(REMINDERS_KEY, "false");
      toast.success("Reminders disabled");
    }
  };

  const handleResetToday = async () => {
    if (!confirm("Reset today's meal progress?")) return;
    setIsResetting(true);
    try {
      await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: getTodayString() }),
      });
      toast.success("Day reset successfully ✓");
    } catch {
      toast.error("Reset failed. Try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const settingsSections = [
    {
      title: "Reminders",
      items: [
        {
          icon: Bell,
          iconBg: "bg-purple-100",
          iconColor: "text-purple-500",
          label: "Meal reminders",
          description:
            notifPermission === "denied"
              ? "Blocked – enable in browser"
              : remindersEnabled
              ? "Enabled"
              : "Get notified before each meal",
          action: (
            <button
              onClick={toggleReminders}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${
                remindersEnabled ? "bg-purple-400" : "bg-slate-200"
              }`}
            >
              <motion.div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                animate={{ left: remindersEnabled ? "22px" : "2px" }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            </button>
          ),
        },
      ],
    },
    {
      title: "Upcoming meals",
      items: configs.map((config) => ({
        icon: null,
        emoji: config.emoji,
        iconBg: "",
        iconColor: "",
        label: config.label,
        description: `${formatTime(config.startTime)} – ${formatTime(config.endTime)}`,
        action: (
          <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
        ),
        href: "/plan",
      })),
    },
    {
      title: "Data & Recovery",
      items: [
        {
          icon: RefreshCw,
          iconBg: "bg-amber-100",
          iconColor: "text-amber-500",
          label: "Reset today",
          description: "Clear all of today's meal completions",
          action: (
            <button
              onClick={handleResetToday}
              disabled={isResetting}
              className="px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-full hover:bg-amber-100 transition-colors flex-shrink-0"
            >
              {isResetting ? "Resetting..." : "Reset"}
            </button>
          ),
        },
        {
          icon: Database,
          iconBg: "bg-blue-100",
          iconColor: "text-blue-500",
          label: "Database",
          description: "SQLite (local) · Ready for Upstash",
          action: (
            <span className="px-2 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full flex-shrink-0">
              Active
            </span>
          ),
        },
      ],
    },
    {
      title: "About",
      items: [
        {
          icon: Heart,
          iconBg: "bg-rose-100",
          iconColor: "text-rose-500",
          label: "Meal Recovery Tracker",
          description: "Built with love for a healthy recovery 🌸",
          action: null,
        },
        {
          icon: Info,
          iconBg: "bg-slate-100",
          iconColor: "text-slate-500",
          label: "Version",
          description: "1.0.0 · Production ready",
          action: null,
        },
      ],
    },
  ];

  return (
    <div className="px-4 pt-6 space-y-6 pb-4">
      {/* Header */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
          Preferences
        </p>
        <h1 className="text-2xl font-bold text-slate-700">Settings</h1>
      </div>

      {/* Upstash upgrade banner */}
      {/* <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Database className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Upgrade to Upstash</p>
            <p className="text-xs text-violet-200 font-medium mt-0.5 leading-relaxed">
              Add your Upstash Redis credentials in{" "}
              <code className="font-mono bg-white/20 px-1 py-0.5 rounded text-xs">.env</code>{" "}
              to enable cloud sync and persistence.
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs text-violet-200 font-semibold">
              <code className="font-mono">UPSTASH_REDIS_REST_URL</code>
              <span>·</span>
              <code className="font-mono">UPSTASH_REDIS_REST_TOKEN</code>
            </div>
          </div>
        </div>
      </motion.div> */}

      {/* Settings sections */}
      {settingsSections.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.06 }}
          className="space-y-2"
        >
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            {section.title}
          </p>
          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-slate-100/60">
            {section.items.map((item, ii) => (
              <div
                key={item.label}
                className="flex items-center gap-3 px-4 py-3.5"
              >
                {"emoji" in item && item.emoji ? (
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-slate-50"
                  >
                    {item.emoji}
                  </div>
                ) : item.icon ? (
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg}`}
                  >
                    <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                  </div>
                ) : null}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {item.description}
                  </p>
                </div>
                {item.action}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Reminder schedule preview */}
      {remindersEnabled && configs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-400" />
            <p className="text-sm font-bold text-slate-600">
              Reminder schedule
            </p>
          </div>
          {configs.map((config) => (
            <div
              key={config.type}
              className="flex items-center gap-3 py-1"
            >
              <span className="text-lg w-6 text-center">{config.emoji}</span>
              <span className="text-sm font-medium text-slate-600 flex-1">
                {config.label}
              </span>
              <span className="text-xs font-semibold text-purple-500">
                {formatTime(config.startTime)}
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
