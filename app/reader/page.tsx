"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import Link from "next/link"

import { BreakEggTimer } from "@/components/break-egg-timer"
import { AudioPlayer } from "@/components/reader/audio-player"
import { MilestoneCelebration } from "@/components/reader/milestone-celebration"
import { GwaniSurahPlayer } from "@/components/reader/gwani-surah-player"
import { MushafView } from "@/components/reader/mushaf-view"
import { NightModeToggle } from "@/components/reader/night-mode-toggle"
import { MorphologyBreakdown } from "@/components/morphology-breakdown"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@/hooks/use-user"
import {
  quranAPI,
  type AudioSegment,
  type Ayah,
  type Surah,
  type Transliteration,
  type Translation,
} from "@/lib/quran-api"
import { mushafVariants } from "@/lib/integration-data"
import { cn } from "@/lib/utils"

import {
  BookOpen,
  Bookmark,
  Check,
  RotateCcw,
  Settings,
  Share,
  SkipBack,
  SkipForward,
  Sparkles,
} from "lucide-react"

const RECITER_OPTIONS = [
  { edition: "ar.alafasy", label: "Mishary Rashid" },
  { edition: "ar.husary", label: "Mahmoud Al-Husary" },
  { edition: "ar.sudais", label: "Abdul Rahman As-Sudais" },
  { edition: "ar.minshawi", label: "Mohamed Siddiq Al-Minshawi" },
]

const TRANSLATION_OPTIONS = [
  { edition: "en.sahih", label: "Sahih International" },
  { edition: "en.pickthall", label: "Muhammad Pickthall" },
  { edition: "en.yusufali", label: "Abdullah Yusuf Ali" },
]

const TRANSLITERATION_EDITION = "en.transliteration"
const TRANSLATION_VISIBILITY_STORAGE_KEY = "alfawz_reader_show_translation"
const TRANSLITERATION_VISIBILITY_STORAGE_KEY = "alfawz_reader_show_transliteration"
const NIGHT_MODE_STORAGE_KEY = "alfawz_reader_night_mode"

function usePersistentBoolean(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(defaultValue)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(key)
    if (stored !== null) {
      setValue(stored === "true")
    }
    setIsLoaded(true)
  }, [key])

  const updateValue = useCallback(
    (next: boolean) => {
      setValue(next)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, next ? "true" : "false")
      }
    },
    [key],
  )

  return [value, updateValue, isLoaded] as const
}

interface AyahDetail {
  arabic: Ayah
  translations: Translation[]
  transliteration?: Transliteration
}

