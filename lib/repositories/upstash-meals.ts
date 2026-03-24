import { getRedis } from "../db/upstash-client";
import { MealCompletion, MealConfig, MealType, DEFAULT_MEAL_CONFIGS } from "../types";
import { getLast7Days } from "../utils";

// Key helpers
const completionKey = (date: string, mealType: string) =>
  `mrt:completion:${date}:${mealType}`;
const planKey = (mealType: string) => `mrt:plan:${mealType}`;
const resetKey = (date: string) => `mrt:reset:${date}`;

const ALL_MEAL_TYPES: MealType[] = [
  "morning",
  "breakfast",
  "lunch",
  "eveningSnack",
  "dinner",
  "beforeBed",
];

export async function getMealCompletionsForDate(
  date: string
): Promise<MealCompletion[]> {
  const redis = getRedis();
  const pipeline = redis.pipeline();
  for (const mt of ALL_MEAL_TYPES) {
    pipeline.get(completionKey(date, mt));
  }
  const results = await pipeline.exec();
  return (results as (MealCompletion | null)[]).filter(Boolean) as MealCompletion[];
}

export async function getMealCompletion(
  date: string,
  mealType: MealType
): Promise<MealCompletion | null> {
  const redis = getRedis();
  return redis.get<MealCompletion>(completionKey(date, mealType));
}

export async function upsertMealCompletion(data: {
  date: string;
  mealType: MealType;
  items: string[];
  status: string;
  notes?: string;
}): Promise<MealCompletion> {
  const redis = getRedis();
  const existing = await getMealCompletion(data.date, data.mealType);

  const completion: MealCompletion = {
    id: existing?.id ?? `${data.date}-${data.mealType}`,
    date: data.date,
    mealType: data.mealType,
    items: data.items,
    status: data.status as MealCompletion["status"],
    notes: data.notes ?? null,
    completedAt: new Date().toISOString(),
  };

  // Expire after 60 days to keep Redis clean
  await redis.set(completionKey(data.date, data.mealType), completion, {
    ex: 60 * 24 * 60 * 60,
  });
  return completion;
}

export async function deleteMealCompletion(
  date: string,
  mealType: MealType
): Promise<void> {
  const redis = getRedis();
  await redis.del(completionKey(date, mealType));
}

export async function getCompletionsForDateRange(
  startDate: string,
  endDate: string
): Promise<MealCompletion[]> {
  const redis = getRedis();
  const days = getLast7Days().filter((d) => d >= startDate && d <= endDate);

  const pipeline = redis.pipeline();
  for (const date of days) {
    for (const mt of ALL_MEAL_TYPES) {
      pipeline.get(completionKey(date, mt));
    }
  }

  const results = await pipeline.exec();
  return (results as (MealCompletion | null)[]).filter(Boolean) as MealCompletion[];
}

export async function getMealPlanConfig(): Promise<MealConfig[]> {
  const redis = getRedis();
  const pipeline = redis.pipeline();
  for (const mt of ALL_MEAL_TYPES) {
    pipeline.get(planKey(mt));
  }
  const overrides = await pipeline.exec();

  return DEFAULT_MEAL_CONFIGS.map((defaultConfig, i) => {
    const override = overrides[i] as Partial<MealConfig> | null;
    if (!override) return defaultConfig;
    return {
      ...defaultConfig,
      label: override.label ?? defaultConfig.label,
      startTime: override.startTime ?? defaultConfig.startTime,
      endTime: override.endTime ?? defaultConfig.endTime,
      items: override.items ?? defaultConfig.items,
      itemDetails: override.itemDetails ?? defaultConfig.itemDetails,
      emoji: override.emoji ?? defaultConfig.emoji,
      color: override.color ?? defaultConfig.color,
    };
  });
}

export async function saveMealPlanConfig(
  mealType: MealType,
  config: Partial<MealConfig>
): Promise<void> {
  const redis = getRedis();
  const existing = (await redis.get<Partial<MealConfig>>(planKey(mealType))) ?? {};
  const merged = { ...existing, ...config };
  await redis.set(planKey(mealType), merged);
}

export async function resetDay(date: string): Promise<void> {
  const redis = getRedis();
  const pipeline = redis.pipeline();
  for (const mt of ALL_MEAL_TYPES) {
    pipeline.del(completionKey(date, mt));
  }
  pipeline.set(resetKey(date), "1", { ex: 30 * 24 * 60 * 60 });
  await pipeline.exec();
}
