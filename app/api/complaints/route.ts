import { NextRequest, NextResponse } from "next/server";
import {
  createComplaint,
  getComplaints,
  resolveComplaint,
  getMostMissedItems,
} from "@/lib/repositories";
import { MealType } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") || "50");

  try {
    if (type === "missed") {
      const items = await getMostMissedItems(10);
      return NextResponse.json({ items });
    }
    const complaints = await getComplaints(limit);
    return NextResponse.json({ complaints });
  } catch (error) {
    console.error("GET /api/complaints error:", error);
    return NextResponse.json({ error: "Failed to fetch complaints" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mealType, itemName, note } = body;

    if (!mealType || !itemName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const complaint = await createComplaint({
      mealType: mealType as MealType,
      itemName,
      note,
    });

    return NextResponse.json({ complaint });
  } catch (error) {
    console.error("POST /api/complaints error:", error);
    return NextResponse.json({ error: "Failed to create complaint" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await resolveComplaint(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/complaints error:", error);
    return NextResponse.json({ error: "Failed to resolve complaint" }, { status: 500 });
  }
}
