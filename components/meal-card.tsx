"use client";

import { motion } from "framer-motion";
import { Check, Clock, AlertCircle, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { MealConfig } from "@/lib/types";
import { formatTime, formatMinutesAsTime, MealWindow } from "@/lib/meal-schedule";

interface MealCardProps {
  mealWindow: MealWindow;
  isHero?: boolean;
  onTap?: () => void;
  className?: string;
}

const statusConfig = {
  completed: {
    icon: Check,
    iconClass: "text-emerald-500",
    badgeClass: "bg-emerald-100 text-emerald-600",
    label: "Done",
  },
  missed: {
    icon: AlertCircle,
    iconClass: "text-amber-400",
    badgeClass: "bg-amber-100 text-amber-600",
    label: "Missed",
  },
  skipped: {
    icon: AlertCircle,
    iconClass: "text-slate-400",
    badgeClass: "bg-slate-100 text-slate-500",
    label: "Skipped",
  },
  pending: {
    icon: Clock,
    iconClass: "text-purple-400",
    badgeClass: "bg-purple-100 text-purple-600",
    label: "Upcoming",
  },
};

export function MealCard({ mealWindow, isHero = false, onTap, className }: MealCardProps) {
  const { config, status, completionStatus, minutesUntilStart, minutesUntilEnd } = mealWindow;
  const statusInfo = statusConfig[completionStatus ?? "pending"];
  const StatusIcon = statusInfo.icon;

  const isActive = status === "active";
  const isPending = completionStatus === "pending" || completionStatus === "missed";

  // Count iron-rich items for this meal
  const ironRichCount = config.itemDetails?.filter((d) =>
    d.tags.includes("iron-rich")
  ).length ?? 0;

  if (isHero) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className={cn(
          "relative overflow-hidden rounded-3xl cursor-pointer select-none",
          "bg-gradient-to-br",
          config.gradient,
          "border border-white/70 shadow-xl",
          className
        )}
        style={{ boxShadow: `0 16px 48px ${config.color}35, 0 4px 16px ${config.color}20` }}
        onClick={onTap}
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-25 blur-3xl"
          style={{ backgroundColor: config.color }}
        />
        <div
          className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full opacity-15 blur-3xl"
          style={{ backgroundColor: config.color }}
        />

        <div className="relative p-6 pb-5">
          {/* Status badge */}
          {isActive && isPending && (
            <motion.div
              className="absolute top-5 right-5 flex items-center gap-1.5 bg-white/75 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: config.color }}
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
              />
              <span className="text-xs font-bold text-slate-700">Now</span>
            </motion.div>
          )}

          {completionStatus === "completed" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-5 right-5 flex items-center gap-1.5 bg-emerald-100/90 backdrop-blur-sm rounded-full px-3 py-1"
            >
              <Check className="w-3 h-3 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">Done</span>
            </motion.div>
          )}

          {completionStatus === "missed" && (
            <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-amber-100/90 backdrop-blur-sm rounded-full px-3 py-1">
              <AlertCircle className="w-3 h-3 text-amber-500" />
              <span className="text-xs font-bold text-amber-700">Overdue</span>
            </div>
          )}

          {/* Emoji + label */}
          <div className="flex items-center gap-3 mb-3">
            <motion.span
              className="text-4xl"
              animate={isActive && isPending ? { rotate: [0, -5, 5, 0] } : {}}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              {config.emoji}
            </motion.span>
            <div>
              <p className="text-xs font-bold text-slate-500/80 uppercase tracking-widest">
                {isActive && isPending
                  ? "Eat right now"
                  : status === "upcoming"
                  ? "Coming up next"
                  : "Meal"}
              </p>
              <h2 className="text-2xl font-bold text-slate-700 leading-tight tracking-tight">
                {config.label}
              </h2>
            </div>
          </div>

          {/* Time info */}
          <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-semibold">
              {formatTime(config.startTime)} – {formatTime(config.endTime)}
            </span>
            {isActive && isPending && minutesUntilEnd > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-purple-600 font-bold">
                  {formatMinutesAsTime(minutesUntilEnd)} left
                </span>
              </>
            )}
            {status === "upcoming" && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-purple-600 font-bold">
                  in {formatMinutesAsTime(minutesUntilStart)}
                </span>
              </>
            )}
          </div>

          {/* Item preview with iron-rich indicators */}
          <div className="flex flex-wrap gap-1.5 mb-1">
            {config.items.slice(0, 5).map((item) => {
              const detail = config.itemDetails?.find((d) => d.name === item);
              const isIronRich = detail?.tags.includes("iron-rich");
              const isRecoveryBest = detail?.tags.includes("recovery-best");
              return (
                <span
                  key={item}
                  className={cn(
                    "px-2.5 py-1 backdrop-blur-sm rounded-full text-xs font-semibold border transition-all",
                    isRecoveryBest
                      ? "bg-white/80 border-pink-200/60 text-slate-700"
                      : isIronRich
                      ? "bg-white/70 border-red-100/60 text-slate-700"
                      : "bg-white/55 border-white/40 text-slate-600"
                  )}
                >
                  {isIronRich && <span className="mr-0.5 opacity-60">🩸</span>}
                  {item}
                </span>
              );
            })}
            {config.items.length > 5 && (
              <span className="px-2.5 py-1 bg-white/35 rounded-full text-xs font-semibold text-slate-400">
                +{config.items.length - 5} more
              </span>
            )}
          </div>

          {/* Iron count badge */}
          {ironRichCount > 0 && (
            <p className="text-xs text-slate-500/80 font-semibold mb-4 flex items-center gap-1">
              <span>🩸</span>
              <span>{ironRichCount} iron-rich options</span>
            </p>
          )}

          {/* CTA */}
          {isPending && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${config.color}EE, ${config.color}AA)`,
                  boxShadow: `0 6px 20px ${config.color}50`,
                }}
              >
                <span>
                  {completionStatus === "missed" ? "Mark complete" : "Log this meal"}
                </span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  // ─── Compact card ─────────────────────────────────────────────────────────
  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer select-none",
        "glass-card",
        completionStatus === "completed" && "opacity-70",
        className
      )}
      onClick={onTap}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: `${config.color}38` }}
      >
        {config.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-700 text-sm truncate">{config.label}</p>
          {isActive && isPending && (
            <motion.span
              className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-400"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            />
          )}
        </div>
        <p className="text-xs text-slate-400 font-medium">
          {formatTime(config.startTime)} – {formatTime(config.endTime)}
        </p>
      </div>

      <div
        className={cn(
          "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0",
          statusInfo.badgeClass
        )}
      >
        <StatusIcon className={cn("w-3 h-3", statusInfo.iconClass)} />
        <span>{statusInfo.label}</span>
      </div>
    </motion.div>
  );
}
