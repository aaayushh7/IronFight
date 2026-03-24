/**
 * Repository index — dynamically picks Upstash or Prisma/SQLite
 * based on whether UPSTASH_REDIS_REST_URL is set.
 *
 * Dynamic import() ensures the unused provider is NEVER bundled,
 * which is critical for Vercel (SQLite native binaries don't run there).
 */

import { MealCompletion, MealConfig, MealType, Complaint } from "../types";

const useUpstash = () => !!process.env.UPSTASH_REDIS_REST_URL;

// ─── Meal functions ──────────────────────────────────────────────────────────

export async function getMealCompletionsForDate(
  date: string
): Promise<MealCompletion[]> {
  if (useUpstash()) {
    return (await import("./upstash-meals")).getMealCompletionsForDate(date);
  }
  return (await import("./meal-repository")).getMealCompletionsForDate(date);
}

export async function getMealCompletion(
  date: string,
  mealType: MealType
): Promise<MealCompletion | null> {
  if (useUpstash()) {
    return (await import("./upstash-meals")).getMealCompletion(date, mealType);
  }
  return (await import("./meal-repository")).getMealCompletion(date, mealType);
}

export async function upsertMealCompletion(data: {
  date: string;
  mealType: MealType;
  items: string[];
  status: string;
  notes?: string;
}): Promise<MealCompletion> {
  if (useUpstash()) {
    return (await import("./upstash-meals")).upsertMealCompletion(data);
  }
  return (await import("./meal-repository")).upsertMealCompletion(data);
}

export async function deleteMealCompletion(
  date: string,
  mealType: MealType
): Promise<void> {
  if (useUpstash()) {
    return (await import("./upstash-meals")).deleteMealCompletion(date, mealType);
  }
  return (await import("./meal-repository")).deleteMealCompletion(date, mealType);
}

export async function getCompletionsForDateRange(
  startDate: string,
  endDate: string
): Promise<MealCompletion[]> {
  if (useUpstash()) {
    return (await import("./upstash-meals")).getCompletionsForDateRange(startDate, endDate);
  }
  return (await import("./meal-repository")).getCompletionsForDateRange(startDate, endDate);
}

export async function getMealPlanConfig(): Promise<MealConfig[]> {
  if (useUpstash()) {
    return (await import("./upstash-meals")).getMealPlanConfig();
  }
  return (await import("./meal-repository")).getMealPlanConfig();
}

export async function saveMealPlanConfig(
  mealType: MealType,
  config: Partial<MealConfig>
): Promise<void> {
  if (useUpstash()) {
    return (await import("./upstash-meals")).saveMealPlanConfig(mealType, config);
  }
  return (await import("./meal-repository")).saveMealPlanConfig(mealType, config);
}

export async function resetDay(date: string): Promise<void> {
  if (useUpstash()) {
    return (await import("./upstash-meals")).resetDay(date);
  }
  return (await import("./meal-repository")).resetDay(date);
}

// ─── Complaint functions ─────────────────────────────────────────────────────

export async function createComplaint(data: {
  mealType: MealType;
  itemName: string;
  note?: string;
}): Promise<Complaint> {
  if (useUpstash()) {
    return (await import("./upstash-complaints")).createComplaint(data);
  }
  return (await import("./complaint-repository")).createComplaint(data);
}

export async function getComplaints(limit = 50): Promise<Complaint[]> {
  if (useUpstash()) {
    return (await import("./upstash-complaints")).getComplaints(limit);
  }
  return (await import("./complaint-repository")).getComplaints(limit);
}

export async function resolveComplaint(id: string): Promise<void> {
  if (useUpstash()) {
    return (await import("./upstash-complaints")).resolveComplaint(id);
  }
  return (await import("./complaint-repository")).resolveComplaint(id);
}

export async function getMostMissedItems(
  limit = 10
): Promise<{ itemName: string; count: number; mealType: MealType }[]> {
  if (useUpstash()) {
    return (await import("./upstash-complaints")).getMostMissedItems(limit);
  }
  return (await import("./complaint-repository")).getMostMissedItems(limit);
}
