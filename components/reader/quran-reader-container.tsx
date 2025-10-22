"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { AudioSegment, Ayah, Surah, Translation, Transliteration } from "@/lib/quran-api"
import { DEFAULT_ENGLISH_TRANSLATION_EDITION, quranAPI } from "@/lib/quran-api"
import { cn } from "@/lib/utils"
import { createAudioPlayerService } from "@/lib/reader/audio-player-service"
import type { ReaderProfile } from "@/lib/reader/preference-manager"
import { generateTajweedForRange } from "@/lib/deepspeech/tajweed-engine"
import type { SparkleEvent } from "@/hooks/use-hasanat-tracker"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"
import { HasanatSparkleEmitter } from "./hasanat-sparkles"

import { Pause, Volume2, Mic, ChevronLeft, ChevronRight, StopCircle } from "lucide-react"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { useToast } from "@/hooks/use-toast"

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
  onNavigate?: (payload: { direction: "previous" | "next"; currentAyah: Ayah; targetAyah: Ayah | null }) => boolean | void
  sparkleEvents?: SparkleEvent[]
  onSparkleComplete?: (id: string) => void
}

const rtlLanguages = new Set(["ar", "fa", "ur", "ps", "he"])

const languageNameMap: Record<string, string> = {
  arabic: "ar",
  english: "en",
  french: "fr",
  spanish: "es",
  german: "de",
  indonesian: "id",
  malay: "ms",
  malayalam: "ml",
  turkish: "tr",
  bengali: "bn",
  hindi: "hi",
  urdu: "ur",
  persian: "fa",
  farsi: "fa",
  swahili: "sw",
  tamil: "ta",
  chinese: "zh",
  japanese: "ja",
  korean: "ko",
  russian: "ru",
  somali: "so",
  hausa: "ha",
  thai: "th",
  filipino: "fil",
  portuguese: "pt",
}

const normalizeLanguageTag = (input?: string | null): string | undefined => {
  if (!input) return undefined
  const trimmed = input.trim()
  if (!trimmed) return undefined
  const lower = trimmed.toLowerCase()
  if (languageNameMap[lower]) {
    return languageNameMap[lower]
  }
  if (lower.includes("-")) {
    return lower
  }
  if (lower.length === 2) {
    return lower
  }
  return lower.slice(0, 2)
}

const selectVoiceForLanguage = (
  voices: SpeechSynthesisVoice[],
  languagePreferences: string[],
): SpeechSynthesisVoice | undefined => {
  if (!voices.length) return undefined
  const normalizedPrefs = languagePreferences
    .map((lang) => normalizeLanguageTag(lang))
    .filter((lang): lang is string => Boolean(lang))

  const exactMatch = normalizedPrefs
    .map((pref) => voices.find((voice) => voice.lang?.toLowerCase() === pref))
    .find((voice): voice is SpeechSynthesisVoice => Boolean(voice))
  if (exactMatch) {
    return exactMatch
  }

  const partialMatch = normalizedPrefs
    .map((pref) => {
      const prefix = pref.split("-")[0]
      return voices.find((voice) => voice.lang?.toLowerCase().startsWith(prefix))
    })
    .find((voice): voice is SpeechSynthesisVoice => Boolean(voice))
  if (partialMatch) {
    return partialMatch
  }

  const defaultVoice = voices.find((voice) => voice.default)
  return defaultVoice ?? voices[0]
}

