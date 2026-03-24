import { prisma } from "../db/prisma-client";
import {
  MealCompletion,
  MealConfig,
  MealType,
  DEFAULT_MEAL_CONFIGS,
} from "../types";

function parseMealCompletion(raw: {
  id: string;
  date: string;
  mealType: string;
  items: string;
  status: string;
  notes: string | null;
  completedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}): MealCompletion {
  return {
    id: raw.id,
    date: raw.date,
    mealType: raw.mealType as MealType,
    items: JSON.parse(raw.items) as string[],
    status: raw.status as MealCompletion["status"],
    notes: raw.notes,
    completedAt: raw.completedAt.toISOString(),
  };
}

export async function getMealCompletionsForDate(
  date: string
): Promise<MealCompletion[]> {
  const completions = await prisma.mealCompletion.findMany({
    where: { date },
    orderBy: { completedAt: "asc" },
  });
  return completions.map(parseMealCompletion);
}

export async function getMealCompletion(
  date: string,
  mealType: MealType
): Promise<MealCompletion | null> {
  const completion = await prisma.mealCompletion.findUnique({
    where: { date_mealType: { date, mealType } },
  });
  return completion ? parseMealCompletion(completion) : null;
}

export async function upsertMealCompletion(data: {
  date: string;
  mealType: MealType;
  items: string[];
  status: string;
  notes?: string;
}): Promise<MealCompletion> {
  const result = await prisma.mealCompletion.upsert({
    where: { date_mealType: { date: data.date, mealType: data.mealType } },
    create: {
      date: data.date,
      mealType: data.mealType,
      items: JSON.stringify(data.items),
      status: data.status,
      notes: data.notes,
    },
    update: {
      items: JSON.stringify(data.items),
      status: data.status,
      notes: data.notes,
      completedAt: new Date(),
    },
  });
  return parseMealCompletion(result);
}

export async function deleteMealCompletion(
  date: string,
  mealType: MealType
): Promise<void> {
  await prisma.mealCompletion.deleteMany({
    where: { date, mealType },
  });
}

export async function getCompletionsForDateRange(
  startDate: string,
  endDate: string
): Promise<MealCompletion[]> {
  const completions = await prisma.mealCompletion.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "asc" },
  });
  return completions.map(parseMealCompletion);
}

export async function getMealPlanConfig(): Promise<MealConfig[]> {
  const configs = await prisma.mealPlanConfig.findMany({
    orderBy: { mealType: "asc" },
  });

  if (configs.length === 0) {
    return DEFAULT_MEAL_CONFIGS;
  }

  const configMap = new Map(configs.map((c) => [c.mealType, c]));
  return DEFAULT_MEAL_CONFIGS.map((defaultConfig) => {
    const saved = configMap.get(defaultConfig.type);
    if (!saved) return defaultConfig;
    return {
      ...defaultConfig,
      label: saved.label,
      startTime: saved.startTime,
      endTime: saved.endTime,
      items: JSON.parse(saved.items) as string[],
      emoji: saved.emoji,
      color: saved.color,
    };
  });
}

export async function saveMealPlanConfig(
  mealType: MealType,
  config: Partial<MealConfig>
): Promise<void> {
  const defaultConfig = DEFAULT_MEAL_CONFIGS.find((c) => c.type === mealType);
  if (!defaultConfig) return;

  await prisma.mealPlanConfig.upsert({
    where: { mealType },
    create: {
      mealType,
      label: config.label ?? defaultConfig.label,
      startTime: config.startTime ?? defaultConfig.startTime,
      endTime: config.endTime ?? defaultConfig.endTime,
      items: JSON.stringify(config.items ?? defaultConfig.items),
      emoji: config.emoji ?? defaultConfig.emoji,
      color: config.color ?? defaultConfig.color,
    },
    update: {
      label: config.label ?? defaultConfig.label,
      startTime: config.startTime ?? defaultConfig.startTime,
      endTime: config.endTime ?? defaultConfig.endTime,
      items: JSON.stringify(config.items ?? defaultConfig.items),
      emoji: config.emoji ?? defaultConfig.emoji,
      color: config.color ?? defaultConfig.color,
    },
  });
}

export async function resetDay(date: string): Promise<void> {
  await prisma.mealCompletion.deleteMany({ where: { date } });
  await prisma.dayReset.upsert({
    where: { date },
    create: { date },
    update: { resetAt: new Date() },
  });
}
