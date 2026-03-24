import { getRedis } from "../db/upstash-client";
import { Complaint, MealType } from "../types";

// Key helpers
const complaintKey = (id: string) => `mrt:complaint:${id}`;
const COMPLAINTS_INDEX = "mrt:complaints:ids";

function generateId(): string {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function createComplaint(data: {
  mealType: MealType;
  itemName: string;
  note?: string;
}): Promise<Complaint> {
  const redis = getRedis();
  const id = generateId();
  const complaint: Complaint = {
    id,
    mealType: data.mealType,
    itemName: data.itemName,
    note: data.note ?? null,
    status: "open",
    createdAt: new Date().toISOString(),
  };

  const pipeline = redis.pipeline();
  pipeline.set(complaintKey(id), complaint, { ex: 90 * 24 * 60 * 60 });
  pipeline.lpush(COMPLAINTS_INDEX, id);
  pipeline.ltrim(COMPLAINTS_INDEX, 0, 499); // keep last 500
  await pipeline.exec();

  return complaint;
}

export async function getComplaints(limit = 50): Promise<Complaint[]> {
  const redis = getRedis();
  const ids = await redis.lrange<string>(COMPLAINTS_INDEX, 0, limit - 1);
  if (!ids || ids.length === 0) return [];

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.get(complaintKey(id));
  }
  const results = await pipeline.exec();
  return (results as (Complaint | null)[]).filter(Boolean) as Complaint[];
}

export async function resolveComplaint(id: string): Promise<void> {
  const redis = getRedis();
  const complaint = await redis.get<Complaint>(complaintKey(id));
  if (!complaint) return;
  await redis.set(complaintKey(id), { ...complaint, status: "resolved" });
}

export async function getMostMissedItems(
  limit = 10
): Promise<{ itemName: string; count: number; mealType: MealType }[]> {
  const redis = getRedis();
  const ids = await redis.lrange<string>(COMPLAINTS_INDEX, 0, 199);
  if (!ids || ids.length === 0) return [];

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.get(complaintKey(id));
  }
  const results = await pipeline.exec();
  const complaints = (results as (Complaint | null)[]).filter(Boolean) as Complaint[];

  const itemCounts = new Map<string, { count: number; mealType: MealType }>();
  for (const c of complaints) {
    const key = `${c.itemName}::${c.mealType}`;
    const existing = itemCounts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      itemCounts.set(key, { count: 1, mealType: c.mealType });
    }
  }

  return Array.from(itemCounts.entries())
    .map(([key, val]) => ({
      itemName: key.split("::")[0],
      count: val.count,
      mealType: val.mealType,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
