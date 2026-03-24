"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Flame, Trophy, TrendingUp, AlertTriangle } from "lucide-react";
import { ProgressRing } from "@/components/progress-ring";
import { Skeleton } from "@/components/skeleton";
import { getRelativeDay } from "@/lib/utils";

interface DailyStats {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

interface ProgressData {
  dailyStats: DailyStats[];
  streak: number;
  weeklyAverage: number;
  bestDay: string | null;
  totalCompleted: number;
}

interface MissedItem {
  itemName: string;
  count: number;
  mealType: string;
}

const MEAL_LABEL: Record<string, string> = {
  breakfast: "Breakfast",
  morningSnack: "Morning Snack",
  lunch: "Lunch",
  eveningSnack: "Evening Snack",
  dinner: "Dinner",
};

function BarChart({ stats }: { stats: DailyStats[] }) {
  const maxVal = 5;
  return (
    <div className="flex items-end gap-2 h-20">
      {stats.map((day, i) => {
        const height = (day.completed / maxVal) * 100;
        const isToday = i === stats.length - 1;
        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center" style={{ height: 64 }}>
              <motion.div
                className={`w-full rounded-t-lg ${
                  isToday
                    ? "bg-gradient-to-t from-purple-400 to-pink-300"
                    : day.percentage >= 60
                    ? "bg-gradient-to-t from-emerald-300 to-teal-200"
                    : day.percentage > 0
                    ? "bg-gradient-to-t from-amber-300 to-yellow-200"
                    : "bg-slate-100"
                }`}
                style={{ height: `${Math.max(height, day.completed > 0 ? 8 : 4)}%` }}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(height, day.completed > 0 ? 8 : 4)}%` }}
                transition={{ delay: i * 0.05, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              />
            </div>
            <span className="text-[9px] font-semibold text-slate-400">
              {getRelativeDay(day.date).split(",")[0].slice(0, 3)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ProgressPage() {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [missedItems, setMissedItems] = useState<MissedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [progressRes, missedRes] = await Promise.all([
        fetch("/api/progress"),
        fetch("/api/complaints?type=missed"),
      ]);
      const [progressJson, missedJson] = await Promise.all([
        progressRes.json(),
        missedRes.json(),
      ]);
      if (progressJson.dailyStats) setProgressData(progressJson);
      if (missedJson.items) setMissedItems(missedJson.items);
    } catch {
      toast.error("Couldn't load progress data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="px-4 pt-6 space-y-6">
        <Skeleton className="h-8 w-36" />
        <div className="flex gap-4">
          <Skeleton className="flex-1 h-28 rounded-3xl" />
          <Skeleton className="flex-1 h-28 rounded-3xl" />
        </div>
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-32 w-full rounded-3xl" />
      </div>
    );
  }

  const todayStats = progressData?.dailyStats[progressData.dailyStats.length - 1];
  const streak = progressData?.streak ?? 0;
  const weeklyAverage = progressData?.weeklyAverage ?? 0;

  return (
    <div className="px-4 pt-6 space-y-5 pb-4">
      {/* Header */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
          Your journey
        </p>
        <h1 className="text-2xl font-bold text-slate-700">Progress</h1>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-3">
        {/* Today */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="glass-card rounded-2xl p-4 flex flex-col items-center"
        >
          <ProgressRing
            percentage={todayStats?.percentage ?? 0}
            size={64}
            strokeWidth={6}
            showLabel
            label={`${todayStats?.percentage ?? 0}%`}
          />
          <p className="text-xs text-slate-400 font-semibold mt-2 text-center">Today</p>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center"
        >
          <div className="flex items-center gap-1">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-2xl font-bold text-slate-700">{streak}</span>
          </div>
          <p className="text-xs text-slate-400 font-semibold mt-1 text-center">Day streak</p>
        </motion.div>

        {/* Weekly avg */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center"
        >
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-2xl font-bold text-slate-700">
              {weeklyAverage}%
            </span>
          </div>
          <p className="text-xs text-slate-400 font-semibold mt-1 text-center">
            Weekly avg
          </p>
        </motion.div>
      </div>

      {/* Streak message */}
      {streak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3"
        >
          <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-slate-600">
            {streak === 1
              ? "Great start! You've been consistent today 🌸"
              : streak < 3
              ? `${streak}-day streak! Keep the momentum going 💪`
              : streak < 7
              ? `${streak}-day streak! You're on a roll! 🔥`
              : `Incredible! ${streak}-day streak! 🏆`}
          </p>
        </motion.div>
      )}

      {/* Weekly bar chart */}
      {progressData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-3xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-slate-600">This week</p>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 inline-block" />
                Today
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block" />
                Good
              </span>
            </div>
          </div>
          <BarChart stats={progressData.dailyStats} />
          <div className="mt-3 pt-3 border-t border-slate-100/60 flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">
              Total this week
            </p>
            <p className="text-sm font-bold text-slate-700">
              {progressData.totalCompleted} meals
            </p>
          </div>
        </motion.div>
      )}

      {/* Daily breakdown */}
      {progressData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-5 space-y-3"
        >
          <p className="text-sm font-bold text-slate-600">Daily breakdown</p>
          {[...progressData.dailyStats].reverse().map((day, i) => (
            <div key={day.date} className="flex items-center gap-3">
              <div className="w-16 flex-shrink-0">
                <p className="text-xs font-semibold text-slate-500">
                  {getRelativeDay(day.date)}
                </p>
              </div>
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    day.percentage >= 80
                      ? "bg-gradient-to-r from-emerald-400 to-teal-300"
                      : day.percentage >= 50
                      ? "bg-gradient-to-r from-amber-400 to-yellow-300"
                      : day.percentage > 0
                      ? "bg-gradient-to-r from-rose-400 to-pink-300"
                      : "bg-slate-200"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${day.percentage}%` }}
                  transition={{ delay: i * 0.04 + 0.2, duration: 0.6 }}
                />
              </div>
              <div className="w-12 text-right flex-shrink-0">
                <p className="text-xs font-bold text-slate-600">
                  {day.completed}/{day.total}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Most missed items */}
      {missedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-3xl p-5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <p className="text-sm font-bold text-slate-600">Frequently reported</p>
          </div>
          {missedItems.map((item, i) => (
            <motion.div
              key={`${item.itemName}-${item.mealType}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-amber-600">
                  {item.count}x
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">
                  {item.itemName}
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  {MEAL_LABEL[item.mealType] || item.mealType}
                </p>
              </div>
              <div className="flex-1 bg-amber-50 rounded-full h-1.5 overflow-hidden max-w-[80px]">
                <motion.div
                  className="h-full rounded-full bg-amber-300"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      (item.count / (missedItems[0]?.count || 1)) * 100,
                      100
                    )}%`,
                  }}
                  transition={{ delay: i * 0.05 + 0.3, duration: 0.6 }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty state for no data */}
      {progressData?.totalCompleted === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🌱</div>
          <p className="font-semibold text-slate-500">Your journey starts now</p>
          <p className="text-sm text-slate-400 mt-1">
            Log your first meal to see your progress here
          </p>
        </div>
      )}
    </div>
  );
}
