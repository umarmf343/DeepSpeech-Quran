import { NextRequest, NextResponse } from "next/server"

import { requireAuth } from "@/lib/auth/session"
import {
  getHasanatProgress,
  updateHasanatProgress,
  type StoredHasanatHistoryEntry,
  type StoredHasanatProgress,
} from "@/lib/data/mock-db"

function sanitiseHistory(entries: unknown): StoredHasanatHistoryEntry[] {
  if (!Array.isArray(entries)) return []
  return entries
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null
      const candidate = entry as Partial<StoredHasanatHistoryEntry>
      if (!candidate.verseKey) return null
      return {
        id: typeof candidate.id === "string" ? candidate.id : `${candidate.verseKey}-${Date.now()}`,
        verseKey: String(candidate.verseKey),
        letters: Number.isFinite(candidate.letters) ? Number(candidate.letters) : 0,
        hasanat: Number.isFinite(candidate.hasanat) ? Number(candidate.hasanat) : 0,
        multiplier: Number.isFinite(candidate.multiplier) ? Number(candidate.multiplier) : 1,
        recordedAt: typeof candidate.recordedAt === "string" ? candidate.recordedAt : new Date().toISOString(),
      }
    })
    .filter((entry): entry is StoredHasanatHistoryEntry => Boolean(entry))
    .slice(-50)
}

export async function GET(request: NextRequest) {
  const { user, error } = requireAuth(request)
  if (error || !user) {
    return error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const progress = getHasanatProgress(user.id)
  return NextResponse.json({ progress })
}

export async function POST(request: NextRequest) {
  const { user, error } = requireAuth(request)
  if (error || !user) {
    return error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const candidate = (body as { progress?: Partial<StoredHasanatProgress> }).progress
  if (!candidate || typeof candidate !== "object") {
    return NextResponse.json({ error: "Missing progress" }, { status: 400 })
  }

  const sanitized: StoredHasanatProgress = {
    totalHasanat: Number.isFinite(candidate.totalHasanat) ? Number(candidate.totalHasanat) : 0,
    dailyHasanat: Number.isFinite(candidate.dailyHasanat) ? Number(candidate.dailyHasanat) : 0,
    sessionHasanat: Number.isFinite(candidate.sessionHasanat) ? Number(candidate.sessionHasanat) : 0,
    today: typeof candidate.today === "string" ? candidate.today : new Date().toISOString().slice(0, 10),
    nextResetAt:
      typeof candidate.nextResetAt === "string"
        ? candidate.nextResetAt
        : new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() + 1)).toISOString(),
    resetStrategy: candidate.resetStrategy === "maghrib" ? "maghrib" : "midnight",
    milestones: {
      surahsCompleted: candidate.milestones?.surahsCompleted ?? [],
      goalsMet: candidate.milestones?.goalsMet ?? [],
      juzCompleted: candidate.milestones?.juzCompleted ?? [],
      hundredSteps: candidate.milestones?.hundredSteps ?? [],
      ramadanMoments: candidate.milestones?.ramadanMoments ?? [],
    },
    history: sanitiseHistory(candidate.history),
  }

  const updated = updateHasanatProgress(user.id, sanitized)
  return NextResponse.json({ progress: updated })
}