const sanitizeSpeechText = (input: string): string => {
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

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
  onNavigate,
  sparkleEvents = [],
  onSparkleComplete,
}: QuranReaderContainerProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offline, setOffline] = useState(false)
  const [activeVerse, setActiveVerse] = useState<number | null>(null)
  const [tajweedError, setTajweedError] = useState<string | null>(null)
  const [tajweedMap, setTajweedMap] = useState<Map<number, string>>(new Map())
  const [speakingVerse, setSpeakingVerse] = useState<number | null>(null)
  const verseCacheRef = useRef<Map<string, VerseRenderData>>(new Map())
  const surahVerseDetailsRef = useRef<{
    key: string
    data: Map<number, { arabic: Ayah; translations: Translation[]; transliteration?: Transliteration }>
  } | null>(null)
  const surahVerseDetailsPromiseRef = useRef<
    Promise<Map<number, { arabic: Ayah; translations: Translation[]; transliteration?: Transliteration }> | null> | null
  >(null)
  const verseDataRef = useRef<Map<number, VerseRenderData>>(new Map())
  const verseRefs = useRef<Map<number, HTMLDivElement | null>>(new Map())
  const audioServiceRef = useRef<ReturnType<typeof createAudioPlayerService> | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const {
    supported: speechSupported,
    voices: speechVoices,
    speak: speakText,
    cancel: cancelSpeech,
    speakingId,
  } = useSpeechSynthesis()
  const stopCurrentSpeech = useCallback(() => {
    cancelSpeech()
    setSpeakingVerse(null)
  }, [cancelSpeech])
  const handleSparkleComplete = useCallback(
    (id: string) => {
      onSparkleComplete?.(id)
    },
    [onSparkleComplete],
  )

  useEffect(() => {
    return () => {
      cancelSpeech()
    }
  }, [cancelSpeech])

  const translationDir = rtlLanguages.has(profile.translationLanguage) ? "rtl" : "ltr"

  const selectedAyahIndex = useMemo(() => {
    if (selectedAyahNumber == null) {
      return -1
    }
    return ayahs.findIndex((ayah) => ayah.numberInSurah === selectedAyahNumber)
  }, [ayahs, selectedAyahNumber])

  const showNavigation = useMemo(() => {
    return !profile.fullSurahView && selectedAyahIndex !== -1 && ayahs.length > 0
  }, [ayahs.length, profile.fullSurahView, selectedAyahIndex])

  const canGoPrevious = showNavigation && selectedAyahIndex > 0
  const canGoNext = showNavigation && selectedAyahIndex < ayahs.length - 1

  const handleNavigate = useCallback(
    (direction: "previous" | "next") => {
      if (profile.fullSurahView || selectedAyahIndex === -1) {
        return
      }
      const delta = direction === "next" ? 1 : -1
      const targetIndex = selectedAyahIndex + delta
      if (targetIndex < 0 || targetIndex >= ayahs.length) {
        return
      }
      const targetAyah = ayahs[targetIndex] ?? null
      const currentAyah = ayahs[selectedAyahIndex]
      if (currentAyah) {
        const handled = onNavigate?.({ direction, currentAyah, targetAyah })
        if (handled) {
          return
        }
      }
      if (targetAyah) {
        onAyahSelect(targetAyah.numberInSurah)
      }
    },
    [ayahs, onAyahSelect, onNavigate, profile.fullSurahView, selectedAyahIndex],
  )

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
        profile.translationLanguage,
        profile.transliterationEdition,
        profile.showTranslation,
        profile.showTransliteration,
      ].join(":")
    },
    [
      profile.showTranslation,
      profile.showTransliteration,
      profile.translationEdition,
      profile.translationLanguage,
      profile.transliterationEdition,
      surahNumber,
    ],
  )

  const buildSurahPreferenceKey = useCallback(() => {
    if (!surahNumber) return "no-surah"
    return [
      surahNumber,
      profile.translationEdition ?? "",
      profile.translationLanguage ?? "",
      profile.transliterationEdition ?? "",
      profile.showTranslation ? "1" : "0",
      profile.showTransliteration ? "1" : "0",
    ].join(":")
  }, [
    profile.showTranslation,
    profile.showTransliteration,
    profile.translationEdition,
    profile.translationLanguage,
    profile.transliterationEdition,
    surahNumber,
  ])

  const processVerseDetail = useCallback(
    (
      detail:
        | { arabic: Ayah; translations: Translation[]; transliteration?: Transliteration }
        | null
        | undefined,
    ): VerseRenderData | null => {
      if (!detail) return null
      const translationsForDisplay = profile.showTranslation
        ? (() => {
            const byEdition = detail.translations.filter(
              (translation) => translation.edition === profile.translationEdition,
            )
            if (byEdition.length) {
              return byEdition
            }
            const languageCode = profile.translationLanguage?.toLowerCase()
            if (languageCode) {
              const byLanguage = detail.translations.filter(
                (translation) => translation.language?.toLowerCase() === languageCode,
              )
              if (byLanguage.length) {
                return byLanguage
              }
            }
            return detail.translations
          })()
        : []

      return {
        arabic: detail.arabic,
        translations: translationsForDisplay,
        transliteration: profile.showTransliteration ? detail.transliteration : undefined,
      }
    },
    [
      profile.showTranslation,
      profile.showTransliteration,
      profile.translationEdition,
      profile.translationLanguage,
    ],
  )

  const fetchVerseData = useCallback(
    async (ayahNumber: number): Promise<VerseRenderData | null> => {
      if (!surahNumber) return null
      const cacheKey = buildCacheKey(ayahNumber)
      if (verseCacheRef.current.has(cacheKey)) {
        return verseCacheRef.current.get(cacheKey) ?? null
      }
      const editions = new Set<string>(["quran-uthmani"])
      if (profile.showTranslation && profile.translationEdition) {
        editions.add(profile.translationEdition)
      }
      if (profile.showTransliteration && profile.transliterationEdition) {
        editions.add(profile.transliterationEdition)
      }
      if (profile.showTransliteration) {
        editions.add(DEFAULT_ENGLISH_TRANSLATION_EDITION)
      }

      const editionList = Array.from(editions)
      const preferenceKey = buildSurahPreferenceKey()

      const ensureSurahDetails = async () => {
        if (surahVerseDetailsRef.current?.key === preferenceKey) {
          return surahVerseDetailsRef.current.data
        }
        if (!surahVerseDetailsPromiseRef.current) {
          surahVerseDetailsPromiseRef.current = quranAPI
            .getSurahVerseDetails(surahNumber, editionList)
            .then((result) => {
              if (result) {
                surahVerseDetailsRef.current = { key: preferenceKey, data: result }
              } else if (surahVerseDetailsRef.current?.key === preferenceKey) {
                surahVerseDetailsRef.current = null
              }
              return result
            })
            .catch((error) => {
              console.error("Failed to fetch batched verses", error)
              return null
            })
            .finally(() => {
              surahVerseDetailsPromiseRef.current = null
            })
        }
        return surahVerseDetailsPromiseRef.current
      }

      let rawDetail:
        | { arabic: Ayah; translations: Translation[]; transliteration?: Transliteration }
        | null = null

      const batched = await ensureSurahDetails()
      if (batched) {
        rawDetail = batched.get(ayahNumber) ?? null
      }

      if (!rawDetail) {
        try {
          rawDetail = await quranAPI.getAyah(surahNumber, ayahNumber, editionList, {
            translationLanguage: profile.translationLanguage,
          })
        } catch (fetchError) {
          console.error("Failed to fetch verse", fetchError)
          rawDetail = null
        }
      }

      const normalized = processVerseDetail(rawDetail)
      if (normalized) {
        verseCacheRef.current.set(cacheKey, normalized)
      }
      return normalized
    },
    [
      buildCacheKey,
      buildSurahPreferenceKey,
      profile.showTranslation,
      profile.showTransliteration,
      profile.translationEdition,
      profile.translationLanguage,
      profile.transliterationEdition,
      processVerseDetail,
      surahNumber,
    ],
  )

  useEffect(() => {
    if (!surahNumber) {
      surahVerseDetailsRef.current = null
      surahVerseDetailsPromiseRef.current = null
    }
  }, [surahNumber])

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
      stopCurrentSpeech()
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
    [
      audioSegments,
      onVersePlaybackEnd,
      profile.playbackSpeed,
      profile.reciterEdition,
      profile.volume,
      stopCurrentSpeech,
      surahNumber,
      telemetryEnabled,
    ],
  )

  const speakVerse = useCallback(
    (ayah: Ayah, detail?: VerseRenderData) => {
      if (!speechSupported) {
        toast({
          title: "Speech unavailable",
          description: "Your browser does not support verse narration.",
        })
        return
      }

      if (!profile.showTranslation && !profile.showTransliteration) {
        toast({
          title: "Enable verse narration",
          description: "Turn on translation or transliteration to play this verse.",
        })
        return
      }

      const verseKey = surahNumber ? `${surahNumber}:${ayah.numberInSurah}` : `${ayah.numberInSurah}`
      if (speakingId === verseKey) {
        stopCurrentSpeech()
        return
      }

      const textCandidates = [
        detail?.translations?.[0]?.text,
        detail?.transliteration?.text,
        ayah.text,
      ]
        .map((value) => (value ? sanitizeSpeechText(value) : value))
        .filter((value): value is string => Boolean(value))

      const textToSpeak = textCandidates[0]
      if (!textToSpeak) {
        toast({
          title: "Nothing to narrate",
          description: "We couldn't find readable text for this verse.",
        })
        return
      }

      const languagePreferences = [
        detail?.translations?.[0]?.language,
        profile.translationLanguage,
        detail?.transliteration?.language,
        "ar-SA",
        "ar",
      ].filter((lang): lang is string => Boolean(lang))

      const selectedVoice = selectVoiceForLanguage(speechVoices, languagePreferences)
      const preferredLang =
        selectedVoice?.lang ?? normalizeLanguageTag(languagePreferences[0]) ?? "ar-SA"

      const success = speakText({
        id: verseKey,
        text: textToSpeak,
        lang: preferredLang,
        voice: selectedVoice,
        onStart: () => {
          setSpeakingVerse(ayah.numberInSurah)
        },
        onEnd: () => {
          setSpeakingVerse((current) => (current === ayah.numberInSurah ? null : current))
        },
        onError: () => {
          setSpeakingVerse((current) => (current === ayah.numberInSurah ? null : current))
          toast({
            title: "Speech error",
            description: "We couldn't finish narrating the verse. Please try again.",
            variant: "destructive",
          })
        },
      })

      if (!success) {
        toast({
          title: "Speech error",
          description: "We couldn't start narrating the verse. Please try again.",
          variant: "destructive",
        })
      }
    },
    [
      profile.showTranslation,
      profile.showTransliteration,
      profile.translationLanguage,
      speakText,
      speakingId,
      speechSupported,
      speechVoices,
      stopCurrentSpeech,
      surahNumber,
      toast,
    ],
  )

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
                "group relative rounded-2xl border border-transparent bg-white/90 p-4 transition-all duration-300 ease-in-out dark:bg-slate-900/70",
                isActive && "shadow-xl ring-2 ring-emerald-500/60",
                nightMode && "border-slate-800/60 bg-slate-900/70",
              )}
              role="listitem"
            >
              {showNavigation ? (
                <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "pointer-events-auto z-20 h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 via-teal-400 to-sky-500 text-white shadow-lg shadow-emerald-500/40 transition-transform hover:-translate-y-1 hover:scale-105 hover:from-emerald-400 hover:via-teal-300 hover:to-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 dark:shadow-emerald-900/50",
                      !canGoPrevious && "pointer-events-none opacity-40",
                    )}
                    onClick={() => handleNavigate("previous")}
                    aria-label="Go to previous verse"
                    disabled={!canGoPrevious}
                  >
                    <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                  </Button>
                  <HasanatSparkleEmitter
                    events={sparkleEvents}
                    reducedMotion={prefersReducedMotion}
                    onComplete={handleSparkleComplete}
                  >
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className={cn(
                        "pointer-events-auto z-20 h-12 w-12 rounded-full bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-500 text-white shadow-lg shadow-sky-500/40 transition-transform hover:-translate-y-1 hover:scale-105 hover:from-sky-400 hover:via-indigo-400 hover:to-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 dark:shadow-sky-900/50",
                        !canGoNext && "pointer-events-none opacity-40",
                      )}
                      onClick={() => handleNavigate("next")}
                      aria-label="Go to next verse"
                      disabled={!canGoNext}
                    >
                      <ChevronRight className="h-6 w-6" aria-hidden="true" />
                    </Button>
                  </HasanatSparkleEmitter>
                </div>
              ) : null}
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
                    className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-sky-500 text-white shadow-md shadow-emerald-500/40 opacity-100 transition-all duration-200 hover:from-emerald-300 hover:via-teal-300 hover:to-sky-400 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-emerald-200 dark:from-emerald-500 dark:via-teal-500 dark:to-sky-600"
                    onClick={() => handlePlay(ayah)}
                    aria-label={`Play verse ${ayah.numberInSurah} of ${surahMeta?.englishName ?? "selected surah"}`}
                  >
                    {isActive ? <Pause className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-10 w-10 rounded-full bg-gradient-to-br from-sky-400 via-indigo-400 to-violet-500 text-white shadow-md shadow-sky-500/40 opacity-100 transition-all duration-200 hover:from-sky-300 hover:via-indigo-300 hover:to-violet-400 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-sky-200 dark:from-sky-500 dark:via-indigo-500 dark:to-violet-600",
                      speakingVerse === ayah.numberInSurah &&
                        "ring-2 ring-offset-2 ring-sky-300 shadow-lg dark:ring-sky-500",
                      !speechSupported && "opacity-75",
                    )}
                    onClick={() => speakVerse(ayah, detail)}
                    aria-label={
                      speakingVerse === ayah.numberInSurah
                        ? `Stop speaking verse ${ayah.numberInSurah}`
                        : `Speak verse ${ayah.numberInSurah}`
                    }
                    aria-pressed={speakingVerse === ayah.numberInSurah}
                  >
                    {speakingVerse === ayah.numberInSurah ? (
                      <StopCircle className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
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
                    {detail.transliteration.translator ? (
                      <span className="ml-2 text-xs uppercase tracking-wide text-muted-foreground">
                        {detail.transliteration.translator}
                      </span>
                    ) : null}
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
