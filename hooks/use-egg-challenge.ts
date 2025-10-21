import { useCallback, useEffect, useState } from "react"

import type { EggChallengeSnapshot } from "@/lib/egg-challenge-store"

export interface TrackEggProgressResponse {
  eggChallenge: EggChallengeSnapshot
  dailyGoal?: unknown
}

interface EggChallengeResponse {
  enabled?: boolean
  state?: EggChallengeSnapshot | null
}

export function useEggChallenge() {
  const [enabled, setEnabled] = useState(false)
  const [state, setState] = useState<EggChallengeSnapshot | null>(null)

  const loadState = useCallback(async () => {
    try {
      const response = await fetch("/api/egg-challenge")
      if (!response.ok) {
        return null
      }

      const data = (await response.json()) as EggChallengeResponse
      return data
    } catch (error) {
      console.error("Error loading egg challenge state:", error)
      return null
    }
  }, [])

  const refresh = useCallback(async () => {
    const data = await loadState()
    if (!data) {
      return null
    }

    setEnabled(Boolean(data.enabled))
    setState((data.state ?? null) as EggChallengeSnapshot | null)
    return data
  }, [loadState])

  useEffect(() => {
    let isActive = true

    const fetchState = async () => {
      const data = await loadState()
      if (!isActive || !data) {
        return
      }

      setEnabled(Boolean(data.enabled))
      setState((data.state ?? null) as EggChallengeSnapshot | null)
    }

    void fetchState()

    return () => {
      isActive = false
    }
  }, [loadState])

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined
    }

    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<EggChallengeSnapshot>
      const snapshot = customEvent.detail
      if (!snapshot) {
        return
      }

      setState(snapshot)
      setEnabled(true)
    }

    window.addEventListener("alfawz:egg-updated", handleUpdate as EventListener)

    return () => {
      window.removeEventListener("alfawz:egg-updated", handleUpdate as EventListener)
    }
  }, [])

  const trackProgress = useCallback(async (verses = 1) => {
    try {
      const response = await fetch("/api/track-verse-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verses }),
      })

      if (!response.ok) {
        return null
      }

      const data = (await response.json()) as TrackEggProgressResponse
      if (data.eggChallenge) {
        setState(data.eggChallenge)
        setEnabled(true)

        if (typeof window !== "undefined") {
          const event = new CustomEvent("alfawz:egg-updated", { detail: data.eggChallenge })
          window.dispatchEvent(event)
        }
      }

      return data
    } catch (error) {
      console.error("Error tracking egg challenge progress:", error)
      return null
    }
  }, [])

  return {
    enabled,
    state,
    refresh,
    trackProgress,
  }
}
