import type { Metadata } from "next"
import Link from "next/link"
import { MorphologyBreakdown } from "@/components/morphology-breakdown"
import { MorphologyWordSearch } from "@/components/morphology-word-search"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMorphologyForAyah } from "@/lib/morphology-db"

export const metadata: Metadata = {
  title: "Quranic Grammar & Morphology Lab",
  description:
    "Explore lemmas, roots, and stems across the Quran while pairing each ayah with tajweed-aware DeepSpeech analysis.",
}

const DEFAULT_REFERENCE = "55:13"

export default async function GrammarAndMorphologyPage() {
  const baselineMorphology = await getMorphologyForAyah(DEFAULT_REFERENCE)

  return (
    <div className="container mx-auto space-y-10 py-10">
      <section className="rounded-3xl bg-gradient-to-r from-amber-50 via-cream-50 to-white border border-amber-100 shadow-sm px-8 py-10">
        <Badge variant="outline" className="border-amber-300 bg-amber-100/60 text-amber-700">
          Quranic Grammar Studio
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold text-maroon-900 sm:text-4xl">
          Map every ayah to its morphology, tajweed cues, and DeepSpeech feedback.
        </h1>
        <p className="mt-3 max-w-3xl text-base text-maroon-700">
          Dive into the handcrafted morphology databases shipped with the institute platform. Filter lemmas, stems, and trilateral roots, then launch real-time tajweed diagnostics powered by the bundled DeepSpeech pipeline.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-maroon-700">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-2">
            Integrated ayah + word morphology datasets
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-2">
            DeepSpeech real-time recitation feedback hooks
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-2">
            Tajweed-aware Mushaf cross-links
          </span>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <MorphologyWordSearch />
        <div className="space-y-6">
          <Card className="border-maroon-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-maroon-900 text-lg">DeepSpeech Tajweed Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-maroon-700">
              <p>
                Upload a WEBM clip in the Practice Studio and the integrated DeepSpeech client (bundled under <code className="rounded bg-maroon-50 px-1.5 py-0.5">/lib/deepspeech</code>) converts it to WAV, transcribes locally, and measures WER/CER on the fly.
              </p>
              <p>
                Tajweed insights highlight elongations, ghunna resonance, and pacing drifts. Hook the transcript back into the reader via <code className="rounded bg-maroon-50 px-1.5 py-0.5">/api/deepspeech/transcribe</code> to align with morphology breakdowns in real time.
              </p>
              <p>
                Need to re-train? Launch the Docker compose recipes in <code className="rounded bg-maroon-50 px-1.5 py-0.5">DeepSpeech/</code> and update <code className="rounded bg-maroon-50 px-1.5 py-0.5">lib/deepspeech/config.ts</code> with the new model path.
              </p>
            </CardContent>
          </Card>

          <Card className="border-maroon-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-maroon-900 text-lg">Ayah Morphology Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-maroon-700">
              <p>
                Start with a popular memorization anchor—<span className="font-semibold">Surah Ar-Rahman, ayah 13</span>. Swap the reference inside the breakdown to match any verse you are drilling in the Practice Studio.
              </p>
              <p>
                Every lemma, root, and stem comes directly from the Quranic Grammar & Morphology dataset migrated into <code className="rounded bg-maroon-50 px-1.5 py-0.5">/data/morphology</code>.
              </p>
            </CardContent>
          </Card>

          <MorphologyBreakdown ayahReference={DEFAULT_REFERENCE} initialData={baselineMorphology} />

          <Card className="border-maroon-200/60 shadow-sm">
            <CardContent className="space-y-3 text-sm text-maroon-700">
              <p>
                Looking for full recitation analytics? Jump into the <Link href="/practice" className="text-amber-600 underline-offset-2 hover:underline">Practice Studio</Link> to combine DeepSpeech scoring, tajweed annotations, and the adaptive leaderboard.
              </p>
              <p>
                Or open the <Link href="/reader" className="text-amber-600 underline-offset-2 hover:underline">Quran Reader</Link> to sync the morphology lens with multiple Mushaf layouts.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
