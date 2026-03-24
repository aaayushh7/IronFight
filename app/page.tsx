"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { RefreshCw, Sparkles, Sun, Sunset, Moon, Coffee, Heart } from "lucide-react";
import { MealCard } from "@/components/meal-card";
import { ProgressRing } from "@/components/progress-ring";
import { MealCompleteSheet } from "@/components/meal-complete-sheet";
import { Confetti } from "@/components/confetti";
import { MealCardSkeleton, Skeleton } from "@/components/skeleton";
import {
  getMealWindows,
  getCurrentMeal,
  getNextMeal,
  getTodayString,
  getEncouragingMessage,
  formatTime,
} from "@/lib/meal-schedule";
import { MealConfig, MealCompletion } from "@/lib/types";
import { formatDateDisplay } from "@/lib/utils";

function getGreeting(): { text: string; icon: typeof Sun } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", icon: Sun };
  if (hour < 17) return { text: "Good afternoon", icon: Sunset };
  if (hour < 21) return { text: "Good evening", icon: Coffee };
  return { text: "Good night", icon: Moon };
}

export default function HomePage() {
  const [configs, setConfigs] = useState<MealConfig[]>([]);
  const [completions, setCompletions] = useState<MealCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealConfig | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const today = getTodayString();
  const { text: greeting, icon: GreetingIcon } = getGreeting();

  const loadData = useCallback(async () => {
    try {
      const [planRes, mealsRes] = await Promise.all([
        fetch("/api/plan"),
        fetch(`/api/meals?date=${today}`),
      ]);
      const [planData, mealsData] = await Promise.all([
        planRes.json(),
        mealsRes.json(),
      ]);
      if (planData.configs) setConfigs(planData.configs);
      if (mealsData.completions) setCompletions(mealsData.completions);
    } catch {
      toast.error("Couldn't load your meals. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const completedTypes = new Set(
    completions.filter((c) => c.status === "completed").map((c) => c.mealType)
  );

  const mealWindows =
    configs.length > 0 ? getMealWindows(configs, completedTypes) : [];
  const currentMeal =
    configs.length > 0 ? getCurrentMeal(configs, completedTypes) : null;
  const nextMeal = currentMeal
    ? getNextMeal(configs, completedTypes, currentMeal.config.type)
    : null;

  const completedCount = completions.filter((c) => c.status === "completed").length;
  const totalMeals = configs.length;
  const progressPct = totalMeals > 0 ? (completedCount / totalMeals) * 100 : 0;

  const handleMealTap = (config: MealConfig) => {
    const window = mealWindows.find((w) => w.config.type === config.type);
    if (!window || window.completionStatus === "completed") return;
    setSelectedMeal(config);
    setSheetOpen(true);
  };

  const handleComplete = async (items: string[], notes?: string) => {
    if (!selectedMeal) return;
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          mealType: selectedMeal.type,
          items,
          status: "completed",
          notes,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");

      setCompletions((prev) => {
        const filtered = prev.filter((c) => c.mealType !== selectedMeal.type);
        return [
          ...filtered,
          {
            id: "temp",
            date: today,
            mealType: selectedMeal.type,
            items,
            status: "completed" as const,
            notes,
            completedAt: new Date().toISOString(),
          },
        ];
      });

      const newCount = completedCount + 1;
      toast.success(`${selectedMeal.label} logged! 🌸`, {
        description: getEncouragingMessage(newCount, totalMeals),
      });
    } catch {
      toast.error("Couldn't save your meal. Please try again.");
      throw new Error("Save failed");
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset today's progress? This can't be undone.")) return;
    setIsResetting(true);
    try {
      await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today }),
      });
      setCompletions([]);
      toast.success("Day reset! Fresh start ✨");
    } catch {
      toast.error("Couldn't reset. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const allDone = completedCount === totalMeals && totalMeals > 0;

  if (isLoading) {
    return (
      <div className="px-4 pt-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="w-20 h-20 rounded-full" />
        </div>
        <MealCardSkeleton />
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Confetti show={showConfetti} onDone={() => setShowConfetti(false)} />

      <div className="px-4 pt-6 space-y-5 pb-4">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <GreetingIcon className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {greeting}
              </p>
            </div>
            <h1 className="text-[26px] font-extrabold text-slate-700 leading-tight tracking-tight">
              Recovery Tracker
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-0.5">
              {formatDateDisplay(today)}
            </p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <ProgressRing
              percentage={progressPct}
              size={80}
              strokeWidth={7}
              showLabel
              label={`${completedCount}/${totalMeals}`}
              sublabel="meals"
            />
          </div>
        </div>

        {/* ── Encouraging banner ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3"
        >
          {allDone ? (
            <Heart className="w-4 h-4 text-pink-400 flex-shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
          )}
          <p className="text-sm font-semibold text-slate-600">
            {allDone
              ? "All meals done! Your body thanks you 💖"
              : getEncouragingMessage(completedCount, totalMeals)}
          </p>
        </motion.div>

        {/* ── Current meal hero ──────────────────────────────────────────── */}
        {allDone ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-gradient-to-br from-emerald-100 via-teal-50 to-sky-50 border border-white/70 shadow-xl shadow-emerald-200/30 p-7 text-center"
          >
            <motion.div
              className="text-5xl mb-3"
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              🎉
            </motion.div>
            <h2 className="text-xl font-extrabold text-slate-700 mb-1.5">
              Perfect recovery day!
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Every meal logged. Your iron levels thank you 🌿
            </p>
          </motion.div>
        ) : currentMeal ? (
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">
              {currentMeal.status === "active" &&
              currentMeal.completionStatus !== "completed"
                ? "⚡ Eat right now"
                : currentMeal.completionStatus === "missed"
                ? "⚠️ Overdue — log when ready"
                : "⏰ Coming up"}
            </p>
            <MealCard
              mealWindow={currentMeal}
              isHero
              onTap={() => handleMealTap(currentMeal.config)}
            />
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-6 text-center">
            <div className="text-4xl mb-2">🌙</div>
            <p className="font-semibold text-slate-600">No meals scheduled now</p>
            <p className="text-sm text-slate-400 mt-1">Rest well. See you tomorrow!</p>
          </div>
        )}

        {/* ── Next meal preview ──────────────────────────────────────────── */}
        <AnimatePresence>
          {nextMeal && !allDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ delay: 0.12 }}
              className="glass-card rounded-2xl p-3.5 flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: `${nextMeal.config.color}35` }}
              >
                {nextMeal.config.emoji}
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Up next
                </p>
                <p className="font-bold text-slate-700 text-sm">
                  {nextMeal.config.label}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-purple-500 font-bold">
                  {nextMeal.status === "upcoming"
                    ? `in ${Math.max(0, nextMeal.minutesUntilStart)}m`
                    : formatTime(nextMeal.config.startTime)}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {formatTime(nextMeal.config.startTime)} –{" "}
                  {formatTime(nextMeal.config.endTime)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Today's full plan ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Today's plan
            </p>
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors font-semibold"
            >
              <RefreshCw
                className={`w-3 h-3 ${isResetting ? "animate-spin" : ""}`}
              />
              Reset day
            </button>
          </div>

          <div className="space-y-2">
            {mealWindows.map((window, i) => (
              <motion.div
                key={window.config.type}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <MealCard
                  mealWindow={window}
                  onTap={() => {
                    if (window.completionStatus !== "completed") {
                      handleMealTap(window.config);
                    }
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Completion timeline ────────────────────────────────────────── */}
        {completions.filter((c) => c.status === "completed").length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">
              Logged today
            </p>
            <div className="space-y-2">
              {completions
                .filter((c) => c.status === "completed")
                .map((c, i) => {
                  const cfg = configs.find((m) => m.type === c.mealType);
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 px-4 py-3 glass-card rounded-2xl"
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                        style={{ backgroundColor: `${cfg?.color ?? "#C9A7EB"}28` }}
                      >
                        {cfg?.emoji ?? "🍽️"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700">
                          {cfg?.label ?? c.mealType}
                        </p>
                        <p className="text-xs text-slate-400 truncate font-medium">
                          {c.items.join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 rounded-full flex-shrink-0">
                        <span className="text-emerald-500 text-xs font-bold">✓</span>
                        <span className="text-xs font-bold text-emerald-600">Done</span>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* ── Meal complete sheet ─────────────────────────────────────────── */}
      {selectedMeal && (
        <MealCompleteSheet
          isOpen={sheetOpen}
          onClose={() => {
            setSheetOpen(false);
            setSelectedMeal(null);
          }}
          config={selectedMeal}
          onComplete={handleComplete}
          existingItems={
            completions.find((c) => c.mealType === selectedMeal.type)?.items ?? []
          }
          onConfettiTrigger={() => setShowConfetti(true)}
        />
      )}
    </>
  );
}
