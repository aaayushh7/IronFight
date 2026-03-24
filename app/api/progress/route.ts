import { NextResponse } from "next/server";
import { getCompletionsForDateRange, getMealPlanConfig } from "@/lib/repositories";
import { getTodayString } from "@/lib/meal-schedule";
import { getLast7Days } from "@/lib/utils";

export async function GET() {
  try {
    const [configs, days] = await Promise.all([
      getMealPlanConfig(),
      Promise.resolve(getLast7Days()),
    ]);

    const TOTAL_MEALS = configs.length;
    const startDate = days[0];
    const endDate = days[days.length - 1];

    const completions = await getCompletionsForDateRange(startDate, endDate);

    const completionsByDay = new Map<string, typeof completions>();
    for (const c of completions) {
      const existing = completionsByDay.get(c.date) || [];
      existing.push(c);
      completionsByDay.set(c.date, existing);
    }

    const dailyStats = days.map((date) => {
      const dayCompletions = completionsByDay.get(date) || [];
      const completed = dayCompletions.filter((c) => c.status === "completed").length;
      return {
        date,
        completed,
        total: TOTAL_MEALS,
        percentage: Math.round((completed / TOTAL_MEALS) * 100),
      };
    });

    // Streak: consecutive days with >= 50% meals completed
    let streak = 0;
    const today = getTodayString();
    const sortedDays = [...days].reverse();
    for (const day of sortedDays) {
      if (day > today) continue;
      const dayStats = dailyStats.find((d) => d.date === day);
      const threshold = Math.ceil(TOTAL_MEALS / 2);
      if (dayStats && dayStats.completed >= threshold) {
        streak++;
      } else if (day !== today) {
        break;
      }
    }

    const weeklyTotal = dailyStats.reduce((sum, d) => sum + d.completed, 0);
    const weeklyAverage = Math.round(
      (weeklyTotal / (days.length * TOTAL_MEALS)) * 100
    );

    const bestDay = dailyStats.reduce(
      (best, day) => (day.percentage > (best?.percentage ?? -1) ? day : best),
      null as (typeof dailyStats)[0] | null
    );

    return NextResponse.json({
      dailyStats,
      streak,
      weeklyAverage,
      bestDay: bestDay?.date || null,
      totalCompleted: weeklyTotal,
      totalMeals: TOTAL_MEALS,
    });
  } catch (error) {
    console.error("GET /api/progress error:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}
