import { NextRequest, NextResponse } from "next/server"
import { getLocalization } from "@/lib/data/mock-db"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get("locale") ?? "en"
  return NextResponse.json({ localization: getLocalization(locale) })
}
