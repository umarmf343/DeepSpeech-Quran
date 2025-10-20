import { NextResponse } from "next/server"

import { getAyahMorphology, getWordMorphology } from "@/lib/quranic/morphology"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const verseKey = url.searchParams.get("verse")?.trim()
    const wordLocation = url.searchParams.get("word")?.trim()

    if (!verseKey && !wordLocation) {
      return NextResponse.json(
        { error: "Provide a verse (?verse=1:1) or word location (?word=2:255:15) query parameter." },
        { status: 400 },
      )
    }

    if (verseKey && wordLocation) {
      return NextResponse.json(
        { error: "Specify either a verse key or a word location, not both." },
        { status: 400 },
      )
    }

    if (verseKey) {
      const morphology = getAyahMorphology(verseKey)
      return NextResponse.json({ verseKey, morphology })
    }

    if (wordLocation) {
      const morphology = getWordMorphology(wordLocation)
      return NextResponse.json({ wordLocation, morphology })
    }

    return NextResponse.json({ error: "Invalid morphology lookup" }, { status: 400 })
  } catch (error) {
    console.error("/api/morphology error", error)
    return NextResponse.json({ error: "Failed to load morphology data" }, { status: 500 })
  }
}
