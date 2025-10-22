"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type {
  ReaderChallengeCelebration,
  ReaderChallengeSnapshot,
} from "@/lib/reader/challenges"

interface ReaderChallengeApiResponse {
  snapshot: ReaderChallengeSnapshot
  celebration?: ReaderChallengeCelebration | null
  error?: string
}

interface UseReaderChallengeResult {
  snapshot: ReaderChallengeSnapshot | null
  loading: boolean
  updating: boolean
  error: string | null
  celebration: ReaderChallengeCelebration | null
  recordVerse: (verses?: number) => Promise<void>
  reset: () => Promise<void>
  refresh: () => Promise<void>
  dismissCelebration: () => void
}

export function useReaderChallenge(): UseReaderChallengeResult {
  const [snapshot, setSnapshot] = useState<ReaderChallengeSnapshot | null>(null)
  const [celebration, setCelebration] = useState<ReaderChallengeCelebration | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  const fetchSnapshot = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/reader-challenge")
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      const data = (await response.json()) as ReaderChallengeApiResponse
      if (!isMountedRef.current) return
      setSnapshot(data.snapshot)
      setError(null)
    } catch (err) {
      if (!isMountedRef.current) return
      const message = err instanceof Error ? err.message : "Unable to load challenge"
      setError(message)
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    void fetchSnapshot()
    return () => {
      isMountedRef.current = false
    }
  }, [fetchSnapshot])

  const handleUpdate = useCallback(
    async (payload: { action: "progress" | "reset"; verses?: number }) => {
      try {
        setUpdating(true)
        const response = await fetch("/api/reader-challenge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        const data = (await response.json()) as ReaderChallengeApiResponse
        if (!isMountedRef.current) return
        setSnapshot(data.snapshot)
        setCelebration(data.celebration ?? null)
        setError(null)
      } catch (err) {
        if (!isMountedRef.current) return
        const message = err instanceof Error ? err.message : "Unable to update challenge"
        setError(message)
      } finally {
        if (isMountedRef.current) {
          setUpdating(false)
        }
      }
    },
    [],
  )

  const recordVerse = useCallback(
    async (verses = 1) => {
      await handleUpdate({ action: "progress", verses })
    },
    [handleUpdate],
  )

  const reset = useCallback(async () => {
    await handleUpdate({ action: "reset" })
  }, [handleUpdate])

  const refresh = useCallback(async () => {
    await fetchSnapshot()
  }, [fetchSnapshot])

  const dismissCelebration = useCallback(() => {
    setCelebration(null)
  }, [])

  return {
    snapshot,
    loading,
    updating,
    error,
    celebration,
    recordVerse,
    reset,
    refresh,
    dismissCelebration,
  }
}
