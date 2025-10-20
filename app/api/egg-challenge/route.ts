import { NextResponse } from "next/server"

import { eggChallengeSettings, getEggChallengeState } from "@/lib/egg-challenge-store"

const DEMO_USER_ID = "demo-user"

export async function GET() {
  const state = getEggChallengeState(DEMO_USER_ID)

  return NextResponse.json({
    enabled: eggChallengeSettings.enabled,
    state,
  })
}
