import { NextResponse } from "next/server"

import {
  completeEggChallengeSession,
  getEggChallengeSessionState,
  resetEggChallengeSession,
  startEggChallengeSession,
} from "@/lib/egg-session-store"

const DEMO_USER_ID = "demo-user"

interface SessionPayload {
  action?: "start" | "complete" | "reset"
  duration?: number
  sessionId?: string
}

export async function GET() {
  const state = getEggChallengeSessionState(DEMO_USER_ID)
  return NextResponse.json({ state })
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => ({}))) as SessionPayload
    const action = payload.action ?? "start"

    switch (action) {
      case "start": {
        const duration = typeof payload.duration === "number" ? Math.max(10, Math.floor(payload.duration)) : 120
        const state = startEggChallengeSession(DEMO_USER_ID, duration)
        return NextResponse.json({ state })
      }
      case "complete": {
        if (!payload.sessionId) {
          return NextResponse.json({ message: "Missing session id" }, { status: 400 })
        }
        const state = completeEggChallengeSession(DEMO_USER_ID, payload.sessionId)
        return NextResponse.json({ state })
      }
      case "reset": {
        const state = resetEggChallengeSession(DEMO_USER_ID, payload.sessionId)
        return NextResponse.json({ state })
      }
      default:
        return NextResponse.json({ message: "Unsupported action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error managing egg challenge session:", error)
    return NextResponse.json({ message: "Unable to update session" }, { status: 500 })
  }
}
