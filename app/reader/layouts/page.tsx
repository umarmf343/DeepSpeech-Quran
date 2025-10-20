"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { mushafVariants } from "@/lib/integration-data"
import { MorphologyBreakdown } from "@/components/morphology-breakdown"
import { BookOpen, LayoutGrid, Palette, Sparkles, Wand2 } from "lucide-react"

const featuredAyah = {
  reference: "1:1",
  text: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ",
}

export default function MushafLayoutsPage() {
  const [selectedVariantId, setSelectedVariantId] = useState(mushafVariants[0]?.id ?? "hafs")
  const selectedVariant = useMemo(
    () => mushafVariants.find((variant) => variant.id === selectedVariantId) ?? mushafVariants[0],
    [selectedVariantId],
  )

  return (
    <AppLayout>
      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
        <header className="space-y-3 animate-in fade-in-50">
          <Badge className="bg-maroon-100 text-maroon-700 border-maroon-200">Mushaf Studio</Badge>
          <h1 className="text-3xl font-bold text-maroon-900">Visual Mushaf & Tajweed Lab</h1>
          <p className="text-gray-600 max-w-3xl">
            Explore the Hafs and color-coded tajweed Mushaf layouts that ship with the DeepSpeech Quran toolkit. Switch between
            print-accurate pagination and AI-enhanced tajweed overlays while keeping ayah references aligned for practice and
            grammar drills.
          </p>
        </header>

        <Card className="border-maroon-200/60 shadow-lg">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2 text-maroon-800">
              <LayoutGrid className="h-5 w-5" /> Mushaf Variant Selector
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {mushafVariants.map((variant) => (
                <Button
                  key={variant.id}
                  onClick={() => setSelectedVariantId(variant.id)}
                  variant={variant.id === selectedVariantId ? "default" : "outline"}
                  className={
                    variant.id === selectedVariantId
                      ? "bg-maroon-600 text-white hover:bg-maroon-700"
                      : "border-maroon-200 text-maroon-700 hover:bg-maroon-50"
                  }
                >
                  {variant.name}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-[2fr,3fr]">
            <div className={`rounded-2xl border ${selectedVariant?.visualStyle.border} bg-white/80 p-6 space-y-4`}>
              <div className={`rounded-xl p-4 text-white shadow-inner ${selectedVariant?.visualStyle.headerAccent}`}>
                <h2 className="text-lg font-semibold">{selectedVariant?.name}</h2>
                <p className="text-sm opacity-90">{selectedVariant?.description}</p>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-700 leading-relaxed">Key Highlights</p>
                <ul className="grid gap-2">
                  {selectedVariant?.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-center gap-2 rounded-lg border border-dashed border-maroon-200 bg-white/70 px-3 py-2 text-sm text-maroon-800"
                    >
                      <Sparkles className="h-4 w-4 text-amber-500" /> {highlight}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-maroon-800">Practice Preview</p>
                <div className="font-arabic text-3xl text-right leading-relaxed bg-cream-50 border-r-4 border-maroon-600 rounded-xl p-6 shadow-sm">
                  {selectedVariant?.ayahExample.arabic}
                </div>
                <p className="text-xs text-gray-600">{selectedVariant?.ayahExample.guidance}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="https://archive.org/details/quran-speech-dataset" target="_blank" rel="noreferrer">
                    Download Checkpoints
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-maroon-200 text-maroon-700 hover:bg-maroon-50">
                  <Link href="https://github.com/tarekeldeeb/DeepSpeech-Quran/tree/master/data/quran" target="_blank" rel="noreferrer">
                    Training Workflow Docs
                  </Link>
                </Button>
              </div>
            </div>
            <div className="space-y-5">
              <Card className="border-dashed border-maroon-200 bg-white/80">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-maroon-800">
                    <Palette className="h-5 w-5" /> Tajweed Overlay Legend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-700">
                  <p>
                    The tajweed edition stores color metadata for ghunna, qalqalah, madd, and ikhfa triggers so the AI feedback aligns
                    with the visual cues shown on screen. Use this legend during practice sessions to explain why a detection was flagged.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                      <p className="font-semibold text-rose-700">Ghunna</p>
                      <p className="text-xs text-rose-600">Highlighted nasalization letters sync with DeepSpeech posterior spikes.</p>
                    </div>
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                      <p className="font-semibold text-orange-700">Madd</p>
                      <p className="text-xs text-orange-600">Elongation counts mirror the mushaf gradient and timing analytics.</p>
                    </div>
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <p className="font-semibold text-emerald-700">Qalqalah</p>
                      <p className="text-xs text-emerald-600">Sharp consonants pulse during energy dips detected by the model.</p>
                    </div>
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="font-semibold text-blue-700">Ikhfa</p>
                      <p className="text-xs text-blue-600">Softened consonants align with morphology-driven reminders.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50/60">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <BookOpen className="h-5 w-5" /> Featured Ayah Alignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-blue-800">
                    Compare the selected Mushaf layout with grammar-aware segmentation for live tajweed guidance.
                  </p>
                  <MorphologyBreakdown ayahReference={featuredAyah.reference} ayahText={featuredAyah.text} />
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50/70">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Wand2 className="h-5 w-5" /> Workflow Shortcuts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-purple-900">
                  <p>
                    Align lesson plans by jumping directly from variant previews to training resources and evaluation dashboards.
                  </p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>Use the imam-only checkpoint to calibrate real-time tajweed detection thresholds.</li>
                    <li>Leverage user-filtered corpora when deploying blended classrooms with diverse accents.</li>
                    <li>Sync Mushaf variants with grammar decks to build adaptive vocabulary quests.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Separator className="bg-maroon-200" />

        <section className="grid gap-6 md:grid-cols-2">
          <Card className="border-green-200 bg-green-50/70">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Sparkles className="h-5 w-5" /> Gamified Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-green-900">
              <p>Blend Mushaf visuals with grammar prompts to keep students engaged:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Trace every qalqalah on the page, then record a focused recitation for DeepSpeech to verify articulation.</li>
                <li>Launch a timed morphology hunt—students tap all instances of a root before the Tajweed Lab scores their recitation.</li>
                <li>Unlock streak bonuses when both timing analytics and color-coded cues show consistent improvement.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/80">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Sparkles className="h-5 w-5" /> Integration Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-amber-900">
              <p>Keep the full pipeline synchronized across modules:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Stage switcher mirrors DeepSpeech training tiers for accurate accuracy targets.</li>
                <li>Mushaf legend colors are referenced inside the AI Tajweed Lab feedback cards.</li>
                <li>Morphology API powers vocabulary quests and per-word grammar flashcards.</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  )
}
