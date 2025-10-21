"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Languages,
  Repeat,
  Egg,
  Sparkles,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { NurBloomWidget } from "@/components/nur-bloom-widget"
import { useNurBloomChallenge } from "@/hooks/use-nur-bloom-challenge"
import { quranAPI, type Surah, type Ayah, type Translation } from "@/lib/quran-api"
import type { DailyGoalSnapshot } from "@/lib/daily-goal-store"

interface QuranReaderProps {
  initialSurah?: number
  initialAyah?: number
  showTranslation?: boolean
  showControls?: boolean
}

export function QuranReader({
  initialSurah = 1,
  initialAyah = 1,
  showTranslation = true,
  showControls = true,
}: QuranReaderProps) {
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null)
  const [ayahs, setAyahs] = useState<Ayah[]>([])
  const [translations, setTranslations] = useState<{ [key: number]: Translation[] }>({})
  const [selectedReciter, setSelectedReciter] = useState("ar.alafasy")
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTranslations, setShowTranslations] = useState(showTranslation)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [volume, setVolume] = useState(0.8)
  const [repeatMode, setRepeatMode] = useState<"none" | "ayah" | "surah">("none")
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [audioUrls, setAudioUrls] = useState<string[]>([])
  const [, setDailyGoalState] = useState<DailyGoalSnapshot | null>(null)
  const [challengeLevel, setChallengeLevel] = useState(1)
  const [challengeProgress, setChallengeProgress] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)

  const challengeGoal = useMemo(() => 10 + (challengeLevel - 1) * 5, [challengeLevel])
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    state: nurBloomState,
    actions: {
      enable: enableNurBloom,
      disable: disableNurBloom,
      dismissPrompt: dismissNurPrompt,
      setTheme: setNurTheme,
      toggleGentleMode,
      toggleSound,
      recordVerseProgress: recordNurProgress,
      scheduleVerseObservation,
      resetStreak: resetNurStreak,
      acknowledgeCelebration,
      markReflectionPromptSeen,
    },
  } = useNurBloomChallenge()

  const audioRef = useRef<HTMLAudioElement>(null)

  // Load initial data
  useEffect(() => {
    let isMounted = true
    void (async () => {
      setIsLoading(true)
      try {
        const surahsData = await quranAPI.getSurahs()
        if (!isMounted) {
          return
        }
        setSurahs(surahsData)
      } catch (error) {
        console.error("Error loading initial data:", error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      isMounted = false
    }
  }, [])

  // Load surah when selection changes
  useEffect(() => {
    if (initialSurah) {
      void loadSurah(initialSurah)
    }
  }, [initialSurah, loadSurah])

  const loadTranslations = useCallback(async (ayahList: Ayah[], surahNumber: number) => {
    const translationPromises = ayahList.map(async (ayah) => {
      const ayahData = await quranAPI.getAyah(surahNumber, ayah.numberInSurah, ["en.sahih", "en.pickthall"])
      return { ayahNumber: ayah.numberInSurah, translations: ayahData?.translations || [] }
    })

    const translationResults = await Promise.all(translationPromises)
    const translationMap: { [key: number]: Translation[] } = {}

    translationResults.forEach(({ ayahNumber, translations: ayahTranslations }) => {
      translationMap[ayahNumber] = ayahTranslations
    })

    setTranslations(translationMap)
  }, [])

  const loadAudio = useCallback(async (surahNumber: number) => {
    try {
      const audioSegments = await quranAPI.getSurahAudio(surahNumber, selectedReciter)
      const urls = audioSegments.map((segment) => segment.url)
      setAudioUrls(urls)
    } catch (error) {
      console.error("Error loading audio:", error)
    }
  }, [selectedReciter])

  const loadSurah = useCallback(
    async (surahNumber: number) => {
      setIsLoading(true)
      try {
        const surahData = await quranAPI.getSurah(surahNumber)
        if (surahData) {
          setCurrentSurah(surahData.surah)
          setAyahs(surahData.ayahs)
          setCurrentAyahIndex(initialAyah - 1)

          if (showTranslations) {
            await loadTranslations(surahData.ayahs, surahNumber)
          }

          await loadAudio(surahNumber)
        }
      } catch (error) {
        console.error("Error loading surah:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [initialAyah, loadAudio, loadTranslations, showTranslations],
  )

  const reportVerseProgress = useCallback(
    async (verses = 1) => {
      try {
        const response = await fetch("/api/track-verse-progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ verses }),
        })

        if (!response.ok) {
          return
        }

        const data = (await response.json()) as { dailyGoal?: DailyGoalSnapshot }
        if (data?.dailyGoal) {
          setDailyGoalState(data.dailyGoal as DailyGoalSnapshot)
        }
      } catch (error) {
        console.error("Error tracking verse progress:", error)
      }
    },
    [],
  )

  const advanceEggChallenge = useCallback(() => {
    setChallengeProgress((prev) => {
      const nextProgress = prev + 1
      if (nextProgress >= challengeGoal) {
        if (celebrationTimeoutRef.current) {
          clearTimeout(celebrationTimeoutRef.current)
        }
        setShowCelebration(true)
        celebrationTimeoutRef.current = setTimeout(() => {
          setShowCelebration(false)
        }, 3200)
        setChallengeLevel((level) => level + 1)
        return 0
      }
      return nextProgress
    })
  }, [challengeGoal])

  const playAyah = (index: number) => {
    if (audioRef.current && audioUrls[index]) {
      audioRef.current.src = audioUrls[index]
      audioRef.current.playbackRate = playbackSpeed
      audioRef.current.volume = volume
      audioRef.current.play()
      setIsPlaying(true)
      setCurrentAyahIndex(index)
    }
  }

  const pauseAyah = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const nextAyah = () => {
    const nextIndex = currentAyahIndex + 1
    if (nextIndex < ayahs.length) {
      setCurrentAyahIndex(nextIndex)
      if (isPlaying) {
        playAyah(nextIndex)
      }
      void reportVerseProgress(1)
      advanceEggChallenge()

      if (currentSurah) {
        const nextAyahData = ayahs[nextIndex]
        const verseKey = `${currentSurah.number}:${nextAyahData?.numberInSurah ?? nextIndex + 1}`
        recordNurProgress({ verseKey, source: "next" })
      }
    }
  }

  const previousAyah = () => {
    const prevIndex = currentAyahIndex - 1
    if (prevIndex >= 0) {
      setCurrentAyahIndex(prevIndex)
      if (isPlaying) {
        playAyah(prevIndex)
      }
    }
  }

  const toggleBookmark = (ayahNumber: number) => {
    const bookmarkKey = `${currentSurah?.number}-${ayahNumber}`
    const newBookmarks = new Set(bookmarkedAyahs)

    if (newBookmarks.has(bookmarkKey)) {
      newBookmarks.delete(bookmarkKey)
    } else {
      newBookmarks.add(bookmarkKey)
    }

    setBookmarkedAyahs(newBookmarks)
    // In real app, save to localStorage or database
    localStorage.setItem("quran-bookmarks", JSON.stringify(Array.from(newBookmarks)))
  }

  const handleAudioEnded = () => {
    if (repeatMode === "ayah") {
      playAyah(currentAyahIndex)
    } else if (repeatMode === "none" && currentAyahIndex < ayahs.length - 1) {
      nextAyah()
    } else if (repeatMode === "surah" && currentAyahIndex === ayahs.length - 1) {
      setCurrentAyahIndex(0)
      playAyah(0)
    } else {
      setIsPlaying(false)
    }
  }

  // Load bookmarks from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("quran-bookmarks")
    if (savedBookmarks) {
      setBookmarkedAyahs(new Set(JSON.parse(savedBookmarks)))
    }
  }, [])

  useEffect(() => {
    if (!currentSurah) {
      return
    }

    resetNurStreak()
  }, [currentSurah, resetNurStreak])

  useEffect(() => {
    if (!currentSurah || !ayahs[currentAyahIndex]) {
      return
    }

    const verseKey = `${currentSurah.number}:${ayahs[currentAyahIndex].numberInSurah}`
    return scheduleVerseObservation(verseKey)
  }, [ayahs, currentAyahIndex, currentSurah, scheduleVerseObservation])

  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current)
      }
    }
  }, [])

  const challengeProgressPercentage = Math.min((challengeProgress / challengeGoal) * 100, 100)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-maroon-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading Quran...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative mx-auto max-w-6xl space-y-6">
      <div className="absolute right-4 top-4 z-30 max-md:static max-md:mb-4 max-md:flex max-md:justify-end">
        <NurBloomWidget
          state={nurBloomState}
          onEnable={enableNurBloom}
          onDisable={disableNurBloom}
          onDismissPrompt={dismissNurPrompt}
          onThemeChange={setNurTheme}
          onToggleGentleMode={toggleGentleMode}
          onToggleSound={toggleSound}
          onAcknowledgeCelebration={acknowledgeCelebration}
          onReflectionPromptSeen={markReflectionPromptSeen}
        />
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-rose-50 to-emerald-50 p-6 shadow-lg">
        <div className="pointer-events-none absolute -top-16 -left-10 h-32 w-32 rounded-full bg-rose-200/40 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-12 -right-8 h-36 w-36 rounded-full bg-emerald-200/40 blur-3xl" aria-hidden="true" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 rounded-2xl bg-white/80 p-3 shadow-md ring-2 ring-amber-200">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-200 via-amber-100 to-orange-100 opacity-60" />
              <Egg className="relative h-full w-full text-amber-600 drop-shadow-lg animate-bounce" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-widest text-amber-700">Break the Egg Challenge</p>
              <h2 className="text-2xl font-semibold text-maroon-800">
                Level {challengeLevel}
              </h2>
              <p className="max-w-sm text-sm text-maroon-600">
                Recite <span className="font-semibold">{challengeGoal}</span> verses using the next button to crack the egg.
                Only <span className="font-semibold">{Math.max(challengeGoal - challengeProgress, 0)}</span> more to go!
              </p>
            </div>
          </div>

          <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-white/70 p-4 shadow-inner md:w-auto">
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-maroon-600">
              <span>Progress</span>
              <span>
                {challengeProgress}/{challengeGoal}
              </span>
            </div>
            <Progress value={challengeProgressPercentage} className="h-3 bg-amber-100">
              {/* indicator handled internally */}
            </Progress>
            <p className="text-xs text-emerald-700">
              {challengeProgressPercentage >= 75
                ? "You're almost there—keep the momentum!"
                : "Press next to keep the egg from cracking too soon!"}
            </p>
          </div>
        </div>

        {showCelebration ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 text-center backdrop-blur-sm transition-opacity">
            <Sparkles className="mb-2 h-10 w-10 text-emerald-500 animate-bounce" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-maroon-800">Congratulations!</h3>
            <p className="mt-1 text-sm text-maroon-600">
              You cracked the egg! A new challenge begins at level {challengeLevel}.
            </p>
          </div>
        ) : null}
      </div>

      {/* Controls Header */}
      {showControls && (
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Surah Selector */}
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium">Surah:</Label>
                <Select
                  value={currentSurah ? currentSurah.number.toString() : ""}
                  onValueChange={(value) => {
                    const surahNumber = Number.parseInt(value, 10)
                    if (Number.isNaN(surahNumber)) {
                      return
                    }
                    loadSurah(surahNumber)
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Surah" />
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

              {/* Reciter Selector */}
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium">Reciter:</Label>
                <Select
                  value={selectedReciter}
                  onValueChange={(value) => {
                    setSelectedReciter(value)
                    if (currentSurah) {
                      loadAudio(currentSurah.number)
                    }
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar.alafasy">Mishary Alafasy</SelectItem>
                    <SelectItem value="ar.husary">Mahmoud Husary</SelectItem>
                    <SelectItem value="ar.minshawi">Mohamed Minshawi</SelectItem>
                    <SelectItem value="ar.sudais">Abdul Rahman Sudais</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Translation Toggle */}
              <div className="flex items-center space-x-2">
                <Switch id="show-translation" checked={showTranslations} onCheckedChange={setShowTranslations} />
                <Label htmlFor="show-translation" className="text-sm">
                  <Languages className="w-4 h-4 inline mr-1" />
                  Translation
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Surah Header */}
      {currentSurah && (
        <Card className="border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-maroon-800">
              {currentSurah.name} - {currentSurah.englishName}
            </CardTitle>
            <p className="text-gray-600">
              {currentSurah.englishNameTranslation} • {currentSurah.numberOfAyahs} Ayahs • {currentSurah.revelationType}
            </p>
          </CardHeader>
        </Card>
      )}

      {/* Audio Controls */}
      {showControls && (
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  onClick={isPlaying ? pauseAyah : () => playAyah(currentAyahIndex)}
                  className="bg-maroon-600 hover:bg-maroon-700 text-white"
                  size="sm"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                <Button
                  onClick={() => {
                    const modes: ("none" | "ayah" | "surah")[] = ["none", "ayah", "surah"]
                    const currentIndex = modes.indexOf(repeatMode)
                    const nextMode = modes[(currentIndex + 1) % modes.length]
                    setRepeatMode(nextMode)
                  }}
                  variant="outline"
                  size="sm"
                  className={repeatMode !== "none" ? "bg-maroon-50 text-maroon-700" : ""}
                >
                  <Repeat className="w-4 h-4 mr-1" />
                  {repeatMode === "none" ? "No Repeat" : repeatMode === "ayah" ? "Repeat Ayah" : "Repeat Surah"}
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4" />
                  <Slider
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    max={1}
                    step={0.1}
                    className="w-20"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Label className="text-sm">Speed:</Label>
                  <Select
                    value={playbackSpeed.toString()}
                    onValueChange={(value) => setPlaybackSpeed(Number.parseFloat(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1">1x</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ayahs Display */}
      <div className="space-y-4">
        {ayahs.map((ayah, index) => {
          const isCurrentAyah = index === currentAyahIndex
          const bookmarkKey = `${currentSurah?.number}-${ayah.numberInSurah}`
          const isBookmarked = bookmarkedAyahs.has(bookmarkKey)
          const ayahTranslations = translations[ayah.numberInSurah] || []

          return (
            <Card
              key={ayah.number}
              className={`border-border/50 transition-all duration-200 ${
                isCurrentAyah ? "ring-2 ring-maroon-200 bg-maroon-50/30" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="outline" className="bg-maroon-50 text-maroon-700 border-maroon-200">
                    Ayah {ayah.numberInSurah}
                  </Badge>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => toggleBookmark(ayah.numberInSurah)}
                      variant="ghost"
                      size="sm"
                      className={
                        isBookmarked ? "text-gold-600 hover:text-gold-700" : "text-gray-400 hover:text-gray-600"
                      }
                    >
                      {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </Button>

                    <Button
                      onClick={() => playAyah(index)}
                      variant="ghost"
                      size="sm"
                      className="text-maroon-600 hover:text-maroon-700"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Arabic Text */}
                <div className="relative mb-6">
                  {isCurrentAyah && (
                    <div className="absolute -top-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
                      <Button
                        onClick={previousAyah}
                        disabled={currentAyahIndex === 0}
                        variant="secondary"
                        size="icon"
                        aria-label="Previous ayah"
                        className="h-12 w-12 rounded-full border border-white/40 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 text-white shadow-lg transition-all duration-300 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-200/80 disabled:opacity-60 disabled:saturate-75"
                      >
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={nextAyah}
                        disabled={currentAyahIndex === ayahs.length - 1}
                        variant="secondary"
                        size="icon"
                        aria-label="Next ayah"
                        className="h-12 w-12 rounded-full border border-white/40 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 text-white shadow-lg transition-all duration-300 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-200/80 disabled:opacity-60 disabled:saturate-75"
                      >
                        <SkipForward className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <div className="text-right text-2xl md:text-3xl leading-relaxed font-arabic text-maroon-800 p-4 bg-cream-50 rounded-lg px-12">
                    {ayah.text}
                  </div>
                </div>

                {/* Translations */}
                {showTranslations && ayahTranslations.length > 0 && (
                  <div className="space-y-3">
                    {ayahTranslations.map((translation, tIndex) => (
                      <div key={tIndex} className="border-l-4 border-blue-200 pl-4">
                        <p className="text-gray-700 leading-relaxed">{translation.text}</p>
                        <p className="text-sm text-gray-500 mt-1">— {translation.translator}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ayah Metadata */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Badge variant="secondary" className="text-xs">
                    Juz {ayah.juz}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Page {ayah.page}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Manzil {ayah.manzil}
                  </Badge>
                  {ayah.sajda && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      Sajda
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        className="hidden"
      />
    </div>
  )
}
