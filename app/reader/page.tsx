"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import Link from "next/link"

import { AudioPlayer } from "@/components/reader/audio-player"
import { MilestoneCelebration } from "@/components/reader/milestone-celebration"
import { GwaniSurahPlayer } from "@/components/reader/gwani-surah-player"
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
const NIGHT_MODE_STORAGE_KEY = "alfawz_reader_night_mode"

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
  const [showTranslation, setShowTranslation] = useState(preferences.showTranslation ?? true)
  const [showTransliteration, setShowTransliteration] = useState(preferences.showTransliteration ?? false)
  const [versesCompleted, setVersesCompleted] = useState(0)
  const [shouldCelebrate, setShouldCelebrate] = useState(false)
  const [nightMode, setNightMode] = useState(false)
  const [selectedMushaf, setSelectedMushaf] = useState(() => mushafVariants[0])

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

  const dailyGoal = useMemo(() => {
    const ayahCount = surahMeta?.numberOfAyahs ?? 5
    return Math.min(Math.max(ayahCount, 3), 10)
  }, [surahMeta?.numberOfAyahs])

  const fontSizeClass = useMemo(() => {
    const map: Record<number, string> = {
      3: "text-3xl",
      4: "text-4xl",
      5: "text-5xl",
      6: "text-6xl",
    }
    return map[fontScale] ?? "text-4xl"
  }, [fontScale])

  useEffect(() => {
    if (typeof window === "undefined") return
    const storedNightMode = window.localStorage.getItem(NIGHT_MODE_STORAGE_KEY)
    if (storedNightMode !== null) {
      setNightMode(storedNightMode === "true")
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(NIGHT_MODE_STORAGE_KEY, nightMode ? "true" : "false")
  }, [nightMode])

  useEffect(() => {
    setSelectedReciter(defaultReciterEdition)
  }, [defaultReciterEdition])

  useEffect(() => {
    setSelectedTranslation(defaultTranslationEdition)
  }, [defaultTranslationEdition])

  useEffect(() => {
    setShowTranslation(preferences.showTranslation ?? true)
  }, [preferences.showTranslation])

  useEffect(() => {
    setShowTransliteration(preferences.showTransliteration ?? false)
  }, [preferences.showTransliteration])

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
    if (!selectedSurahNumber || !selectedAyahNumber) return
    let active = true
    setIsLoadingAyah(true)
    setError(null)

    ;(async () => {
      try {
        const editions = Array.from(new Set(["quran-uthmani", selectedTranslation, TRANSLITERATION_EDITION]))
        const detail = await quranAPI.getAyah(selectedSurahNumber, selectedAyahNumber, editions)
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
  }, [selectedSurahNumber, selectedAyahNumber, selectedTranslation])

  const audioUrl = useMemo(() => {
    if (!selectedAyahNumber) return undefined
    const index = selectedAyahNumber - 1
    return audioSegments[index]?.url
  }, [audioSegments, selectedAyahNumber])

  const handleNightModeToggle = useCallback((value: boolean) => {
    setNightMode(value)
  }, [])

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

  const handleShowTranslationChange = useCallback(
    (checked: boolean) => {
      setShowTranslation(checked)
      if (preferences.showTranslation !== checked) {
        void updatePreferences({ showTranslation: checked })
      }
    },
    [preferences.showTranslation, updatePreferences],
  )

  const handleShowTransliterationChange = useCallback(
    (checked: boolean) => {
      setShowTransliteration(checked)
      if (preferences.showTransliteration !== checked) {
        void updatePreferences({ showTransliteration: checked })
      }
    },
    [preferences.showTransliteration, updatePreferences],
  )

  const markAyahCompleted = useCallback(() => {
    setVersesCompleted((prev) => {
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
  const cardBackground = nightMode ? "border-slate-700 bg-slate-900/70" : "border-border/50 bg-white/90"

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

        <GwaniSurahPlayer surahs={surahs} nightMode={nightMode} />

        <div className="grid gap-8 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-3">
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Select Surah</Label>
                    <Select
                      value={selectedSurahNumber?.toString()}
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
                    <Select value={selectedAyahNumber?.toString()} onValueChange={handleAyahSelection}>
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
                    "rounded-xl border-2 px-6 py-8 shadow-sm",
                    selectedMushaf.visualStyle.border,
                    nightMode ? "bg-slate-950/60" : "bg-white/90",
                  )}
                >
                  {isLoadingAyah ? (
                    <Skeleton className="h-24 w-full" />
                  ) : (
                    <p className={cn("font-arabic text-right leading-relaxed text-maroon-900 dark:text-amber-100", fontSizeClass)}>
                      {ayahDetail?.arabic?.text ?? ""}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showTranslation}
                      onCheckedChange={handleShowTranslationChange}
                      id="toggle-translation"
                    />
                    <Label htmlFor="toggle-translation" className="text-sm text-muted-foreground">
                      Show translation
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showTransliteration}
                      onCheckedChange={handleShowTransliterationChange}
                      id="toggle-transliteration"
                    />
                    <Label htmlFor="toggle-transliteration" className="text-sm text-muted-foreground">
                      Show transliteration
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={markAyahCompleted}>
                      <Check className="mr-2 h-4 w-4" /> Mark ayah complete
                    </Button>
                    <Badge variant="outline" className="text-xs">
                      {versesCompleted} / {dailyGoal} today
                    </Badge>
                  </div>
                </div>

                {showTranslation && ayahDetail?.translations?.length ? (
                  <div className="rounded-lg bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                    {ayahDetail.translations.map((translation) => (
                      <div key={translation.translator} className="space-y-2">
                        <p>{translation.text}</p>
                        <p className="text-xs text-muted-foreground">— {translation.translator}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {showTransliteration && ayahDetail?.transliteration && (
                  <p className="text-sm italic text-slate-600 dark:text-slate-300">
                    {ayahDetail.transliteration.text}
                  </p>
                )}

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
                            handleShowTranslationChange(true)
                            handleShowTransliterationChange(false)
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
                            onClick={() => handleShowTranslationChange(!showTranslation)}
                          >
                            {showTranslation ? "Hide" : "Show"} translation
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowTransliterationChange(!showTransliteration)}
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
          </div>

          <div className="space-y-6">
            <Card className={cn("border border-maroon-200 bg-white/80", nightMode && "border-maroon-500/60 bg-slate-900/60") }>
              <CardHeader>
                <CardTitle className="text-lg text-maroon-800 dark:text-amber-200">Ayah Navigator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingSurah ? (
                  <Skeleton className="h-48 w-full" />
                ) : (
                  <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-2">
                    {ayahList.map((ayah) => (
                      <button
                        key={ayah.number}
                        onClick={() => handleAyahSelection(ayah.numberInSurah.toString())}
                        className={cn(
                          "w-full rounded-lg border px-4 py-3 text-left transition",
                          selectedAyahNumber === ayah.numberInSurah
                            ? "border-maroon-300 bg-maroon-50 text-maroon-800 shadow dark:border-amber-400/60 dark:bg-amber-500/20 dark:text-amber-100"
                            : "border-slate-200 bg-white/70 hover:bg-cream-100 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800/60",
                        )}
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold">Ayah {ayah.numberInSurah}</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round((ayah.numberInSurah / (surahMeta?.numberOfAyahs ?? 1)) * 100)}%
                          </Badge>
                        </div>
                        <p className="mt-2 font-arabic text-right text-lg text-maroon-900 dark:text-amber-100">
                          {ayah.text}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

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

