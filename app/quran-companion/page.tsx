"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import Link from "next/link"

import { HasanatCelebration } from "@/components/reader/hasanat-celebration"
import { MilestoneCelebration } from "@/components/reader/milestone-celebration"
import { GwaniSurahPlayer } from "@/components/reader/gwani-surah-player"
import { MushafView } from "@/components/reader/mushaf-view"
import { NightModeToggle } from "@/components/reader/night-mode-toggle"
import { QuranReaderContainer } from "@/components/reader/quran-reader-container"
import { ReaderTogglePanel } from "@/components/reader/reader-toggle-panel"
import { EggChallengeWidget } from "@/components/reader/egg-challenge-widget"
import { MorphologyBreakdown } from "@/components/morphology-breakdown"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useHasanatTracker } from "@/hooks/use-hasanat-tracker"
import { useReaderChallenge } from "@/hooks/use-reader-challenge"
import { useUser } from "@/hooks/use-user"
import { quranAPI, type AudioSegment, type Ayah, type Surah } from "@/lib/quran-api"
import { mushafVariants } from "@/lib/integration-data"
import {
  DEFAULT_PROFILE,
  loadReaderProfile,
  updateProfile as mergeReaderProfile,
  type ReaderProfile,
} from "@/lib/reader/preference-manager"
import { buildVerseKey } from "@/lib/hasanat"
import { cn } from "@/lib/utils"

import {
  BookOpen,
  Bookmark,
  Check,
  ChevronDown,
  Sparkles,
  Settings,
  Share,
} from "lucide-react"

const RECITER_OPTIONS = [
  { edition: "ar.alafasy", label: "Mishary Rashid" },
  { edition: "ar.husary", label: "Mahmoud Al-Husary" },
  { edition: "ar.sudais", label: "Abdul Rahman As-Sudais" },
  { edition: "ar.minshawi", label: "Mohamed Siddiq Al-Minshawi" },
  { edition: "ar.abdulbasitmurattal", label: "Abdul Basit (Murattal)" },
  { edition: "ar.muhammadayyoub", label: "Muhammad Ayyoub" },
]

const DEFAULT_TRANSLATION_OPTIONS = [
  { edition: "en.sahih", label: "Sahih International", language: "en" },
  { edition: "ur.jalandhry", label: "Fateh Muhammad Jalandhry", language: "ur" },
  { edition: "id.indonesian", label: "Bahasa Indonesia", language: "id" },
  { edition: "fr.hamidullah", label: "Muhammad Hamidullah", language: "fr" },
  { edition: "sw.barwani", label: "Ali Muhsin Al-Barwani", language: "sw" },
]

const DEFAULT_TRANSLITERATION_OPTIONS = [
  { edition: "en.transliteration", label: "English Transliteration", language: "en" },
]

const TRANSLATION_LANGUAGES = new Set(["en", "ur", "id", "fr", "sw"])

const TRANSLATION_LANGUAGE_LABELS: Record<string, string> = {
  en: "ENG",
  ur: "URD",
  id: "IND",
  fr: "FRA",
  sw: "SWA",
}

