import { NextRequest, NextResponse } from "next/server";
import {
  getMealCompletionsForDate,
  upsertMealCompletion,
  deleteMealCompletion,
} from "@/lib/repositories";
import { getTodayString } from "@/lib/meal-schedule";
import { MealType } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || getTodayString();

  try {
    const completions = await getMealCompletionsForDate(date);
    return NextResponse.json({ completions });
  } catch (error) {
    console.error("GET /api/meals error:", error);
    return NextResponse.json({ error: "Failed to fetch meals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, mealType, items, status, notes } = body;

    if (!date || !mealType || !items || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const completion = await upsertMealCompletion({
      date,
      mealType: mealType as MealType,
      items,
      status,
      notes,
    });

    return NextResponse.json({ completion });
  } catch (error) {
    console.error("POST /api/meals error:", error);
    return NextResponse.json({ error: "Failed to save meal" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, mealType } = body;

    if (!date || !mealType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await deleteMealCompletion(date, mealType as MealType);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/meals error:", error);
    return NextResponse.json({ error: "Failed to delete meal" }, { status: 500 });
  }
}
