import { NextResponse } from "next/server"

const DEFAULT_MULTIPLIER = 700

export async function GET() {
  const envActive = process.env.RAMADAN_ACTIVE
  const envMultiplier = process.env.RAMADAN_MULTIPLIER

  const isRamadan = envActive ? envActive === "true" : false
  const multiplier = envMultiplier ? Number(envMultiplier) || DEFAULT_MULTIPLIER : DEFAULT_MULTIPLIER

  return NextResponse.json({
    isRamadan,
    multiplier: isRamadan ? multiplier : 1,
    source: envActive ? "config" : "default",
    message: isRamadan
      ? "Ramadan hours detected—each letter blossoms seven hundredfold."
      : "Standard reward rate active.",
  })
}

