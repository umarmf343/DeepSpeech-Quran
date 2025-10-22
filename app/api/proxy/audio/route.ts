import { NextRequest, NextResponse } from "next/server"

const ALLOWED_AUDIO_HOSTS = new Set([
  "cdn.islamic.network",
  "verses.quran.com",
])

function resolveTargetUrl(rawUrl: string | null): URL | null {
  if (!rawUrl) {
    return null
  }
  try {
    const target = new URL(rawUrl)
    if (!ALLOWED_AUDIO_HOSTS.has(target.hostname)) {
      return null
    }
    return target
  } catch (error) {
    console.error("Invalid proxy url", error)
    return null
  }
}

async function proxyAudio(request: NextRequest, method: "GET" | "HEAD") {
  const target = resolveTargetUrl(request.nextUrl.searchParams.get("url"))
  if (!target) {
    return NextResponse.json({ error: "Invalid or missing url" }, { status: 400 })
  }

  const upstreamHeaders: Record<string, string> = {}
  const rangeHeader = request.headers.get("range")
  if (rangeHeader) {
    upstreamHeaders.Range = rangeHeader
  }

  const upstreamResponse = await fetch(target, {
    cache: "no-store",
    headers: upstreamHeaders,
  }).catch((error: unknown) => {
    console.error("Failed to fetch upstream audio", error)
    return null
  })

  if (!upstreamResponse || !upstreamResponse.ok || (!upstreamResponse.body && method === "GET")) {
    const status = upstreamResponse?.status ?? 502
    return NextResponse.json({ error: "Failed to retrieve audio" }, { status })
  }

  const headers = new Headers(upstreamResponse.headers)
  headers.set("Access-Control-Allow-Origin", "*")
  headers.set("Access-Control-Allow-Headers", "Range")
  headers.set("Access-Control-Expose-Headers", "Accept-Ranges, Content-Length, Content-Range")
  if (!headers.has("content-type")) {
    headers.set("Content-Type", "audio/mpeg")
  }
  if (!headers.has("cache-control")) {
    headers.set("Cache-Control", "public, max-age=86400")
  }

  return new Response(method === "HEAD" ? null : upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers,
  })
}

export async function GET(request: NextRequest) {
  return proxyAudio(request, "GET")
}

export async function HEAD(request: NextRequest) {
  return proxyAudio(request, "HEAD")
}
