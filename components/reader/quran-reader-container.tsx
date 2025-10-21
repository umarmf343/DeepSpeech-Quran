"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { AudioSegment, Ayah, Surah, Translation, Transliteration } from "@/lib/quran-api"
import { quranAPI } from "@/lib/quran-api"
import { cn } from "@/lib/utils"
import { createAudioPlayerService } from "@/lib/reader/audio-player-service"
import type { ReaderProfile } from "@/lib/reader/preference-manager"
import { generateTajweedForRange } from "@/lib/deepspeech/tajweed-engine"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"

import { Pause, Volume2, Mic, Egg, Sparkles } from "lucide-react"

interface VerseRenderData {
  arabic: Ayah
  translations: Translation[]
  transliteration?: Transliteration
}

interface QuranReaderContainerProps {
  surahNumber: number | null
  surahMeta: Surah | null
  ayahs: Ayah[]
  selectedAyahNumber: number | null
  onAyahSelect: (ayahNumber: number) => void
  profile: ReaderProfile
  nightMode: boolean
  audioSegments: AudioSegment[]
  onVersePlaybackEnd?: (ayahNumber: number) => void
  telemetryEnabled?: boolean
  challengeGoal: number
  challengeProgress: number
  challengeLevel: number
  challengeCelebrationActive?: boolean
  lastCompletedGoal: number
}

const rtlLanguages = new Set(["ar", "fa", "ur", "ps", "he"])

