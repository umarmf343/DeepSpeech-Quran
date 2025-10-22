import { NextResponse } from "next/server"

import { getDailyGoalState } from "@/lib/daily-goal-store"

const DEMO_USER_ID = "demo-user"

export async function GET() {
  try {
    const dailyGoal = getDailyGoalState(DEMO_USER_ID)

    return NextResponse.json({
      dailyGoal,
    })
  } catch (error) {
    console.error("Error loading daily goal state", error)
    return NextResponse.json({ message: "Unable to load daily goal" }, { status: 500 })
  }
}
