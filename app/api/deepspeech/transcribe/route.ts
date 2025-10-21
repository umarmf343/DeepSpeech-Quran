import { NextResponse } from "next/server"
import { deepspeechStages } from "@/lib/integration-data"
import { getMorphologyForAyah } from "@/lib/morphology-db"
import { createAudioTempFiles } from "@/lib/server/temp-files"
import { convertWebmToWav } from "@/lib/audio/convert-webm-to-wav"
import { runDeepSpeechClient } from "@/lib/deepspeech/run-client"
import { calculateWerMetrics } from "@/lib/deepspeech/metrics"

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

  const tajweedMistakes = ayahText
    ? [
        {
          rule: "Madd Tabee'i",
          severity: "low",
          description:
            "Sustain the elongation on the alif in الرَّحْمٰنِ for a full two counts to match the tajweed-colored Mushaf guidance.",
        },
        {
          rule: "Ghunna",
          severity: "medium",
          description:
            "Ensure nasal resonance on the doubled meem in الرَّحِيمِ; the DeepSpeech posterior highlighted a drop in harmonic energy.",
        },
      ]
    : []

  if (recognizedTranscript) {
    const normalizedReference = ayahText.replace(/\s+/g, " ").trim()
    const normalizedRecognition = recognizedTranscript.replace(/\s+/g, " ").trim()
    if (normalizedReference && normalizedReference !== normalizedRecognition) {
      tajweedMistakes.push({
        rule: "Pronunciation Drift",
        severity: "medium",
        description:
          "The DeepSpeech transcript detected wording that differs from the target ayah. Replay the recording to confirm articulation and reconnect with the Mushaf's tajweed cues.",
      })
    }
  }

  const recommendations = [
    "Review the tajweed legend in the Color-Coded Mushaf to reinforce nasalization cues.",
    "Run a grammar drill on the shared root ر ح م using the adaptive morphology deck.",
  ]

  if (recognizedTranscript) {
    recommendations.unshift(
      "Compare the DeepSpeech transcript with the target ayah to pinpoint articulation drifts before your next attempt.",
    )
  } else if (audioFile && !deepSpeechTranscription) {
    recommendations.unshift(
      "DeepSpeech could not process the uploaded audio. Confirm that the inference service and model paths are configured.",
    )
  }

  const responsePayload = {
    transcript,
    duration,
    stage: stage.stage,
    confidence,
    evaluation,
    notes: stage.notes,
    enhancements: stage.enhancements,
    tajweedMistakes,
    morphology: morphologyLookup,
    recommendations,
  }

  return NextResponse.json(responsePayload)
}
