"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MorphologyBreakdown } from "@/components/morphology-breakdown"
import { mushafVariants } from "@/lib/integration-data"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  BookOpen,
  Settings,
  Bookmark,
  Share,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

const sampleSurah = {
  number: 1,
  name: "Al-Fatiha",
  englishName: "The Opening",
  numberOfAyahs: 7,
  revelationType: "Meccan",
  ayahs: [
    {
      number: 1,
      text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      transliteration: "Bismillahir-Rahmanir-Raheem",
      audioUrl: "/audio/001001.mp3",
    },
    {
      number: 2,
      text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      translation: "All praise is due to Allah, Lord of the worlds.",
      transliteration: "Alhamdu lillahi rabbil-alameen",
      audioUrl: "/audio/001002.mp3",
    },
    {
      number: 3,
      text: "الرَّحْمَٰنِ الرَّحِيمِ",
      translation: "The Entirely Merciful, the Especially Merciful,",
      transliteration: "Ar-Rahmanir-Raheem",
      audioUrl: "/audio/001003.mp3",
    },
    {
      number: 4,
      text: "مَالِكِ يَوْمِ الدِّينِ",
      translation: "Sovereign of the Day of Recompense.",
      transliteration: "Maliki yawmid-deen",
      audioUrl: "/audio/001004.mp3",
    },
    {
      number: 5,
      text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      translation: "It is You we worship and You we ask for help.",
      transliteration: "Iyyaka na'budu wa iyyaka nasta'een",
      audioUrl: "/audio/001005.mp3",
    },
    {
      number: 6,
      text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
      translation: "Guide us to the straight path -",
      transliteration: "Ihdinassiratal-mustaqeem",
      audioUrl: "/audio/001006.mp3",
    },
    {
      number: 7,
      text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
      translation:
        "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
      transliteration: "Siratal-lazeena an'amta alayhim ghayril-maghdoobi alayhim wa lad-dalleen",
      audioUrl: "/audio/001007.mp3",
    },
  ],
}