export function QuranReaderContainer({
  surahNumber,
  surahMeta,
  ayahs,
  selectedAyahNumber,
  onAyahSelect,
  profile,
  nightMode,
  audioSegments,
  onVersePlaybackEnd,
  telemetryEnabled,
  challengeGoal,
  challengeProgress,
  challengeLevel,
  challengeCelebrationActive = false,
  lastCompletedGoal,
}: QuranReaderContainerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offline, setOffline] = useState(false)
  const [activeVerse, setActiveVerse] = useState<number | null>(null)
  const [tajweedError, setTajweedError] = useState<string | null>(null)
  const [tajweedMap, setTajweedMap] = useState<Map<number, string>>(new Map())
  const verseCacheRef = useRef<Map<string, VerseRenderData>>(new Map())
  const verseDataRef = useRef<Map<number, VerseRenderData>>(new Map())
  const verseRefs = useRef<Map<number, HTMLDivElement | null>>(new Map())
  const audioServiceRef = useRef<ReturnType<typeof createAudioPlayerService> | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  const translationDir = rtlLanguages.has(profile.translationLanguage) ? "rtl" : "ltr"

  const challengeProgressRatio = useMemo(() => {
    if (challengeGoal <= 0) return 0
    return Math.min(challengeProgress / challengeGoal, 1)
  }, [challengeGoal, challengeProgress])

  const versesToRender = useMemo(() => {
    if (!surahNumber || ayahs.length === 0) return []
    if (profile.fullSurahView) {
      return ayahs
    }
    const selected = ayahs.find((ayah) => ayah.numberInSurah === selectedAyahNumber)
    return selected ? [selected] : []
  }, [ayahs, profile.fullSurahView, selectedAyahNumber, surahNumber])

  useEffect(() => {
    if (typeof window === "undefined") return
    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    setOffline(!navigator.onLine)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("Service worker registration failed", err))
  }, [])

  useEffect(() => {
    if (profile.fullSurahView && audioSegments.length > 0 && typeof navigator !== "undefined") {
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "PRECACHE_AUDIO",
          urls: audioSegments.map((segment) => segment.url),
        })
      }
    }
  }, [profile.fullSurahView, audioSegments])

  useEffect(() => {
    if (!audioServiceRef.current) {
      audioServiceRef.current = createAudioPlayerService()
    }
    return () => {
      audioServiceRef.current?.pause()
      audioServiceRef.current = null
    }
  }, [])

  const buildCacheKey = useCallback(
    (ayahNumber: number) => {
      return [
        surahNumber,
        ayahNumber,
        profile.translationEdition,
        profile.transliterationEdition,
        profile.showTranslation,
        profile.showTransliteration,
      ].join(":")
    },
    [profile.showTranslation, profile.showTransliteration, profile.translationEdition, profile.transliterationEdition, surahNumber],
  )

  const fetchVerseData = useCallback(
    async (ayahNumber: number): Promise<VerseRenderData | null> => {
      if (!surahNumber) return null
      const cacheKey = buildCacheKey(ayahNumber)
      if (verseCacheRef.current.has(cacheKey)) {
        return verseCacheRef.current.get(cacheKey) ?? null
      }
      const editions = new Set<string>(["quran-uthmani"])
      if (profile.showTranslation) {
        editions.add(profile.translationEdition)
      }
      if (profile.showTransliteration) {
        editions.add(profile.transliterationEdition)
      }
      try {
        const detail = await quranAPI.getAyah(surahNumber, ayahNumber, Array.from(editions))
        if (!detail) {
          return null
        }
        const normalized: VerseRenderData = {
          arabic: detail.arabic,
          translations: profile.showTranslation ? detail.translations : [],
          transliteration: profile.showTransliteration ? detail.transliteration : undefined,
        }
        verseCacheRef.current.set(cacheKey, normalized)
        return normalized
      } catch (fetchError) {
        console.error("Failed to fetch verse", fetchError)
        return null
      }
    },
    [buildCacheKey, profile.showTranslation, profile.showTransliteration, profile.translationEdition, profile.transliterationEdition, surahNumber],
  )

  useEffect(() => {
    if (!surahNumber || versesToRender.length === 0) {
      verseDataRef.current.clear()
      setIsLoading(false)
      return
    }
    let isActive = true
    setIsLoading(true)
    setError(null)

    const load = async () => {
      for (const ayah of versesToRender) {
        if (!isActive) return
        const data = await fetchVerseData(ayah.numberInSurah)
        if (data) {
          verseDataRef.current.set(ayah.numberInSurah, data)
        }
      }
      if (isActive) {
        setIsLoading(false)
      }
    }

    void load().catch((loadError) => {
      console.error("Failed to load verses", loadError)
      if (isActive) {
        setError("Verse not available")
        setIsLoading(false)
      }
    })

    return () => {
      isActive = false
    }
  }, [fetchVerseData, surahNumber, versesToRender])

  useEffect(() => {
    if (!profile.showTajweed || !surahNumber || versesToRender.length === 0) {
      setTajweedError(null)
      setTajweedMap(new Map())
      return
    }
    let isMounted = true
    const range = {
      start: versesToRender[0]?.numberInSurah ?? 1,
      end: versesToRender[versesToRender.length - 1]?.numberInSurah ?? 1,
    }
    ;(async () => {
      const response = await generateTajweedForRange(surahNumber, range)
      if (!isMounted) return
      if (!response.success) {
        setTajweedError(response.error ?? "Tajweed view unavailable. Showing standard text.")
        setTajweedMap(new Map())
        return
      }
      const map = new Map<number, string>()
      response.fragments.forEach((fragment) => {
        map.set(fragment.ayah, fragment.html)
      })
      setTajweedMap(map)
      setTajweedError(null)
    })().catch((err) => {
      console.error("Tajweed load failed", err)
      if (!isMounted) return
      setTajweedError("Tajweed view unavailable. Showing standard text.")
      setTajweedMap(new Map())
    })
    return () => {
      isMounted = false
    }
  }, [profile.showTajweed, surahNumber, versesToRender])

  const handlePlay = useCallback(
    async (ayah: Ayah) => {
      const audioService = audioServiceRef.current
      if (!audioService) return
      const index = ayah.numberInSurah - 1
      const segment = audioSegments[index]
      if (!segment?.url) return
      const verseKey = `${surahNumber}:${ayah.numberInSurah}`
      await audioService.play({
        verseKey,
        url: segment.url,
        playbackRate: profile.playbackSpeed,
        volume: profile.volume,
        onStart: () => {
          setActiveVerse(ayah.numberInSurah)
          if (telemetryEnabled) {
            console.info("telemetry", {
              event: "verse_played",
              surah: surahNumber,
              verse: ayah.numberInSurah,
              reciter: profile.reciterEdition,
            })
          }
        },
        onEnd: () => {
          setActiveVerse((current) => (current === ayah.numberInSurah ? null : current))
          onVersePlaybackEnd?.(ayah.numberInSurah)
        },
        onError: (err) => {
          console.error("Audio playback failed", err)
        },
      })
    },
    [audioSegments, onVersePlaybackEnd, profile.playbackSpeed, profile.reciterEdition, profile.volume, surahNumber, telemetryEnabled],
  )

  const speakVerse = useCallback((ayah: Ayah, detail?: VerseRenderData) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance()
    utterance.text = detail?.translations?.[0]?.text ?? ayah.text
    utterance.lang = detail?.translations?.[0]?.language ?? "ar-SA"
    window.speechSynthesis.speak(utterance)
  }, [])

  useEffect(() => {
    if (!activeVerse || prefersReducedMotion) return
    const element = verseRefs.current.get(activeVerse)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
      element.classList.add("ring", "ring-emerald-400", "ring-offset-2")
      const timeout = window.setTimeout(() => {
        element.classList.remove("ring", "ring-emerald-400", "ring-offset-2")
      }, 1200)
      return () => window.clearTimeout(timeout)
    }
  }, [activeVerse, prefersReducedMotion])

  if (!surahNumber) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
        Select a surah to begin your recitation journey.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4" aria-live="polite" aria-busy="true">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" role="alert">
        <AlertTitle>Verse not available</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4" id="quran-reader-container">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50 via-rose-50 to-emerald-50 p-4 shadow-sm dark:border-amber-700/40 dark:from-amber-900/30 dark:via-rose-900/30 dark:to-emerald-900/20",
          nightMode && "text-emerald-100",
        )}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div
                className={cn(
                  "absolute inset-0 rounded-full bg-white/60 blur-xl transition-all duration-700 ease-out dark:bg-emerald-400/40",
                  challengeCelebrationActive ? "opacity-90" : "opacity-70",
                )}
              />
              <div
                className={cn(
                  "relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 via-rose-200 to-emerald-200 shadow-lg ring-2 ring-white/50 transition-transform duration-500 ease-out dark:from-amber-500/40 dark:via-rose-500/30 dark:to-emerald-500/40",
                  challengeCelebrationActive ? "scale-110" : "animate-pulse",
                )}
              >
                <Egg
                  className={cn(
                    "h-10 w-10 text-amber-700 transition-transform duration-500 ease-out drop-shadow-md dark:text-amber-200",
                    challengeCelebrationActive ? "-rotate-6 text-emerald-500" : "",
                  )}
                  aria-hidden
                />
                {challengeCelebrationActive ? (
                  <Sparkles className="absolute -top-2 right-0 h-5 w-5 animate-ping text-emerald-500" aria-hidden />
                ) : null}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                Break the Egg Challenge • Level {challengeLevel}
              </p>
              <p className="text-xs text-emerald-900/70 dark:text-emerald-100/80">
                Recite {challengeGoal} verses by tapping “Next” to crack the egg. Progress: {challengeProgress} / {challengeGoal}
              </p>
            </div>
          </div>
          <div className="w-full max-w-xs self-start md:self-center">
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-white/40 dark:bg-slate-900/50"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={Math.max(challengeGoal, 1)}
              aria-valuenow={Math.min(challengeProgress, challengeGoal)}
              aria-label="Break the Egg challenge progress"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-pink-400 to-emerald-400 transition-all duration-500 ease-out"
                style={{ width: `${challengeProgressRatio * 100}%` }}
                aria-hidden
              />
            </div>
          </div>
        </div>
        {challengeCelebrationActive ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-slate-900/70">
            <div className="flex max-w-sm flex-col items-center gap-2 text-center" role="status" aria-live="polite">
              <Sparkles className="h-8 w-8 text-emerald-500" aria-hidden />
              <p className="text-base font-semibold text-emerald-700 dark:text-emerald-200">
                Mabruk! You cracked the egg after {lastCompletedGoal} verses.
              </p>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-100/70">
                Level {challengeLevel} unlocked. Aim for {challengeGoal} verses to shatter the next egg!
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {offline ? (
        <Alert role="status" className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-600/70 dark:bg-amber-900/40 dark:text-amber-200">
          <AlertTitle>Offline mode</AlertTitle>
          <AlertDescription>
            You are reading offline. Previously cached verses and audio will be used until the connection returns.
          </AlertDescription>
        </Alert>
      ) : null}
      {tajweedError ? (
        <Alert role="status" className="border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-600/70 dark:bg-rose-900/40 dark:text-rose-100">
          <AlertTitle>Tajweed view unavailable</AlertTitle>
          <AlertDescription>{tajweedError}</AlertDescription>
        </Alert>
      ) : null}

      <div className={cn("space-y-6", profile.fullSurahView ? "max-h-[520px] overflow-y-auto pr-2" : "")}
        role="list"
        aria-label={
          profile.fullSurahView
            ? `Full surah view for ${surahMeta?.englishName ?? "selected surah"}`
            : `Verse ${selectedAyahNumber ?? ""} from ${surahMeta?.englishName ?? "selected surah"}`
        }
      >
        {versesToRender.map((ayah) => {
          const detail = verseDataRef.current.get(ayah.numberInSurah)
          const isActive = activeVerse === ayah.numberInSurah
          const tajweedHtml = profile.showTajweed ? tajweedMap.get(ayah.numberInSurah) : null
          return (
            <div
              key={ayah.number}
              ref={(element) => {
                verseRefs.current.set(ayah.numberInSurah, element)
              }}
              className={cn(
                "group rounded-2xl border border-transparent bg-white/90 p-4 transition-all duration-300 ease-in-out dark:bg-slate-900/70",
                isActive && "shadow-xl ring-2 ring-emerald-500/60",
                nightMode && "border-slate-800/60 bg-slate-900/70",
              )}
              role="listitem"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    aria-label={`Ayah ${ayah.numberInSurah}`}
                  >
                    {ayah.numberInSurah}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-emerald-100/70 text-emerald-700 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 dark:bg-emerald-900/40 dark:text-emerald-200"
                    onClick={() => handlePlay(ayah)}
                    aria-label={`Play verse ${ayah.numberInSurah} of ${surahMeta?.englishName ?? "selected surah"}`}
                  >
                    {isActive ? <Pause className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-slate-100/70 text-slate-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 dark:bg-slate-800/50 dark:text-slate-200"
                    onClick={() => speakVerse(ayah, detail)}
                    aria-label={`Speak verse ${ayah.numberInSurah}`}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  className="text-xs text-emerald-700 hover:text-emerald-800 dark:text-emerald-300"
                  onClick={() => onAyahSelect(ayah.numberInSurah)}
                >
                  Focus verse
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                <div
                  className={cn(
                    "font-arabic text-right text-2xl leading-relaxed md:text-[2.25rem]",
                    profile.fontSizeClass,
                    profile.lineHeightClass,
                  )}
                  dir="rtl"
                >
                  {tajweedHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: tajweedHtml }} />
                  ) : (
                    detail?.arabic?.text ?? ayah.text
                  )}
                </div>

                {profile.showTranslation && (detail?.translations?.length ?? 0) > 0 ? (
                  <div className="space-y-2" dir={translationDir}>
                    {detail?.translations.map((translation, index) => (
                      <p
                        key={`${translation.translator}-${index}`}
                        className="text-base leading-relaxed text-slate-700 dark:text-slate-200"
                      >
                        {translation.text}
                        {translation.translator ? (
                          <span className="ml-2 text-xs uppercase tracking-wide text-muted-foreground">
                            {translation.translator}
                          </span>
                        ) : null}
                      </p>
                    ))}
                  </div>
                ) : null}

                {profile.showTransliteration && detail?.transliteration ? (
                  <p className="text-base leading-relaxed text-emerald-700 dark:text-emerald-300" dir="ltr">
                    {detail.transliteration.text}
                  </p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
