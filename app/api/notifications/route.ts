import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/session"
import { markNotificationRead, upsertNotification } from "@/lib/data/mock-db"

export async function GET(request: NextRequest) {
  const { user, error } = requireAuth(request)
  if (error || !user) {
    return error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({ notifications: user.notifications })
}

export async function POST(request: NextRequest) {
  const { user, error } = requireAuth(request)
  if (error || !user) {
    return error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  if (body.action === "mark-read" && body.id) {
    const updated = markNotificationRead(user.id, body.id)
    return NextResponse.json({ notifications: updated?.notifications ?? user.notifications })
  }

  if (body.notification) {
    const updated = upsertNotification(user.id, {
      ...body.notification,
      createdAt: new Date().toISOString(),
      read: false,
    })
    return NextResponse.json({ notifications: updated?.notifications ?? user.notifications })
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 })
}
