"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  CheckCircle2,
  Heart,
  Hourglass,
  Loader2,
  Mic,
  PlusCircle,
  Radio,
  Repeat2,
  Settings2,
  Share2,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

interface SurahSummary {
  number: number
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
}

interface VerseDetail {
  numberInSurah: number
  arabicText: string
  translation: string
}

interface MemorizationPlan {
  id: string
  surahNumber: number
  surahName: string
  startAyah: number
  endAyah: number
  totalVerses: number
  completed: boolean
}

type ConfirmationMode = "voice" | "heart" | "gesture" | "writing"

interface PlanProgressState {
  levelIndex: number
  repeatCount: number
  completed: boolean
  mode: ConfirmationMode
  targetRepetitions: number
  failureCount: number
  pausedUntil?: string | null
}

interface MemorizationPreferences {
  defaultMode: ConfirmationMode | null
  graceEnabled: boolean
  childMode: boolean
  elderMode: boolean
  publicMode: boolean
  lastSelectedPlanId?: string | null
}

const DEFAULT_TARGET = 20
const CHILD_TARGET = 12
const ELDER_TARGET = 15
const GRACE_TARGET = 15
const HEART_HOLD_DURATION = 4000
const GESTURE_REQUIRED_TAPS = 3
const GESTURE_WINDOW_MS = 6000
const WRITING_REQUIRED_WORDS = 3
const VOICE_TIMEOUT_MS = 8000
const VOICE_MIN_DURATION_MS = 1500
const VOICE_THRESHOLD = 0.02

const formatOrdinal = (value: number) => {
  const remainderTen = value % 10
  const remainderHundred = value % 100

  if (remainderTen === 1 && remainderHundred !== 11) return `${value}st`
  if (remainderTen === 2 && remainderHundred !== 12) return `${value}nd`
  if (remainderTen === 3 && remainderHundred !== 13) return `${value}rd`
  return `${value}th`
}

const LOCAL_STORAGE_KEYS = {
  plans: "memorization-plans",
  progress: "memorization-progress",
  preferences: "memorization-preferences",
} as const

const voiceUnavailableMessage =
  "Microphone access is blocked. Switch to Heart, Gesture, or Writing mode to keep your hifz journey moving."

const affirmationMessages = [
  "Allah hears the effort in every breath.",
  "Your intention is brighter than any counter.",
  "Every repetition is a seed in Jannah.",
  "Take your time—presence over perfection.",
]

const pickRandomAffirmation = () =>
  affirmationMessages[Math.floor(Math.random() * affirmationMessages.length)]

