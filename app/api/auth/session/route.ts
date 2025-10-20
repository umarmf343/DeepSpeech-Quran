import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/session"
import { getNavigationForRole } from "@/lib/data/mock-db"

export async function GET(request: NextRequest) {
  const { user, error } = requireAuth(request)
  if (error || !user) {
    return error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({
    user,
    navigation: getNavigationForRole(user.role, user.preferences),
  })
}
