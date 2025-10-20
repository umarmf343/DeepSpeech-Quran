"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AdvancedAudioRecorder } from "@/components/advanced-audio-recorder"
import { MorphologyBreakdown } from "@/components/morphology-breakdown"
import { deepspeechResources, deepspeechStages, mushafVariants } from "@/lib/integration-data"
import type { MorphologyResponse } from "@/types/morphology"
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  AlertTriangle,
  Loader2,
  ScrollText,
  Sparkles,
  Target,
  TrendingUp,
  Waves,
} from "lucide-react"

type SampleAyah = {
  id: number
  arabic: string
  translation: string
  surah: string
  ayah: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  reference: string
}

const sampleAyahs: SampleAyah[] = [
  {
    id: 1,
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    surah: "Al-Fatiha",
    ayah: 1,
    difficulty: "Beginner",
    reference: "1:1",
  },
  {
    id: 2,
    arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    translation: "All praise is due to Allah, Lord of the worlds.",
    surah: "Al-Fatiha",
    ayah: 2,
    difficulty: "Beginner",
    reference: "1:2",
  },
  {
    id: 3,
    arabic: "وَإِذَا قُرِئَ الْقُرْآنُ فَاسْتَمِعُوا لَهُ وَأَنصِتُوا لَعَلَّكُمْ تُرْحَمُونَ",
    translation: "So when the Qur'an is recited, then listen to it and pay attention that you may receive mercy.",
    surah: "Al-A'raf",
    ayah: 204,
    difficulty: "Intermediate",
    reference: "7:204",
  },
]

type TajweedAnalysis = {
  transcript: string
  duration: number
  stage: string
  confidence: number
  evaluation: { wer: number; cer: number; loss: number }
  notes: string
  enhancements: string[]
  tajweedMistakes: { rule: string; severity: string; description: string }[]
  morphology: MorphologyResponse | null
  recommendations: string[]
}

type AnalysisNotice = {
  tone: "warning" | "error"
  message: string
}

