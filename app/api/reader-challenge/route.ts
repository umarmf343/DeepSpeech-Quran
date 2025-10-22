import { NextRequest, NextResponse } from "next/server"

import { requireAuth } from "@/lib/auth/session"
import { getReaderChallenge, recordReaderChallengeProgress, resetReaderChallenge } from "@/lib/data/mock-db"

const DEFAULT_USER_ID = "user_student"

function resolveUserId(request: NextRequest): string {
  const { user } = requireAuth(request)
  return user?.id ?? DEFAULT_USER_ID
}

export async function GET(request: NextRequest) {
  const userId = resolveUserId(request)
  const snapshot = getReaderChallenge(userId)
  if (!snapshot) {
    return NextResponse.json({ error: "Challenge state not found" }, { status: 404 })
  }
  return NextResponse.json({ snapshot })
}

interface ChallengeActionPayload {
  action?: "progress" | "reset"
  verses?: number
}

export async function POST(request: NextRequest) {
  const userId = resolveUserId(request)
  const payload = (await request.json().catch(() => null)) as ChallengeActionPayload | null
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  if (payload.action === "reset") {
    const snapshot = resetReaderChallenge(userId)
    if (!snapshot) {
      return NextResponse.json({ error: "Unable to reset challenge" }, { status: 500 })
    }
    return NextResponse.json({ snapshot, celebration: null })
  }

  if (payload.action === "progress") {
    const verses = typeof payload.verses === "number" ? payload.verses : 1
    const result = recordReaderChallengeProgress(userId, verses)
    if (!result) {
      return NextResponse.json({ error: "Unable to record progress" }, { status: 500 })
    }
    return NextResponse.json(result)
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 })
}
