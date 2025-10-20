import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/session"
import { updateUserStats, completeHabitForUser, recordBadgeEarned } from "@/lib/data/mock-db"

export async function GET(request: NextRequest) {
  const { user, error } = requireAuth(request)
  if (error || !user) {
    return error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({ user })
}

export async function PATCH(request: NextRequest) {
  const { user, error } = requireAuth(request)
  if (error || !user) {
    return error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { stats, habitId, badgeId } = body as {
    stats?: Record<string, number>
    habitId?: string
    badgeId?: string
  }

  let updated = user

  if (stats) {
    updated = updateUserStats(user.id, stats) ?? updated
  }

  if (habitId) {
    updated = completeHabitForUser(user.id, habitId) ?? updated
  }

  if (badgeId) {
    updated = recordBadgeEarned(user.id, badgeId) ?? updated
  }

  return NextResponse.json({ user: updated })
}
