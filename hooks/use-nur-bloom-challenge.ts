"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { useUser } from "@/hooks/use-user"

export type NurBloomTheme = "blossom" | "lantern" | "child"

interface StoredNurBloomPreferences {
  enabled?: boolean
  completedChallenges?: number
  challengeSessions?: number
  totalVersesCompleted?: number
  theme?: NurBloomTheme
  gentleMode?: boolean
  soundEnabled?: boolean
  promptDismissed?: boolean
  lastReflectionPromptAt?: string | null
}

export interface NurBloomCelebrationState {
  active: boolean
  message: string
  encouragement: string
}

export interface NurBloomState {
  currentStreak: number
  targetVerses: number
  completedChallenges: number
  percentage: number
  encouragement: string | null
  celebration: NurBloomCelebrationState | null
  theme: NurBloomTheme
  gentleMode: boolean
  soundEnabled: boolean
  enabled: boolean
  baseTarget: number
  promptDismissed: boolean
  weeklyReflectionDue: boolean
  locale: string
  lowPerformanceMode: boolean
}

export interface VerseProgressOptions {
  source: "next" | "dwell"
  verseKey: string
}

interface NurBloomActions {
  enable: () => void
  disable: () => void
  dismissPrompt: () => void
  setTheme: (theme: NurBloomTheme) => void
  toggleGentleMode: (value?: boolean) => void
  toggleSound: (value?: boolean) => void
  recordVerseProgress: (options: VerseProgressOptions) => void
  scheduleVerseObservation: (verseKey: string) => () => void
  resetStreak: () => void
  acknowledgeCelebration: () => void
  markReflectionPromptSeen: () => void
}

export interface NurBloomHook {
  state: NurBloomState
  actions: NurBloomActions
}

const STORAGE_KEY = "nur-bloom-preferences"
const DWELL_THRESHOLD_MS = 8000
const MIN_TARGET = 6
const MAX_TARGET = 20
const INCREMENT_STEP = 2

const ENCOURAGEMENTS: Record<string, string[]> = {
  en: [
    "Indeed, the patient will be given their reward without account. (39:10)",
    "And We have certainly made the Quran easy for remembrance. (54:17)",
    "Every verse is a seed of light—keep planting, keep blooming.",
  ],
  ar: [
    "إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُمْ بِغَيْرِ حِسَابٍ (الزمر: 10)",
    "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ (القمر: 17)",
    "كل آية بذرة نور، واصل الزراعة وراقب الازدهار.",
  ],
  id: [
    "Sungguh, orang yang sabar akan diberi pahala tanpa batas. (39:10)",
    "Dan sungguh, Kami mudahkan Al-Qur'an untuk diingat. (54:17)",
    "Setiap ayat adalah benih cahaya—teruslah menanam, teruslah mekar.",
  ],
  ur: [
    "بیشک صبر کرنے والوں کو ان کا اجر بے حساب دیا جائے گا۔ (39:10)",
    "اور بے شک ہم نے قرآن کو یاد کرنے کے لئے آسان بنا دیا ہے۔ (54:17)",
    "ہر آیت نور کا بیج ہے—پڑھتے رہیں، کھِلتے رہیں۔",
  ],
}

const DEFAULT_ENCOURAGEMENT_LOCALE = "en"

function clampTarget(value: number) {
  return Math.max(MIN_TARGET, Math.min(MAX_TARGET, Math.round(value)))
}

function safeParsePreferences(): StoredNurBloomPreferences {
  if (typeof window === "undefined") {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {}
    }

    return JSON.parse(raw) as StoredNurBloomPreferences
  } catch (error) {
    console.warn("Unable to parse Nur Bloom preferences", error)
    return {}
  }
}

function persistPreferences(prefs: StoredNurBloomPreferences) {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch (error) {
    console.warn("Unable to persist Nur Bloom preferences", error)
  }
}

function pickEncouragement(locale: string): string {
  const messages = ENCOURAGEMENTS[locale] ?? ENCOURAGEMENTS[DEFAULT_ENCOURAGEMENT_LOCALE]
  if (!messages || messages.length === 0) {
    return ""
  }

  const index = Math.floor(Math.random() * messages.length)
  return messages[index]
}