export default function PracticePage() {
  const [currentAyah, setCurrentAyah] = useState<SampleAyah>(sampleAyahs[0])
  const [practiceSession, setPracticeSession] = useState({
    completed: 0,
    total: 10,
    accuracy: 85,
    hasanatEarned: 245,
  })
  const [selectedStage, setSelectedStage] = useState(deepspeechStages[1] ?? deepspeechStages[0])
  const [analysis, setAnalysis] = useState<TajweedAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisNotice, setAnalysisNotice] = useState<AnalysisNotice | null>(null)

  const stageOptions = useMemo(() => deepspeechStages, [])

  function applyAnalysisResult(result: TajweedAnalysis) {
    setAnalysis(result)
    setPracticeSession((prev) => ({
      ...prev,
      completed: Math.min(prev.total, prev.completed + 1),
      hasanatEarned: prev.hasanatEarned + 25,
      accuracy: Math.round(result.confidence * 100),
    }))
  }

  function createFallbackAnalysis(
    ayahText: string,
    ayahReference: string,
    duration: number,
  ): TajweedAnalysis {
    const stage = selectedStage ?? stageOptions[0]
    const evaluation = stage.metrics
    const confidence = Number((1 - evaluation.wer).toFixed(3))
    const notesFallback =
      stage.notes ||
      "Offline fallback guidance generated from the current DeepSpeech stage profile while the analysis service is unavailable."

    return {
      transcript: ayahText || "",
      duration,
      stage: stage.stage,
      confidence: Number.isFinite(confidence) ? confidence : 0.75,
      evaluation,
      notes: notesFallback,
      enhancements: stage.enhancements,
      tajweedMistakes: [
        {
          rule: "Review Madd Elongations",
          severity: "medium",
          description:
            "Use the tajweed-colored Mushaf to hold each elongation for two counts while we reconnect to the DeepSpeech service.",
        },
        {
          rule: "Ghunna Consistency",
          severity: "low",
          description:
            "Maintain a gentle nasal resonance on doubled letters such as meem and noon to keep articulation smooth offline.",
        },
      ],
      morphology: null,
      recommendations: [
        "Retry the DeepSpeech analysis once your connection stabilizes to compare automated feedback.",
        "Pair this ayah with the color-coded Mushaf legend for a self-paced tajweed check.",
      ],
    }
  }

  async function analyzeRecitation(
    audioBlob: Blob,
    duration: number,
    ayahText: string,
    ayahReference: string,
  ): Promise<{ analysis: TajweedAnalysis; isFallback: boolean }> {
    const formData = new FormData()
    formData.append("audio", audioBlob, "recitation.webm")
    formData.append("duration", duration.toString())
    formData.append("ayahText", ayahText)
    formData.append("stage", selectedStage.stage)
    formData.append("ayahReference", ayahReference)

    try {
      const response = await fetch("/api/deepspeech/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Unable to analyze recitation (${response.status})`)
      }

      const result: TajweedAnalysis = await response.json()
      applyAnalysisResult(result)
      return { analysis: result, isFallback: false }
    } catch (error) {
      console.error("DeepSpeech analysis request failed", error)
      const fallback = createFallbackAnalysis(ayahText, ayahReference, duration)
      applyAnalysisResult(fallback)
      return { analysis: fallback, isFallback: true }
    }
  }

  const handleRecordingComplete = (audioBlob: Blob, duration: number) => {
    setIsAnalyzing(true)
    setAnalysisNotice(null)
    analyzeRecitation(audioBlob, duration, currentAyah.arabic, currentAyah.reference)
      .then(({ isFallback }) => {
        if (isFallback) {
          setAnalysisNotice({
            tone: "warning",
            message:
              "We couldn't reach the DeepSpeech service, so we generated offline guidance using the selected stage profile.",
          })
        }
      })
      .catch((error) => {
        console.error("DeepSpeech analysis failed", error)
        setAnalysis(null)
        setAnalysisNotice({
          tone: "error",
          message: "We couldn't analyze your recitation right now. Please try again shortly.",
        })
      })
      .finally(() => {
        setIsAnalyzing(false)
      })
  }

  const nextAyah = () => {
    const currentIndex = sampleAyahs.findIndex((ayah) => ayah.id === currentAyah.id)
    const nextIndex = (currentIndex + 1) % sampleAyahs.length
    setCurrentAyah(sampleAyahs[nextIndex])
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 animate-in fade-in-50">
          <h1 className="text-3xl font-bold text-maroon-800 mb-2">AI Tajweed Lab</h1>
          <p className="text-gray-600">
            Practice your Quranic recitation with the DeepSpeech Quran pipeline, tajweed-aware Mushaf layouts, and morphology-driven feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-maroon-600" />
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-xl font-bold text-maroon-800">
                    {practiceSession.completed}/{practiceSession.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Accuracy</p>
                  <p className="text-xl font-bold text-green-700">{practiceSession.accuracy}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-sm text-gray-600">Hasanat</p>
                  <p className="text-xl font-bold text-amber-700">{practiceSession.hasanatEarned}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <Badge variant="secondary">{currentAyah.difficulty}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-maroon-800">Session Progress</h3>
              <span className="text-sm text-gray-600">
                {Math.round((practiceSession.completed / practiceSession.total) * 100)}% Complete
              </span>
            </div>
            <Progress value={(practiceSession.completed / practiceSession.total) * 100} className="h-3" />
          </CardContent>
        </Card>

        <Card className="mb-8 border-amber-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Ayah</span>
              <Badge variant="outline">
                {currentAyah.surah} - Ayah {currentAyah.ayah}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-right text-2xl font-arabic leading-relaxed text-maroon-800 bg-cream-50 p-6 rounded-lg border-r-4 border-maroon-600 animate-in fade-in-50">
              {currentAyah.arabic}
            </div>
            <div className="text-gray-700 italic bg-gray-50 p-4 rounded-lg">{currentAyah.translation}</div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-maroon-700">Choose DeepSpeech Stage</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {stageOptions.map((stage) => (
                  <button
                    key={stage.stage}
                    type="button"
                    onClick={() => setSelectedStage(stage)}
                    className={`text-left rounded-xl border p-4 transition shadow-sm hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-500/60 ${
                      selectedStage.stage === stage.stage
                        ? "border-maroon-300 bg-maroon-50"
                        : "border-gray-200 bg-white/80"
                    }`}
                  >
                    <p className="text-sm font-semibold text-maroon-800">{stage.stage}</p>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">{stage.datasetFocus}</p>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                        WER {stage.metrics.wer.toFixed(3)}
                      </Badge>
                      <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                        CER {stage.metrics.cer.toFixed(3)}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {mushafVariants.map((variant) => (
                <Card
                  key={variant.id}
                  className={`${variant.visualStyle.border} ${variant.visualStyle.background} transition hover:-translate-y-1 hover:shadow-lg`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-maroon-800 flex items-center gap-2">
                      <Waves className="h-4 w-4 text-maroon-500" /> {variant.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className={`text-sm ${variant.visualStyle.text}`}>{variant.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {variant.highlights.map((highlight) => (
                        <Badge key={highlight} className={variant.visualStyle.badge}>
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-right font-arabic text-xl bg-white/80 rounded-lg border p-3 shadow-sm">
                      {variant.ayahExample.arabic}
                    </div>
                    <p className="text-xs text-gray-600">{variant.ayahExample.guidance}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <AdvancedAudioRecorder
            onRecordingComplete={handleRecordingComplete}
            maxDuration={120}
            ayahText={currentAyah.arabic}
          />
          {isAnalyzing && (
            <div className="mt-4 flex items-center gap-2 text-sm text-maroon-700">
              <Loader2 className="h-4 w-4 animate-spin" /> Processing recitation with DeepSpeech Quran pipeline...
            </div>
          )}
          {analysisNotice && (
            <div
              className={`mt-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
                analysisNotice.tone === "warning"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{analysisNotice.message}</span>
            </div>
          )}
        </div>

        {analysis && (
          <div className="grid lg:grid-cols-3 gap-6 mb-10 animate-in fade-in-50">
            <Card className="lg:col-span-2 border-maroon-200/60 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-maroon-800">
                  <Activity className="h-5 w-5 text-green-600" /> Tajweed Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
                    {analysis.stage}
                  </Badge>
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                    Confidence {Math.round(analysis.confidence * 100)}%
                  </Badge>
                  <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
                    Duration {analysis.duration.toFixed(1)}s
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {analysis.tajweedMistakes.map((mistake) => (
                    <div key={mistake.rule} className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-maroon-800">{mistake.rule}</p>
                        <Badge className="bg-amber-500/20 text-amber-800 border-amber-300">{mistake.severity}</Badge>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{mistake.description}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-green-200 bg-green-50/80 px-4 py-3 text-sm text-green-800">
                  <p className="font-semibold">Pipeline Enhancements</p>
                  <ul className="list-disc ml-4 space-y-1 mt-1">
                    {analysis.enhancements.map((enhancement) => (
                      <li key={enhancement}>{enhancement}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
                  <p className="font-semibold text-maroon-800">Stage Notes</p>
                  <p>{analysis.notes}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {analysis.recommendations.map((recommendation) => (
                    <Badge key={recommendation} variant="outline" className="bg-maroon-50 text-maroon-700 border-maroon-200">
                      <ArrowRight className="h-3 w-3 mr-1" /> {recommendation}
                    </Badge>
                  ))}
                </div>

                {analysis.morphology && (
                  <div className="rounded-lg border border-purple-200 bg-purple-50/80 px-4 py-3 text-sm text-purple-900 space-y-2">
                    <p className="font-semibold">Grammar Snapshot</p>
                    <p>
                      <span className="font-medium">Roots observed:</span> {analysis.morphology.summary.roots ?? "—"}
                    </p>
                    <p>
                      <span className="font-medium">Lemmas:</span> {analysis.morphology.summary.lemmas ?? "—"}
                    </p>
                    <Button asChild variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100">
                      <Link href={`/reader/layouts?ayah=${encodeURIComponent(analysis.morphology.ayah)}`}>
                        Open Mushaf Alignment
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-blue-200 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <ScrollText className="h-5 w-5" /> DeepSpeech Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                      <p className="text-xs text-blue-600">WER</p>
                      <p className="text-lg font-semibold text-blue-800">{analysis.evaluation.wer.toFixed(3)}</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                      <p className="text-xs text-blue-600">CER</p>
                      <p className="text-lg font-semibold text-blue-800">{analysis.evaluation.cer.toFixed(3)}</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                      <p className="text-xs text-blue-600">Loss</p>
                      <p className="text-lg font-semibold text-blue-800">{analysis.evaluation.loss.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    These metrics come directly from the Quran-specific DeepSpeech checkpoints. Use them to decide when to promote a learner to the mixed-stage pipeline.
                  </p>
                </CardContent>
              </Card>

              <MorphologyBreakdown
                ayahReference={currentAyah.reference}
                ayahText={currentAyah.arabic}
                initialData={analysis?.morphology ?? null}
              />
            </div>
          </div>
        )}

        <Card className="mb-12 border-maroon-200/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-maroon-800">
              <Sparkles className="h-5 w-5" /> DeepSpeech Resources & Workflows
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            {deepspeechResources.map((resource) => (
              <a
                key={resource.href}
                href={resource.href}
                target="_blank"
                rel="noreferrer"
                className="group rounded-xl border border-maroon-200 bg-white/70 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <h4 className="font-semibold text-maroon-800 mb-2 group-hover:text-maroon-600 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> {resource.title}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">{resource.description}</p>
              </a>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button onClick={nextAyah} className="bg-maroon-600 hover:bg-maroon-700 text-white px-8" size="lg">
            Next Ayah
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
