import { prisma } from "../db/prisma-client";
import { Complaint, MealType } from "../types";

function parseComplaint(raw: {
  id: string;
  mealType: string;
  itemName: string;
  note: string | null;
  status: string;
  createdAt: Date;
}): Complaint {
  return {
    id: raw.id,
    mealType: raw.mealType as MealType,
    itemName: raw.itemName,
    note: raw.note,
    status: raw.status as Complaint["status"],
    createdAt: raw.createdAt.toISOString(),
  };
}

export async function createComplaint(data: {
  mealType: MealType;
  itemName: string;
  note?: string;
}): Promise<Complaint> {
  const complaint = await prisma.complaint.create({
    data: {
      mealType: data.mealType,
      itemName: data.itemName,
      note: data.note,
    },
  });
  return parseComplaint(complaint);
}

export async function getComplaints(limit = 50): Promise<Complaint[]> {
  const complaints = await prisma.complaint.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return complaints.map(parseComplaint);
}

export async function resolveComplaint(id: string): Promise<void> {
  await prisma.complaint.update({
    where: { id },
    data: { status: "resolved" },
  });
}

export async function getMostMissedItems(
  limit = 5
): Promise<{ itemName: string; count: number; mealType: MealType }[]> {
  const complaints = await prisma.complaint.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const itemCounts = new Map<
    string,
    { count: number; mealType: MealType }
  >();
  for (const c of complaints) {
    const key = `${c.itemName}::${c.mealType}`;
    const existing = itemCounts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      itemCounts.set(key, { count: 1, mealType: c.mealType as MealType });
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
