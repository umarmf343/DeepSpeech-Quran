"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { countArabicLetters, hasanatFromLetters } from "@/lib/hasanat"

const STORAGE_KEY = "alfawz::hasanat-tracker"
const MAGHRIB_KEY = "alfawz::maghrib-reset"

export const HASANAT_PROGRESS_EVENT = "alfawz:hasanat-progress"

export interface HasanatProgressDetail {
  total: number
  daily: number
  session: number
}

export interface VerseInput {
  verseKey: string
  text: string
  juz?: number
}

export interface HasanatHistoryEntry {
  id: string
  verseKey: string
  letters: number
  hasanat: number
  multiplier: number
  recordedAt: string
}

export interface HasanatMilestones {
  surahsCompleted: string[]
  goalsMet: string[]
  juzCompleted: string[]
  hundredSteps: number[]
  ramadanMoments: string[]
}

export interface HasanatProgressState {
  totalHasanat: number
  dailyHasanat: number
  sessionHasanat: number
  today: string
  nextResetAt: string
  resetStrategy: "maghrib" | "midnight"
  milestones: HasanatMilestones
  history: HasanatHistoryEntry[]
}

export interface HasanatCelebrationPayload {
  id: string
  type: "hundred" | "surah" | "goal" | "ramadan" | "juz"
  title: string
  message: string
  verse: string
  emphasis?: string
}

export interface RamadanState {
  isRamadan: boolean
  multiplier: number
  source?: string
  message?: string
}

export interface RecordRecitationPayload {
  surahNumber: number
  surahName?: string
  verses: VerseInput[]
  shouldCount: boolean
  completedGoal?: boolean
  isSurahCompletion?: boolean
  completedJuzIds?: number[]
}

export interface RecordRecitationResult {
  earned: number
  base: number
  multiplier: number
  letters: number
}

export interface SparkleEvent {
  id: string
  amount: number
  multiplier: number
  createdAt: number
  emphasis?: string
}

interface UseHasanatTrackerOptions {
  initialDailyGoal?: number
}

function getUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function resolveNextReset(now: Date): { nextResetAt: string; today: string; strategy: "maghrib" | "midnight" } {
  if (typeof window !== "undefined") {
    const storedMaghrib = window.localStorage.getItem(MAGHRIB_KEY)
    if (storedMaghrib) {
      const parsed = new Date(storedMaghrib)
      if (!Number.isNaN(parsed.getTime()) && parsed > now) {
        return { nextResetAt: parsed.toISOString(), today: getUtcDateKey(now), strategy: "maghrib" }
      }
    }
  }

  const midnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
  return { nextResetAt: midnightUtc.toISOString(), today: getUtcDateKey(now), strategy: "midnight" }
}

function createInitialState(now: Date): HasanatProgressState {
  const { nextResetAt, today, strategy } = resolveNextReset(now)
  return {
    totalHasanat: 0,
    dailyHasanat: 0,
    sessionHasanat: 0,
    today,
    nextResetAt,
    resetStrategy: strategy,
    milestones: {
      surahsCompleted: [],
      goalsMet: [],
      juzCompleted: [],
      hundredSteps: [],
      ramadanMoments: [],
    },
    history: [],
  }
}

function normaliseState(state: Partial<HasanatProgressState> | null, now: Date): HasanatProgressState {
  const base = createInitialState(now)
  if (!state) return base

  const today = typeof state.today === "string" ? state.today : base.today
  const nextResetAt = typeof state.nextResetAt === "string" ? state.nextResetAt : base.nextResetAt
  const resetStrategy = state.resetStrategy === "maghrib" ? "maghrib" : state.resetStrategy === "midnight" ? "midnight" : base.resetStrategy

  return {
    totalHasanat: Number.isFinite(state.totalHasanat) ? state.totalHasanat : base.totalHasanat,
    dailyHasanat: Number.isFinite(state.dailyHasanat) ? state.dailyHasanat : base.dailyHasanat,
    sessionHasanat: Number.isFinite(state.sessionHasanat) ? state.sessionHasanat : base.sessionHasanat,
    today,
    nextResetAt,
    resetStrategy,
    milestones: {
      surahsCompleted: state.milestones?.surahsCompleted ?? base.milestones.surahsCompleted,
      goalsMet: state.milestones?.goalsMet ?? base.milestones.goalsMet,
      juzCompleted: state.milestones?.juzCompleted ?? base.milestones.juzCompleted,
      hundredSteps: state.milestones?.hundredSteps ?? base.milestones.hundredSteps,
      ramadanMoments: state.milestones?.ramadanMoments ?? base.milestones.ramadanMoments,
    },
    history: Array.isArray(state.history) ? state.history.slice(-50) : base.history,
  }
}

