import { NextResponse } from "next/server"
import { deepspeechStages } from "@/lib/integration-data"
import { getMorphologyForAyah } from "@/lib/morphology-db"
import { createAudioTempFiles } from "@/lib/server/temp-files"
import { convertWebmToWav } from "@/lib/audio/convert-webm-to-wav"
import { runDeepSpeechClient } from "@/lib/deepspeech/run-client"
import { calculateWerMetrics } from "@/lib/deepspeech/metrics"
import { generateTajweedFeedback } from "@/lib/deepspeech/tajweed-feedback"
import type {
  TajweedAlignmentOperation,
  TajweedMistakeSummary,
  TajweedPaceInsight,
} from "@/types/deepspeech-analysis"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const formData = await request.formData()
  const ayahText = (formData.get("ayahText") as string) ?? ""
  const duration = Number.parseFloat((formData.get("duration") as string) ?? "0")
  const audioFile = formData.get("audio") as File | null

  const preferredStage = formData.get("stage") as string | null
  const ayahReference = formData.get("ayahReference") as string | null
  const stage =
    deepspeechStages.find((entry) => entry.stage === preferredStage) ?? deepspeechStages[1] ?? deepspeechStages[0]
  const morphologyLookup = ayahReference ? await getMorphologyForAyah(ayahReference, ayahText) : null

  let deepSpeechTranscription: Awaited<ReturnType<typeof runDeepSpeechClient>> | null = null

  if (audioFile) {
    try {
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
      const tempFiles = await createAudioTempFiles(audioBuffer)
      try {
        await convertWebmToWav({ inputPath: tempFiles.webmPath, outputPath: tempFiles.wavPath })
        deepSpeechTranscription = await runDeepSpeechClient({ audioPath: tempFiles.wavPath })
      } finally {
        await tempFiles.dispose()
      }
    } catch (error) {
      console.error("DeepSpeech pipeline failed", error)
    }
  }

  let transcript = ayahText || ""
  let confidence = stage.metrics ? Number((1 - stage.metrics.wer).toFixed(3)) : 0.0
  let evaluation = stage.metrics
  let recognizedTranscript: string | null = null

  if (deepSpeechTranscription?.transcripts?.length) {
    const [bestCandidate] = deepSpeechTranscription.transcripts
    const recognized = bestCandidate.words.map((word) => word.word).join(" ").trim()
    if (recognized) {
      transcript = recognized
      recognizedTranscript = recognized
    }
    confidence = Number(bestCandidate.confidence.toFixed(3))
    const metrics = calculateWerMetrics(ayahText, transcript)
    evaluation = {
      wer: metrics.wer,
      cer: metrics.cer,
      loss: stage.metrics?.loss ?? 0,
    }
  }

  const baseRecommendations = new Set<string>([
    "Review the tajweed legend in the Color-Coded Mushaf to reinforce nasalization cues.",
    "Run a grammar drill on the shared root ر ح م using the adaptive morphology deck.",
  ])

  let tajweedMistakes: TajweedMistakeSummary[] = []
  let alignment: TajweedAlignmentOperation[] = []
  let pace: TajweedPaceInsight | null = null

  if (recognizedTranscript) {
    const insights = generateTajweedFeedback({
      referenceText: ayahText,
      recognizedText: recognizedTranscript,
      durationSeconds: duration,
      metrics: evaluation,
    })
    tajweedMistakes = insights.mistakes
    alignment = insights.alignment
    pace = insights.pace
    insights.recommendations.forEach((item) => baseRecommendations.add(item))
    baseRecommendations.add(
      "Compare the DeepSpeech transcript with the target ayah to pinpoint articulation drifts before your next attempt.",
    )
  } else {
    if (audioFile && !deepSpeechTranscription) {
      baseRecommendations.add(
        "DeepSpeech could not process the uploaded audio. Confirm that the inference service and model paths are configured.",
      )
    }

    if (ayahText) {
      tajweedMistakes = [
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
      ]
      alignment = ayahText
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => ({
          type: "match" as const,
          reference: word,
          hypothesis: word,
        }))
    }
  }

  const recommendations = Array.from(baseRecommendations)

  const responsePayload = {
    transcript,
    recognizedTranscript,
    referenceText: ayahText,
    ayahReference: ayahReference ?? null,
    duration,
    stage: stage.stage,
    confidence,
    evaluation,
    notes: stage.notes,
    enhancements: stage.enhancements,
    tajweedMistakes,
    alignment,
    pace,
    morphology: morphologyLookup,
    recommendations,
  }

  return NextResponse.json(responsePayload)
}
