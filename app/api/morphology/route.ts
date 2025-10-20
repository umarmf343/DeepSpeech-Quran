import { NextResponse } from "next/server"
import { getMorphologyForAyah } from "@/lib/morphology-db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get("ayah")
  const ayahText = searchParams.get("text") ?? undefined

  if (!reference) {
    return NextResponse.json({ error: "Missing ayah reference" }, { status: 400 })
  }

  const morphology = await getMorphologyForAyah(reference, ayahText)

  if (!morphology) {
    return NextResponse.json({ error: "No morphology data found" }, { status: 404 })
  }

  return NextResponse.json(morphology)
}
