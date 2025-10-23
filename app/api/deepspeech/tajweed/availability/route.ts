import { NextResponse } from "next/server"

import { isTajweedModuleAvailable } from "@/lib/deepspeech/tajweed-engine"

export async function GET() {
  const available = await isTajweedModuleAvailable()
  return NextResponse.json({ available })
}