function ensureDailyFreshness(state: HasanatProgressState, now: Date): HasanatProgressState {
  if (!state.nextResetAt) {
    return createInitialState(now)
  }

  const resetAt = new Date(state.nextResetAt)
  if (Number.isNaN(resetAt.getTime()) || now >= resetAt) {
    const { nextResetAt, today, strategy } = resolveNextReset(now)
    return {
      ...state,
      dailyHasanat: 0,
      sessionHasanat: 0,
      today,
      nextResetAt,
      resetStrategy: strategy,
    }
  }

  return state
}

export function useHasanatTracker({ initialDailyGoal }: UseHasanatTrackerOptions = {}) {
  void initialDailyGoal
  const letterCacheRef = useRef<Map<string, number>>(new Map())
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [state, setState] = useState<HasanatProgressState>(() => {
    const now = new Date()
    if (typeof window === "undefined") {
      return createInitialState(now)
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        return createInitialState(now)
      }
      const parsed = JSON.parse(stored) as Partial<HasanatProgressState>
      return ensureDailyFreshness(normaliseState(parsed, now), now)
    } catch (error) {
      console.warn("Failed to restore hasanat tracker state", error)
      return createInitialState(now)
    }
  })

  const [ramadanState, setRamadanState] = useState<RamadanState>({ isRamadan: false, multiplier: 1 })
  const [sparkles, setSparkles] = useState<SparkleEvent[]>([])
  const [celebration, setCelebration] = useState<HasanatCelebrationPayload | null>(null)
  const [announcement, setAnnouncement] = useState<string>("")

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.warn("Unable to persist hasanat tracker state", error)
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }

    syncTimeoutRef.current = setTimeout(() => {
      if (typeof window === "undefined" || !("fetch" in window)) {
        return
      }
      if (!navigator.onLine) {
        return
      }
      void fetch("/api/user/hasanat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: state }),
      }).catch((error) => {
        console.warn("Failed to sync hasanat progress", error)
      })
    }, 800)

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [state])

  useEffect(() => {
    let aborted = false
    async function loadRamadanStatus() {
      try {
        const response = await fetch("/api/ramadan-status")
        if (!response.ok) return
        const payload = (await response.json()) as RamadanState
        if (!aborted && payload) {
          setRamadanState({
            isRamadan: Boolean(payload.isRamadan),
            multiplier: payload.multiplier && Number.isFinite(payload.multiplier) ? payload.multiplier : 1,
            source: payload.source,
            message: payload.message,
          })
        }
      } catch (error) {
        console.warn("Failed to load Ramadan status", error)
      }
    }
    void loadRamadanStatus()
    return () => {
      aborted = true
    }
  }, [])

  const recordRecitation = useCallback(
    ({ surahNumber, surahName, verses, shouldCount, completedGoal, isSurahCompletion, completedJuzIds }: RecordRecitationPayload): RecordRecitationResult | null => {
      if (!shouldCount || verses.length === 0) {
        setAnnouncement("Recite with the Arabic script to witness each letter.")
        return null
      }

      let totalLetters = 0
      const contributions: { verseKey: string; letters: number; juz?: number }[] = []

      for (const verse of verses) {
        let cached = letterCacheRef.current.get(verse.verseKey)
        if (cached === undefined) {
          cached = countArabicLetters(verse.text)
          letterCacheRef.current.set(verse.verseKey, cached)
        }

        if (cached > 0) {
          totalLetters += cached
          contributions.push({ verseKey: verse.verseKey, letters: cached, juz: verse.juz })
        }
      }

      if (totalLetters === 0) {
        setAnnouncement("No Arabic letters detected. Breathe and recite from the mushaf view.")
        return null
      }

      const baseHasanat = hasanatFromLetters(totalLetters)
      const multiplier = ramadanState.isRamadan ? ramadanState.multiplier || 1 : 1
      const earned = baseHasanat * multiplier
      const now = new Date()

      let celebrationToTrigger: HasanatCelebrationPayload | null = null

      setState((previous) => {
        const refreshed = ensureDailyFreshness(previous, now)
        const updatedHistory: HasanatHistoryEntry[] = [
          ...refreshed.history,
          ...contributions.map((entry) => ({
            id: `${entry.verseKey}-${now.getTime()}`,
            verseKey: entry.verseKey,
            letters: entry.letters,
            hasanat: entry.letters * 10 * multiplier,
            multiplier,
            recordedAt: now.toISOString(),
          })),
        ].slice(-50)

        const previousHundreds = Math.floor(refreshed.totalHasanat / 100)
        const nextTotal = refreshed.totalHasanat + earned
        const nextDaily = refreshed.dailyHasanat + earned
        const nextSession = refreshed.sessionHasanat + earned
        const newHundreds = Math.floor(nextTotal / 100)

        let milestones = refreshed.milestones

        if (newHundreds > previousHundreds) {
          milestones = {
            ...milestones,
            hundredSteps: Array.from(new Set([...milestones.hundredSteps, newHundreds * 100])).sort((a, b) => a - b),
          }
        }

        if (isSurahCompletion) {
          const surahKey = `${surahNumber}`
          if (!milestones.surahsCompleted.includes(surahKey)) {
            milestones = {
              ...milestones,
              surahsCompleted: [...milestones.surahsCompleted, surahKey],
            }
          }
          celebrationToTrigger = {
            id: `surah-${surahNumber}-${now.getTime()}`,
            type: "surah",
            title: "Surah completed",
            message: `${surahName ?? "A surah"} completed. May its light fill your heart.`,
            verse:
              "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
            emphasis: "Carry its meaning with you into your day.",
          }
        }

        if (completedGoal) {
          const goalKey = refreshed.today
          if (!milestones.goalsMet.includes(goalKey)) {
            milestones = {
              ...milestones,
              goalsMet: [...milestones.goalsMet, goalKey],
            }
          }
        }

        if (ramadanState.isRamadan && multiplier > 1) {
          const ramadanKey = `${refreshed.today}-${now.getUTCHours()}`
          if (!milestones.ramadanMoments.includes(ramadanKey)) {
            milestones = {
              ...milestones,
              ramadanMoments: [...milestones.ramadanMoments, ramadanKey],
            }
          }
        }

        if (completedJuzIds && completedJuzIds.length > 0) {
          const newJuz = completedJuzIds.filter((id) => !milestones.juzCompleted.includes(id.toString()))
          if (newJuz.length > 0) {
            milestones = {
              ...milestones,
              juzCompleted: [...milestones.juzCompleted, ...newJuz.map((id) => id.toString())],
            }
          }
        }

        return {
          ...refreshed,
          totalHasanat: nextTotal,
          dailyHasanat: nextDaily,
          sessionHasanat: nextSession,
          milestones,
          history: updatedHistory,
        }
      })

      setSparkles((previous) => [
        ...previous,
        {
          id: `sparkle-${Date.now()}`,
          amount: earned,
          multiplier,
          createdAt: Date.now(),
          emphasis: ramadanState.isRamadan && multiplier > 1 ? "Ramadan Reward" : undefined,
        },
      ])

      setAnnouncement(
        multiplier > 1
          ? `+${earned.toLocaleString()} Hasanat (Ramadan reward)`
          : `+${earned.toLocaleString()} hasanat earned.`,
      )

      if (celebrationToTrigger) {
        setCelebration(celebrationToTrigger)
      }

      return { earned, base: baseHasanat, multiplier, letters: totalLetters }
    },
    [ramadanState.isRamadan, ramadanState.multiplier],
  )

  const removeSparkle = useCallback((id: string) => {
    setSparkles((previous) => previous.filter((event) => event.id !== id))
  }, [])

  const dismissCelebration = useCallback(() => {
    setCelebration(null)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const detail: HasanatProgressDetail = {
      total: state.totalHasanat,
      daily: state.dailyHasanat,
      session: state.sessionHasanat,
    }
    window.dispatchEvent(new CustomEvent<HasanatProgressDetail>(HASANAT_PROGRESS_EVENT, { detail }))
  }, [state.dailyHasanat, state.sessionHasanat, state.totalHasanat])

  const preparedState = useMemo(() => state, [state])

  return {
    state: preparedState,
    recordRecitation,
    sparkles,
    removeSparkle,
    celebration,
    dismissCelebration,
    announcement,
    ramadanState,
  }
}