export default function QuranReaderPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAyah, setCurrentAyah] = useState(0)
  const [volume, setVolume] = useState([75])
  const [playbackSpeed, setPlaybackSpeed] = useState("1")
  const [showTranslation, setShowTranslation] = useState(true)
  const [showTransliteration, setShowTransliteration] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [fontScale, setFontScale] = useState(4)
  const [reciter, setReciter] = useState("mishary")
  const [selectedMushaf, setSelectedMushaf] = useState(mushafVariants[0])

  const audioRef = useRef<HTMLAudioElement>(null)
  const mushafOptions = useMemo(() => mushafVariants, [])
  const fontSizeClass = useMemo(() => {
    const map: Record<number, string> = {
      3: "text-3xl",
      4: "text-4xl",
      5: "text-5xl",
      6: "text-6xl",
    }
    return map[fontScale] ?? "text-4xl"
  }, [fontScale])

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleNextAyah = () => {
    if (currentAyah < sampleSurah.ayahs.length - 1) {
      setCurrentAyah(currentAyah + 1)
      setIsPlaying(false)
    }
  }

  const handlePrevAyah = () => {
    if (currentAyah > 0) {
      setCurrentAyah(currentAyah - 1)
      setIsPlaying(false)
    }
  }

  const handleAyahClick = (index: number) => {
    setCurrentAyah(index)
    setIsPlaying(false)
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100
      audioRef.current.playbackRate = Number.parseFloat(playbackSpeed)
    }
  }, [volume, playbackSpeed])

  const selectedAyah = sampleSurah.ayahs[currentAyah]
  const morphologyReference = `${sampleSurah.number}:${selectedAyah.number}`

  return (
    <div className="min-h-screen bg-gradient-cream">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-8 h-8 gradient-maroon rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-foreground">AlFawz Reader</h1>
                </div>
              </Link>
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Surah {sampleSurah.number}</span>
                <span>•</span>
                <span>{sampleSurah.name}</span>
                <span>•</span>
                <span>{sampleSurah.englishName}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="bg-transparent">
                <Bookmark className="w-4 h-4 mr-2" />
                Bookmark
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <Card className={`border-border/50 shadow-lg transition ${selectedMushaf.visualStyle.background}`}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl gradient-maroon bg-clip-text text-transparent">
                      {sampleSurah.name} - {sampleSurah.englishName}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1">
                      {sampleSurah.numberOfAyahs} Ayahs • {sampleSurah.revelationType}
                    </p>
                  </div>
                  <Badge className="gradient-gold text-white border-0">Ayah {currentAyah + 1}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">{sampleSurah.revelationType}</Badge>
                    <Badge variant="outline">{sampleSurah.numberOfAyahs} Ayahs</Badge>
                    <Badge className={selectedMushaf.visualStyle.badge}>{selectedMushaf.name}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="text-maroon-700" asChild>
                    <Link href="/practice">
                      <Sparkles className="w-4 h-4 mr-2" /> Launch AI Lab
                    </Link>
                  </Button>
                </div>

                <div
                  className={`rounded-xl border-2 px-6 py-8 shadow-sm bg-white/90 transition ${selectedMushaf.visualStyle.border}`}
                >
                  <p className={`font-arabic text-right leading-relaxed text-maroon-900 ${fontSizeClass}`}>
                    {selectedAyah.text}
                  </p>
                </div>

                {showTranslation && (
                  <p className="text-sm text-gray-700 bg-gray-50/80 rounded-lg p-4 leading-relaxed">{selectedAyah.translation}</p>
                )}

                {showTransliteration && (
                  <p className="text-sm text-gray-600 italic">{selectedAyah.transliteration}</p>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-maroon-50/70 border-maroon-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-maroon-800">Reader Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-gray-700">
                      <div className="space-y-2">
                        <p className="font-medium text-maroon-800 text-sm">Font Size</p>
                        <Slider
                          value={[fontScale]}
                          onValueChange={(value) => setFontScale(value[0] ?? 4)}
                          min={3}
                          max={6}
                          step={1}
                        />
                        <p className="text-xs text-gray-500">Current size: {fontSizeClass.replace("text-", "")}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-maroon-800 text-sm">Reciter</p>
                        <Select value={reciter} onValueChange={setReciter}>
                          <SelectTrigger className="bg-white/90">
                            <SelectValue placeholder="Select reciter" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mishary">Mishary Alafasy</SelectItem>
                            <SelectItem value="husary">Mahmoud Al-Husary</SelectItem>
                            <SelectItem value="abdulbasit">Abdul Basit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-maroon-800 text-sm">Mushaf Variant</p>
                        <div className="flex flex-wrap gap-2">
                          {mushafOptions.map((variant) => (
                            <Button
                              key={variant.id}
                              variant={variant.id === selectedMushaf.id ? "default" : "outline"}
                              className={
                                variant.id === selectedMushaf.id
                                  ? "bg-maroon-600 text-white"
                                  : "border-maroon-200 text-maroon-700"
                              }
                              size="sm"
                              onClick={() => setSelectedMushaf(variant)}
                            >
                              {variant.name}
                            </Button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{selectedMushaf.description}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50/70">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-blue-800">Audio Controls</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <Button onClick={handlePrevAyah} variant="outline" size="sm">
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        <Button onClick={handlePlayPause} className="bg-maroon-600 hover:bg-maroon-700 text-white px-4">
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          <span className="ml-2">{isPlaying ? "Pause" : "Play"}</span>
                        </Button>
                        <Button onClick={handleNextAyah} variant="outline" size="sm">
                          <SkipForward className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-blue-800 text-sm">Volume</p>
                        <Slider value={volume} onValueChange={setVolume} max={100} step={5} className="w-full" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-blue-800 text-sm">Playback Speed</p>
                        <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
                          <SelectTrigger className="bg-white/90">
                            <SelectValue placeholder="Speed" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.75">0.75x</SelectItem>
                            <SelectItem value="1">1x</SelectItem>
                            <SelectItem value="1.25">1.25x</SelectItem>
                            <SelectItem value="1.5">1.5x</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  <Card className="border-emerald-200 bg-emerald-50/80">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-emerald-800">Mushaf Highlights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-emerald-900">
                      <div className="font-arabic text-right text-xl bg-white/80 rounded-lg border border-emerald-200 p-3 shadow-sm">
                        {selectedMushaf.ayahExample.arabic}
                      </div>
                      <p className="text-sm text-gray-700">{selectedMushaf.ayahExample.guidance}</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedMushaf.highlights.map((highlight) => (
                          <Badge key={highlight} className={selectedMushaf.visualStyle.badge}>
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <MorphologyBreakdown ayahReference={morphologyReference} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-purple-200 bg-purple-50/80">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-purple-800">Live Tajweed Coach</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={toggleRecording}
                          className={`px-4 ${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-maroon-600 hover:bg-maroon-700"} text-white`}
                        >
                          {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                          {isRecording ? "Stop" : "Record"}
                        </Button>
                        <Button variant="outline" size="sm" className="text-purple-700" asChild>
                          <Link href="/practice">
                            Review Mistakes
                          </Link>
                        </Button>
                      </div>
                      <p>
                        Connects directly to the DeepSpeech tajweed detector, enabling real-time mistake highlighting as you recite each ayah.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 bg-white/80">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-800">Reader Shortcuts</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3 text-xs text-gray-700">
                      <div className="rounded-lg border border-slate-200 p-3">
                        <p className="font-semibold text-maroon-700">Reset Layout</p>
                        <p>Restore default font, translation, and Mushaf settings.</p>
                        <Button variant="ghost" size="sm" className="mt-2 text-maroon-700" onClick={() => setSelectedMushaf(mushafVariants[0])}>
                          <RotateCcw className="w-4 h-4 mr-1" /> Reset
                        </Button>
                      </div>
                      <div className="rounded-lg border border-slate-200 p-3">
                        <p className="font-semibold text-maroon-700">Toggle Translation</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="sm" onClick={() => setShowTranslation((prev) => !prev)}>
                            {showTranslation ? "Hide" : "Show"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setShowTransliteration((prev) => !prev)}>
                            Transliteration
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <audio
              ref={audioRef}
              src={selectedAyah.audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>

          <div className="space-y-6">
            <Card className="border-maroon-200 bg-white/80 shadow-md">
              <CardHeader>
                <CardTitle className="text-maroon-800 text-lg">Ayah Navigator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-2">
                  {sampleSurah.ayahs.map((ayah, index) => (
                    <button
                      key={ayah.number}
                      onClick={() => handleAyahClick(index)}
                      className={`w-full text-left rounded-lg border px-4 py-3 transition ${
                        index === currentAyah
                          ? "border-maroon-300 bg-maroon-50 text-maroon-800 shadow"
                          : "border-gray-200 bg-white/70 hover:bg-cream-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Ayah {ayah.number}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round((index / sampleSurah.numberOfAyahs) * 100)}%
                        </Badge>
                      </div>
                      <p className="font-arabic text-right text-lg text-maroon-900 mt-2">{ayah.text}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-amber-800">DeepSpeech Reader Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                <p>
                  • Keep your microphone within 15cm and enable the tajweed Mushaf to mirror the color-coded mistakes flagged by DeepSpeech.
                </p>
                <p>
                  • Replay any ayah with mismatched morphology roots to drill vocabulary directly from the grammar corpus.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
