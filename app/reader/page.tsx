"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import Link from "next/link"

import { HasanatCelebration } from "@/components/reader/hasanat-celebration"
import { HasanatHud } from "@/components/reader/hasanat-hud"
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
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

import { BookOpen, Bookmark, Check, Settings, Share, Sparkles } from "lucide-react"

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

export default function AlfawzReaderPage() {
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
  const [showMushafView, setShowMushafView] = useState(false)
  const [translationOptions, setTranslationOptions] = useState(DEFAULT_TRANSLATION_OPTIONS)
  const [transliterationOptions, setTransliterationOptions] = useState(DEFAULT_TRANSLITERATION_OPTIONS)
  const [systemPrefersDark, setSystemPrefersDark] = useState(false)
  const [profile, setProfile] = useState<ReaderProfile>(() => ({
    ...DEFAULT_PROFILE,
    ...loadReaderProfile(),
  }))

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
    state: hasanatState,
    recordRecitation,
    sparkles,
    removeSparkle,
    celebration: hasanatCelebration,
    dismissCelebration,
    announcement: hasanatAnnouncement,
    ramadanState,
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

  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false)

  const challengeHudInfo = useMemo(() => {
    if (!challengeSnapshot) return undefined
    return {
      title: challengeSnapshot.current.title,
      icon: challengeSnapshot.current.icon,
      goal: challengeSnapshot.state.goal,
      current: challengeSnapshot.state.progress,
      roundsCompleted: challengeSnapshot.state.roundsCompleted,
      roundsTarget: challengeSnapshot.current.roundsToAdvance,
      difficultyLevel: challengeSnapshot.state.difficultyLevel,
      totalCompletions: challengeSnapshot.state.totalCompletions,
    }
  }, [challengeSnapshot])

  const celebrationDuration = useMemo(() => {
    if (!challengeCelebration) return null
    const seconds = Math.max(0, Math.round(challengeCelebration.durationSeconds ?? 0))
    const minutes = Math.floor(seconds / 60)
    const remainder = seconds % 60
    if (minutes <= 0) {
      return `${remainder}s`
    }
    return `${minutes}m ${remainder.toString().padStart(2, "0")}s`
  }, [challengeCelebration])

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
    if (challengeCelebration) {
      setChallengeDialogOpen(true)
    }
  }, [challengeCelebration])

  const handleDismissChallengeCelebration = useCallback(() => {
    setChallengeDialogOpen(false)
    dismissChallengeCelebration()
  }, [dismissChallengeCelebration])

  const handleChallengeReset = useCallback(async () => {
    await resetChallenge()
    setChallengeDialogOpen(false)
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
    <div className={cn("min-h-screen pb-16 transition-colors", nightModeBackground)}>
      <HasanatCelebration celebration={hasanatCelebration} onClose={dismissCelebration} nightMode={nightMode} />
      <MilestoneCelebration
        show={shouldCelebrate}
        title="MashaAllah! Goal achieved"
        message="You have completed today’s recitation goal. Keep nurturing your Qur’anic journey."
        onClose={closeCelebration}
      />

      <Dialog
        open={challengeDialogOpen && Boolean(challengeCelebration)}
        onOpenChange={(open) => {
          if (!open) {
            handleDismissChallengeCelebration()
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-emerald-500" aria-hidden="true" />
              {challengeCelebration ? `Takbir! ${challengeCelebration.challengeTitle}` : "Takbir!"}
            </DialogTitle>
            <DialogDescription>
              {challengeCelebration
                ? `You recited ${challengeCelebration.versesCompleted} verses in ${celebrationDuration ?? "moments"}.`
                : "Keep nurturing your recitation rhythm."}
            </DialogDescription>
          </DialogHeader>
          {challengeCelebration ? (
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                Round {challengeCelebration.completedRound} of {challengeCelebration.roundsTarget}
                {challengeCelebration.switchedChallenge
                  ? " completed—get ready for a new quest!"
                  : " warmed the egg even more."}
              </p>
              <p>
                Total challenge completions: <strong>{challengeCelebration.totalCompletions}</strong>
              </p>
              <p>
                Next up: <strong>{challengeCelebration.nextChallengeTitle}</strong> at difficulty level{' '}
                <strong>{challengeCelebration.difficultyLevel}</strong>.
              </p>
            </div>
          ) : null}
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => void handleChallengeReset()}>
              Reset challenge
            </Button>
            <Button onClick={handleDismissChallengeCelebration}>Continue reciting</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <HasanatHud
        totalHasanat={hasanatState.totalHasanat}
        dailyHasanat={hasanatState.dailyHasanat}
        sessionHasanat={hasanatState.sessionHasanat}
        dailyGoal={dailyGoal}
        versesCompleted={versesCompleted}
        ramadanMultiplier={ramadanState.multiplier}
        isRamadan={ramadanState.isRamadan}
        announcement={hasanatAnnouncement}
        challengeInfo={challengeHudInfo}
      />

      <div className="mx-auto mt-6 flex w-full max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8">
        <EggChallengeWidget
          snapshot={challengeSnapshot}
          celebration={challengeCelebration}
          loading={challengeLoading}
          updating={challengeUpdating}
          onReset={() => {
            void handleChallengeReset()
          }}
          onDismissCelebration={handleDismissChallengeCelebration}
        />
        {challengeError ? (
          <Alert variant="destructive" role="alert">
            <AlertTitle>Unable to update challenge</AlertTitle>
            <AlertDescription>{challengeError}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className={cn("shadow-lg", cardBackground, selectedMushaf.visualStyle.background)}>
            <CardHeader className="space-y-4 pb-4">
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
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Select Surah</Label>
                  <Select
                    value={selectedSurahNumber?.toString() ?? ""}
                    onValueChange={(value) => {
                      const surahNumber = Number.parseInt(value)
                      if (Number.isNaN(surahNumber)) return
                      setSelectedSurahNumber(surahNumber)
                      setSelectedAyahNumber(null)
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
                  <Select value={profile.reciterEdition} onValueChange={handleReciterChange}>
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
                  <Select value={profile.translationEdition} onValueChange={handleTranslationChange}>
                    <SelectTrigger className="bg-white/90 dark:bg-slate-900/70">
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

              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                {surahMeta && (
                  <Badge className="bg-emerald-100 text-emerald-800">{surahMeta.revelationType}</Badge>
                )}
                {surahMeta && <Badge variant="outline">{surahMeta.numberOfAyahs} Ayahs</Badge>}
                <Badge className={selectedMushaf.visualStyle.badge}>{selectedMushaf.name}</Badge>
                <div className="text-xs text-muted-foreground">Ayah {currentAyahDisplay} of {totalAyahDisplay}</div>
                <div className="text-xs text-emerald-600">Repetitions {repetitionsCompleted} / {dailyGoal}</div>
              </div>

              {error ? (
                <Alert variant="destructive" role="alert">
                  <AlertTitle>Unable to load content</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : showMushafView ? (
                <MushafView ayahs={ayahList} selectedAyahNumber={selectedAyahNumber} nightMode={nightMode} />
              ) : (
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
              )}

              <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:items-center sm:justify-items-end">
                <div className="flex w-full items-center gap-2 rounded-md border bg-background px-3 py-1.5 shadow-xs dark:border-input dark:bg-input/30 sm:w-auto sm:justify-self-end">
                  <Switch
                    id="translation-toggle"
                    checked={profile.showTranslation}
                    onCheckedChange={(checked) => updateReaderProfile({ showTranslation: checked })}
                  />
                  <Label
                    htmlFor="translation-toggle"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Translation
                  </Label>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {profile.showTranslation ? "On" : "Off"}
                  </span>
                </div>
                <div className="flex w-full items-center gap-2 rounded-md border bg-background px-3 py-1.5 shadow-xs dark:border-input dark:bg-input/30 sm:w-auto sm:justify-self-end">
                  <Switch
                    id="transliteration-toggle"
                    checked={profile.showTransliteration}
                    onCheckedChange={(checked) => updateReaderProfile({ showTransliteration: checked })}
                  />
                  <Label
                    htmlFor="transliteration-toggle"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Transliteration
                  </Label>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {profile.showTransliteration ? "On" : "Off"}
                  </span>
                </div>
                <div className="flex w-full items-center gap-2 rounded-md border bg-background px-3 py-1.5 shadow-xs dark:border-input dark:bg-input/30 sm:w-auto sm:justify-self-end">
                  <Switch
                    id="mushaf-view-toggle"
                    checked={showMushafView}
                    onCheckedChange={setShowMushafView}
                  />
                  <Label
                    htmlFor="mushaf-view-toggle"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Mushaf view
                  </Label>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {showMushafView ? "On" : "Off"}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full gap-2 sm:w-auto sm:justify-self-end"
                >
                  <Sparkles className="h-4 w-4" /> Launch AI Lab
                </Button>
              </div>

            </CardContent>
          </Card>

          <div className="space-y-6">
            {selectedSurahNumber && selectedAyahNumber ? (
              <MorphologyBreakdown ayahReference={`${selectedSurahNumber}:${selectedAyahNumber}`} />
            ) : null}

            <Card className={cn("border border-emerald-200/60 bg-emerald-50/70", nightMode && "border-emerald-600/40 bg-emerald-900/20") }>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-emerald-800 dark:text-emerald-200">Today's Milestone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
                <p>Complete {dailyGoal} focused repetitions with tajweed-aware tracking.</p>
                <p>Playback speed: <strong>{profile.playbackSpeed.toFixed(2)}x</strong></p>
                <p>Preferred reciter: <strong>{RECITER_OPTIONS.find((reciter) => reciter.edition === profile.reciterEdition)?.label}</strong></p>
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

        <div className="mt-10 grid gap-8 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-3">
            <GwaniSurahPlayer surahs={surahs} nightMode={nightMode} />
          </div>
        </div>
      </div>
    </div>
  )
}