export default function MemorizationPage() {
  const [surahs, setSurahs] = useState<SurahSummary[]>([])
  const [surahLoading, setSurahLoading] = useState(false)
  const [surahError, setSurahError] = useState<string | null>(null)

  const [plans, setPlans] = useState<MemorizationPlan[]>([])
  const [planProgress, setPlanProgress] = useState<Record<string, PlanProgressState>>({})
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<MemorizationPreferences>({
    defaultMode: null,
    graceEnabled: true,
    childMode: false,
    elderMode: false,
    publicMode: false,
    lastSelectedPlanId: null,
  })

  const baseTarget = useMemo(() => {
    if (preferences.childMode) return CHILD_TARGET
    if (preferences.elderMode) return ELDER_TARGET
    return DEFAULT_TARGET
  }, [preferences.childMode, preferences.elderMode])

  const fallbackMode = useMemo(
    () => preferences.defaultMode ?? (preferences.publicMode ? "heart" : "voice"),
    [preferences.defaultMode, preferences.publicMode],
  )

  const [verses, setVerses] = useState<VerseDetail[]>([])
  const [verseLoading, setVerseLoading] = useState(false)
  const [verseError, setVerseError] = useState<string | null>(null)

  const [repeatCount, setRepeatCount] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [sessionActive, setSessionActive] = useState(false)
  const [showModeDialog, setShowModeDialog] = useState(false)
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [pauseDuration, setPauseDuration] = useState(1)
  const [showGracePrompt, setShowGracePrompt] = useState(false)
  const [encouragement, setEncouragement] = useState<string | null>(null)
  const [lastAttemptFailed, setLastAttemptFailed] = useState(false)
  const [micStatus, setMicStatus] = useState<"idle" | "requesting" | "active" | "blocked" | "error">("idle")
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isUltraLowPower, setIsUltraLowPower] = useState(false)
  const [timeStarted, setTimeStarted] = useState<number | null>(null)
  const [sessionDurationLimitReached, setSessionDurationLimitReached] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const [lastTapTimestamp, setLastTapTimestamp] = useState<number | null>(null)
  const [writingInput, setWritingInput] = useState("")
  const [holdingHeart, setHoldingHeart] = useState(false)
  const [levelCelebrationMessage, setLevelCelebrationMessage] = useState<string | null>(null)
  const heartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const sessionStartRef = useRef<number | null>(null)
  const failureCountRef = useRef(0)
  const listeningStartRef = useRef<number | null>(null)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false)
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<string>("")
  const [startAyah, setStartAyah] = useState("")
  const [endAyah, setEndAyah] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setSurahLoading(true)
        const response = await fetch("https://api.alquran.cloud/v1/surah")
        const payload = await response.json()

        if (!response.ok || payload.code !== 200) {
          throw new Error("Unable to load surah list. Please try again later.")
        }

        const surahData: SurahSummary[] = payload.data.map((surah: any) => ({
          number: surah.number,
          englishName: surah.englishName,
          englishNameTranslation: surah.englishNameTranslation,
          numberOfAyahs: surah.numberOfAyahs,
        }))

        setSurahs(surahData)
        setSurahError(null)
      } catch (error) {
        console.error(error)
        setSurahError("Failed to fetch the list of surahs. Please refresh the page.")
      } finally {
        setSurahLoading(false)
      }
    }

    fetchSurahs()
  }, [])

  useEffect(() => {
    if (typeof navigator === "undefined") return
    const memory = (navigator as any).deviceMemory
    if (memory && Number(memory) <= 2) {
      setIsUltraLowPower(true)
    }

    const setLowPowerFromBattery = (level: number) => {
      if (level <= 0.2) {
        setIsUltraLowPower(true)
      }
    }

    let batteryCleanup: (() => void) | null = null

    if ((navigator as any).getBattery) {
      ;(navigator as any)
        .getBattery()
        .then((battery: any) => {
          setLowPowerFromBattery(battery.level)
          const listener = () => setLowPowerFromBattery(battery.level)
          battery.addEventListener("levelchange", listener)
          batteryCleanup = () => battery.removeEventListener("levelchange", listener)
        })
        .catch(() => {
          /* ignore */
        })
    }

    return () => {
      if (batteryCleanup) {
        batteryCleanup()
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const storedPlans = window.localStorage.getItem(LOCAL_STORAGE_KEYS.plans)
      if (storedPlans) {
        const parsedPlans: MemorizationPlan[] = JSON.parse(storedPlans)
        setPlans(parsedPlans)
      }

      const storedProgress = window.localStorage.getItem(LOCAL_STORAGE_KEYS.progress)
      if (storedProgress) {
        const parsedProgress: Record<string, PlanProgressState> = JSON.parse(storedProgress)
        setPlanProgress(parsedProgress)
      }

      const storedPreferences = window.localStorage.getItem(LOCAL_STORAGE_KEYS.preferences)
      if (storedPreferences) {
        const parsedPreferences: MemorizationPreferences = JSON.parse(storedPreferences)
        setPreferences((previous) => ({ ...previous, ...parsedPreferences }))
        if (parsedPreferences.lastSelectedPlanId) {
          setSelectedPlanId(parsedPreferences.lastSelectedPlanId)
        }
      }
    } catch (error) {
      console.error("Unable to restore memorization state", error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(LOCAL_STORAGE_KEYS.plans, JSON.stringify(plans))
  }, [plans])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(LOCAL_STORAGE_KEYS.progress, JSON.stringify(planProgress))
  }, [planProgress])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(LOCAL_STORAGE_KEYS.preferences, JSON.stringify(preferences))
  }, [preferences])

  useEffect(() => {
    const loadPlanVerses = async () => {
      if (!selectedPlanId) {
        setVerses([])
        setVerseError(null)
        return
      }

      const activePlan = plans.find((plan) => plan.id === selectedPlanId)
      if (!activePlan) {
        return
      }

      try {
        setVerseLoading(true)
        setVerseError(null)

        const response = await fetch(
          `https://api.alquran.cloud/v1/surah/${activePlan.surahNumber}/editions/quran-uthmani,en.asad`,
        )
        const payload = await response.json()

        if (!response.ok || payload.code !== 200 || !Array.isArray(payload.data)) {
          throw new Error("Unable to load verses for this plan. Please try again.")
        }

        const arabicEdition = payload.data[0]
        const translationEdition = payload.data[1]

        const startIndex = activePlan.startAyah - 1
        const endIndex = activePlan.endAyah - 1

        const selectedAyahs: VerseDetail[] = arabicEdition.ayahs
          .slice(startIndex, endIndex + 1)
          .map((ayah: any, index: number) => ({
            numberInSurah: ayah.numberInSurah,
            arabicText: ayah.text,
            translation: translationEdition?.ayahs?.[startIndex + index]?.text ?? "",
          }))

        setVerses(selectedAyahs)

        const progressState = planProgress[activePlan.id] ?? {
          levelIndex: 0,
          repeatCount: 0,
          completed: false,
          mode: fallbackMode,
          targetRepetitions: baseTarget,
          failureCount: 0,
        }

        setRepeatCount(progressState.repeatCount ?? 0)
      } catch (error) {
        console.error(error)
        setVerseError("We could not fetch the verses. Please check your connection and retry.")
      } finally {
        setVerseLoading(false)
      }
    }

    loadPlanVerses()
  }, [selectedPlanId, plans, planProgress, baseTarget, fallbackMode])

  const activePlan = useMemo(() => plans.find((plan) => plan.id === selectedPlanId) ?? null, [plans, selectedPlanId])

  const handleCreatePlan = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedSurahNumber) {
      setFormError("Please choose a surah to memorize.")
      return
    }

    const surah = surahs.find((item) => item.number === Number(selectedSurahNumber))
    if (!surah) {
      setFormError("The selected surah was not found.")
      return
    }

    const start = Number(startAyah)
    const end = Number(endAyah)

    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      setFormError("Please enter a valid start and end ayah number.")
      return
    }

    if (start < 1 || end < 1 || start > surah.numberOfAyahs || end > surah.numberOfAyahs) {
      setFormError(`Please choose ayah numbers between 1 and ${surah.numberOfAyahs}.`)
      return
    }

    if (start > end) {
      setFormError("The start ayah must come before the end ayah.")
      return
    }

    const newPlan: MemorizationPlan = {
      id: `plan-${Date.now()}`,
      surahNumber: surah.number,
      surahName: surah.englishName,
      startAyah: start,
      endAyah: end,
      totalVerses: end - start + 1,
      completed: false,
    }

    setPlans((previous) => [...previous, newPlan])
    setPlanProgress((previous) => ({
      ...previous,
      [newPlan.id]: {
        levelIndex: 0,
        repeatCount: 0,
        completed: false,
        mode: fallbackMode,
        targetRepetitions: baseTarget,
        failureCount: 0,
        pausedUntil: null,
      },
    }))

    setSelectedPlanId(newPlan.id)
    setPreferences((previous) => ({ ...previous, lastSelectedPlanId: newPlan.id }))
    setStartAyah("")
    setEndAyah("")
    setSelectedSurahNumber("")
    setFormError(null)
    setIsCreateDialogOpen(false)
    setPlanDropdownOpen(true)
  }

  const updatePlanProgress = useCallback(
    (planId: string, updater: (previous: PlanProgressState) => PlanProgressState) => {
      setPlanProgress((previous) => {
        const existing = previous[planId] ?? {
          levelIndex: 0,
          repeatCount: 0,
          completed: false,
          mode: fallbackMode,
          targetRepetitions: baseTarget,
          failureCount: 0,
          pausedUntil: null,
        }
        return {
          ...previous,
          [planId]: updater(existing),
        }
      })
    },
    [baseTarget, fallbackMode],
  )

  const markPlanCompleted = useCallback(
    (planId: string) => {
      setPlans((previous) => previous.map((plan) => (plan.id === planId ? { ...plan, completed: true } : plan)))
      updatePlanProgress(planId, (existing) => ({
        ...existing,
        completed: true,
        repeatCount: existing.targetRepetitions,
      }))
      setRepeatCount((previous) => Math.max(previous, planProgress[planId]?.targetRepetitions ?? DEFAULT_TARGET))
      setShowCelebration(true)
    },
    [planProgress, updatePlanProgress],
  )

  const activePlanProgress = activePlan ? planProgress[activePlan.id] : undefined

  const activeLevelIndex = activePlanProgress?.levelIndex ?? 0
  const activeTarget = activePlanProgress?.targetRepetitions ?? baseTarget

  const levelDefinitions = useMemo(() => {
    if (!verses.length) return []
    const definitions: { label: string; verseCount: number; description: string }[] = []
    definitions.push({
      label: "Level 1 • Single verse presence",
      verseCount: 1,
      description: "Focus your tongue and heart on the very first ayah.",
    })
    if (verses.length > 1) {
      definitions.push({
        label: "Level 2 • Flowing between two ayat",
        verseCount: Math.min(2, verses.length),
        description: "Let the verses join in your memory, moving with calm intention.",
      })
    }
    if (verses.length > 2) {
      definitions.push({
        label: "Level 3 • Full passage devotion",
        verseCount: verses.length,
        description: "Hold the entire passage together, reciting with presence.",
      })
    } else {
      // Ensure we always end with a full passage level even for short selections
      definitions.push({
        label: "Level 3 • Full passage devotion",
        verseCount: verses.length,
        description: "Hold the entire passage together, reciting with presence.",
      })
    }
    return definitions
  }, [verses])

  const safeLevelIndex = Math.min(activeLevelIndex, Math.max(levelDefinitions.length - 1, 0))

  const activeLevelDefinition = levelDefinitions[safeLevelIndex]

  const versesForActiveLevel = useMemo(() => {
    if (!activeLevelDefinition) return []
    return verses.slice(0, activeLevelDefinition.verseCount)
  }, [verses, activeLevelDefinition])

  useEffect(() => {
    setRepeatCount(activePlanProgress?.repeatCount ?? 0)
  }, [activePlanProgress?.repeatCount])

  const totalLevels = levelDefinitions.length

  const globalProgressPercent = useMemo(() => {
    if (!activePlan || !totalLevels) return 0
    if (activePlan.completed || activePlanProgress?.completed) return 100
    const levelsCompleted = safeLevelIndex
    const levelProgress = Math.min(1, repeatCount / activeTarget)
    return Math.min(100, ((levelsCompleted + levelProgress) / totalLevels) * 100)
  }, [activePlan, totalLevels, activePlanProgress?.completed, safeLevelIndex, repeatCount, activeTarget])

  const handleRepetitionSuccess = useCallback(() => {
    if (!activePlan || !activeLevelDefinition) return
    failureCountRef.current = 0
    setLastAttemptFailed(false)
    setShowGracePrompt(false)

    const nextCount = Math.min(activeTarget, repeatCount + 1)
    const levelCompleted = nextCount >= activeTarget
    const completedLevelNumber = safeLevelIndex + 1

    setEncouragement(
      levelCompleted ? `You have completed the ${formatOrdinal(completedLevelNumber)} level!` : pickRandomAffirmation(),
    )
    setRepeatCount(nextCount)

    updatePlanProgress(activePlan.id, (existing) => ({
      ...existing,
      repeatCount: nextCount,
      failureCount: 0,
      mode: existing.mode ?? fallbackMode,
    }))

    if (levelCompleted) {
      if (safeLevelIndex >= totalLevels - 1 || levelDefinitions.length === 1) {
        setLevelCelebrationMessage(null)
        markPlanCompleted(activePlan.id)
      } else {
        setLevelCelebrationMessage(`You have completed the ${formatOrdinal(completedLevelNumber)} level!`)
        setRepeatCount(0)
        updatePlanProgress(activePlan.id, (existing) => ({
          ...existing,
          levelIndex: safeLevelIndex + 1,
          repeatCount: 0,
        }))
      }
    }
  }, [
    activePlan,
    activeLevelDefinition,
    activeTarget,
    fallbackMode,
    levelDefinitions.length,
    markPlanCompleted,
    repeatCount,
    safeLevelIndex,
    totalLevels,
    updatePlanProgress,
  ])

  const handleRepetitionFailure = useCallback(
    (options?: { dueToTimeout?: boolean; dueToPermission?: boolean }) => {
      if (!activePlan) return
      const nextFailureCount = failureCountRef.current + 1
      failureCountRef.current = nextFailureCount
      setLastAttemptFailed(true)
      setEncouragement("Please Recite (Again)")
      updatePlanProgress(activePlan.id, (existing) => ({
        ...existing,
        failureCount: nextFailureCount,
      }))

      if (options?.dueToPermission) {
        setVoiceError(voiceUnavailableMessage)
        setMicStatus("blocked")
      }

      if (preferences.graceEnabled && nextFailureCount >= 3 && activeTarget > GRACE_TARGET) {
        setShowGracePrompt(true)
      }
    },
    [activePlan, activeTarget, preferences.graceEnabled, updatePlanProgress],
  )

  const acceptGraceReduction = useCallback(() => {
    if (!activePlan) return
    setShowGracePrompt(false)
    setEncouragement("You chose mercy. Focus on heartfelt quality over quantity.")
    updatePlanProgress(activePlan.id, (existing) => ({
      ...existing,
      targetRepetitions: GRACE_TARGET,
      repeatCount: Math.min(existing.repeatCount, GRACE_TARGET),
    }))
    setRepeatCount((previous) => Math.min(previous, GRACE_TARGET))
  }, [activePlan, updatePlanProgress])

  const declineGraceReduction = useCallback(() => {
    setShowGracePrompt(false)
    setEncouragement("Take a breath and continue when ready.")
  }, [])

  const isPlanPaused = useMemo(() => {
    if (!activePlanProgress?.pausedUntil) return false
    const pausedUntilDate = new Date(activePlanProgress.pausedUntil)
    return pausedUntilDate.getTime() > Date.now()
  }, [activePlanProgress?.pausedUntil])

  useEffect(() => {
    if (!activePlan || !activePlanProgress?.pausedUntil) return
    const pausedUntilDate = new Date(activePlanProgress.pausedUntil)
    if (pausedUntilDate.getTime() <= Date.now()) {
      updatePlanProgress(activePlan.id, (existing) => ({ ...existing, pausedUntil: null }))
    }
  }, [activePlan, activePlanProgress?.pausedUntil, updatePlanProgress])

  const handlePauseSession = useCallback(() => {
    if (!activePlan) return
    const now = new Date()
    const pauseEnd = new Date(now.getTime() + pauseDuration * 24 * 60 * 60 * 1000)
    updatePlanProgress(activePlan.id, (existing) => ({
      ...existing,
      pausedUntil: pauseEnd.toISOString(),
    }))
    setSessionActive(false)
    setShowPauseDialog(false)
    setEncouragement("Your heartful pause is honoured. Return when you feel ready.")
  }, [activePlan, pauseDuration, updatePlanProgress])

  const resumePausedPlan = useCallback(() => {
    if (!activePlan) return
    updatePlanProgress(activePlan.id, (existing) => ({
      ...existing,
      pausedUntil: null,
    }))
    setEncouragement("Welcome back. Continue gently.")
  }, [activePlan, updatePlanProgress])

  const performVoiceAttempt = useCallback(async (): Promise<boolean | null> => {
    if (!activePlan || !activeLevelDefinition) return null
    if (isUltraLowPower || preferences.publicMode) {
      setMicStatus("idle")
      setVoiceError("Voice mode is relaxed due to your current settings.")
      return null
    }
    if (typeof window === "undefined" || typeof navigator === "undefined" || !navigator.mediaDevices) {
      setVoiceError("Voice detection is not supported in this browser.")
      return null
    }

    try {
      setMicStatus("requesting")
      setVoiceError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicStatus("active")
      setIsListening(true)
      listeningStartRef.current = performance.now()

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioCtx()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)

      const data = new Float32Array(analyser.fftSize)
      let speakingDuration = 0
      let rafId: number
      const attemptStart = performance.now()

      const stopAll = () => {
        cancelAnimationFrame(rafId)
        source.disconnect()
        analyser.disconnect()
        audioContext.close().catch(() => undefined)
        stream.getTracks().forEach((track) => track.stop())
        setIsListening(false)
        setMicStatus("idle")
      }

      return await new Promise<boolean>((resolve) => {
        const check = () => {
          analyser.getFloatTimeDomainData(data)
          let sumSquares = 0
          for (let i = 0; i < data.length; i++) {
            const value = data[i]
            sumSquares += value * value
          }
          const rms = Math.sqrt(sumSquares / data.length)

          if (rms > VOICE_THRESHOLD) {
            speakingDuration += 16
            if (speakingDuration >= VOICE_MIN_DURATION_MS) {
              stopAll()
              resolve(true)
              return
            }
          }

          if (performance.now() - attemptStart >= VOICE_TIMEOUT_MS) {
            stopAll()
            resolve(false)
            return
          }

          rafId = requestAnimationFrame(check)
        }

        rafId = requestAnimationFrame(check)
      })
    } catch (error) {
      console.error("Voice attempt failed", error)
      setMicStatus("blocked")
      setVoiceError(voiceUnavailableMessage)
      handleRepetitionFailure({ dueToPermission: true })
      return false
    }
  }, [
    activeLevelDefinition,
    activePlan,
    handleRepetitionFailure,
    isUltraLowPower,
    preferences.publicMode,
  ])

  const handleHeartHoldStart = useCallback(() => {
    if (!activePlan || !sessionActive) return
    setHoldingHeart(true)
    if (heartTimeoutRef.current) {
      clearTimeout(heartTimeoutRef.current)
    }
    heartTimeoutRef.current = setTimeout(() => {
      setHoldingHeart(false)
      handleRepetitionSuccess()
    }, HEART_HOLD_DURATION)
  }, [activePlan, handleRepetitionSuccess, sessionActive])

  const handleHeartHoldEnd = useCallback(() => {
    setHoldingHeart(false)
    if (heartTimeoutRef.current) {
      clearTimeout(heartTimeoutRef.current)
      heartTimeoutRef.current = null
    }
  }, [])

  const handleGestureTap = useCallback(() => {
    if (!activePlan || !sessionActive) return
    const now = Date.now()
    if (!lastTapTimestamp || now - lastTapTimestamp > GESTURE_WINDOW_MS) {
      setTapCount(1)
      setLastTapTimestamp(now)
    } else {
      const nextCount = tapCount + 1
      setTapCount(nextCount)
      setLastTapTimestamp(now)
      if (nextCount >= GESTURE_REQUIRED_TAPS) {
        setTapCount(0)
        setLastTapTimestamp(null)
        handleRepetitionSuccess()
        if (gestureTimeoutRef.current) {
          clearTimeout(gestureTimeoutRef.current)
          gestureTimeoutRef.current = null
        }
        return
      }
    }

    if (gestureTimeoutRef.current) {
      clearTimeout(gestureTimeoutRef.current)
    }
    gestureTimeoutRef.current = setTimeout(() => {
      setTapCount(0)
      setLastTapTimestamp(null)
    }, GESTURE_WINDOW_MS)
  }, [
    activePlan,
    gestureTimeoutRef,
    handleRepetitionSuccess,
    lastTapTimestamp,
    sessionActive,
    tapCount,
  ])

  const writingExpectedWords = useMemo(() => {
    const verse = versesForActiveLevel[0]
    if (!verse) return []
    const translationWords = verse.translation
      .replace(/[.,!?;:()\[\]{}]/g, "")
      .split(/\s+/)
      .filter(Boolean)
    return translationWords.slice(0, WRITING_REQUIRED_WORDS)
  }, [versesForActiveLevel])

  const handleWritingSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!activePlan || !sessionActive) return
      const normalizedInput = writingInput
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
      const expected = writingExpectedWords.map((word) => word.toLowerCase())

      const isMatch = expected.length
        ? expected.every((word, index) => normalizedInput[index] === word)
        : writingInput.trim().length >= 10

      if (isMatch) {
        setWritingInput("")
        handleRepetitionSuccess()
      } else {
        handleRepetitionFailure()
      }
    },
    [
      activePlan,
      handleRepetitionFailure,
      handleRepetitionSuccess,
      sessionActive,
      writingExpectedWords,
      writingInput,
    ],
  )

  useEffect(() => {
    return () => {
      if (heartTimeoutRef.current) {
        clearTimeout(heartTimeoutRef.current)
      }
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current)
      }
    }
  }, [])

  const activeMode: ConfirmationMode = useMemo(() => {
    const preferred = activePlanProgress?.mode ?? preferences.defaultMode ?? (preferences.publicMode ? "heart" : "voice")
    if (preferences.publicMode && preferred === "voice") {
      return "heart"
    }
    if (isUltraLowPower && preferred === "voice") {
      return "gesture"
    }
    return preferred
  }, [activePlanProgress?.mode, isUltraLowPower, preferences.defaultMode, preferences.publicMode])

  const micStatusDetails = useMemo(() => {
    switch (micStatus) {
      case "requesting":
        return { label: "Awaiting permission", tone: "text-amber-600", dot: "bg-amber-500" }
      case "active":
        return { label: isListening ? "Listening for your recitation" : "Microphone ready", tone: "text-emerald-600", dot: "bg-emerald-500" }
      case "blocked":
        return { label: "Microphone blocked", tone: "text-red-600", dot: "bg-red-500" }
      case "error":
        return { label: "Microphone error", tone: "text-red-600", dot: "bg-red-500" }
      default:
        return { label: "Microphone idle", tone: "text-slate-500", dot: "bg-slate-300" }
    }
  }, [isListening, micStatus])

  const modeDescriptions: Record<ConfirmationMode, { title: string; support: string }> = {
    voice: {
      title: "Voice presence",
      support: "Recite aloud and let the system sense your spoken effort.",
    },
    heart: {
      title: "Heart hold",
      support: "Hold the intention button and recite softly within.",
    },
    gesture: {
      title: "Gesture rhythm",
      support: "Tap in a steady rhythm to mirror your memorisation flow.",
    },
    writing: {
      title: "Writing reflection",
      support: "Type the opening words to show mindful engagement.",
    },
  }

  useEffect(() => {
    if (!activePlan) return
    if (!activePlanProgress?.mode && !preferences.defaultMode) {
      setShowModeDialog(true)
    }
  }, [activePlan, activePlanProgress?.mode, preferences.defaultMode])

  useEffect(() => {
    if (!activePlan || !activePlanProgress) return
    if (preferences.publicMode && activePlanProgress.mode === "voice") {
      updatePlanProgress(activePlan.id, (existing) => ({ ...existing, mode: "heart" }))
    }
    if (isUltraLowPower && activePlanProgress.mode === "voice") {
      updatePlanProgress(activePlan.id, (existing) => ({ ...existing, mode: "gesture" }))
    }
  }, [activePlan, activePlanProgress, isUltraLowPower, preferences.publicMode, updatePlanProgress])

  useEffect(() => {
    setSessionActive(false)
    setEncouragement(null)
    setLevelCelebrationMessage(null)
    setLastAttemptFailed(false)
  }, [activePlan?.id])

  const handleModeSelection = useCallback(
    (mode: ConfirmationMode) => {
      setPreferences((previous) => ({ ...previous, defaultMode: mode }))
      if (activePlan) {
        updatePlanProgress(activePlan.id, (existing) => ({ ...existing, mode }))
      }
      setShowModeDialog(false)
    },
    [activePlan, updatePlanProgress],
  )

  const handleVoiceRecitation = useCallback(async () => {
    if (!activePlan || isListening) return
    setSessionActive(true)
    const success = await performVoiceAttempt()
    if (success) {
      handleRepetitionSuccess()
    } else if (success === false) {
      handleRepetitionFailure({ dueToTimeout: true })
    }
  }, [activePlan, handleRepetitionFailure, handleRepetitionSuccess, isListening, performVoiceAttempt])

  const handleStartMemorization = useCallback(() => {
    if (!activePlan || versesForActiveLevel.length === 0) return
    if (isPlanPaused) {
      setEncouragement("This plan is resting. Resume when the pause concludes.")
      return
    }
    setLevelCelebrationMessage(null)
    setLastAttemptFailed(false)
    setVoiceError(null)
    setSessionActive(true)
    setEncouragement("Breathe, intend, and let your recitation begin.")

    if (activeMode !== "voice") {
      handleModeSelection("voice")
    }

    void handleVoiceRecitation()
  }, [
    activeMode,
    activePlan,
    handleModeSelection,
    handleVoiceRecitation,
    isPlanPaused,
    versesForActiveLevel.length,
  ])

  const handleManualCompletion = useCallback(() => {
    if (!activePlan) return
    markPlanCompleted(activePlan.id)
  }, [activePlan, markPlanCompleted])

  useEffect(() => {
    if (!activePlan) return
    const target = baseTarget
    updatePlanProgress(activePlan.id, (existing) => ({
      ...existing,
      targetRepetitions: target,
      repeatCount: Math.min(existing.repeatCount, target),
    }))
    setRepeatCount((previous) => Math.min(previous, target))
  }, [activePlan, baseTarget, updatePlanProgress])

  useEffect(() => {
    if (!sessionActive) {
      setSessionDurationLimitReached(false)
    }
  }, [sessionActive])

  const handleShareWithTeacher = useCallback(() => {
    if (!activePlan || typeof window === "undefined") return
    const windowRef = window.open("", "_blank")
    if (!windowRef) return

    const todaysDate = new Date().toLocaleDateString()
    const completedLevels = safeLevelIndex + (repeatCount >= activeTarget ? 1 : 0)
    const versesHtml = versesForActiveLevel
      .map(
        (verse) => `
        <div style="margin-bottom: 12px;">
          <div style="font-size:20px; font-weight:bold;">${verse.arabicText}</div>
          <div style="font-size:14px; color:#334155; margin-top:4px;">${verse.translation}</div>
        </div>
      `,
      )
      .join("")

    windowRef.document.write(`
      <html>
        <head>
          <title>Hifz Progress Share Sheet</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #0f172a; margin: 32px; }
            h1 { color: #047857; }
            .badge { display: inline-block; border-radius: 999px; background: #10b981; color: white; padding: 4px 12px; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Memorization Witness Sheet</h1>
          <p>Date: <strong>${todaysDate}</strong></p>
          <p>Plan: <strong>${activePlan.surahName} • Ayah ${activePlan.startAyah} – ${activePlan.endAyah}</strong></p>
          <p>Current level: <span class="badge">Level ${safeLevelIndex + 1} / ${totalLevels}</span></p>
          <p>Repetitions witnessed: <strong>${repeatCount} / ${activeTarget}</strong></p>
          <p>Total levels complete: <strong>${completedLevels} / ${totalLevels}</strong></p>
          <hr style="margin:24px 0;" />
          <h2>Verses Engaged</h2>
          ${versesHtml}
          <p style="margin-top:24px; font-size:14px; color:#475569;">Use your browser's print dialog to save this page as a PDF and share with your teacher.</p>
        </body>
      </html>
    `)
    windowRef.document.close()
    windowRef.focus()
  }, [
    activePlan,
    activeTarget,
    repeatCount,
    safeLevelIndex,
    totalLevels,
    versesForActiveLevel,
  ])

  useEffect(() => {
    if (!sessionActive) return
    if (!timeStarted) {
      const now = Date.now()
      setTimeStarted(now)
      sessionStartRef.current = now
    }
  }, [sessionActive, timeStarted])

  useEffect(() => {
    if (!timeStarted) return
    const interval = window.setInterval(() => {
      if (!timeStarted) return
      const elapsed = Date.now() - timeStarted
      if (elapsed >= 25 * 60 * 1000) {
        setSessionDurationLimitReached(true)
      }
    }, 60_000)
    return () => window.clearInterval(interval)
  }, [timeStarted])

  const nextAvailablePlan = useMemo(() => {
    if (!activePlan) return null
    const currentIndex = plans.findIndex((plan) => plan.id === activePlan.id)
    const orderedPlans = plans
      .slice(currentIndex + 1)
      .concat(plans.slice(0, currentIndex))
      .filter((plan) => !plan.completed)
    return orderedPlans[0] ?? null
  }, [activePlan, plans])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <header className="border-b border-emerald-100 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 text-emerald-600">
              <Sparkles className="h-6 w-6" />
              <span className="text-sm font-semibold uppercase tracking-wide">Memorization Studio</span>
            </div>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">Build your personalised Qur'an plans</h1>
            <p className="mt-2 max-w-2xl text-base text-slate-600">
              Craft focused memorization plans, repeat each ayah with intention, and celebrate as you progress through the Noble
              Qur&apos;an.
            </p>
          </div>
          <Link href="/dashboard" className="inline-flex">
            <Button variant="outline" className="border-emerald-200 bg-white/80 text-emerald-700 hover:bg-emerald-50">
              <BookOpen className="mr-2 h-4 w-4" /> Back to dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row">
        <Card className="h-fit w-full border-emerald-100/80 bg-white/80 shadow-sm lg:w-[320px]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg font-semibold text-slate-900">
              Memorization plans
              <Button
                size="sm"
                className="rounded-full bg-emerald-500 px-3 text-xs font-semibold text-white hover:bg-emerald-600"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <PlusCircle className="mr-1 h-4 w-4" /> Create plan
              </Button>
            </CardTitle>
            <CardDescription className="text-sm text-slate-600">
              Build as many targeted plans as you like. Select one to begin memorising.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {surahLoading && plans.length === 0 ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-emerald-200 bg-emerald-50/60 p-6 text-emerald-700">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading surah list...
              </div>
            ) : plans.length === 0 ? (
              <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/60 p-6 text-center">
                <p className="text-sm font-medium text-emerald-800">No plans yet</p>
                <p className="mt-1 text-sm text-emerald-700">Create your first plan to get started.</p>
                <Button
                  size="sm"
                  className="mt-4 rounded-full bg-emerald-500 px-4 text-xs font-semibold text-white hover:bg-emerald-600"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <PlusCircle className="mr-1 h-4 w-4" /> Create plan
                </Button>
              </div>
            ) : (
              <ScrollArea className="max-h-[520px] pr-2">
                <div className="space-y-3">
                  {plans.map((plan) => {
                    const isActive = plan.id === selectedPlanId
                    const planState = planProgress[plan.id]
                    const totalLevelsForPlan = plan.totalVerses > 1 ? 3 : 2
                    const planLevel = planState?.levelIndex ?? 0
                    const planTarget = planState?.targetRepetitions ?? baseTarget
                    const planRepetitions = planState?.repeatCount ?? 0
                    const levelProgress = Math.min(1, planRepetitions / planTarget)
                    const computedProgress = planState?.completed || plan.completed
                      ? 100
                      : Math.min(100, ((Math.min(planLevel, totalLevelsForPlan - 1) + levelProgress) / totalLevelsForPlan) * 100)
                    return (
                      <button
                        key={plan.id}
                        onClick={() => {
                          setSelectedPlanId(plan.id)
                          setShowCelebration(false)
                        }}
                        className={cn(
                          "w-full rounded-xl border bg-white px-4 py-4 text-left shadow-sm transition-all",
                          "hover:border-emerald-300 hover:shadow-md",
                          isActive ? "border-emerald-400 ring-2 ring-emerald-200" : "border-emerald-100",
                          plan.completed ? "bg-emerald-50" : "",
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{plan.surahName}</p>
                            <p className="text-xs text-slate-500">Ayah {plan.startAyah} – {plan.endAyah}</p>
                          </div>
                          <span
                            className={cn(
                              "mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border",
                              isActive ? "border-emerald-500" : "border-slate-300",
                              plan.completed ? "bg-emerald-500 text-white" : "bg-white",
                            )}
                          >
                            {plan.completed ? <CheckCircle2 className="h-4 w-4" /> : <Radio className="h-3 w-3" />}
                          </span>
                        </div>
                        <div className="mt-3">
                          <Progress className="h-1.5 rounded-full bg-emerald-100" value={computedProgress} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
            {surahError && (
              <p className="mt-4 text-xs font-medium text-red-600">{surahError}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex-1 space-y-6">
          <Card className="border-emerald-100/80 bg-white/80 shadow-sm">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    {activePlan
                      ? `${activePlan.surahName} • Ayah ${activePlan.startAyah} – ${activePlan.endAyah}`
                      : "Choose a memorisation plan"}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    {activePlan
                      ? "Move level by level. Each repetition is honoured only when your presence is sensed."
                      : "Select or create a plan to open your digital memorisation circle."}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {plans.length > 0 && (
                    <Select
                      open={planDropdownOpen}
                      onOpenChange={setPlanDropdownOpen}
                      value={selectedPlanId ?? undefined}
                      onValueChange={(value) => {
                        setSelectedPlanId(value)
                        setPreferences((previous) => ({ ...previous, lastSelectedPlanId: value }))
                        setPlanDropdownOpen(false)
                        setShowCelebration(false)
                      }}
                    >
                      <SelectTrigger className="w-full border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200 md:w-64">
                        <SelectValue placeholder="Choose a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.surahName} • Ayah {plan.startAyah} – {plan.endAyah}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => setShowSettingsDialog(true)}
                  >
                    <Settings2 className="mr-2 h-4 w-4" /> Intention settings
                  </Button>
                  <Button
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => setShowModeDialog(true)}
                    disabled={!activePlan}
                  >
                    <Repeat2 className="mr-2 h-4 w-4" /> Confirmation modes
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-10">
              {!activePlan ? (
                <div className="-mt-6 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 p-8 text-center">
                  <p className="text-sm font-medium text-emerald-900">No plan selected</p>
                  <p className="mt-1 text-sm text-emerald-700">Select a plan or create one to begin reciting.</p>
                  <Button
                    size="sm"
                    className="mt-4 rounded-full bg-emerald-500 px-4 text-xs font-semibold text-white hover:bg-emerald-600"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <PlusCircle className="mr-1 h-4 w-4" /> Create plan
                  </Button>
                </div>
              ) : verseLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-emerald-100 bg-white/80 p-12 text-emerald-700">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p className="text-sm">Loading verses for this plan...</p>
                </div>
              ) : verseError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
                  <p className="text-sm font-medium">{verseError}</p>
                </div>
              ) : versesForActiveLevel.length === 0 ? (
                <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 p-8 text-center text-emerald-800">
                  <p className="text-sm font-medium">No verses found for this range.</p>
                  <p className="mt-1 text-sm text-emerald-700">Edit or recreate the plan with a valid ayah selection.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold text-emerald-700">
                        Level {safeLevelIndex + 1} of {totalLevels}
                      </span>
                      <span className="text-xs font-medium text-emerald-700">
                        Repetition {repeatCount} / {activeTarget}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{activeLevelDefinition?.description}</p>
                  </div>

                  <div className="space-y-5 rounded-2xl border border-emerald-100 bg-white/90 p-6 shadow-inner">
                    {sessionActive ? (
                      versesForActiveLevel.map((verse) => (
                        <div key={verse.numberInSurah} className="space-y-2">
                          <p className="text-3xl leading-relaxed text-slate-900 md:text-[2.25rem]">{verse.arabicText}</p>
                          <p className="text-sm leading-relaxed text-slate-600">{verse.translation}</p>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center text-slate-600">
                        <Mic className="h-6 w-6 text-emerald-600" />
                        <p className="text-sm font-semibold text-slate-700">Press start to reveal your verses</p>
                        <p className="text-xs text-slate-500">Begin the sitting to activate voice witnessing for each recitation.</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Progress className="h-2 rounded-full bg-emerald-100" value={Math.min(100, (repeatCount / activeTarget) * 100)} />
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-600">
                      <span>Level progress witnessed: {repeatCount} / {activeTarget}</span>
                      <span>Total journey: {Math.round(globalProgressPercent)}%</span>
                    </div>
                  </div>

                  {!sessionActive && !activePlan.completed && !isPlanPaused && (
                    <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={handleStartMemorization}>
                      <Sparkles className="mr-2 h-4 w-4" /> Start memorization
                    </Button>
                  )}

                  {encouragement && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-800">
                      {encouragement}
                    </div>
                  )}

                  {lastAttemptFailed && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                      Please Recite (Again).
                    </div>
                  )}

                  {sessionDurationLimitReached && (
                    <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white/80 p-4 text-sm text-emerald-800">
                      <Hourglass className="mt-0.5 h-4 w-4" />
                      <span>
                        You have been reciting for a while. Consider resting and returning with renewed focus.
                      </span>
                    </div>
                  )}

                  {isPlanPaused && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-white/80 p-4 text-sm text-emerald-800">
                      <span>Your pause is active until the time you chose. Resume whenever your heart is ready.</span>
                      <Button size="sm" variant="outline" onClick={resumePausedPlan}>
                        Resume now
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-emerald-900">{modeDescriptions[activeMode].title}</p>
                        <p className="text-xs text-slate-600">{modeDescriptions[activeMode].support}</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => setShowModeDialog(true)}>
                        Change mode
                      </Button>
                    </div>

                    {activeMode === "voice" && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={cn("h-2 w-2 rounded-full", micStatusDetails.dot)} />
                          <span className={micStatusDetails.tone}>{micStatusDetails.label}</span>
                        </div>
                        {voiceError && <p className="text-xs text-red-600">{voiceError}</p>}
                        <Button
                          className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                          disabled={
                            !sessionActive ||
                            micStatus === "requesting" ||
                            isListening ||
                            isPlanPaused ||
                            activePlan.completed
                          }
                          onClick={handleVoiceRecitation}
                        >
                          <Mic className="mr-2 h-4 w-4" /> Recite aloud to witness a repetition
                        </Button>
                        <p className="text-xs text-slate-500">
                          Recite the displayed verses aloud for at least {VOICE_MIN_DURATION_MS / 1000} seconds. Silence for {VOICE_TIMEOUT_MS / 1000} seconds will gently prompt you again.
                        </p>
                      </div>
                    )}

                    {activeMode === "heart" && (
                      <div className="space-y-3">
                        <Button
                          className={cn(
                            "w-full border border-emerald-200 bg-white text-emerald-700 transition",
                            holdingHeart ? "bg-emerald-100" : "hover:bg-emerald-50",
                          )}
                          onMouseDown={handleHeartHoldStart}
                          onMouseUp={handleHeartHoldEnd}
                          onMouseLeave={handleHeartHoldEnd}
                          onTouchStart={(event) => {
                            event.preventDefault()
                            handleHeartHoldStart()
                          }}
                          onTouchEnd={handleHeartHoldEnd}
                          disabled={activePlan.completed || isPlanPaused || !sessionActive}
                        >
                          <Heart className="mr-2 h-4 w-4" /> Hold for {HEART_HOLD_DURATION / 1000} seconds with intention
                        </Button>
                        <p className="text-xs text-slate-500">
                          Keep the button pressed as you recite within. Release early to try again.
                        </p>
                      </div>
                    )}

                    {activeMode === "gesture" && (
                      <div className="space-y-3">
                        <Button
                          className="w-full border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                          onClick={handleGestureTap}
                          disabled={activePlan.completed || isPlanPaused || !sessionActive}
                        >
                          Tap rhythm • {tapCount} / {GESTURE_REQUIRED_TAPS}
                        </Button>
                        <p className="text-xs text-slate-500">
                          Tap {GESTURE_REQUIRED_TAPS} times within {GESTURE_WINDOW_MS / 1000} seconds to mirror your silent recitation.
                        </p>
                      </div>
                    )}

                    {activeMode === "writing" && (
                      <form className="space-y-3" onSubmit={handleWritingSubmit}>
                        <Input
                          value={writingInput}
                          onChange={(event) => setWritingInput(event.target.value)}
                          placeholder={
                            writingExpectedWords.length
                              ? `Type the first ${writingExpectedWords.length} words of the meaning...`
                              : "Share a reflection on what you just recited..."
                          }
                          className="border-emerald-200"
                          disabled={activePlan.completed || isPlanPaused || !sessionActive}
                        />
                        <div className="flex flex-wrap items-center gap-3">
                          <Button
                            type="submit"
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                            disabled={activePlan.completed || isPlanPaused || !sessionActive}
                          >
                            Submit reflection
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setWritingInput("")}>
                            Clear
                          </Button>
                        </div>
                        {writingExpectedWords.length > 0 && (
                          <p className="text-xs text-slate-500">
                            Hint: {writingExpectedWords.join(" ")}
                          </p>
                        )}
                      </form>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => setShowPauseDialog(true)}
                      disabled={activePlan.completed}
                    >
                      <Hourglass className="mr-2 h-4 w-4" /> My heart is heavy
                    </Button>
                    <Button
                      variant="outline"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={handleShareWithTeacher}
                    >
                      <Share2 className="mr-2 h-4 w-4" /> Share with teacher
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-slate-500 hover:text-emerald-700"
                      onClick={handleManualCompletion}
                      disabled={activePlan.completed}
                    >
                      Mark plan complete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md border-emerald-100 bg-white/90">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">Create a memorization plan</DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Choose a surah and the ayah range you would like to focus on. You can add as many plans as you need.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreatePlan}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Surah</label>
              <Select value={selectedSurahNumber} onValueChange={setSelectedSurahNumber}>
                <SelectTrigger className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200">
                  <SelectValue placeholder={surahLoading ? "Loading..." : "Select a surah"} />
                </SelectTrigger>
                <SelectContent>
                  {surahs.map((surah) => (
                    <SelectItem key={surah.number} value={String(surah.number)}>
                      {surah.number}. {surah.englishName} ({surah.numberOfAyahs} ayat)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Start ayah</label>
                <Input
                  type="number"
                  min={1}
                  value={startAyah}
                  onChange={(event) => setStartAyah(event.target.value)}
                  className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">End ayah</label>
                <Input
                  type="number"
                  min={1}
                  value={endAyah}
                  onChange={(event) => setEndAyah(event.target.value)}
                  className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200"
                />
              </div>
            </div>
            {selectedSurahNumber && (
              <p className="text-xs text-slate-500">
                {surahs.find((surah) => surah.number === Number(selectedSurahNumber))?.englishNameTranslation} • up to{" "}
                {surahs.find((surah) => surah.number === Number(selectedSurahNumber))?.numberOfAyahs ?? 0} ayat
              </p>
            )}
            {formError && <p className="text-sm font-medium text-red-600">{formError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-500 text-white hover:bg-emerald-600">
                Save plan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showModeDialog} onOpenChange={setShowModeDialog}>
        <DialogContent className="max-w-2xl border-emerald-100 bg-white/95">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">Choose how you confirm each repetition</DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Select the mode that matches your current space and ability. You can switch anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              className={cn(
                "rounded-xl border p-4 text-left transition",
                activeMode === "voice" ? "border-emerald-400 bg-emerald-50" : "border-emerald-100 hover:border-emerald-200",
                preferences.publicMode || isUltraLowPower ? "opacity-60" : "",
              )}
              onClick={() => !preferences.publicMode && !isUltraLowPower && handleModeSelection("voice")}
              disabled={preferences.publicMode || isUltraLowPower}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-900">Voice presence</span>
                <Mic className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-sm text-slate-600">Recite aloud and let the microphone sense your effort.</p>
              {preferences.publicMode && <p className="mt-3 text-xs text-amber-600">Public mode is on—voice input is paused.</p>}
              {isUltraLowPower && <p className="mt-3 text-xs text-amber-600">Ultra-low-power mode detected. Voice detection is resting.</p>}
            </button>

            <button
              className={cn(
                "rounded-xl border p-4 text-left transition",
                activeMode === "heart" ? "border-emerald-400 bg-emerald-50" : "border-emerald-100 hover:border-emerald-200",
              )}
              onClick={() => handleModeSelection("heart")}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-900">Heart hold</span>
                <Heart className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-sm text-slate-600">Hold the intention button while you recite quietly or inwardly.</p>
            </button>

            <button
              className={cn(
                "rounded-xl border p-4 text-left transition",
                activeMode === "gesture" ? "border-emerald-400 bg-emerald-50" : "border-emerald-100 hover:border-emerald-200",
              )}
              onClick={() => handleModeSelection("gesture")}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-900">Gesture rhythm</span>
                <Repeat2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-sm text-slate-600">Tap gently three times to mirror your memorisation cadence.</p>
            </button>

            <button
              className={cn(
                "rounded-xl border p-4 text-left transition",
                activeMode === "writing" ? "border-emerald-400 bg-emerald-50" : "border-emerald-100 hover:border-emerald-200",
              )}
              onClick={() => handleModeSelection("writing")}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-900">Writing reflection</span>
                <BookOpen className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-sm text-slate-600">Type the opening words or a brief reflection to honour the verse.</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-xl border-emerald-100 bg-white/95">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">Intention settings</DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Shape the repetition goals to honour your current season of memorisation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Graceful repetitions</p>
                <p className="text-xs text-slate-600">Allow the system to suggest a reduced repetition count when effort feels heavy.</p>
              </div>
              <Switch checked={preferences.graceEnabled} onCheckedChange={(checked) => setPreferences((previous) => ({ ...previous, graceEnabled: checked }))} />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-white/80 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Child-friendly focus</p>
                <p className="text-xs text-slate-600">Use a lighter target (around {CHILD_TARGET} repetitions) for young memorizers.</p>
              </div>
              <Switch
                checked={preferences.childMode}
                onCheckedChange={(checked) =>
                  setPreferences((previous) => ({ ...previous, childMode: checked, elderMode: checked ? false : previous.elderMode }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-white/80 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Elder support</p>
                <p className="text-xs text-slate-600">A gentle target (about {ELDER_TARGET} repetitions) for slower, reflective pacing.</p>
              </div>
              <Switch
                checked={preferences.elderMode}
                onCheckedChange={(checked) =>
                  setPreferences((previous) => ({ ...previous, elderMode: checked, childMode: checked ? false : previous.childMode }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-white/80 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Public / quiet mode</p>
                <p className="text-xs text-slate-600">Silence the microphone and favour touch-based confirmation for shared spaces.</p>
              </div>
              <Switch checked={preferences.publicMode} onCheckedChange={(checked) => setPreferences((previous) => ({ ...previous, publicMode: checked }))} />
            </div>

            {isUltraLowPower && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                Ultra-low-power mode is active. Voice detection is softened automatically to protect your device.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showGracePrompt} onOpenChange={setShowGracePrompt}>
        <DialogContent className="max-w-md border-emerald-100 bg-white/95">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">Would you like a gentler pace?</DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Mercy is part of memorisation. We can reduce today&apos;s repetitions to {GRACE_TARGET} with full intention.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-slate-600">
            <p>Your effort has been witnessed. Choosing the lighter path keeps sincerity at the centre.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={declineGraceReduction}>
              Keep current target
            </Button>
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={acceptGraceReduction}>
              Embrace grace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent className="max-w-md border-emerald-100 bg-white/95">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">My heart is heavy</DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Pause this plan with gentleness. Your progress will stay safe until you return.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Pause length (days)</label>
              <Input
                type="number"
                min={1}
                max={7}
                value={pauseDuration}
                onChange={(event) => setPauseDuration(Math.min(7, Math.max(1, Number(event.target.value) || 1)))}
                className="mt-2 w-full border-emerald-200"
              />
            </div>
            <p className="text-xs text-slate-600">Allah knows your state. Return whenever the heart feels ready.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
              Not now
            </Button>
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={handlePauseSession}>
              Pause with intention
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={levelCelebrationMessage !== null}
        onOpenChange={(open) => {
          if (!open) {
            setLevelCelebrationMessage(null)
          }
        }}
      >
        <DialogContent className="max-w-md border-emerald-100 bg-white/95 text-center">
          <DialogHeader>
            <div className="flex flex-col items-center gap-3">
              <Sparkles className="h-8 w-8 text-emerald-600" />
              <DialogTitle className="text-xl font-semibold text-slate-900">
                {levelCelebrationMessage ?? "Level complete"}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                The next verses are now revealed. Recite them aloud twenty times to continue your journey.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="flex-row justify-center">
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => {
                setLevelCelebrationMessage(null)
                if (sessionActive) {
                  void handleVoiceRecitation()
                }
              }}
            >
              Continue reciting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent showCloseButton={false} className="max-w-md border-none bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <DialogHeader>
            <div className="flex flex-col items-center gap-3 text-center">
              <Sparkles className="h-10 w-10" />
              <DialogTitle className="text-2xl font-bold text-white">Hifz milestone completed!</DialogTitle>
              <DialogDescription className="text-base text-emerald-50">
                “And We have certainly made the Qur’an easy for remembrance, so is there any who will remember?” (54:17)
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="text-center text-sm text-emerald-50">
            <p>
              {activePlan
                ? `${activePlan.surahName} • Ayah ${activePlan.startAyah} – ${activePlan.endAyah}`
                : "Keep building momentum with your memorization."}
            </p>
          </div>
          <DialogFooter className="flex-row justify-center gap-3">
            <Button
              variant="outline"
              className="border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-50"
              onClick={() => {
                setShowCelebration(false)
                setIsCreateDialogOpen(true)
              }}
            >
              Create another plan
            </Button>
            {nextAvailablePlan ? (
              <Button
                className="bg-emerald-800 text-white hover:bg-emerald-900"
                onClick={() => {
                  setShowCelebration(false)
                  setSelectedPlanId(nextAvailablePlan.id)
                }}
              >
                Go to next plan
              </Button>
            ) : (
              <Button className="bg-emerald-800 text-white hover:bg-emerald-900" onClick={() => setShowCelebration(false)}>
                Keep reviewing
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
