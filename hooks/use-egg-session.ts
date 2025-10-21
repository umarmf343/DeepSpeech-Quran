import { useCallback, useEffect, useRef, useState } from "react"

import type { EggChallengeSessionSnapshot } from "@/lib/egg-session-store"

interface SessionResponse {
  state: EggChallengeSessionSnapshot
}

type SessionAction = "start" | "complete" | "reset"

export function useEggSessionTimer(defaultDuration = 120) {
  const [state, setState] = useState<EggChallengeSessionSnapshot | null>(null)
  const [duration, setDuration] = useState(defaultDuration)
  const [timeLeft, setTimeLeft] = useState(defaultDuration)
  const [isRunning, setIsRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const syncTimeFromSession = useCallback((snapshot: EggChallengeSessionSnapshot | null) => {
    if (!snapshot?.activeSession) {
      clearTimer()
      setIsRunning(false)
      setSessionId(null)
      setTimeLeft(defaultDuration)
      setDuration(defaultDuration)
      return
    }

    const active = snapshot.activeSession
    setSessionId(active.id)
    setDuration(active.duration)

    const startedAt = new Date(active.startedAt).getTime()
    const elapsed = Math.floor((Date.now() - startedAt) / 1000)
    const remaining = Math.max(active.duration - elapsed, 0)

    setTimeLeft(remaining)

    if (remaining <= 0) {
      clearTimer()
      setIsRunning(false)
      return
    }

    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    setIsRunning(true)
  }, [clearTimer, defaultDuration])

  const request = useCallback(
    async (action: SessionAction, payload: Partial<{ duration: number; sessionId: string }> = {}) => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/egg-challenge/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action, ...payload }),
        })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = (await response.json()) as SessionResponse
        setState(data.state)
        syncTimeFromSession(data.state)
        return data.state
      } finally {
        setIsLoading(false)
      }
    },
    [syncTimeFromSession],
  )

  const start = useCallback(
    async (customDuration?: number) => {
      const durationToUse = typeof customDuration === "number" ? customDuration : defaultDuration
      const snapshot = await request("start", { duration: durationToUse })
      setDuration(snapshot.activeSession?.duration ?? durationToUse)
      setTimeLeft(snapshot.activeSession ? snapshot.activeSession.duration : durationToUse)
      return snapshot
    },
    [defaultDuration, request],
  )

  const complete = useCallback(async () => {
    if (!sessionId) return null
    const snapshot = await request("complete", { sessionId })
    clearTimer()
    setIsRunning(false)
    setTimeLeft(defaultDuration)
    setSessionId(null)
    return snapshot
  }, [clearTimer, defaultDuration, request, sessionId])

  const reset = useCallback(async () => {
    if (!sessionId) {
      setTimeLeft(defaultDuration)
      setIsRunning(false)
      clearTimer()
      return null
    }
    const snapshot = await request("reset", { sessionId })
    clearTimer()
    setTimeLeft(defaultDuration)
    setIsRunning(false)
    setSessionId(null)
    return snapshot
  }, [clearTimer, defaultDuration, request, sessionId])

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/egg-challenge/session")
      if (!response.ok) {
        return
      }
      const data = (await response.json()) as SessionResponse
      setState(data.state)
      syncTimeFromSession(data.state)
    } catch (error) {
      console.error("Error loading egg challenge session state:", error)
    }
  }, [syncTimeFromSession])

  useEffect(() => {
    void load()
    return () => {
      clearTimer()
    }
  }, [clearTimer, load])

  useEffect(() => {
    if (timeLeft === 0 && sessionId) {
      void complete()
    }
  }, [complete, sessionId, timeLeft])

  return {
    state,
    duration,
    timeLeft,
    isRunning,
    isLoading,
    start,
    reset,
    complete,
  }
}
