import {
  MealConfig,
  MealType,
  MealStatus,
  DEFAULT_MEAL_CONFIGS,
} from "./types";

export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return { hours, minutes };
}

export function timeToMinutes(timeStr: string): number {
  const { hours, minutes } = parseTime(timeStr);
  return hours * 60 + minutes;
}

export function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function formatTime(timeStr: string): string {
  const { hours, minutes } = parseTime(timeStr);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function getMinutesUntil(timeStr: string): number {
  return timeToMinutes(timeStr) - getCurrentMinutes();
}

export type MealWindow = {
  config: MealConfig;
  status: "upcoming" | "active" | "overdue";
  minutesUntilStart: number;
  minutesUntilEnd: number;
  completionStatus?: MealStatus;
};

export function getMealWindows(
  configs: MealConfig[],
  completedTypes: Set<MealType>
): MealWindow[] {
  const currentMins = getCurrentMinutes();

  return configs.map((config) => {
    const startMins = timeToMinutes(config.startTime);
    const endMins = timeToMinutes(config.endTime);
    const minutesUntilStart = startMins - currentMins;
    const minutesUntilEnd = endMins - currentMins;

    let status: MealWindow["status"];
    if (currentMins < startMins) {
      status = "upcoming";
    } else if (currentMins >= startMins && currentMins <= endMins) {
      status = "active";
    } else {
      status = "overdue";
    }

    const completionStatus: MealStatus = completedTypes.has(config.type)
      ? "completed"
      : status === "overdue"
      ? "missed"
      : "pending";

    return {
      config,
      status,
      minutesUntilStart,
      minutesUntilEnd,
      completionStatus,
    };
  });
}

export function getCurrentMeal(
  configs: MealConfig[],
  completedTypes: Set<MealType>
): MealWindow | null {
  const windows = getMealWindows(configs, completedTypes);

  // First priority: active meal that hasn't been completed
  const activePending = windows.find(
    (w) => w.status === "active" && !completedTypes.has(w.config.type)
  );
  if (activePending) return activePending;

  // Second priority: most recently overdue meal not completed
  const overdueNotCompleted = windows
    .filter((w) => w.status === "overdue" && !completedTypes.has(w.config.type))
    .sort((a, b) => b.minutesUntilStart - a.minutesUntilStart);
  if (overdueNotCompleted.length > 0) return overdueNotCompleted[0];

  // Third priority: next upcoming meal
  const upcoming = windows.find((w) => w.status === "upcoming");
  if (upcoming) return upcoming;

  return null;
}

export function getNextMeal(
  configs: MealConfig[],
  completedTypes: Set<MealType>,
  currentType: MealType | null
): MealWindow | null {
  const windows = getMealWindows(configs, completedTypes);

  if (!currentType) {
    return windows.find((w) => w.status === "upcoming") || null;
  }

  const currentIndex = windows.findIndex((w) => w.config.type === currentType);
  if (currentIndex === -1) return null;

  for (let i = currentIndex + 1; i < windows.length; i++) {
    if (!completedTypes.has(windows[i].config.type)) {
      return windows[i];
    }
  }
  return null;
}

export function formatMinutesAsTime(minutes: number): string {
  if (minutes < 0) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function getEncouragingMessage(
  completedCount: number,
  totalMeals: number
): string {
  const percentage = (completedCount / totalMeals) * 100;
  if (completedCount === 0) return "Let's start your day right 🌸";
  if (percentage <= 25) return "Great start! Keep going 💪";
  if (percentage <= 50) return "You're doing amazing! Halfway there ✨";
  if (percentage <= 75) return "Almost there! Stay consistent 🌿";
  if (percentage < 100) return "So close! One more to go 🎯";
  return "Perfect day! You crushed it 🎉";
}

export function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}
