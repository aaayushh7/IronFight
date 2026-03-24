/**
 * Upstash Redis meal repository — skeleton implementation.
 *
 * To activate:
 * 1. npm install @upstash/redis
 * 2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env
 * 3. Set DB_PROVIDER=upstash in .env
 * 4. Implement the methods below using the Redis client
 *
 * Key schema:
 *   meal:completion:{date}:{mealType}  → MealCompletion JSON
 *   meal:completions:{date}            → Set of mealTypes completed that day
 *   meal:plan:{mealType}               → MealConfig overrides JSON
 *   day:reset:{date}                   → Reset timestamp
 */

import { MealCompletion, MealConfig, MealType } from "../types";

export async function getMealCompletionsForDate(
  date: string
): Promise<MealCompletion[]> {
  // TODO: Implement with Upstash Redis
  throw new Error("Upstash repository not yet implemented. Set DB_PROVIDER=prisma (default).");
}

export async function upsertMealCompletion(data: {
  date: string;
  mealType: MealType;
  items: string[];
  status: string;
  notes?: string;
}): Promise<MealCompletion> {
  // TODO: Implement with Upstash Redis
  throw new Error("Upstash repository not yet implemented.");
}

export async function getMealPlanConfig(): Promise<MealConfig[]> {
  // TODO: Implement with Upstash Redis
  throw new Error("Upstash repository not yet implemented.");
}

export async function resetDay(date: string): Promise<void> {
  // TODO: Implement with Upstash Redis
  throw new Error("Upstash repository not yet implemented.");
}
