import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/session"
import {
  completeHabitForUser,
  getGamificationData,
  getNavigationForRole,
  recordBadgeEarned,
  upsertNotification,
} from "@/lib/data/mock-db"

export async function GET(request: NextRequest) {
  const { user, error } = requireAuth(request)
  if (error || !user) {
    return error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({
    gamification: getGamificationData(user.id),
    navigation: getNavigationForRole(user.role, user.preferences),
    notifications: user.notifications,
  })
}

export async function POST(request: NextRequest) {
  const { user, error } = requireAuth(request)
  if (error || !user) {
    return error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { type, habitId, badgeId } = body as {
    type: "habit" | "badge" | "notification"
    habitId?: string
    badgeId?: string
    notification?: { id: string; title: string; message: string }
  }

  let updated = user

  if (type === "habit" && habitId) {
    updated = completeHabitForUser(user.id, habitId) ?? updated
  }

  if (type === "badge" && badgeId) {
    updated = recordBadgeEarned(user.id, badgeId) ?? updated
  }

  if (type === "notification" && body.notification) {
    updated = upsertNotification(user.id, {
      ...body.notification,
      createdAt: new Date().toISOString(),
      type: "celebration",
      read: false,
    }) ?? updated
  }

  return NextResponse.json({
    gamification: getGamificationData(updated.id),
    notifications: updated.notifications,
  })
}
