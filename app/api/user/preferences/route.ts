import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/session"
import { updateUserPreferences } from "@/lib/data/mock-db"

export async function GET(request: NextRequest) {
  const { user, error } = requireAuth(request)
  if (error || !user) {
    return error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({ preferences: user.preferences })
}

export async function PUT(request: NextRequest) {
  const { user, error } = requireAuth(request)
  if (error || !user) {
    return error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const updated = updateUserPreferences(user.id, body)
  if (!updated) {
    return NextResponse.json({ error: "Unable to update preferences" }, { status: 400 })
  }

  return NextResponse.json({ preferences: updated.preferences })
}
