import { NextRequest, NextResponse } from "next/server"
import googleTTS from "google-tts-api"

const MAX_TEXT_LENGTH = 200

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get("text")?.trim()

  if (!text) {
    return NextResponse.json({ error: "Missing text query parameter" }, { status: 400 })
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: "Requested text is too long" }, { status: 400 })
  }

  try {
    const audioUrl = googleTTS.getAudioUrl(text, {
      lang: "ar",
      slow: false,
      host: "https://translate.google.com",
    })

    const audioResponse = await fetch(audioUrl)
    if (!audioResponse.ok) {
      throw new Error(`Upstream response ${audioResponse.status}`)
    }

    const arrayBuffer = await audioResponse.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Failed to generate Arabic audio", error)
    return NextResponse.json(
      { error: "Unable to generate audio pronunciation" },
      { status: 500 },
    )
  }
}
