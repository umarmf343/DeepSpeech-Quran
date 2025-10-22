import Image from "next/image"
import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import {
  AppWindow,
  LayoutDashboard,
  Library,
  MoonStar,
  Repeat2,
  Search,
  Sparkles,
  TextQuote,
  Volume2,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Quran Companion | AlFawz Qur'an Institute",
  description:
    "Discover Quran Companion, a free and open-source desktop Quran reader and player featuring rich translations, dark mode, and advanced memorization tools.",
  keywords: [
    "Quran Companion",
    "Desktop Quran",
    "Quran Reader",
    "Open Source Quran",
    "Islamic Software",
  ],
}

const readerExperience = [
  {
    title: "Mushaf and verse layouts",
    description:
      "Navigate between a classical mushaf presentation and focused verse-by-verse reading while keeping controls within reach.",
    icon: LayoutDashboard,
  },
  {
    title: "Adaptive themes",
    description:
      "Night mode and automatic theme detection keep long recitation sessions comfortable, matching the reader's environment.",
    icon: MoonStar,
  },
  {
    title: "Quick navigation",
    description:
      "Surah and ayah selectors, paired with responsive interface panels, make it effortless to jump across the mushaf.",
    icon: Search,
  },
]

const audioAndMemorization = [
  {
    title: "Renowned reciters",
    description:
      "Choose from multiple recitation editions and adjust playback speed to suit memorization or reflective listening.",
    icon: Volume2,
  },
  {
    title: "Focused repetition",
    description:
      "Loop verses, monitor repetitions, and keep track of memorization streaks with the built-in hasanat tracker.",
    icon: Repeat2,
  },
  {
    title: "Motivating celebrations",
    description:
      "Milestone effects and celebratory overlays reinforce progress as users complete their daily goals.",
    icon: Sparkles,
  },
]

const studyTools = [
  {
    title: "Context-rich toggles",
    description:
      "Fine-grained controls toggle translations, transliterations, tajweed overlays, and full-surah reading views on demand.",
    icon: AppWindow,
  },
  {
    title: "Linguistic insights",
    description:
      "Dive into morphology breakdowns that surface roots, stems, and lemmas directly alongside the recited ayat.",
    icon: TextQuote,
  },
  {
    title: "Expanding library",
    description:
      "A curated list of translation editions in multiple languages keeps the experience accessible worldwide.",
    icon: Library,
  },
]

export default function QuranCompanionPage() {
  return (
    <div className="min-h-screen bg-gradient-cream">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/10 via-transparent to-secondary/20" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 text-center">
          <Badge className="gradient-gold border-0 px-4 py-2 text-white">Open Source Spotlight</Badge>
          <div className="space-y-6">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Quran Companion
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground sm:text-xl">
              Quran Companion is a desktop-class reader built for deep study and memorization. It distills the full AlFawz reader
              experience into a polished package that emphasizes comfort, clarity, and steady spiritual growth.
            </p>
          </div>
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-xl">
            <Image
              src="https://0xzer0x.github.io/imgs/quran-companion/banner.png"
              alt="Preview of the Quran Companion desktop application"
              width={1600}
              height={900}
              className="h-full w-full object-cover"
              priority
              unoptimized
            />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">Reader Experience</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The Quran Companion interface mirrors the live reader with familiar panels, responsive controls, and streamlined
              navigation.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {readerExperience.map((feature) => (
              <Card key={feature.title} className="border-border/60 bg-background/80">
                <CardHeader className="items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-foreground">{feature.title}</CardTitle>
                    <CardDescription className="mt-2 text-base leading-relaxed text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">Audio &amp; Memorization</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built-in audio tools and celebration systems sustain consistent recitation habits and memorization sessions.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {audioAndMemorization.map((feature) => (
              <Card key={feature.title} className="border-border/60 bg-card/80">
                <CardHeader className="items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15 text-secondary-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-foreground">{feature.title}</CardTitle>
                    <CardDescription className="mt-2 text-base leading-relaxed text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">Study Tools</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Engage every ayah with rich linguistic data and tailored presentation controls designed for serious learners.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studyTools.map((feature) => (
              <Card key={feature.title} className="border-border/60 bg-background/80">
                <CardHeader className="items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-foreground">{feature.title}</CardTitle>
                    <CardDescription className="mt-2 text-base leading-relaxed text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background/60 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <Card className="border-border/70 bg-card/80 p-8 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-8 w-8" />
            </div>
            <CardHeader className="mt-6 space-y-4 text-center">
              <CardTitle className="text-3xl font-semibold text-foreground">Crafted for Daily Devotion</CardTitle>
              <CardDescription className="text-lg leading-relaxed text-muted-foreground">
                Quran Companion channels the heart of the AlFawz experience into a desktop environment, keeping your reading
                rhythm grounded with thoughtful design, uplifting celebrations, and deep study aids.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-base text-muted-foreground">
                Whether preparing for class, revising memorized passages, or exploring linguistic nuance, every panel is tuned to
                make the Qur'an feel close at hand.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
