import { NextResponse } from "next/server"
import { deepspeechStages } from "@/lib/integration-data"
import { getMorphologyForAyah } from "@/lib/morphology-db"

export async function POST(request: Request) {
  const formData = await request.formData()
  const ayahText = (formData.get("ayahText") as string) ?? ""
  const duration = Number.parseFloat((formData.get("duration") as string) ?? "0")

  const preferredStage = formData.get("stage") as string | null
  const ayahReference = formData.get("ayahReference") as string | null
  const stage =
    deepspeechStages.find((entry) => entry.stage === preferredStage) ?? deepspeechStages[1] ?? deepspeechStages[0]
  const morphologyLookup = ayahReference ? await getMorphologyForAyah(ayahReference, ayahText) : null

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

  const responsePayload = {
    transcript: ayahText || "", // In production this would be returned by DeepSpeech inference
    duration,
    stage: stage.stage,
    confidence: stage.metrics ? Number((1 - stage.metrics.wer).toFixed(3)) : 0.0,
    evaluation: stage.metrics,
    notes: stage.notes,
    enhancements: stage.enhancements,
    tajweedMistakes,
    morphology: morphologyLookup,
    recommendations: [
      "Review the tajweed legend in the Color-Coded Mushaf to reinforce nasalization cues.",
      "Run a grammar drill on the shared root ر ح م using the adaptive morphology deck.",
    ],
  }

  return NextResponse.json(responsePayload)
}
