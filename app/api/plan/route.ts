import { NextRequest, NextResponse } from "next/server";
import { getMealPlanConfig, saveMealPlanConfig } from "@/lib/repositories";
import { MealType } from "@/lib/types";

export async function GET() {
  try {
    const configs = await getMealPlanConfig();
    return NextResponse.json({ configs });
  } catch (error) {
    console.error("GET /api/plan error:", error);
    return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { mealType, ...config } = body;

    if (!mealType) {
      return NextResponse.json({ error: "Missing mealType" }, { status: 400 });
    }

    await saveMealPlanConfig(mealType as MealType, config);
    const configs = await getMealPlanConfig();
    return NextResponse.json({ configs });
  } catch (error) {
    console.error("PATCH /api/plan error:", error);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}