function computeBaseTarget(totalVerses: number, sessions: number): number {
  if (sessions <= 0 || totalVerses <= 0) {
    return clampTarget(8)
  }

  const average = totalVerses / sessions
  const softened = average * 0.75
  return clampTarget(softened)
}

export function useNurBloomChallenge(): NurBloomHook {
  const { profile } = useUser()
  const locale = profile?.locale ?? "en"

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") {
      return false
    }

    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  }, [])

  const deviceMemory = useMemo(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return 4
    }

    // @ts-expect-error deviceMemory is not in TS DOM types yet for all targets
    return typeof navigator.deviceMemory === "number" ? navigator.deviceMemory : 4
  }, [])

  const lowPerformanceMode = deviceMemory && deviceMemory < 2

  const stored = safeParsePreferences()

  const [preferences, setPreferences] = useState<StoredNurBloomPreferences>({
    enabled: stored.enabled ?? false,
    completedChallenges: stored.completedChallenges ?? 0,
    challengeSessions: stored.challengeSessions ?? 0,
    totalVersesCompleted: stored.totalVersesCompleted ?? 0,
    theme: stored.theme ?? "blossom",
    gentleMode: stored.gentleMode ?? prefersReducedMotion,
    soundEnabled: stored.soundEnabled ?? false,
    promptDismissed: stored.promptDismissed ?? false,
    lastReflectionPromptAt: stored.lastReflectionPromptAt ?? null,
  })

  const baseTarget = useMemo(() => {
    return computeBaseTarget(
      preferences.totalVersesCompleted ?? 0,
      preferences.challengeSessions ?? 0,
    )
  }, [preferences.challengeSessions, preferences.totalVersesCompleted])

  const targetVerses = useMemo(() => {
    return clampTarget(baseTarget + (preferences.completedChallenges ?? 0) * INCREMENT_STEP)
  }, [baseTarget, preferences.completedChallenges])

  const [currentStreak, setCurrentStreak] = useState(0)
  const [lastVerseKey, setLastVerseKey] = useState<string | null>(null)
  const [celebration, setCelebration] = useState<NurBloomCelebrationState | null>(null)
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const verseRecordedRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    persistPreferences(preferences)
  }, [preferences])

  const clearTimer = useCallback(() => {
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current)
      dwellTimerRef.current = null
    }
  }, [])

  const resetStreak = useCallback(() => {
    setCurrentStreak(0)
    verseRecordedRef.current = null
    setLastVerseKey(null)
    clearTimer()
  }, [clearTimer])

  const updatePreferences = useCallback(
    (patch: Partial<StoredNurBloomPreferences>) => {
      setPreferences((prev) => ({
        ...prev,
        ...patch,
      }))
    },
    [],
  )

  const enable = useCallback(() => {
    updatePreferences({ enabled: true, promptDismissed: true })
  }, [updatePreferences])

  const disable = useCallback(() => {
    updatePreferences({ enabled: false })
    resetStreak()
  }, [resetStreak, updatePreferences])

  const dismissPrompt = useCallback(() => {
    updatePreferences({ promptDismissed: true })
  }, [updatePreferences])

  const setTheme = useCallback(
    (theme: NurBloomTheme) => {
      updatePreferences({ theme })
    },
    [updatePreferences],
  )

  const toggleGentleMode = useCallback(
    (value?: boolean) => {
      const nextValue = value ?? !preferences.gentleMode
      updatePreferences({ gentleMode: nextValue })
    },
    [preferences.gentleMode, updatePreferences],
  )

  const toggleSound = useCallback(
    (value?: boolean) => {
      const nextValue = value ?? !preferences.soundEnabled
      updatePreferences({ soundEnabled: nextValue })
    },
    [preferences.soundEnabled, updatePreferences],
  )

  const acknowledgeCelebration = useCallback(() => {
    setCelebration(null)
  }, [])

  const markReflectionPromptSeen = useCallback(() => {
    updatePreferences({ lastReflectionPromptAt: new Date().toISOString() })
  }, [updatePreferences])

  const completeChallenge = useCallback(
    (finalCount: number) => {
      const nextCompleted = (preferences.completedChallenges ?? 0) + 1
      const nextSessions = (preferences.challengeSessions ?? 0) + 1
      const nextTotal = (preferences.totalVersesCompleted ?? 0) + finalCount

      updatePreferences({
        completedChallenges: nextCompleted,
        challengeSessions: nextSessions,
        totalVersesCompleted: nextTotal,
      })

      setCelebration({
        active: true,
        message:
          locale === "ar"
            ? "ما شاء الله! نورك يزداد تألقًا."
            : locale === "id"
              ? "MasyaAllah! Cahaya tilawahmu semakin terang."
              : locale === "ur"
                ? "ماشاءاللہ! آپ کی تلاوت کی روشنی مزید نکھر رہی ہے۔"
                : "MashaAllah! Your recitation light is blooming brightly.",
        encouragement: pickEncouragement(locale),
      })

      setCurrentStreak(0)
      verseRecordedRef.current = null
      setLastVerseKey(null)
    },
    [locale, preferences.completedChallenges, preferences.challengeSessions, preferences.totalVersesCompleted, updatePreferences],
  )

  const recordVerseProgress = useCallback(
    ({ verseKey }: VerseProgressOptions) => {
      if (!preferences.enabled) {
        return
      }

      if (!verseKey || verseRecordedRef.current === verseKey) {
        return
      }

      clearTimer()
      verseRecordedRef.current = verseKey

      const [surahStr, ayahStr] = verseKey.split(":")
      const prevKey = lastVerseKey
      setLastVerseKey(verseKey)

      const surah = Number.parseInt(surahStr, 10)
      const ayah = Number.parseInt(ayahStr, 10)

      let newStreak = currentStreak + 1

      if (prevKey) {
        const [prevSurahStr, prevAyahStr] = prevKey.split(":")
        const prevSurah = Number.parseInt(prevSurahStr, 10)
        const prevAyah = Number.parseInt(prevAyahStr, 10)

        const sequential = prevSurah === surah && ayah === prevAyah + 1
        if (!sequential) {
          newStreak = 1
        }
      }

      setCurrentStreak(newStreak)

      if (newStreak >= targetVerses) {
        completeChallenge(targetVerses)
      }
    },
    [clearTimer, completeChallenge, currentStreak, lastVerseKey, preferences.enabled, targetVerses],
  )

  const scheduleVerseObservation = useCallback(
    (verseKey: string) => {
      if (!preferences.enabled) {
        return () => {}
      }

      clearTimer()

      dwellTimerRef.current = setTimeout(() => {
        recordVerseProgress({ verseKey, source: "dwell" })
      }, DWELL_THRESHOLD_MS)

      return () => {
        if (dwellTimerRef.current) {
          clearTimeout(dwellTimerRef.current)
          dwellTimerRef.current = null
        }
      }
    },
    [clearTimer, preferences.enabled, recordVerseProgress],
  )

  useEffect(() => {
    if (!preferences.enabled) {
      resetStreak()
    }
  }, [preferences.enabled, resetStreak])

  const streakPercentage = targetVerses <= 0 ? 0 : Math.min(currentStreak / targetVerses, 1)

  const weeklyReflectionDue = useMemo(() => {
    if (!preferences.enabled) {
      return false
    }

    if (!preferences.lastReflectionPromptAt) {
      return true
    }

    const lastPrompt = new Date(preferences.lastReflectionPromptAt)
    const now = new Date()

    const diff = now.getTime() - lastPrompt.getTime()
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    return diff >= sevenDays
  }, [preferences.enabled, preferences.lastReflectionPromptAt])

  const state: NurBloomState = {
    currentStreak,
    targetVerses,
    completedChallenges: preferences.completedChallenges ?? 0,
    percentage: streakPercentage,
    encouragement: celebration?.encouragement ?? null,
    celebration,
    theme: preferences.theme ?? "blossom",
    gentleMode: preferences.gentleMode ?? false,
    soundEnabled: preferences.soundEnabled ?? false,
    enabled: preferences.enabled ?? false,
    baseTarget,
    promptDismissed: preferences.promptDismissed ?? false,
    weeklyReflectionDue,
    locale,
    lowPerformanceMode,
  }

  return {
    state,
    actions: {
      enable,
      disable,
      dismissPrompt,
      setTheme,
      toggleGentleMode,
      toggleSound,
      recordVerseProgress,
      scheduleVerseObservation,
      resetStreak,
      acknowledgeCelebration,
      markReflectionPromptSeen,
    },
  }
}
