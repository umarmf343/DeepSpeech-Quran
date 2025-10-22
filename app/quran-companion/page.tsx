"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { Metadata } from "next"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { EggChallengeWidget } from "@/components/reader/egg-challenge-widget"
import { HasanatCelebration } from "@/components/reader/hasanat-celebration"
import { MilestoneCelebration } from "@/components/reader/milestone-celebration"
import { MorphologyBreakdown } from "@/components/morphology-breakdown"
import { MushafView } from "@/components/reader/mushaf-view"
import { NightModeToggle } from "@/components/reader/night-mode-toggle"
import { QuranReaderContainer } from "@/components/reader/quran-reader-container"
import { ReaderTogglePanel } from "@/components/reader/reader-toggle-panel"
import { useHasanatTracker } from "@/hooks/use-hasanat-tracker"
import { useReaderChallenge } from "@/hooks/use-reader-challenge"
import { useUser } from "@/hooks/use-user"
import { buildVerseKey } from "@/lib/hasanat"
import { mushafVariants } from "@/lib/integration-data"
import { quranAPI, type AudioSegment, type Ayah, type Surah } from "@/lib/quran-api"
import {
  DEFAULT_PROFILE,
  loadReaderProfile,
  updateProfile as mergeReaderProfile,
  type ReaderProfile,
} from "@/lib/reader/preference-manager"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Quran Companion | AlFawz Qur'an Institute",
  description:
    "Experience the full Quran Companion desktop environment directly in the browser with immersive reading, audio controls, and study tooling.",
}

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

type EditionOption = {
  edition: string
  label: string
  language: string
}

type TransliterationOption = {
  edition: string
  label: string
  language: string
}

