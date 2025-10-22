import { NextResponse } from "next/server"

const QURAN_API_BASE_URL = "https://api.alquran.cloud/v1"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const surah = url.searchParams.get("surah")
  const ayah = url.searchParams.get("ayah")
  const reciter = url.searchParams.get("reciter") ?? "ar.alafasy"

  if (!surah || !ayah) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
  }

  try {
    const ayahResponse = await fetch(`${QURAN_API_BASE_URL}/ayah/${surah}:${ayah}/${reciter}`)
    if (!ayahResponse.ok) {
      return NextResponse.json({ error: "Failed to resolve audio source" }, { status: ayahResponse.status })
    }

    const ayahData = await ayahResponse.json()
    const audioUrl = ayahData?.data?.audio

    if (typeof audioUrl !== "string" || !audioUrl) {
      return NextResponse.json({ error: "Audio not available for requested verse" }, { status: 404 })
    }

    const audioResponse = await fetch(audioUrl)
    if (!audioResponse.ok || !audioResponse.body) {
      return NextResponse.json({ error: "Failed to fetch verse audio" }, { status: audioResponse.status || 500 })
    }

    const headers = new Headers()
    headers.set("Content-Type", audioResponse.headers.get("content-type") ?? "audio/mpeg")
    headers.set("Cache-Control", "public, max-age=86400")
    headers.set("Access-Control-Allow-Origin", "*")

    return new Response(audioResponse.body, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Verse audio fetch failed", error)
    return NextResponse.json({ error: "Unexpected error fetching verse audio" }, { status: 500 })
  }
}