export default function AlfawzReaderPage() {
  const { preferences, stats, updatePreferences } = useUser()

  const [surahs, setSurahs] = useState<Surah[]>([])
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null)
  const [surahMeta, setSurahMeta] = useState<Surah | null>(null)
  const [ayahList, setAyahList] = useState<Ayah[]>([])
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number | null>(null)
  const [ayahDetail, setAyahDetail] = useState<AyahDetail | null>(null)
  const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoadingSurah, setIsLoadingSurah] = useState(true)
  const [isLoadingAyah, setIsLoadingAyah] = useState(false)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fontScale, setFontScale] = useState(4)
  const [rawShowTranslation, setRawShowTranslation, showTranslationLoaded] =
    usePersistentBoolean(TRANSLATION_VISIBILITY_STORAGE_KEY, true)
  const [rawShowTransliteration, setRawShowTransliteration, showTransliterationLoaded] =
    usePersistentBoolean(TRANSLITERATION_VISIBILITY_STORAGE_KEY, false)
  const [versesCompleted, setVersesCompleted] = useState(0)
  const [shouldCelebrate, setShouldCelebrate] = useState(false)
  const [rawNightMode, setRawNightMode, nightModeLoaded] = usePersistentBoolean(
    NIGHT_MODE_STORAGE_KEY,
    false,
  )
  const [selectedMushaf, setSelectedMushaf] = useState(() => mushafVariants[0])
  const [showMushafView, setShowMushafView] = useState(false)

  const mushafOptions = useMemo(() => mushafVariants, [])

  const defaultReciterEdition = useMemo(() => {
    const preferred = RECITER_OPTIONS.find((option) => option.label === preferences.reciter)
    return preferred?.edition ?? RECITER_OPTIONS[0].edition
  }, [preferences.reciter])

  const defaultTranslationEdition = useMemo(() => {
    const preferred = TRANSLATION_OPTIONS.find((option) => option.label === preferences.translation)
    return preferred?.edition ?? TRANSLATION_OPTIONS[0].edition
  }, [preferences.translation])

  const [selectedReciter, setSelectedReciter] = useState(defaultReciterEdition)
  const [selectedTranslation, setSelectedTranslation] = useState(defaultTranslationEdition)
  const [playbackSpeed, setPlaybackSpeed] = useState(preferences.playbackSpeed ?? 1)
  const [volume, setVolume] = useState(0.8)

  const showTranslation = showTranslationLoaded ? rawShowTranslation : true
  const showTransliteration = showTransliterationLoaded ? rawShowTransliteration : false
  const nightMode = nightModeLoaded ? rawNightMode : false

  const dailyGoal = useMemo(() => {
    const ayahCount = surahMeta?.numberOfAyahs ?? 5
    return Math.min(Math.max(ayahCount, 3), 10)
  }, [surahMeta?.numberOfAyahs])

  const fontSizeClass = useMemo(() => {
    const map: Record<number, string> = {
      3: "text-lg",
      4: "text-xl",
      5: "text-2xl",
      6: "text-3xl",
    }
    return map[fontScale] ?? "text-2xl"
  }, [fontScale])

  const totalAyahs = surahMeta?.numberOfAyahs ?? ayahList.length
  const totalAyahDisplay = totalAyahs > 0 ? totalAyahs : "–"
  const currentAyahDisplay = selectedAyahNumber ?? "–"
  const repetitionsCompleted = Math.min(versesCompleted, dailyGoal)

  useEffect(() => {
    setSelectedReciter(defaultReciterEdition)
  }, [defaultReciterEdition])

  useEffect(() => {
    setSelectedTranslation(defaultTranslationEdition)
  }, [defaultTranslationEdition])

  useEffect(() => {
    setPlaybackSpeed(preferences.playbackSpeed ?? 1)
  }, [preferences.playbackSpeed])

  useEffect(() => {
    let active = true
    setIsLoadingSurah(true)
    ;(async () => {
      try {
        const loadedSurahs = await quranAPI.getSurahs()
        if (!active) return
        setSurahs(loadedSurahs)
        const initial = loadedSurahs[0]
        if (initial) {
          setSelectedSurahNumber(initial.number)
        }
      } catch (err) {
        console.error("Failed to load surah list", err)
        if (active) {
          setError("Unable to load surah list. Please try again later.")
        }
      } finally {
        if (active) {
          setIsLoadingSurah(false)
        }
      }
    })()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedSurahNumber) return
    let active = true
    setIsLoadingSurah(true)
    setError(null)
    setIsPlaying(false)
    setVersesCompleted(0)

    ;(async () => {
      try {
        const surahData = await quranAPI.getSurah(selectedSurahNumber)
        if (!active) return
        if (!surahData) {
          setError("Unable to load the selected surah.")
          return
        }
        setSurahMeta(surahData.surah)
        setAyahList(surahData.ayahs)
        const firstAyah = surahData.ayahs[0]
        setSelectedAyahNumber(firstAyah?.numberInSurah ?? null)
      } catch (err) {
        console.error("Failed to load surah", err)
        if (active) {
          setError("Unable to load the selected surah. Please try another surah.")
        }
      } finally {
        if (active) {
          setIsLoadingSurah(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [selectedSurahNumber])

  useEffect(() => {
    if (!selectedSurahNumber) return
    let active = true
    setIsLoadingAudio(true)
    setAudioSegments([])

    ;(async () => {
      try {
        const audio = await quranAPI.getSurahAudio(selectedSurahNumber, selectedReciter)
        if (!active) return
        setAudioSegments(audio)
      } catch (err) {
        console.error("Failed to load audio", err)
      } finally {
        if (active) {
          setIsLoadingAudio(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [selectedSurahNumber, selectedReciter])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(TRANSLATION_VISIBILITY_STORAGE_KEY, showTranslation ? "true" : "false")
  }, [showTranslation])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(TRANSLITERATION_VISIBILITY_STORAGE_KEY, showTransliteration ? "true" : "false")
  }, [showTransliteration])

  useEffect(() => {
    if (!selectedSurahNumber || !selectedAyahNumber) return
    let active = true
    setIsLoadingAyah(true)
    setError(null)

    ;(async () => {
      try {
        const editions = new Set<string>(["quran-uthmani"])
        if (showTranslation) {
          editions.add(selectedTranslation)
        }
        if (showTransliteration) {
          editions.add(TRANSLITERATION_EDITION)
        }
        const editionsArray = Array.from(editions)
        const detail = await quranAPI.getAyah(selectedSurahNumber, selectedAyahNumber, editionsArray)
        if (!active) return
        if (!detail) {
          setError("Unable to load ayah details.")
          return
        }
        setAyahDetail(detail)
      } catch (err) {
        console.error("Failed to load ayah", err)
        if (active) {
          setError("Unable to load the ayah. Please try again.")
        }
      } finally {
        if (active) {
          setIsLoadingAyah(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [selectedSurahNumber, selectedAyahNumber, selectedTranslation, showTranslation, showTransliteration])

  const audioUrl = useMemo(() => {
    if (!selectedAyahNumber) return undefined
    const index = selectedAyahNumber - 1
    return audioSegments[index]?.url
  }, [audioSegments, selectedAyahNumber])

  const handleNightModeToggle = useCallback(
    (value: boolean) => {
      setRawNightMode(value)
    },
    [setRawNightMode],
  )

  const handleReciterChange = useCallback(
    (edition: string) => {
      setSelectedReciter(edition)
      const label = RECITER_OPTIONS.find((option) => option.edition === edition)?.label
      if (label && label !== preferences.reciter) {
        void updatePreferences({ reciter: label })
      }
    },
    [preferences.reciter, updatePreferences],
  )

  const handleTranslationChange = useCallback(
    (edition: string) => {
      setSelectedTranslation(edition)
      const label = TRANSLATION_OPTIONS.find((option) => option.edition === edition)?.label
      if (label && label !== preferences.translation) {
        void updatePreferences({ translation: label, translationLanguage: "en" })
      }
    },
    [preferences.translation, updatePreferences],
  )

  const handlePlaybackSpeedChange = useCallback(
    (speed: number) => {
      setPlaybackSpeed(speed)
      if (speed !== preferences.playbackSpeed) {
        void updatePreferences({ playbackSpeed: speed })
      }
    },
    [preferences.playbackSpeed, updatePreferences],
  )

  const handleNextAyah = useCallback(() => {
    setSelectedAyahNumber((prev) => {
      if (!prev) return prev
      if (prev >= ayahList.length) return prev
      return prev + 1
    })
    setIsPlaying(false)
  }, [ayahList.length])

  const handlePreviousAyah = useCallback(() => {
    setSelectedAyahNumber((prev) => {
      if (!prev) return prev
      if (prev <= 1) return prev
      return prev - 1
    })
    setIsPlaying(false)
  }, [])

  const handleAyahSelection = useCallback((value: string) => {
    const ayahNumber = Number.parseInt(value)
    if (Number.isNaN(ayahNumber)) return
    setSelectedAyahNumber(ayahNumber)
    setIsPlaying(false)
  }, [])

  const markAyahCompleted = useCallback(() => {
    setVersesCompleted((prev) => {
      if (prev >= dailyGoal) {
        return prev
      }

      const next = prev + 1
      if (next >= dailyGoal) {
        setShouldCelebrate(true)
      }
      return next
    })
  }, [dailyGoal])

  const closeCelebration = useCallback(() => {
    setShouldCelebrate(false)
  }, [])

  const nightModeBackground = nightMode ? "bg-slate-950 text-slate-100" : "bg-gradient-cream text-slate-900"
  const goalReached = versesCompleted >= dailyGoal
  const cardBackground = nightMode ? "border-slate-700 bg-slate-900/70" : "border-border/50 bg-white/90"
  const hasPreviousAyah = selectedAyahNumber !== null && selectedAyahNumber > 1
  const hasNextAyah = selectedAyahNumber !== null && selectedAyahNumber < ayahList.length

  return (
    <div className={cn("min-h-screen pb-16 transition-colors", nightModeBackground)}>
      <MilestoneCelebration
        show={shouldCelebrate}
        title="MashaAllah! Goal achieved"
        message="You have completed today’s recitation goal. Keep nurturing your Qur’anic journey."
        onClose={closeCelebration}
      />

      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-maroon-600 to-amber-500 text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-semibold">AlFawz Reader</h1>
                {surahMeta && (
                  <p className="text-xs text-muted-foreground">
                    Surah {surahMeta.number} • {surahMeta.englishName}
                  </p>
                )}
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <NightModeToggle enabled={nightMode} onChange={handleNightModeToggle} />
            <Button variant="outline" size="sm" className="bg-transparent">
              <Bookmark className="mr-2 h-4 w-4" />
              Bookmark
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6">
          <BreakEggTimer />
        </div>

        <Card className={cn("shadow-lg", cardBackground, selectedMushaf.visualStyle.background)}>
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl text-maroon-900 dark:text-amber-100">
                  {surahMeta ? `${surahMeta.name} – ${surahMeta.englishName}` : "Loading…"}
                </CardTitle>
                {surahMeta && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {surahMeta.numberOfAyahs} Ayahs • {surahMeta.revelationType} Revelation
                  </p>
                )}
              </div>
              {selectedAyahNumber && (
                <Badge className="bg-gradient-to-r from-maroon-600 to-amber-500 text-white">Ayah {selectedAyahNumber}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Select Surah</Label>
                <Select
                  value={selectedSurahNumber?.toString() ?? ""}
                  onValueChange={(value) => {
                    const surahNumber = Number.parseInt(value)
                    if (!Number.isNaN(surahNumber)) {
                      setSelectedSurahNumber(surahNumber)
                    }
                  }}
                >
                  <SelectTrigger className="bg-white/90 dark:bg-slate-900/70">
                    <SelectValue placeholder="Choose a surah" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {surahs.map((surah) => (
                      <SelectItem key={surah.number} value={surah.number.toString()}>
                        {surah.number}. {surah.englishName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Select Ayah</Label>
                <Select value={selectedAyahNumber?.toString() ?? ""} onValueChange={handleAyahSelection}>
                  <SelectTrigger className="bg-white/90 dark:bg-slate-900/70">
                    <SelectValue placeholder="Ayah" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {ayahList.map((ayah) => (
                      <SelectItem key={ayah.number} value={ayah.numberInSurah.toString()}>
                        Ayah {ayah.numberInSurah}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Reciter</Label>
                <Select value={selectedReciter} onValueChange={handleReciterChange}>
                  <SelectTrigger className="bg-white/90 dark:bg-slate-900/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECITER_OPTIONS.map((reciter) => (
                      <SelectItem key={reciter.edition} value={reciter.edition}>
                        {reciter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Translation</Label>
                <Select value={selectedTranslation} onValueChange={handleTranslationChange}>
                  <SelectTrigger className="bg-white/90 dark:bg-slate-900/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSLATION_OPTIONS.map((translation) => (
                      <SelectItem key={translation.edition} value={translation.edition}>
                        {translation.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {surahMeta && (
                  <Badge className="bg-emerald-100 text-emerald-800">{surahMeta.revelationType}</Badge>
                )}
                {surahMeta && (
                  <Badge variant="outline">{surahMeta.numberOfAyahs} Ayahs</Badge>
                )}
                <Badge className={selectedMushaf.visualStyle.badge}>{selectedMushaf.name}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-maroon-600" />
                <Link href="/practice" className="text-sm font-medium text-maroon-700 hover:underline">
                  Launch AI Lab
                </Link>
              </div>
            </div>

            <div
              className={cn(
                "relative overflow-hidden rounded-xl border-2 px-6 py-8 shadow-sm",
                selectedMushaf.visualStyle.border,
                nightMode ? "bg-slate-950/60" : "bg-white/90",
                showMushafView && "px-0 py-0",
              )}
            >
              {!showMushafView && hasPreviousAyah && (
                <>
                  <div
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute inset-y-0 left-0 z-0 w-20 bg-gradient-to-r",
                      nightMode
                        ? "from-slate-950/80 via-slate-900/50 to-transparent"
                        : "from-white/95 via-emerald-50/60 to-transparent",
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Previous ayah"
                    onClick={handlePreviousAyah}
                    className={cn(
                      "absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 hover:-translate-y-0.5",
                      nightMode
                        ? "border-emerald-500/40 bg-slate-900/70 text-emerald-200 hover:bg-slate-900/60"
                        : "border-emerald-200/70 bg-white/90 text-emerald-700 hover:bg-white",
                    )}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                </>
              )}
              {!showMushafView && hasNextAyah && (
                <>
                  <div
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute inset-y-0 right-0 z-0 w-20 bg-gradient-to-l",
                      nightMode
                        ? "from-slate-950/80 via-slate-900/50 to-transparent"
                        : "from-white/95 via-emerald-50/60 to-transparent",
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Next ayah"
                    onClick={handleNextAyah}
                    className={cn(
                      "absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 hover:-translate-y-0.5",
                      nightMode
                        ? "border-emerald-500/40 bg-slate-900/70 text-emerald-200 hover:bg-slate-900/60"
                        : "border-emerald-200/70 bg-white/90 text-emerald-700 hover:bg-white",
                    )}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </>
              )}

              {isLoadingAyah ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <div className={cn("space-y-6", showMushafView && "px-6 py-6")}>
                  {showMushafView ? (
                    <MushafView
                      ayahs={ayahList}
                      selectedAyahNumber={selectedAyahNumber}
                      nightMode={nightMode}
                    />
                  ) : (
                    <div className="rounded-2xl bg-gradient-to-br from-white to-emerald-50 p-8 shadow-inner">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center justify-center border w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent [a&]:hover:bg-primary/90 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Ayah {currentAyahDisplay} of {totalAyahDisplay}
                        </span>
                        <span className="text-xs font-medium text-emerald-600">
                          Repetitions {repetitionsCompleted} / {dailyGoal}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "mt-6 leading-relaxed text-slate-900 md:text-[1.875rem]",
                          fontSizeClass,
                          "font-arabic text-right",
                        )}
                      >
                        {ayahDetail?.arabic?.text ?? ""}
                      </p>
                      {showTranslation && ayahDetail?.translations?.length
                        ? ayahDetail.translations.map((translation, index) => (
                            <p
                              key={`${translation.translator}-${index}`}
                              className={cn(
                                "text-base leading-relaxed text-slate-600",
                                index === 0 ? "mt-4" : "mt-2",
                              )}
                            >
                              {translation.text}
                              {translation.translator ? ` — ${translation.translator}` : ""}
                            </p>
                          ))
                        : null}
                    </div>
                  )}

                  {showTransliteration && ayahDetail?.transliteration ? (
                    <p className="text-sm italic text-slate-600 dark:text-slate-300">
                      {ayahDetail.transliteration.text}
                    </p>
                  ) : null}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Switch
                  checked={showTranslation}
                  onCheckedChange={(checked) => setRawShowTranslation(checked === true)}
                  id="toggle-translation"
                />
                <Label htmlFor="toggle-translation" className="text-sm text-muted-foreground">
                  Show translation
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showTransliteration}
                  onCheckedChange={(checked) => setRawShowTransliteration(checked === true)}
                  id="toggle-transliteration"
                />
                <Label htmlFor="toggle-transliteration" className="text-sm text-muted-foreground">
                  Show transliteration
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showMushafView}
                  onCheckedChange={(checked) => setShowMushafView(checked === true)}
                  id="toggle-mushaf"
                />
                <Label htmlFor="toggle-mushaf" className="text-sm text-muted-foreground">
                  Mushaf view
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={markAyahCompleted} disabled={goalReached}>
                  <Check className="mr-2 h-4 w-4" /> Mark ayah complete
                </Button>
                <Badge variant="outline" className="text-xs">
                  {Math.min(versesCompleted, dailyGoal)} / {dailyGoal} today
                </Badge>
              </div>
            </div>

            <AudioPlayer
              source={audioUrl}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying((prev) => !prev)}
              onNext={selectedAyahNumber && selectedAyahNumber < ayahList.length ? handleNextAyah : undefined}
              onPrevious={selectedAyahNumber && selectedAyahNumber > 1 ? handlePreviousAyah : undefined}
              playbackSpeed={playbackSpeed}
              onPlaybackSpeedChange={handlePlaybackSpeedChange}
              volume={volume}
              onVolumeChange={setVolume}
              disabled={isLoadingAudio || !audioUrl}
              onEnded={handleNextAyah}
              className={nightMode ? "border-slate-700 bg-slate-900/60" : undefined}
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className={cn("border border-emerald-200 bg-emerald-50/80", nightMode && "border-emerald-400/60 bg-emerald-900/40") }>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-emerald-800 dark:text-emerald-200">Mushaf Highlights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-emerald-900 dark:text-emerald-200">
                  <div className="font-arabic rounded-lg border border-emerald-200 bg-white/90 p-3 text-right text-xl shadow-sm dark:border-emerald-400/50 dark:bg-emerald-900/40">
                    {selectedMushaf.ayahExample.arabic}
                  </div>
                  <p>{selectedMushaf.ayahExample.guidance}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMushaf.highlights.map((highlight) => (
                      <Badge key={highlight} className={selectedMushaf.visualStyle.badge}>
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedSurahNumber && selectedAyahNumber && (
                <MorphologyBreakdown ayahReference={`${selectedSurahNumber}:${selectedAyahNumber}`} />
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className={cn("border border-purple-200 bg-purple-50/80", nightMode && "border-purple-400/60 bg-purple-900/30") }>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-purple-800 dark:text-purple-200">Reader Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
                  <div className="space-y-2">
                    <p className="font-medium">Font size</p>
                    <Slider value={[fontScale]} onValueChange={(value) => setFontScale(value[0] ?? 4)} min={3} max={6} step={1} />
                    <p className="text-xs text-muted-foreground">Current size: {fontSizeClass.replace("text-", "")}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Mushaf variant</p>
                    <div className="flex flex-wrap gap-2">
                      {mushafOptions.map((variant) => (
                        <Button
                          key={variant.id}
                          variant={variant.id === selectedMushaf.id ? "default" : "outline"}
                          className={
                            variant.id === selectedMushaf.id
                              ? "bg-maroon-600 text-white"
                              : nightMode
                                ? "border-slate-600 text-slate-200"
                                : "border-maroon-200 text-maroon-700"
                          }
                          size="sm"
                          onClick={() => setSelectedMushaf(variant)}
                        >
                          {variant.name}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedMushaf.description}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className={cn("border border-slate-200 bg-white/80", nightMode && "border-slate-700 bg-slate-900/60") }>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-800 dark:text-slate-200">Reader shortcuts</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 text-xs text-slate-700 dark:text-slate-200 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-600">
                    <p className="font-semibold text-maroon-700 dark:text-amber-200">Reset layout</p>
                    <p>Restore default font, translation, and Mushaf settings.</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-maroon-700 dark:text-amber-200"
                      onClick={() => {
                        setFontScale(4)
                        setRawShowTranslation(true)
                        setRawShowTransliteration(false)
                        setSelectedMushaf(mushafVariants[0])
                      }}
                    >
                      <RotateCcw className="mr-1 h-4 w-4" /> Reset
                    </Button>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-600">
                    <p className="font-semibold text-maroon-700 dark:text-amber-200">Toggle visibility</p>
                    <p>Show or hide translations and transliteration instantly.</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRawShowTranslation(!showTranslation)}
                      >
                        {showTranslation ? "Hide" : "Show"} translation
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRawShowTransliteration(!showTransliteration)}
                      >
                        {showTransliteration ? "Hide" : "Show"} transliteration
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-3">
            <GwaniSurahPlayer surahs={surahs} nightMode={nightMode} />
          </div>

          <div className="space-y-6">
            <Card className={cn("border border-amber-200 bg-amber-50/80", nightMode && "border-amber-500/50 bg-amber-900/30") }>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-amber-800 dark:text-amber-200">Daily progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
                <p>
                  Today’s verses completed: <strong>{versesCompleted}</strong> / {dailyGoal}
                </p>
                <p>
                  Current streak: <strong>{stats.streak}</strong> days
                </p>
                <p>
                  Total ayahs read: <strong>{stats.ayahsRead}</strong>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

