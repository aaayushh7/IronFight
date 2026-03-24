import { NextRequest, NextResponse } from "next/server";
import { resetDay } from "@/lib/repositories";
import { getTodayString } from "@/lib/meal-schedule";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const date = body.date || getTodayString();

    await resetDay(date);
    return NextResponse.json({ success: true, date });
  } catch (error) {
    console.error("POST /api/reset error:", error);
    return NextResponse.json({ error: "Failed to reset day" }, { status: 500 });
  }
}
