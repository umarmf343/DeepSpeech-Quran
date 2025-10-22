import { NextResponse } from "next/server"
import { searchMorphologyWords } from "@/lib/morphology-db"
import type { MorphologyWordScope } from "@/types/morphology"

export const runtime = "nodejs"

function resolveScope(value: string | null): MorphologyWordScope | null {
  switch (value) {
    case "lemma":
    case "root":
    case "stem":
      return value
    default:
      return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const scope = resolveScope(searchParams.get("scope")) ?? "lemma"
  const limitParam = searchParams.get("limit")

  if (!query || !query.trim()) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 })
  }

  let limit: number | undefined
  if (limitParam) {
    const parsed = Number.parseInt(limitParam, 10)
    if (!Number.isNaN(parsed)) {
      limit = parsed
    }
  }

  try {
    const results = await searchMorphologyWords({ scope, query, limit })
    return NextResponse.json({ results, scope })
  } catch (error) {
    console.error("Failed to search morphology lexicon", error)
    return NextResponse.json({ error: "Unable to search morphology database" }, { status: 500 })
  }
}