export default function QuranCompanionWorkspacePage() {
  const { preferences, stats, updatePreferences } = useUser()

  const [surahs, setSurahs] = useState<Surah[]>([])
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null)
  const [surahMeta, setSurahMeta] = useState<Surah | null>(null)
  const [ayahList, setAyahList] = useState<Ayah[]>([])
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number | null>(null)
  const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [versesCompleted, setVersesCompleted] = useState(0)
  const [shouldCelebrate, setShouldCelebrate] = useState(false)
  const [translationOptions, setTranslationOptions] = useState(DEFAULT_TRANSLATION_OPTIONS)
  const [transliterationOptions, setTransliterationOptions] = useState(DEFAULT_TRANSLITERATION_OPTIONS)
  const [systemPrefersDark, setSystemPrefersDark] = useState(false)
  const [profile, setProfile] = useState<ReaderProfile>(DEFAULT_PROFILE)
  const [configOpen, setConfigOpen] = useState(true)
  const [insightView, setInsightView] = useState<"mushaf" | "morphology">("mushaf")

  useEffect(() => {
    const storedProfile = loadReaderProfile()
    setProfile(storedProfile)
  }, [])

  const selectedMushaf = mushafVariants[0]

  const defaultReciterEdition = useMemo(() => {
    const preferred = RECITER_OPTIONS.find((option) => option.label === preferences.reciter)
    return preferred?.edition ?? RECITER_OPTIONS[0].edition
  }, [preferences.reciter])

  const dailyGoal = useMemo(() => {
    const ayahCount = surahMeta?.numberOfAyahs ?? 5
    return Math.min(Math.max(ayahCount, 3), 10)
  }, [surahMeta?.numberOfAyahs])

  const totalAyahs = surahMeta?.numberOfAyahs ?? ayahList.length
  const totalAyahDisplay = totalAyahs > 0 ? totalAyahs : "–"
  const currentAyahDisplay = selectedAyahNumber ?? "–"
  const repetitionsCompleted = Math.min(versesCompleted, dailyGoal)

  const nightMode = profile.theme === "dark" || (profile.theme === "auto" && systemPrefersDark)

  const {
    recordRecitation,
    sparkles,
    removeSparkle,
    celebration: hasanatCelebration,
    dismissCelebration,
  } = useHasanatTracker({ initialDailyGoal: dailyGoal })

  const {
    snapshot: challengeSnapshot,
    loading: challengeLoading,
    updating: challengeUpdating,
    error: challengeError,
    celebration: challengeCelebration,
    recordVerse: recordChallengeVerse,
    reset: resetChallenge,
    dismissCelebration: dismissChallengeCelebration,
  } = useReaderChallenge()

  useEffect(() => {
    if (typeof window === "undefined") return
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setSystemPrefersDark(event.matches)
    }
    handleChange(media)
    media.addEventListener("change", handleChange)
    return () => media.removeEventListener("change", handleChange)
  }, [])

  const handleDismissChallengeCelebration = useCallback(() => {
    dismissChallengeCelebration()
  }, [dismissChallengeCelebration])

  const handleChallengeReset = useCallback(async () => {
    await resetChallenge()
    dismissChallengeCelebration()
  }, [resetChallenge, dismissChallengeCelebration])

  const updateReaderProfile = useCallback(
    (update: Partial<ReaderProfile>) => {
      setProfile((previous) => mergeReaderProfile(previous, update))
    },
    [],
  )

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const editions = await quranAPI.getEditions()
        if (!active || editions.length === 0) return

        const translations = editions
          .filter((edition) => edition.type === "translation" && TRANSLATION_LANGUAGES.has(edition.language))
          .map((edition) => ({
            edition: edition.identifier,
            label: edition.englishName ?? edition.name,
            language: edition.language,
          }))

        const transliterations = editions
          .filter((edition) => edition.type === "transliteration")
          .map((edition) => ({
            edition: edition.identifier,
            label: edition.englishName ?? edition.name,
            language: edition.language,
          }))

        if (translations.length) {
          setTranslationOptions(translations)
        }
        if (transliterations.length) {
          setTransliterationOptions(transliterations)
        }
      } catch (err) {
        console.error("Failed to load editions", err)
      }
    })()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    setProfile((previous) => {
      const updates: Partial<ReaderProfile> = {}
      if (!previous.reciterEdition) {
        updates.reciterEdition = defaultReciterEdition
      }

      const translationMatch = translationOptions.find((option) => option.edition === previous.translationEdition)
      if (!translationMatch && translationOptions[0]) {
        updates.translationEdition = translationOptions[0].edition
        updates.translationLanguage = translationOptions[0].language
      } else if (translationMatch && previous.translationLanguage !== translationMatch.language) {
        updates.translationLanguage = translationMatch.language
      }

      const transliterationMatch = transliterationOptions.find(
        (option) => option.edition === previous.transliterationEdition,
      )
      if (!transliterationMatch && transliterationOptions[0]) {
        updates.transliterationEdition = transliterationOptions[0].edition
      }

      if (Object.keys(updates).length === 0) {
        return previous
      }

      return mergeReaderProfile(previous, updates)
    })
  }, [defaultReciterEdition, translationOptions, transliterationOptions])

  useEffect(() => {
    if (!preferences.playbackSpeed) return
    if (preferences.playbackSpeed !== profile.playbackSpeed) {
      updateReaderProfile({ playbackSpeed: preferences.playbackSpeed })
    }
  }, [preferences.playbackSpeed, profile.playbackSpeed, updateReaderProfile])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const loadedSurahs = await quranAPI.getSurahs()
        if (!active) return
        setSurahs(loadedSurahs)
        const initial = loadedSurahs[0]
        if (initial) {
          setSelectedSurahNumber((previous) => previous ?? initial.number)
        }
      } catch (err) {
        console.error("Failed to load surah list", err)
        if (active) {
          setError("Unable to load surah list. Please try again later.")
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
    setError(null)
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
        setSelectedAyahNumber((previous) => previous ?? surahData.ayahs[0]?.numberInSurah ?? null)
      } catch (err) {
        console.error("Failed to load surah", err)
        if (active) {
          setError("Unable to load the selected surah. Please try another surah.")
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
    setAudioSegments([])

    ;(async () => {
      try {
        const audio = await quranAPI.getSurahAudio(selectedSurahNumber, profile.reciterEdition)
        if (!active) return
        setAudioSegments(audio)
      } catch (err) {
        console.error("Failed to load audio", err)
      }
    })()

    return () => {
      active = false
    }
  }, [selectedSurahNumber, profile.reciterEdition])

  useEffect(() => {
    const reciterLabel = RECITER_OPTIONS.find((option) => option.edition === profile.reciterEdition)?.label
    if (reciterLabel && reciterLabel !== preferences.reciter) {
      void updatePreferences({ reciter: reciterLabel })
    }
  }, [preferences.reciter, profile.reciterEdition, updatePreferences])

  useEffect(() => {
    const translation = translationOptions.find((option) => option.edition === profile.translationEdition)
    if (translation) {
      if (
        translation.label !== preferences.translation ||
        translation.language !== preferences.translationLanguage
      ) {
        void updatePreferences({ translation: translation.label, translationLanguage: translation.language })
      }
    }
  }, [preferences.translation, preferences.translationLanguage, profile.translationEdition, translationOptions, updatePreferences])

  useEffect(() => {
    if (profile.playbackSpeed !== (preferences.playbackSpeed ?? profile.playbackSpeed)) {
      void updatePreferences({ playbackSpeed: profile.playbackSpeed })
    }
  }, [preferences.playbackSpeed, profile.playbackSpeed, updatePreferences])

  const handleNightModeToggle = useCallback(
    (value: boolean) => {
      updateReaderProfile({ theme: value ? "dark" : "light" })
    },
    [updateReaderProfile],
  )

  const handleReciterChange = useCallback(
    (edition: string) => {
      updateReaderProfile({ reciterEdition: edition })
    },
    [updateReaderProfile],
  )

  const handleTranslationChange = useCallback(
    (edition: string) => {
      const translation = translationOptions.find((option) => option.edition === edition)
      updateReaderProfile({
        translationEdition: edition,
        translationLanguage: translation?.language ?? "en",
      })
    },
    [translationOptions, updateReaderProfile],
  )

  const handleAyahSelection = useCallback((value: string) => {
    const ayahNumber = Number.parseInt(value)
    if (Number.isNaN(ayahNumber)) return
    setSelectedAyahNumber(ayahNumber)
  }, [])

  const markAyahCompleted = useCallback(() => {
    setVersesCompleted((previous) => {
      if (previous >= dailyGoal) {
        return previous
      }

      const next = previous + 1
      if (next >= dailyGoal) {
        setShouldCelebrate(true)
      }
      return next
    })
  }, [dailyGoal])

  const handleNextAyah = useCallback(
    (currentAyah: Ayah | null, nextAyah: Ayah | null) => {
      if (!selectedSurahNumber || !currentAyah) {
        return false
      }

      const result = recordRecitation({
        surahNumber: selectedSurahNumber,
        surahName: surahMeta?.englishName,
        verses: [
          {
            verseKey: buildVerseKey(selectedSurahNumber, currentAyah.numberInSurah),
            text: currentAyah.text,
            juz: currentAyah.juz,
          },
        ],
        shouldCount: true,
        completedGoal: versesCompleted + 1 >= dailyGoal,
        isSurahCompletion: !nextAyah,
        completedJuzIds:
          !nextAyah || nextAyah.juz !== currentAyah.juz ? [currentAyah.juz] : [],
      })

      if (result) {
        markAyahCompleted()
      }

      void recordChallengeVerse(1)

      if (nextAyah) {
        setSelectedAyahNumber(nextAyah.numberInSurah)
      }

      return true
    },
    [
      dailyGoal,
      markAyahCompleted,
      recordChallengeVerse,
      recordRecitation,
      selectedSurahNumber,
      surahMeta?.englishName,
      versesCompleted,
    ],
  )

  const closeCelebration = useCallback(() => {
    setShouldCelebrate(false)
  }, [])

  const nightModeBackground = nightMode ? "bg-slate-950 text-slate-100" : "bg-gradient-cream text-slate-900"
  const cardBackground = nightMode ? "border-slate-700 bg-slate-900/70" : "border-border/50 bg-white/90"
  const goalReached = versesCompleted >= dailyGoal

  return (
    <div className={cn("min-h-screen pb-20 transition-colors", nightModeBackground)}>
      <HasanatCelebration celebration={hasanatCelebration} onClose={dismissCelebration} nightMode={nightMode} />
      <MilestoneCelebration
        show={shouldCelebrate}
        title="MashaAllah! Goal achieved"
        message="You have completed today’s recitation goal. Keep nurturing your Qur’anic journey."
        onClose={closeCelebration}
      />

      <ReaderTogglePanel
        profile={profile}
        onProfileChange={updateReaderProfile}
        translationOptions={translationOptions}
        transliterationOptions={transliterationOptions}
        reciterOptions={RECITER_OPTIONS}
      />

      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-amber-500 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold">Quran Companion</h1>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                  Workspace
                </Badge>
              </div>
              {surahMeta ? (
                <p className="text-xs text-muted-foreground">
                  Surah {surahMeta.number} • {surahMeta.englishName}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Select a surah to begin your session.</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NightModeToggle enabled={nightMode} onChange={handleNightModeToggle} />
            <Button variant="outline" size="sm" className="bg-transparent">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent">
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent">
              <Settings className="h-4 w-4" />
            </Button>
            <Button asChild size="sm" className="hidden bg-emerald-600 text-white hover:bg-emerald-500 sm:inline-flex">
              <Link href="/reader">Return to full reader</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-6 flex w-full max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8">
        <EggChallengeWidget
          snapshot={challengeSnapshot}
          celebration={challengeCelebration}
          loading={challengeLoading}
          updating={challengeUpdating}
          onContinue={handleDismissChallengeCelebration}
          onReset={handleChallengeReset}
        />
        {challengeError ? (
          <Alert variant="destructive" role="alert">
            <AlertTitle>Unable to update challenge</AlertTitle>
            <AlertDescription>{challengeError}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <Collapsible open={configOpen} onOpenChange={setConfigOpen}>
            <Card className={cn("shadow-lg", cardBackground, selectedMushaf.visualStyle.background)}>
              <CardHeader className="pb-0">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {goalReached ? "Goal met" : `${versesCompleted}/${dailyGoal} verses today`}
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      {preferences.stageLabel ?? "AI Tajweed Coach"}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-emerald-500" />
                      Ayah {currentAyahDisplay} / {totalAyahDisplay}
                    </div>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="group h-8 w-8 rounded-full bg-transparent hover:bg-muted/50"
                      aria-label={configOpen ? "Hide recitation configuration" : "Show recitation configuration"}
                    >
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="surah-select" className="text-xs uppercase tracking-wide text-muted-foreground">
                        Surah
                      </Label>
                      <Select
                        value={selectedSurahNumber ? String(selectedSurahNumber) : undefined}
                        onValueChange={(value) => setSelectedSurahNumber(Number.parseInt(value))}
                      >
                        <SelectTrigger id="surah-select" className="bg-background/80">
                          <SelectValue placeholder="Choose a surah" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[320px]">
                          {surahs.map((surah) => (
                            <SelectItem key={surah.number} value={String(surah.number)}>
                              {surah.number}. {surah.englishName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ayah-select" className="text-xs uppercase tracking-wide text-muted-foreground">
                        Ayah
                      </Label>
                      <Select
                        value={selectedAyahNumber ? String(selectedAyahNumber) : undefined}
                        onValueChange={handleAyahSelection}
                        disabled={!ayahList.length}
                      >
                        <SelectTrigger id="ayah-select" className="bg-background/80">
                          <SelectValue placeholder="Choose an ayah" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[320px]">
                          {ayahList.map((ayah) => (
                            <SelectItem key={ayah.number} value={String(ayah.numberInSurah)}>
                              Ayah {ayah.numberInSurah}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reciter-select" className="text-xs uppercase tracking-wide text-muted-foreground">
                        Reciter
                      </Label>
                      <Select value={profile.reciterEdition} onValueChange={handleReciterChange}>
                        <SelectTrigger id="reciter-select" className="bg-background/80">
                          <SelectValue placeholder="Choose a reciter" />
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
                      <Label htmlFor="translation-select" className="text-xs uppercase tracking-wide text-muted-foreground">
                        Translation
                      </Label>
                      <Select value={profile.translationEdition} onValueChange={handleTranslationChange}>
                        <SelectTrigger id="translation-select" className="bg-background/80">
                          <SelectValue placeholder="Choose a translation" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[320px]">
                          {translationOptions.map((translation) => (
                            <SelectItem key={translation.edition} value={translation.edition}>
                              {translation.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">Playback speed</Label>
                      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-sm">
                        <span>{profile.playbackSpeed.toFixed(2)}x</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            updateReaderProfile({
                              playbackSpeed: Math.min(profile.playbackSpeed + 0.1, 2),
                            })
                          }
                          className="h-7 px-2"
                        >
                          Faster
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">Session goal</Label>
                      <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-sm">
                        Complete <strong>{dailyGoal}</strong> ayat today
                      </div>
                    </div>
                  </div>

                  {error ? (
                    <Alert variant="destructive">
                      <AlertTitle>Unable to load selection</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : null}

                  {selectedSurahNumber && ayahList.length ? (
                    <QuranReaderContainer
                      surahNumber={selectedSurahNumber}
                      surahMeta={surahMeta}
                      ayahs={ayahList}
                      selectedAyahNumber={selectedAyahNumber}
                      onAyahSelect={setSelectedAyahNumber}
                      profile={profile}
                      nightMode={nightMode}
                      audioSegments={audioSegments}
                      onVersePlaybackEnd={(ayahNumber) => {
                        const currentIndex = ayahList.findIndex((ayah) => ayah.numberInSurah === ayahNumber)
                        const nextAyah = currentIndex >= 0 ? ayahList[currentIndex + 1] ?? null : null
                        const currentAyah = currentIndex >= 0 ? ayahList[currentIndex] ?? null : null
                        handleNextAyah(currentAyah ?? null, nextAyah)
                      }}
                      onNavigate={(payload) => {
                        const { direction, currentAyah, targetAyah } = payload
                        if (direction === "next") {
                          return handleNextAyah(currentAyah, targetAyah ?? null)
                        }
                        return false
                      }}
                      sparkleEvents={sparkles}
                      onSparkleComplete={removeSparkle}
                    />
                  ) : (
                    <div className="rounded-xl border border-dashed border-border/60 bg-background/60 p-12 text-center text-sm text-muted-foreground">
                      Select a surah and ayah to begin reading with Quran Companion.
                    </div>
                  )}

                  <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:items-center sm:justify-items-end">
                    <div className="flex w-full items-center gap-2 rounded-md border bg-background px-3 py-1.5 shadow-xs dark:border-input dark:bg-input/30 sm:w-auto sm:justify-self-end">
                      <Switch
                        id="translation-toggle"
                        checked={profile.showTranslation}
                        onCheckedChange={(checked) => updateReaderProfile({ showTranslation: checked })}
                      />
                      <Label htmlFor="translation-toggle" className="text-sm font-medium text-muted-foreground">
                        Translation
                      </Label>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        {
                          TRANSLATION_LANGUAGE_LABELS[profile.translationLanguage ?? "en"] ??
                          (profile.translationLanguage ?? "eng").toUpperCase()
                        }
                      </span>
                    </div>
                    <div className="flex w-full items-center gap-2 rounded-md border bg-background px-3 py-1.5 shadow-xs dark:border-input dark:bg-input/30 sm:w-auto sm:justify-self-end">
                      <Switch
                        id="transliteration-toggle"
                        checked={profile.showTransliteration}
                        onCheckedChange={(checked) => updateReaderProfile({ showTransliteration: checked })}
                      />
                      <Label htmlFor="transliteration-toggle" className="text-sm font-medium text-muted-foreground">
                        Trans
                      </Label>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        {profile.showTransliteration ? "On" : "Off"}
                      </span>
                    </div>
                    <div className="flex w-full items-center gap-2 rounded-md border bg-background px-3 py-1.5 shadow-xs dark:border-input dark:bg-input/30 sm:w-auto sm:justify-self-end">
                      <Switch
                        id="night-mode-toggle"
                        checked={nightMode}
                        onCheckedChange={(checked) => handleNightModeToggle(checked)}
                      />
                      <Label htmlFor="night-mode-toggle" className="text-sm font-medium text-muted-foreground">
                        Night mode
                      </Label>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        {nightMode ? "On" : "Off"}
                      </span>
                    </div>
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      className="w-full h-[1.55rem] px-[0.6rem] has-[>svg]:px-[0.5rem] gap-1 text-xs sm:w-auto sm:justify-self-end"
                    >
                      <Link href="/practice" className="inline-flex items-center gap-1 text-xs">
                        <Sparkles className="h-3 w-3" /> Launch AI Lab
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <aside className="space-y-6">
            <Card className={cn("shadow-lg", cardBackground)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Insights panel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={insightView} onValueChange={(value) => setInsightView(value as typeof insightView)} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2 bg-background/70">
                    <TabsTrigger value="mushaf" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                      Mushaf preview
                    </TabsTrigger>
                    <TabsTrigger value="morphology" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                      Morphology
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="mushaf" className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Scroll the Mushaf to stay synchronized with the active ayah.
                    </p>
                    <MushafView ayahs={ayahList} selectedAyahNumber={selectedAyahNumber} nightMode={nightMode} />
                  </TabsContent>
                  <TabsContent value="morphology" className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Explore linguistic details and root analysis for the focused ayah.
                    </p>
                    {selectedSurahNumber && selectedAyahNumber ? (
                      <MorphologyBreakdown ayahReference={`${selectedSurahNumber}:${selectedAyahNumber}`} />
                    ) : (
                      <div className="rounded-lg border border-dashed border-border/60 bg-background/60 p-6 text-sm text-muted-foreground">
                        Select an ayah to load detailed morphology insights.
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className={cn("border border-emerald-200/60 bg-emerald-50/70", nightMode && "border-emerald-600/40 bg-emerald-900/20")}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-emerald-800 dark:text-emerald-200">Today's milestone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
                <p>Complete {dailyGoal} focused repetitions with tajweed-aware tracking.</p>
                <p>
                  Playback speed: <strong>{profile.playbackSpeed.toFixed(2)}x</strong>
                </p>
                <p>
                  Preferred reciter: <strong>{RECITER_OPTIONS.find((reciter) => reciter.edition === profile.reciterEdition)?.label}</strong>
                </p>
              </CardContent>
            </Card>

            <Card className={cn("border border-amber-200 bg-amber-50/80", nightMode && "border-amber-500/50 bg-amber-900/30")}>
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
                <p>
                  Repetitions recorded: <strong>{repetitionsCompleted}</strong>
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-3">
            <GwaniSurahPlayer surahs={surahs} nightMode={nightMode} />
          </div>
        </div>
      </div>
    </div>
  )
}