export default function QuranCompanionPage() {
  const { preferences, stats, updatePreferences } = useUser()

  const [surahs, setSurahs] = useState<Surah[]>([])
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null)
  const [surahMeta, setSurahMeta] = useState<Surah | null>(null)
  const [ayahList, setAyahList] = useState<Ayah[]>([])
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number | null>(null)
  const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([])
  const [translationOptions, setTranslationOptions] = useState<EditionOption[]>(DEFAULT_TRANSLATION_OPTIONS)
  const [transliterationOptions, setTransliterationOptions] = useState<TransliterationOption[]>(
    DEFAULT_TRANSLITERATION_OPTIONS,
  )
  const [profile, setProfile] = useState<ReaderProfile>(DEFAULT_PROFILE)
  const [systemPrefersDark, setSystemPrefersDark] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [versesCompleted, setVersesCompleted] = useState(0)
  const [shouldCelebrate, setShouldCelebrate] = useState(false)
  const [showMushafPreview, setShowMushafPreview] = useState(true)

  const selectedMushaf = mushafVariants[0]

  useEffect(() => {
    const storedProfile = loadReaderProfile()
    setProfile(storedProfile)
  }, [])

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

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const editions = await quranAPI.getEditions()
        if (!active) return

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

  const defaultReciterEdition = useMemo(() => {
    const preferred = RECITER_OPTIONS.find((option) => option.label === preferences.reciter)
    return preferred?.edition ?? RECITER_OPTIONS[0].edition
  }, [preferences.reciter])

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
        if (!selectedSurahNumber && loadedSurahs[0]) {
          setSelectedSurahNumber(loadedSurahs[0].number)
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
  }, [selectedSurahNumber])

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

  const updateReaderProfile = useCallback((update: Partial<ReaderProfile>) => {
    setProfile((previous) => mergeReaderProfile(previous, update))
  }, [])

  const dailyGoal = useMemo(() => {
    const ayahCount = surahMeta?.numberOfAyahs ?? 5
    return Math.min(Math.max(ayahCount, 3), 10)
  }, [surahMeta?.numberOfAyahs])

  const totalAyahs = surahMeta?.numberOfAyahs ?? ayahList.length
  const totalAyahDisplay = totalAyahs > 0 ? totalAyahs : "–"
  const currentAyahDisplay = selectedAyahNumber ?? "–"
  const repetitionsCompleted = Math.min(versesCompleted, dailyGoal)

  const nightMode = profile.theme === "dark" || (profile.theme === "auto" && systemPrefersDark)
  const nightModeBackground = nightMode ? "bg-slate-950 text-slate-100" : "bg-gradient-cream text-slate-900"
  const cardBackground = nightMode ? "border-slate-700 bg-slate-900/70" : "border-border/50 bg-white/90"

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
        completedJuzIds: !nextAyah || nextAyah.juz !== currentAyah.juz ? [currentAyah.juz] : [],
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
    const ayahNumber = Number.parseInt(value, 10)
    if (Number.isNaN(ayahNumber)) return
    setSelectedAyahNumber(ayahNumber)
  }, [])

  const handleChallengeReset = useCallback(async () => {
    await resetChallenge()
    dismissChallengeCelebration()
  }, [resetChallenge, dismissChallengeCelebration])

  const handleDismissChallengeCelebration = useCallback(() => {
    dismissChallengeCelebration()
  }, [dismissChallengeCelebration])

  const selectedAyah = useMemo(() => {
    if (!selectedAyahNumber) return null
    return ayahList.find((ayah) => ayah.numberInSurah === selectedAyahNumber) ?? null
  }, [ayahList, selectedAyahNumber])

  const ayahReference = selectedSurahNumber && selectedAyahNumber ? `${selectedSurahNumber}:${selectedAyahNumber}` : ""

  const dailyProgressPercent = dailyGoal > 0 ? Math.min(100, Math.round((versesCompleted / dailyGoal) * 100)) : 0

  const insightsPanel = (
    <div className="space-y-6">
      <Card className={cn(cardBackground, "sticky top-6 space-y-4 p-6")}
        aria-labelledby="mushaf-preview-heading"
      >
        <div className="flex items-center justify-between">
          <div>
            <p id="mushaf-preview-heading" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Mushaf Preview
            </p>
            <p className="text-sm text-muted-foreground">Follow along with the printed mushaf layout.</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={showMushafPreview} onCheckedChange={setShowMushafPreview} aria-label="Toggle mushaf preview" />
            <span className="text-xs text-muted-foreground">{showMushafPreview ? "Visible" : "Hidden"}</span>
          </div>
        </div>
        {showMushafPreview ? (
          <MushafView ayahs={ayahList} selectedAyahNumber={selectedAyahNumber} nightMode={nightMode} />
        ) : (
          <div className="rounded-lg border border-dashed border-muted-foreground/40 p-6 text-sm text-muted-foreground">
            Enable the preview to mirror each ayah inside the mushaf layout.
          </div>
        )}
      </Card>

      {ayahReference ? (
        <MorphologyBreakdown ayahReference={ayahReference} ayahText={selectedAyah?.text} />
      ) : (
        <Card className={cardBackground}>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Select a surah and ayah to load morphology insights.
          </CardContent>
        </Card>
      )}
    </div>
  )

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

      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-4 py-10 lg:px-8">
        <header className={cn("rounded-3xl border px-6 py-6 shadow-sm", cardBackground)}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-emerald-100 text-emerald-700">Quran Companion Workspace</Badge>
              <h1 className="text-3xl font-semibold tracking-tight">Quran Companion</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Manage your desktop reading environment with synchronized audio, memorization tracking, and deep study aides—all without leaving this workspace.
              </p>
            </div>
            <div className="flex flex-col items-end gap-4">
              <NightModeToggle enabled={nightMode} onChange={handleNightModeToggle} />
              <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-muted-foreground">
                {surahMeta ? (
                  <Badge variant="secondary">{surahMeta.revelationType}</Badge>
                ) : null}
                {surahMeta ? <Badge variant="outline">{surahMeta.numberOfAyahs} Ayahs</Badge> : null}
                <Badge className={selectedMushaf.visualStyle.badge}>{selectedMushaf.name}</Badge>
                <span>Ayah {currentAyahDisplay} / {totalAyahDisplay}</span>
                <span>Repetitions {repetitionsCompleted} / {dailyGoal}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
          <aside className="space-y-6">
            <ReaderTogglePanel
              profile={profile}
              onProfileChange={updateReaderProfile}
              translationOptions={translationOptions}
              transliterationOptions={transliterationOptions}
              reciterOptions={RECITER_OPTIONS}
            />

            <Card className={cardBackground}>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold">Session Controls</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Surah</Label>
                  <Select
                    value={selectedSurahNumber?.toString() ?? ""}
                    onValueChange={(value) => {
                      const surahNumber = Number.parseInt(value, 10)
                      if (Number.isNaN(surahNumber)) return
                      setSelectedSurahNumber(surahNumber)
                      setSelectedAyahNumber(null)
                    }}
                  >
                    <SelectTrigger className="bg-background/80">
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
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ayah</Label>
                  <Select value={selectedAyahNumber?.toString() ?? ""} onValueChange={handleAyahSelection}>
                    <SelectTrigger className="bg-background/80">
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
                  <Select value={profile.reciterEdition} onValueChange={handleReciterChange}>
                    <SelectTrigger className="bg-background/80">
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
                  <Select value={profile.translationEdition} onValueChange={handleTranslationChange}>
                    <SelectTrigger className="bg-background/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {translationOptions.map((translation) => (
                        <SelectItem key={translation.edition} value={translation.edition}>
                          {translation.label} ({translation.language.toUpperCase()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-dashed border-muted-foreground/40 px-3 py-2">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Translation</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="translation-toggle"
                      checked={profile.showTranslation}
                      onCheckedChange={(checked) => updateReaderProfile({ showTranslation: checked })}
                    />
                    <span className="text-xs text-muted-foreground">{profile.showTranslation ? "On" : "Off"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-dashed border-muted-foreground/40 px-3 py-2">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Transliteration</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="transliteration-toggle"
                      checked={profile.showTransliteration}
                      onCheckedChange={(checked) => updateReaderProfile({ showTransliteration: checked })}
                    />
                    <span className="text-xs text-muted-foreground">{profile.showTransliteration ? "On" : "Off"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardBackground}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Recitation Challenge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <EggChallengeWidget
                  snapshot={challengeSnapshot}
                  celebration={challengeCelebration}
                  loading={challengeLoading}
                  updating={challengeUpdating}
                  onContinue={handleDismissChallengeCelebration}
                  onReset={handleChallengeReset}
                />
                {challengeError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Challenge unavailable</AlertTitle>
                    <AlertDescription>{challengeError}</AlertDescription>
                  </Alert>
                ) : null}
              </CardContent>
            </Card>

            <Card className={cardBackground}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Daily Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Verses read today</p>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>{versesCompleted} / {dailyGoal}</span>
                    <span className={cn(goalReached ? "text-emerald-600" : "text-muted-foreground")}>{goalReached ? "Goal met" : "Keep going"}</span>
                  </div>
                  <Progress value={dailyProgressPercent} className="h-2" />
                </div>
                <div className="flex flex-col gap-1 text-muted-foreground">
                  <span>Current streak: <strong>{stats.streak}</strong> days</span>
                  <span>Total ayahs read: <strong>{stats.ayahsRead}</strong></span>
                </div>
              </CardContent>
            </Card>
          </aside>

          <main className="space-y-6">
            {surahMeta ? (
              <Card className={cardBackground}>
                <CardHeader className="pb-2 text-center">
                  <CardTitle className="text-2xl font-semibold">{surahMeta.name} • {surahMeta.englishName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {surahMeta.englishNameTranslation} · {surahMeta.numberOfAyahs} Ayahs
                  </p>
                </CardHeader>
              </Card>
            ) : null}

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Unable to load content</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <Card className={cardBackground}>
                <CardContent className="p-0">
                  <QuranReaderContainer
                    surahNumber={selectedSurahNumber}
                    surahMeta={surahMeta}
                    ayahs={ayahList}
                    selectedAyahNumber={selectedAyahNumber}
                    onAyahSelect={setSelectedAyahNumber}
                    profile={profile}
                    nightMode={nightMode}
                    audioSegments={audioSegments}
                    onVersePlaybackEnd={markAyahCompleted}
                    telemetryEnabled={profile.telemetryOptIn}
                    onNavigate={({ direction, currentAyah, targetAyah }) => {
                      if (direction === "next") {
                        return handleNextAyah(currentAyah, targetAyah ?? null)
                      }
                      return false
                    }}
                    sparkleEvents={sparkles}
                    onSparkleComplete={removeSparkle}
                  />
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className={cardBackground}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Reading Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Playback speed: <strong>{profile.playbackSpeed.toFixed(2)}x</strong></p>
                  <p>Preferred reciter: <strong>{RECITER_OPTIONS.find((reciter) => reciter.edition === profile.reciterEdition)?.label ?? "–"}</strong></p>
                  <p>Translation language: <strong>{profile.translationLanguage?.toUpperCase() ?? "EN"}</strong></p>
                  <p>Full surah view: <strong>{profile.fullSurahView ? "Enabled" : "Focused"}</strong></p>
                </CardContent>
              </Card>

              <Card className={cardBackground}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Session Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Use the next ayah controls to increment memorization streaks and trigger the egg celebration.</p>
                  <p>Bookmarks and playback preferences persist locally so your desktop and browser stay aligned.</p>
                </CardContent>
              </Card>
            </div>
          </main>

          <aside className="hidden xl:block">
            {insightsPanel}
          </aside>
        </div>

        <div className="xl:hidden">{insightsPanel}</div>
      </div>
    </div>
  )
}
