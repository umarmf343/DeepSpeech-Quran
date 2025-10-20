"use client"

import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Waves, Workflow } from "lucide-react"

const trainingPhases = [
  {
    id: "phase-1",
    title: "Imām reference corpus",
    description:
      "Start with curated studio recordings from master reciters to pin down canonical tajwīd timings and pronunciations.",
    checklist: [
      "Normalize audio to 16kHz mono WAV",
      "Apply noise profiles + room impulse augmentations",
      "Export alignment CSVs capped at 12s segments",
    ],
  },
  {
    id: "phase-2",
    title: "Learner reinforcement",
    description:
      "Blend filtered learner submissions after confidence > 0.92 to teach the engine how drift manifests in real practice.",
    checklist: [
      "Score with tajwīd-aware heuristics",
      "Only accept samples meeting 0.85 word accuracy",
      "Tag each sample with Mushaf page + rule focus",
    ],
  },
]

const liveMetrics = [
  { label: "Imām corpus WER", value: 3.8 },
  { label: "Imām + learner WER", value: 5.1 },
  { label: "Real-time latency", value: 640 },
]

const augmentationStack = [
  "Pitch ±2%",
  "Tempo ±5%",
  "SpecAugment dropout",
  "Reverberation sweep",
]

export function DeepSpeechEnginePanel() {
  const targetLatency = 900
  const averageLatency = useMemo(() => liveMetrics.find((metric) => metric.label === "Real-time latency")?.value ?? 0, [])
  const latencyPercent = Math.min(100, Math.round((averageLatency / targetLatency) * 100))

  return (
    <Card className="border-maroon-100 bg-gradient-to-br from-white via-rose-50/70 to-maroon-50/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-maroon-900">
          <Sparkles className="h-5 w-5 text-maroon-600" /> DeepSpeech Qurʼān engine
        </CardTitle>
        <CardDescription>
          Mozilla&apos;s DeepSpeech tuned for tajwīd with Mushaf-aware metadata, ready to power live mistake detection without
          Chrome APIs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          {liveMetrics.slice(0, 2).map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-maroon-100 bg-white/80 p-4">
              <p className="text-xs uppercase tracking-wide text-maroon-600">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold text-maroon-900">{metric.value}%</p>
              <p className="text-xs text-maroon-600">WER against Mushaf-aligned evaluation sets</p>
            </div>
          ))}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-700">Streaming latency</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-800">{averageLatency} ms</p>
            <Progress value={latencyPercent} className="mt-3 h-2" />
            <p className="mt-2 text-xs text-emerald-700">Target &lt; {targetLatency} ms per 2.5s chunk</p>
          </div>
        </div>

        <Tabs defaultValue="workflow">
          <TabsList className="bg-maroon-100/70">
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" /> Training workflow
            </TabsTrigger>
            <TabsTrigger value="augmentations" className="flex items-center gap-2">
              <Waves className="h-4 w-4" /> Augmentations
            </TabsTrigger>
          </TabsList>
          <TabsContent value="workflow" className="space-y-4 pt-4">
            {trainingPhases.map((phase, index) => (
              <div key={phase.id} className="rounded-2xl border border-maroon-100 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge className="bg-maroon-600 text-white shadow-sm">Stage {index + 1}</Badge>
                  <p className="text-sm font-semibold text-maroon-900">{phase.title}</p>
                </div>
                <p className="mt-2 text-sm text-maroon-700">{phase.description}</p>
                <ul className="mt-3 space-y-2 text-sm text-maroon-700">
                  {phase.checklist.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-maroon-400" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="augmentations" className="space-y-3 pt-4">
            <p className="text-sm text-maroon-700">
              Pipeline-ready augmentation stack lifted from the DeepSpeech research drop. Mix and match to simulate learner
              mic conditions.
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              {augmentationStack.map((technique) => (
                <div
                  key={technique}
                  className="rounded-2xl border border-maroon-100 bg-white/70 p-3 text-sm text-maroon-800"
                >
                  {technique}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-maroon-100 bg-white/80 p-4">
          <div>
            <p className="text-sm font-semibold text-maroon-900">Model assets</p>
            <p className="text-xs text-maroon-600">
              Pull checkpoints and CSV recipes from the <code className="rounded bg-maroon-100 px-1">DeepSpeech/</code> folder.
            </p>
          </div>
            <Button
              variant="secondary"
              className="bg-maroon-100 text-maroon-700 hover:bg-maroon-200"
              onClick={() => window.open("https://github.com/mozilla/DeepSpeech/tree/master/doc", "_blank")}
            >
            Open training docs
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
