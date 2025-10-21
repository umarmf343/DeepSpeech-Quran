import { NextResponse } from "next/server"

import { incrementDailyGoal } from "@/lib/daily-goal-store"

const DEMO_USER_ID = "demo-user"

interface TrackVersePayload {
  verses?: number
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as TrackVersePayload
    const verses = typeof body.verses === "number" && !Number.isNaN(body.verses) ? Math.max(1, Math.floor(body.verses)) : 1

    const dailyGoal = incrementDailyGoal(DEMO_USER_ID, verses)

    return NextResponse.json({
      dailyGoal,
    })
  } catch (error) {
    console.error("Error handling verse progress:", error)
    return NextResponse.json({ message: "Unable to update verse progress" }, { status: 500 })
  }
}
